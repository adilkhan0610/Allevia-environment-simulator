/**
 * UAE November Normal Baselines & Live Sensor Network Engine
 * 
 * Provides:
 * - EPA standard piecewise linear AQI to PM2.5 conversion
 * - Realistic UAE November per-zone normal baselines (WBGT well below 28°C Watch tier)
 * - Mean-reverting random walk for natural subtle wiggles in normal telemetry
 * - Exponential decay for spikes/overrides back to baseline
 * - 60-second automated dispatch for all nodes N01-N05
 */

export const SIMULATION_CADENCE_SECONDS = 60;
export const POPULATION_API_BASE = 'https://population-and-workforce-health-early.onrender.com';
export const POPULATION_DEVICE_KEY = 'Ms5C-o-MDq3OUJfa10nr_k1ANiqcnU3oME5uNVVAAMk';

/**
 * Node hardware reservation setting.
 * When set to a node ID (e.g. 'N05'), the simulator leaves that node for real hardware.
 * Currently null: all N01-N05 are simulated.
 */
export const RESERVED_HARDWARE_NODE_ID: string | null = null;

/**
 * EPA standard AQI to PM2.5 (ug/m3) piecewise linear conversion
 * Breakpoints:
 * AQI   0 -  50: 0.0 - 12.0 ug/m3 (Good)
 * AQI  51 - 100: 12.1 - 35.4 ug/m3 (Moderate)
 * AQI 101 - 150: 35.5 - 55.4 ug/m3 (Unhealthy for Sensitive)
 * AQI 151 - 200: 55.5 - 150.4 ug/m3 (Unhealthy)
 * AQI 201 - 300: 150.5 - 250.4 ug/m3 (Very Unhealthy)
 * AQI 301 - 500: 250.5 - 500.0 ug/m3 (Hazardous)
 */
export function aqiToPm25(aqi: number): number {
  const a = Math.max(0, Math.min(500, Number(aqi) || 0));
  if (a <= 50) return Number(((a / 50) * 12.0).toFixed(1));
  if (a <= 100) return Number((12.1 + ((a - 51) / 49) * (35.4 - 12.1)).toFixed(1));
  if (a <= 150) return Number((35.5 + ((a - 101) / 49) * (55.4 - 35.5)).toFixed(1));
  if (a <= 200) return Number((55.5 + ((a - 151) / 49) * (150.4 - 55.5)).toFixed(1));
  if (a <= 300) return Number((150.5 + ((a - 201) / 99) * (250.4 - 150.5)).toFixed(1));
  return Number((250.5 + ((a - 301) / 199) * (500.0 - 250.5)).toFixed(1));
}

/**
 * Psychrometric Stull (2011) WBGT computation
 */
