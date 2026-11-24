"""
Allevia Environment Simulator — Autonomous Server-Side Worker & Cycle Runner
Sends simulated telemetry for N01-N05 to http://localhost:8000/api/v1/ingest/readings every 60s
or on-demand per minute via run_one_cycle().
Runs continuously in background or invoked by protected HTTP scheduler endpoints.
"""

from __future__ import annotations

import json
import logging
import math
import os
import random
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib import request as urllib_request
from urllib.error import URLError

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("allevia_simulator_worker")

# Hardware reservation setting ('N06' reserved exclusively for real hardware)
RESERVED_HARDWARE_NODE_ID: str | None = "N06"

CADENCE_SECONDS = int(os.environ.get("SIMULATOR_INTERVAL_S", "60"))

STATE_FILE = Path(__file__).resolve().parent / "simulator_worker_state.json"
OVERRIDE_FILE = Path(__file__).resolve().parent / "simulator_override.json"

# In-memory singleton cache and concurrency lock
_nodes: dict[str, NodeState] | None = None
_last_executed_minute: str | None = None
_cycle_lock = threading.Lock()


def get_ingest_config() -> tuple[str, str]:
    """
    Resolves (api_base_url, device_key) based on environment and APP_ENV.
    In production mode (APP_ENV=production), localhost defaults are strictly rejected.
    """
    app_env = (os.environ.get("APP_ENV") or "development").strip().lower()
    api_base = os.environ.get("POPULATION_API_BASE") or os.environ.get("POPULATION_API_BASE_URL")
    dev_key = os.environ.get("POPULATION_DEVICE_KEY")

    if app_env == "production":
        if not api_base or "localhost" in api_base or "127.0.0.1" in api_base:
            raise ValueError(
                "Production configuration error: POPULATION_API_BASE / POPULATION_API_BASE_URL "
                "must be explicitly set to a remote server in production mode (localhost is not permitted)."
            )
        if not dev_key:
            raise ValueError(
                "Production configuration error: POPULATION_DEVICE_KEY must be explicitly configured in production mode."
            )
        return api_base.rstrip("/"), dev_key
    else:
        api_base = (api_base or "http://localhost:8000").rstrip("/")
        dev_key = dev_key or "Ms5C-o-MDq3OUJfa10nr_k1ANiqcnU3oME5uNVVAAMk"
        return api_base, dev_key


def aqi_to_pm25(aqi: float) -> float:
    """EPA standard piecewise linear AQI to PM2.5 (ug/m3) conversion."""
    a = max(0.0, min(500.0, float(aqi)))
    if a <= 50.0:
        return round((a / 50.0) * 12.0, 1)
    if a <= 100.0:
        return round(12.1 + ((a - 51.0) / 49.0) * (35.4 - 12.1), 1)
    if a <= 150.0:
        return round(35.5 + ((a - 101.0) / 49.0) * (55.4 - 35.5), 1)
    if a <= 200.0:
        return round(55.5 + ((a - 151.0) / 49.0) * (150.4 - 55.5), 1)
    if a <= 300.0:
        return round(150.5 + ((a - 201.0) / 99.0) * (250.4 - 150.5), 1)
    return round(250.5 + ((a - 301.0) / 199.0) * (500.0 - 250.5), 1)


def wet_bulb_stull(t: float, rh: float) -> float:
    """Psychrometric Stull (2011) wet-bulb temperature."""
    return (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh**1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )


def calculate_wbgt(air_c: float, rh_pct: float, globe_c: float | None = None) -> float:
    tg = globe_c if globe_c is not None else air_c + 2.0
    tw = wet_bulb_stull(air_c, rh_pct)
    return round(0.7 * tw + 0.2 * tg + 0.1 * air_c, 1)


NODE_CONFIGS = {
    "N01": {"site_id": "S13", "zone": "A", "zone_name": "Mussafah Industrial Area", "air_c": 28.2, "rh_pct": 48.0, "pressure_hpa": 1014.2, "aqi": 45, "battery_pct": 95.0},
    "N02": {"site_id": "S03", "zone": "B", "zone_name": "Industrial City of Abu Dhabi (ICAD)", "air_c": 28.6, "rh_pct": 50.0, "pressure_hpa": 1013.8, "aqi": 48, "battery_pct": 95.0},
    "N03": {"site_id": "S17", "zone": "C", "zone_name": "KEZAD Al Taweelah", "air_c": 27.8, "rh_pct": 54.0, "pressure_hpa": 1015.0, "aqi": 42, "battery_pct": 14.0},
    "N04": {"site_id": "S20", "zone": "D", "zone_name": "Zayed Port (Mina Zayed)", "air_c": 27.4, "rh_pct": 58.0, "pressure_hpa": 1015.5, "aqi": 40, "battery_pct": 95.0},
    "N05": {"site_id": "S22", "zone": "E", "zone_name": "Al Mafraq Workers Residential City", "air_c": 28.0, "rh_pct": 46.0, "pressure_hpa": 1014.0, "aqi": 44, "battery_pct": 14.0},
}


