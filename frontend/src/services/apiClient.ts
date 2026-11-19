import type {
  ScenarioListApiResponse,
  SessionCreateApiRequest,
  SessionDeleteApiResponse,
} from '@/types/api'
import type { SimulationSession } from '@/types/simulation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, { ...options, headers })
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorMessage)
      }
      return (await response.json()) as T
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err
      }
      throw new Error(String(err))
    }
  }

  async checkHealth(): Promise<{ status: string; service: string; source: string; timestamp: string }> {
    return this.request('/health')
  }

  async getScenarios(): Promise<ScenarioListApiResponse> {
    return this.request('/api/v1/scenarios')
  }

  async createSession(payload: SessionCreateApiRequest = {}): Promise<SimulationSession> {
    return this.request('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getSession(sessionId: string): Promise<SimulationSession> {
    return this.request(`/api/v1/sessions/${sessionId}`)
  }

  async deleteSession(sessionId: string): Promise<SessionDeleteApiResponse> {
    return this.request(`/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  async controlEngine(
    sessionId: string,
    payload: {
      action: string
      speed_multiplier?: number
      intensity_multiplier?: number
      scenario_id?: string
      sensor_name?: string
      fault_type?: string | null
      dt?: number
    }
  ): Promise<{ action: string; session_id: string; engine_state?: unknown }> {
    return this.request(`/api/v1/sessions/${sessionId}/engine/control`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getEngineHistory(sessionId: string, limit = 50): Promise<unknown[]> {
    return this.request(`/api/v1/sessions/${sessionId}/engine/history?limit=${limit}`)
  }

  async setIntegrationNode(node: number): Promise<unknown> {
    return this.request('/api/v1/integration/target-node', {
      method: 'POST',
      body: JSON.stringify({ node }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