export function wetBulbStull(t: number, rh: number): number {
  return (
    t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}

export function calculateWBGT(airC: number, rhPct: number, globeC?: number): number {
  const tg = globeC != null ? globeC : airC + 2.0;
  const tw = wetBulbStull(airC, rhPct);
  return Number((0.7 * tw + 0.2 * tg + 0.1 * airC).toFixed(1));
}

export interface NodeMetrics {
  air_c: number;
  rh_pct: number;
  pressure_hpa: number;
  aqi: number;
  pm25: number;
  globe_c: number;
  wbgt_c: number;
  mq2_adc: number;
  mq3_adc: number;
  mq135_adc: number;
  battery_pct: number;
  flame_ir_detected: boolean;
  charging: boolean;
}

export interface NodeSimConfig {
  nodeId: string;
  siteId: string;
  zone: string;
  zoneName: string;
  label: string;
  baseline: NodeMetrics;
}

/**
 * Realistic UAE November Elevated Baselines (Continuously maintained instead of normal)
 * Zone A: Dust & thermal overload (Elevated: air_c=38, rh_pct=35, globe_c=46, pm25=95, mq2=160, mq3=80, mq135=200, wbgt=31)
 * Zone B: Same as Zone A
 * Zone C: Chemical vapors & inhalation (Elevated: air_c=33, rh_pct=55, globe_c=36, pm25=45, mq2=350, mq3=700, mq135=900, wbgt=28.6)
 * Zone D: Thermal heat stress (Elevated: air_c=36, rh_pct=50, globe_c=41, pm25=12, mq2=145, mq3=75, mq135=180, wbgt=31)
 * Zone E: Retained baseline
 */
export const UAE_NOVEMBER_BASELINES: Record<string, NodeSimConfig> = {
  N01: {
    nodeId: 'N01',
    siteId: 'S13',
    zone: 'A',
    zoneName: 'Mussafah Industrial Area',
    label: 'Node 1 — Zone A (Mussafah)',
    baseline: {
      air_c: 38.0,
      rh_pct: 35.0,
      pressure_hpa: 1014.2,
      aqi: 171,
      pm25: 95.0,
      globe_c: 46.0,
      wbgt_c: 31.0,
      mq2_adc: 160,
      mq3_adc: 80,
      mq135_adc: 200,
      battery_pct: 95.0,
      flame_ir_detected: false,
      charging: false,
    },
  },
  N02: {
    nodeId: 'N02',
    siteId: 'S03',
    zone: 'B',
    zoneName: 'Industrial City of Abu Dhabi (ICAD)',
    label: 'Node 2 — Zone B (ICAD)',
    baseline: {
      air_c: 38.0,
      rh_pct: 35.0,
      pressure_hpa: 1013.8,
      aqi: 171,
      pm25: 95.0,
      globe_c: 46.0,
      wbgt_c: 31.0,
      mq2_adc: 160,
      mq3_adc: 80,
      mq135_adc: 200,
      battery_pct: 95.0,
      flame_ir_detected: false,
      charging: false,
    },
  },
  N03: {
    nodeId: 'N03',
    siteId: 'S17',
    zone: 'C',
    zoneName: 'KEZAD Al Taweelah',
    label: 'Node 3 — Zone C (KEZAD)',
    baseline: {
      air_c: 33.0,
      rh_pct: 55.0,
      pressure_hpa: 1015.0,
      aqi: 124,
      pm25: 45.0,
      globe_c: 36.0,
      wbgt_c: 28.6,
      mq2_adc: 350,
      mq3_adc: 700,
      mq135_adc: 900,
      battery_pct: 14.0,
      flame_ir_detected: false,
      charging: false,
    },
  },
  N04: {
    nodeId: 'N04',
    siteId: 'S20',
    zone: 'D',
    zoneName: 'Zayed Port (Mina Zayed)',
    label: 'Node 4 — Zone D (Zayed Port)',
    baseline: {
      air_c: 36.0,
      rh_pct: 50.0,
      pressure_hpa: 1015.5,
      aqi: 50,
      pm25: 12.0,
      globe_c: 41.0,
      wbgt_c: 31.0,
      mq2_adc: 145,
      mq3_adc: 75,
      mq135_adc: 180,
      battery_pct: 95.0,
      flame_ir_detected: false,
      charging: false,
    },
  },
  N05: {
    nodeId: 'N05',
    siteId: 'S22',
    zone: 'E',
    zoneName: 'Al Mafraq Workers Residential City',
    label: 'Node 5 — Zone E (Al Mafraq)',
    baseline: {
      air_c: 28.0,
      rh_pct: 46.0,
      pressure_hpa: 1014.0,
      aqi: 44,
      pm25: 10.5,
      globe_c: 29.9,
      wbgt_c: 22.5,
      mq2_adc: 132,
      mq3_adc: 74,
      mq135_adc: 118,
      battery_pct: 14.0,
      flame_ir_detected: false,
      charging: false,
    },
  },
};

/**
 * Scenario Alert Readings triggered on operator trigger
 */
export const ZONE_ALERT_READINGS: Record<string, NodeMetrics> = {
  N01: {
    air_c: 40.0,
    rh_pct: 30.0,
    pressure_hpa: 1014.2,
    aqi: 270,
    pm25: 220.0,
    globe_c: 52.0,
    wbgt_c: 32.5,
    mq2_adc: 180,
    mq3_adc: 85,
    mq135_adc: 220,
    battery_pct: 95.0,
    flame_ir_detected: false,
    charging: false,
  },
  N02: {
    air_c: 40.0,
    rh_pct: 30.0,
    pressure_hpa: 1013.8,
    aqi: 270,
    pm25: 220.0,
    globe_c: 52.0,
    wbgt_c: 32.5,
    mq2_adc: 180,
    mq3_adc: 85,
    mq135_adc: 220,
    battery_pct: 95.0,
    flame_ir_detected: false,
    charging: false,
  },
  N03: {
    air_c: 34.0,
    rh_pct: 55.0,
    pressure_hpa: 1015.0,
    aqi: 153,
    pm25: 60.0,
    globe_c: 38.0,
    wbgt_c: 29.5,
    mq2_adc: 700,
    mq3_adc: 1600,
    mq135_adc: 2200,
    battery_pct: 14.0,
    flame_ir_detected: false,
    charging: false,
  },
  N04: {
    air_c: 38.0,
    rh_pct: 52.0,
    pressure_hpa: 1015.5,
    aqi: 50,
    pm25: 12.0,
    globe_c: 46.0,
    wbgt_c: 33.5,
    mq2_adc: 145,
    mq3_adc: 75,
    mq135_adc: 180,
    battery_pct: 95.0,
    flame_ir_detected: false,
    charging: false,
  },
  N05: {
    air_c: 28.0,
    rh_pct: 46.0,
    pressure_hpa: 1014.0,
    aqi: 44,
    pm25: 10.5,
    globe_c: 29.9,
    wbgt_c: 22.5,
    mq2_adc: 132,
    mq3_adc: 74,
    mq135_adc: 118,
    battery_pct: 14.0,
    flame_ir_detected: false,
    charging: false,
  },
};

/**
 * Random walk with mean reversion for natural variation around continuous baseline
 */
export function stepNormalVariation(current: NodeMetrics, base: NodeMetrics): NodeMetrics {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  // Mean reversion rate theta = 0.25
  const theta = 0.25;
  const air_c = Number((current.air_c + theta * (base.air_c - current.air_c) + rand(-0.15, 0.15)).toFixed(2));
  const rh_pct = Number(Math.max(10, Math.min(95, current.rh_pct + theta * (base.rh_pct - current.rh_pct) + rand(-0.4, 0.4))).toFixed(1));
  const pressure_hpa = Number((current.pressure_hpa + theta * (base.pressure_hpa - current.pressure_hpa) + rand(-0.2, 0.2)).toFixed(1));
  const aqi = base.aqi;
  const pm25 = Number(Math.max(0, current.pm25 + theta * (base.pm25 - current.pm25) + rand(-0.3, 0.3)).toFixed(1));

  const globe_c = Number((current.globe_c + theta * (base.globe_c - current.globe_c) + rand(-0.1, 0.1)).toFixed(2));
  const wbgt_c = base.wbgt_c;

  const mq2_adc = Math.max(0, Math.round(current.mq2_adc + theta * (base.mq2_adc - current.mq2_adc) + rand(-1.5, 1.5)));
  const mq3_adc = Math.max(0, Math.round(current.mq3_adc + theta * (base.mq3_adc - current.mq3_adc) + rand(-1.5, 1.5)));
  const mq135_adc = Math.max(0, Math.round(current.mq135_adc + theta * (base.mq135_adc - current.mq135_adc) + rand(-1.5, 1.5)));

  // Preserve configured battery percentage
  const battery_pct = base.battery_pct;

  return {
    air_c,
    rh_pct,
    pressure_hpa,
    aqi,
    pm25,
    globe_c,
    wbgt_c,
    mq2_adc,
    mq3_adc,
    mq135_adc,
    battery_pct,
    flame_ir_detected: false,
    charging: current.charging,
  };
}

export interface OverrideState {
  temperature: number;
  humidity: number;
  airQuality: number; // AQI
  infrared: number;
  pressure: number;
  gases: string[];
  battery: 'normal' | 'low';
  charging?: boolean;
  flameTicksRemaining: number;
}

/**
 * Applies exponential decay toward baseline on each tick:
 * value = baseline + (value - baseline) * k + noise
 * k ≈ 0.80 - 0.85 for PM/smoke/gas
 * k ≈ 0.90 for air and globe temperature
 */
export function stepSpikeDecay(
  current: NodeMetrics,
  base: NodeMetrics,
  override: OverrideState
): { nextMetrics: NodeMetrics; nextOverride: OverrideState | null } {
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  const k_pm = 0.82;
  const k_temp = 0.90;
  const k_rh = 0.88;

  // 1. Air temperature decay
  const airDiff = current.air_c - base.air_c;
  const nextAir = Math.abs(airDiff) > 0.15
    ? Number((base.air_c + airDiff * k_temp + rand(-0.1, 0.1)).toFixed(2))
    : base.air_c;

  // 2. Humidity decay
  const rhDiff = current.rh_pct - base.rh_pct;
  const nextRh = Math.abs(rhDiff) > 0.5
    ? Number((base.rh_pct + rhDiff * k_rh + rand(-0.3, 0.3)).toFixed(1))
    : base.rh_pct;

  // 3. Pressure decay
  const pDiff = current.pressure_hpa - base.pressure_hpa;
  const nextP = Math.abs(pDiff) > 0.5
    ? Number((base.pressure_hpa + pDiff * 0.85 + rand(-0.2, 0.2)).toFixed(1))
    : base.pressure_hpa;

  // 4. AQI and PM2.5 decay (e.g. 300 -> 255 -> 215 -> 180 -> 150 -> 120 -> 100 -> normal)
  const aqiDiff = current.aqi - base.aqi;
  const nextAqi = Math.abs(aqiDiff) > 2
    ? Math.round(base.aqi + aqiDiff * k_pm + rand(-1.5, 1.5))
    : base.aqi;
  const nextPm25 = aqiToPm25(nextAqi);

  // 5. Globe temperature decay
  const globeDiff = current.globe_c - base.globe_c;
  const nextGlobe = Math.abs(globeDiff) > 0.2
    ? Number((base.globe_c + globeDiff * k_temp + rand(-0.1, 0.1)).toFixed(2))
    : Number((nextAir + 2.0).toFixed(2));

  const nextWbgt = calculateWBGT(nextAir, nextRh, nextGlobe);

  // 6. Gas ADCs decay
  const mq2Diff = current.mq2_adc - base.mq2_adc;
  const nextMq2 = Math.abs(mq2Diff) > 5
    ? Math.round(base.mq2_adc + mq2Diff * k_pm + rand(-2, 2))
    : base.mq2_adc;

  const mq3Diff = current.mq3_adc - base.mq3_adc;
  const nextMq3 = Math.abs(mq3Diff) > 4
    ? Math.round(base.mq3_adc + mq3Diff * k_pm + rand(-2, 2))
    : base.mq3_adc;

  const mq135Diff = current.mq135_adc - base.mq135_adc;
  const nextMq135 = Math.abs(mq135Diff) > 5
    ? Math.round(base.mq135_adc + mq135Diff * k_pm + rand(-2, 2))
    : base.mq135_adc;

  // 7. Flame IR sensor: decays back to false after 2-3 ticks
  const flameTicksRemaining = Math.max(0, override.flameTicksRemaining - 1);
  const flameDetected = flameTicksRemaining > 0;

  // 8. Battery drain
  const nextBat = override.charging
    ? Math.min(100, Number((current.battery_pct + 0.5).toFixed(2)))
    : Math.max(5, Number((current.battery_pct - 0.01).toFixed(2)));

  // Check if fully settled back to baseline
  const isSettled =
    Math.abs(nextAir - base.air_c) < 0.2 &&
    Math.abs(nextRh - base.rh_pct) < 1.0 &&
    Math.abs(nextAqi - base.aqi) < 4 &&
    !flameDetected;

  const nextMetrics: NodeMetrics = {
    air_c: nextAir,
    rh_pct: nextRh,
    pressure_hpa: nextP,
    aqi: nextAqi,
    pm25: nextPm25,
    globe_c: nextGlobe,
    wbgt_c: nextWbgt,
    mq2_adc: nextMq2,
    mq3_adc: nextMq3,
    mq135_adc: nextMq135,
    battery_pct: nextBat,
    flame_ir_detected: flameDetected,
    charging: Boolean(override.charging),
  };

  const nextOverrideState: OverrideState | null = isSettled
    ? null
    : {
      ...override,
      flameTicksRemaining,
    };

  return { nextMetrics, nextOverride: nextOverrideState };
}
