import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class IntegrationService:
    def __init__(self):
        self.enabled: bool = settings.POPULATION_BACKEND_INTEGRATION_ENABLED
        self.mode: str = "LIVE_BRIDGE" if self.enabled else "STANDALONE"
        self.population_api_base_url: str = settings.POPULATION_API_BASE_URL.rstrip("/")
        self.node_id: str = settings.NODE_ID
        self.site_id: str = settings.SITE_ID
        self.zone_id: str = settings.ZONE_ID
        self.device_key: str = settings.POPULATION_DEVICE_KEY

        self.backend_healthy: bool = False
        self.device_authenticated: bool = False

        self.total_sent: int = 0
        self.total_stored: int = 0
        self.total_duplicates: int = 0
        self.total_rejected: int = 0
        self.total_failed: int = 0
        self.last_quality_flag: Optional[str] = None
        self.last_wbgt_est_c: Optional[float] = None
        self.last_error: Optional[str] = None

    def set_mode(self, mode: str, enabled: bool) -> None:
        self.mode = mode
        self.enabled = enabled

    async def check_status(self) -> Dict[str, Any]:
        """Probes the Population backend health and device whoami authentication."""
        # 1. Health check
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.population_api_base_url}/health")
                if resp.status_code != 200:
                    resp = await client.get(f"{self.population_api_base_url}/api/v1/health")
                self.backend_healthy = (resp.status_code == 200)
        except Exception as e:
            logger.warning(f"Failed health check to Population backend: {e}")
            self.backend_healthy = False

        # 2. Device Auth check
        if self.backend_healthy and self.device_key:
            try:
                headers = {
                    "X-Node-Id": self.node_id,
                    "X-Device-Key": self.device_key,
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(f"{self.population_api_base_url}/api/v1/ingest/whoami", headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        self.device_authenticated = (data.get("node_id") == self.node_id)
                    else:
                        self.device_authenticated = False
            except Exception as e:
                logger.warning(f"Failed device auth check: {e}")
                self.device_authenticated = False
        else:
            self.device_authenticated = False

        return {
            "enabled": self.enabled,
            "mode": self.mode,
            "backend_healthy": self.backend_healthy,
            "device_authenticated": self.device_authenticated,
            "node_id": self.node_id,
            "site_id": self.site_id,
            "zone_id": self.zone_id,
            "total_sent": self.total_sent,
            "total_stored": self.total_stored,
            "total_duplicates": self.total_duplicates,
            "total_rejected": self.total_rejected,
            "total_failed": self.total_failed,
            "last_quality_flag": self.last_quality_flag,
            "last_wbgt_est_c": self.last_wbgt_est_c,
            "last_error": self.last_error,
        }

    async def forward_telemetry(self, packet) -> bool:
        """Forwards an active simulation TelemetryPacket to the Population backend."""
        if not self.enabled or self.mode != "LIVE_BRIDGE":
            return False

        ts_str = packet.timestamp.isoformat() if hasattr(packet.timestamp, "isoformat") else str(packet.timestamp)
        readings = packet.readings
        bme = readings.bme280

        # Build Population Ingest Schema 1 packet
        payload = {
            "schema": 1,
            "node_id": self.node_id,
            "site_id": self.site_id,
            "zone": self.zone_id,
            "ts": ts_str,
            "air_c": round(bme.temperature_c, 2) if bme.temperature_c is not None else None,
            "rh_pct": round(bme.humidity_pct, 2) if bme.humidity_pct is not None else None,
            "pressure_hpa": round(bme.pressure_hpa, 2) if bme.pressure_hpa is not None else None,
            "mq2_adc": float(readings.mq2_raw) if readings.mq2_raw is not None else None,
            "mq3_adc": float(readings.mq7_raw) if readings.mq7_raw is not None else None,
            "mq135_adc": float(readings.mq135_raw) if readings.mq135_raw is not None else None,
            "flame_ir_detected": bool(readings.ir_state == 1) if readings.ir_state is not None else None,
            "buffered": False,
        }

        headers = {
            "Content-Type": "application/json",
            "X-Node-Id": self.node_id,
            "X-Device-Key": self.device_key,
        }

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.post(
                    f"{self.population_api_base_url}/api/v1/ingest/readings",
                    json=payload,
                    headers=headers,
                )
            
            self.total_sent += 1
            if resp.status_code == 200:
                data = resp.json()
                self.total_stored += data.get("stored", 0)
                self.total_duplicates += data.get("duplicates", 0)
                self.total_rejected += data.get("rejected", 0)
                items = data.get("items", [])
                if items:
                    self.last_quality_flag = items[0].get("quality_flag")
                    self.last_wbgt_est_c = items[0].get("wbgt_est_c")
                return True
            elif resp.status_code == 422:
                self.total_rejected += 1
                self.last_error = f"HTTP 422: {resp.text}"
                return False
            else:
                self.total_failed += 1
                self.last_error = f"HTTP {resp.status_code}: {resp.text}"
                return False
        except Exception as e:
            self.total_sent += 1
            self.total_failed += 1
            self.last_error = str(e)
            logger.warning(f"Telemetry forwarding exception: {e}")
            return False


integration_service = IntegrationService()
