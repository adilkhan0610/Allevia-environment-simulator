import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock HTMLCanvasElement.getContext for Three.js / WebGL
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId) => {
  if (contextId === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Array(4) })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    }
  }
  if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(() => 0),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      clearColor: vi.fn(),
      clearDepth: vi.fn(),
      clear: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      viewport: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      flush: vi.fn(),
      finish: vi.fn(),
    }
  }
  return null
}) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock global fetch for apiClient
global.fetch = vi.fn().mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
  const urlStr = typeof url === 'string' ? url : url.toString()

  if (urlStr.includes('/api/v1/scenarios')) {
    return {
      ok: true,
      json: async () => ({
        status: 'healthy',
        total: 6,
        scenarios: [
          {
            id: 'scenario-01',
            slug: 'normal-day',
            name: 'Normal Day',
            category: 'Baseline',
            description: 'Baseline workplace environment with gentle fluctuations.',
            duration_seconds: 300,
            primary_threat: 'None',
            target_sensors: ['bme280'],
            risk_level_expected: 'LOW',
            expected_tier: 'GREEN',
          },
          {
            id: 'scenario-02',
            slug: 'midday-heatwave',
            name: 'Midday Heatwave',
            category: 'Thermal Stress',
            description: 'Rapid temperature escalation up to 43.5°C.',
            duration_seconds: 300,
            primary_threat: 'Extreme Heat',
            target_sensors: ['bme280'],
            risk_level_expected: 'HIGH',
            expected_tier: 'ORANGE',
          },
          {
            id: 'scenario-03',
            slug: 'humid-heat',
            name: 'Humid Heat',
            category: 'Thermal Stress',
            description: 'Dangerous combined high heat and 94% humidity.',
            duration_seconds: 300,
            primary_threat: 'Humid Heat',
            target_sensors: ['bme280'],
            risk_level_expected: 'CRITICAL',
            expected_tier: 'RED',
          },
          {
            id: 'scenario-04',
            slug: 'smoke-dust',
            name: 'Smoke Episode',
            category: 'Air Quality',
            description: 'Sudden smoke infiltration driving MQ-2 spike.',
            duration_seconds: 300,
            primary_threat: 'Dense Smoke',
            target_sensors: ['mq2', 'ir'],
            risk_level_expected: 'HIGH',
            expected_tier: 'RED',
          },
          {
            id: 'scenario-05',
            slug: 'gas-leak',
            name: 'Gas Leak Demo',
            category: 'Chemical Hazard',
            description: 'Carbon monoxide escalation driving MQ-7 spike.',
            duration_seconds: 300,
            primary_threat: 'Carbon Monoxide',
            target_sensors: ['mq7', 'mq2'],
            risk_level_expected: 'CRITICAL',
            expected_tier: 'RED',
          },
          {
            id: 'scenario-06',
            slug: 'sensor-fault',
            name: 'Sensor Faults',
            category: 'Diagnostics',
            description: 'Hardware anomalies, I2C bus lockup and pull-ups.',
            duration_seconds: 300,
            primary_threat: 'Hardware Failure',
            target_sensors: ['bme280', 'mq7', 'ir'],
            risk_level_expected: 'HIGH',
            expected_tier: 'FAULT',
          },
        ],
      }),
    }
  }

  if (urlStr.includes('/api/v1/sessions')) {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    return {
      ok: true,
      json: async () => ({
        session_id: 'test-session-001',
        device_id: 'ALLEVIA-SIM-001',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: 'IDLE',
        source: 'simulated',
        selected_scenario: body.scenario_id || 'scenario-01',
        speed_multiplier: body.speed_multiplier || 1.0,
        intensity_multiplier: 1.0,
      }),
    }
  }

  return {
    ok: true,
    json: async () => ({ status: 'healthy', service: 'simulation-engine', source: 'simulated', timestamp: new Date().toISOString() }),
  }
})
