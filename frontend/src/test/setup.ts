import '@testing-library/jest-dom'
import { vi } from 'vitest'

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

// Mock global fetch for apiClient
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    status: 'healthy',
    total: 6,
    scenarios: [
      { id: 'scenario-01', slug: 'normal-day', name: 'Normal Day', category: 'Baseline', description: '', duration_seconds: 300, primary_threat: 'None', target_sensors: [], risk_level_expected: 'LOW' }
    ]
  }),
})