class NodeState:
    def __init__(self, node_id: str, cfg: dict):
        self.node_id = node_id
        self.site_id = cfg["site_id"]
        self.zone = cfg["zone"]
        self.zone_name = cfg["zone_name"]
        self.base_air = cfg["air_c"]
        self.base_rh = cfg["rh_pct"]
        self.base_p = cfg["pressure_hpa"]
        self.base_aqi = cfg["aqi"]
        self.base_battery = cfg["battery_pct"]

        self.cur_air = self.base_air
        self.cur_rh = self.base_rh
        self.cur_p = self.base_p
        self.cur_aqi = self.base_aqi
        self.cur_battery = self.base_battery
        self.flame_detected = False
        self.flame_ticks = 0

        self.override: dict | None = None
        self.last_sent: dict | None = None

    def apply_override(self, override: dict):
        self.override = override
        if "temperature" in override:
            self.cur_air = float(override["temperature"])
        if "humidity" in override:
            self.cur_rh = float(override["humidity"])
        if "airQuality" in override:
            self.cur_aqi = float(override["airQuality"])
        if "pressure" in override:
            self.cur_p = float(override["pressure"])
        if "infrared" in override and float(override["infrared"]) > 75:
            self.flame_detected = True
            self.flame_ticks = 3
        else:
            self.flame_detected = False
            self.flame_ticks = 0
        if "battery" in override or "battery_pct" in override:
            val = float(override.get("battery_pct", override.get("battery", 95)))
            self.cur_battery = 14.0 if (val <= 35 or val == 14.0) else 95.0

    def tick(self):
        if self.override:
            # Decay towards baseline: value = baseline + (value - baseline) * k + noise
            k_pm = 0.82
            k_temp = 0.90
            k_rh = 0.88

            air_diff = self.cur_air - self.base_air
            self.cur_air = round(self.base_air + air_diff * k_temp + random.uniform(-0.1, 0.1), 2)

            rh_diff = self.cur_rh - self.base_rh
            self.cur_rh = round(self.base_rh + rh_diff * k_rh + random.uniform(-0.3, 0.3), 1)

            p_diff = self.cur_p - self.base_p
            self.cur_p = round(self.base_p + p_diff * 0.85 + random.uniform(-0.2, 0.2), 1)

            aqi_diff = self.cur_aqi - self.base_aqi
            self.cur_aqi = round(self.base_aqi + aqi_diff * k_pm + random.uniform(-1.5, 1.5), 0)

            if self.flame_ticks > 0:
                self.flame_ticks -= 1
            self.flame_detected = self.flame_ticks > 0

            # Battery for simulated nodes: strictly 95.0% or 14.0%
            self.cur_battery = 14.0 if (self.cur_battery <= 35 or self.cur_battery == 14.0) else 95.0

            # Snap back to normal when diff is negligible
            if abs(self.cur_air - self.base_air) < 0.2 and abs(self.cur_aqi - self.base_aqi) < 4 and not self.flame_detected:
                self.override = None
                self.cur_air = self.base_air
                self.cur_aqi = self.base_aqi
                self.cur_rh = self.base_rh
                self.cur_p = self.base_p
        else:
            # Bounded mean-reverting random walk around normal baseline
            theta = 0.25
            self.cur_air = round(self.cur_air + theta * (self.base_air - self.cur_air) + random.uniform(-0.2, 0.2), 2)
            self.cur_rh = round(max(20.0, min(90.0, self.cur_rh + theta * (self.base_rh - self.cur_rh) + random.uniform(-0.7, 0.7))), 1)
            self.cur_p = round(self.cur_p + theta * (self.base_p - self.cur_p) + random.uniform(-0.2, 0.2), 1)
            self.cur_aqi = round(max(15.0, min(75.0, self.cur_aqi + theta * (self.base_aqi - self.cur_aqi) + random.uniform(-2.0, 2.0))), 0)
            self.flame_detected = False
<<<<<<< Updated upstream
            self.cur_battery = 14.0 if (self.cur_battery <= 35 or self.cur_battery == 14.0) else 95.0
=======
<<<<<<< HEAD
            self.cur_battery = self.base_battery
=======
            self.cur_battery = 14.0 if (self.cur_battery <= 35 or self.cur_battery == 14.0) else 95.0

    def build_payload(self, ts: str | None = None) -> dict:
        pm25 = aqi_to_pm25(self.cur_aqi)
        globe_c = round(self.cur_air + 2.0 + random.uniform(-0.1, 0.1), 2)
        wbgt = calculate_wbgt(self.cur_air, self.cur_rh, globe_c)

        # Raw gas ADC estimates
        mq2_adc = int(round(135 + (self.cur_aqi / 500.0) * 500 + random.uniform(-3, 3)))
        mq3_adc = int(round(75 + (self.cur_aqi / 500.0) * 450 + random.uniform(-2, 2)))
        mq135_adc = int(round(120 + (self.cur_aqi / 500.0) * 600 + random.uniform(-3, 3)))
>>>>>>> 9e726fbbf87086ce69256db821de2ef595517dd5
>>>>>>> Stashed changes

    def build_payload(self, ts: str | None = None) -> dict:
        pm25 = aqi_to_pm25(self.cur_aqi)
        globe_c = round(self.cur_air + 2.0 + random.uniform(-0.1, 0.1), 2)
        wbgt = calculate_wbgt(self.cur_air, self.cur_rh, globe_c)

        # Raw gas ADC estimates
        mq2_adc = int(round(135 + (self.cur_aqi / 500.0) * 500 + random.uniform(-3, 3)))
        mq3_adc = int(round(75 + (self.cur_aqi / 500.0) * 450 + random.uniform(-2, 2)))
        mq135_adc = int(round(120 + (self.cur_aqi / 500.0) * 600 + random.uniform(-3, 3)))

        return {
            "schema": 1,
            "node_id": self.node_id,
            "site_id": self.site_id,
            "zone": self.zone,
            "ts": ts if ts is not None else datetime.now(timezone.utc).isoformat(),
            "air_c": self.cur_air,
            "rh_pct": self.cur_rh,
            "pressure_hpa": self.cur_p,
            "pm25": pm25,
            "globe_c": globe_c,
            "battery_pct": self.cur_battery,
            "mq2_adc": min(1023, max(0, mq2_adc)),
            "mq3_adc": min(1023, max(0, mq3_adc)),
            "mq135_adc": min(1023, max(0, mq135_adc)),
            "flame_ir_detected": self.flame_detected,
            "buffered": False,
        }


def check_for_override(nodes: dict[str, NodeState]):
    if not OVERRIDE_FILE.exists():
        return
    try:
        data = json.loads(OVERRIDE_FILE.read_text())
        node_id = data.get("node_id") or data.get("selectedNode")
        if node_id in nodes:
            logger.info("Applying user override for node %s: %s", node_id, data)
            nodes[node_id].apply_override(data)
            OVERRIDE_FILE.unlink()  # consumed
    except Exception as exc:
        logger.warning("Error reading override file: %s", exc)


def send_packet(node_id: str, payload: dict, api_base: str | None = None, device_key: str | None = None) -> bool:
    if not api_base or not device_key:
        api_base, device_key = get_ingest_config()

    url = f"{api_base}/api/v1/ingest/readings"
    data = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Node-Id": node_id,
            "X-Device-Key": device_key,
        },
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except URLError as err:
        logger.warning("Ingest push failed for %s: %s", node_id, err)
        return False
    except Exception as err:
        logger.warning("Unexpected error during packet send for %s: %s", node_id, err)
        return False


def get_nodes(state_file: Path | None = None) -> dict[str, NodeState]:
    """
    Returns the in-memory singleton nodes dictionary, initializing or restoring
    state from state_file (default STATE_FILE) if not yet loaded.
    """
    global _nodes, _last_executed_minute
    if _nodes is not None:
        return _nodes

    target_state_file = state_file or STATE_FILE
    nodes = {nid: NodeState(nid, cfg) for nid, cfg in NODE_CONFIGS.items()}

    if target_state_file.exists():
        try:
            saved_data = json.loads(target_state_file.read_text())
            nodes_data = saved_data.get("nodes", {})
            for nid, node in nodes.items():
                if nid in nodes_data:
                    info = nodes_data[nid]
                    curr = info.get("current", {})
                    if "air_c" in curr:
                        node.cur_air = float(curr["air_c"])
                    if "rh_pct" in curr:
                        node.cur_rh = float(curr["rh_pct"])
                    if "pressure_hpa" in curr:
                        node.cur_p = float(curr["pressure_hpa"])
                    if "aqi" in curr:
                        node.cur_aqi = float(curr["aqi"])
                    if "battery_pct" in curr:
                        node.cur_battery = float(curr["battery_pct"])
                    node.flame_detected = info.get("flame_detected", False)
                    node.flame_ticks = int(info.get("flame_ticks", 0))
                    node.override = info.get("override", None)
                    node.last_sent = info.get("last_payload", None)

            _last_executed_minute = saved_data.get("aligned_minute") or saved_data.get("last_executed_minute")
            logger.info("Restored node states and aligned minute (%s) from %s", _last_executed_minute, target_state_file)
        except Exception as exc:
            logger.warning("Failed to restore state from %s: %s; starting from baseline", target_state_file, exc)

    _nodes = nodes
    return _nodes


def save_state(nodes: dict[str, NodeState], state_dump: dict, state_file: Path | None = None) -> None:
    """Persists node state dictionary to JSON file."""
    target_state_file = state_file or STATE_FILE
    try:
        target_state_file.write_text(json.dumps(state_dump, indent=2))
    except Exception as exc:
        logger.warning("Failed to save state to %s: %s", target_state_file, exc)


def run_one_cycle(force: bool = False, state_file: Path | None = None) -> dict:
    """
    Executes exactly ONE simulation cycle:
    - Resolves ingest configuration (strict production validation).
    - Checks for pending user overrides.
    - Synchronizes state with minute alignment to handle scheduler jitter.
    - If already executed for the current minute and force=False, returns a skipped result.
    - For each simulated node (N01-N05, excluding N06):
        1. Ticks decay / random-walk dynamics.
        2. Builds canonical telemetry packet with aligned minute timestamp.
        3. Sends packet to main Allevia ingest backend.
    - Persists current values, active overrides, and decay progress to disk.
    - Thread-safe via _cycle_lock so overlapping scheduler calls cannot collide.
    """
    global _last_executed_minute
    target_state_file = state_file or STATE_FILE

    with _cycle_lock:
        now = datetime.now(timezone.utc)
        aligned_dt = now.replace(second=0, microsecond=0)
        aligned_ts = aligned_dt.isoformat()

        nodes = get_nodes(target_state_file)

        # Scheduler jitter check: align to the minute and prevent duplicate (node_id, ts) packets
        if not force and _last_executed_minute == aligned_ts:
            logger.info("Scheduler cycle for minute %s already executed. Returning skipped result.", aligned_ts)
            return {
                "status": "skipped",
                "reason": "already_executed_for_minute",
                "minute": aligned_ts,
                "timestamp": now.isoformat(),
            }

        # Check and apply any pending user override
        check_for_override(nodes)

        # Ingest configuration check (raises ValueError if invalid in production)
        api_base, device_key = get_ingest_config()

        state_dump = {
            "last_cycle_at": now.isoformat(),
            "aligned_minute": aligned_ts,
            "cadence_seconds": CADENCE_SECONDS,
            "reserved_hardware_node_id": RESERVED_HARDWARE_NODE_ID,
            "nodes": {},
        }

        results = {}
        for nid, node in nodes.items():
            if nid == RESERVED_HARDWARE_NODE_ID or nid == "N06":
                continue

            node.tick()
            payload = node.build_payload(ts=aligned_ts)
            success = send_packet(nid, payload, api_base=api_base, device_key=device_key)
            node.last_sent = payload

            state_dump["nodes"][nid] = {
                "node_id": nid,
                "zone": node.zone,
                "current": {
                    "air_c": node.cur_air,
                    "rh_pct": node.cur_rh,
                    "pressure_hpa": node.cur_p,
                    "pm25": payload["pm25"],
                    "wbgt_c": calculate_wbgt(node.cur_air, node.cur_rh, payload["globe_c"]),
                    "battery_pct": node.cur_battery,
                    "aqi": node.cur_aqi,
                },
                "baseline": {
                    "air_c": node.base_air,
                    "rh_pct": node.base_rh,
                    "aqi": node.base_aqi,
                    "battery_pct": node.base_battery,
                },
                "has_override": node.override is not None,
                "override": node.override,
                "flame_detected": node.flame_detected,
                "flame_ticks": node.flame_ticks,
                "http_success": success,
                "last_payload": payload,
            }
            results[nid] = "OK" if success else "FAIL"
            logger.info(
                "Node %s (Zone %s): air=%.1f°C rh=%.1f%% pm25=%.1f wbgt=%.1f bat=%.1f%% -> %s",
                nid, node.zone, node.cur_air, node.cur_rh, payload["pm25"],
                state_dump["nodes"][nid]["current"]["wbgt_c"], node.cur_battery,
                "OK" if success else "FAIL"
            )

        state_dump["last_executed_minute"] = aligned_ts
        save_state(nodes, state_dump, state_file=target_state_file)
        _last_executed_minute = aligned_ts

        return {
            "status": "success",
            "minute": aligned_ts,
            "timestamp": now.isoformat(),
            "nodes_sent": len(results),
            "results": results,
        }


def run_worker_loop():
    logger.info("Starting Allevia Simulator Server-Side Worker (cadence=%ds)", CADENCE_SECONDS)
    # Ensure nodes initialized/restored
    get_nodes()

    while True:
        try:
            result = run_one_cycle()
            logger.info("Worker loop tick completed: status=%s, minute=%s", result.get("status"), result.get("minute"))
        except Exception as exc:
            logger.error("Error in worker cycle: %s", exc)

        time.sleep(CADENCE_SECONDS)


if __name__ == "__main__":
    run_worker_loop()
