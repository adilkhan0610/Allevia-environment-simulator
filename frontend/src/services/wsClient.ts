import type { ConnectionStatus } from '@/types/telemetry'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

export type WebSocketMessageHandler = (data: unknown) => void
export type WebSocketStatusHandler = (status: ConnectionStatus) => void

export class WebSocketSimulationClient {
  private socket: WebSocket | null = null
  private sessionId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private baseReconnectDelayMs = 1000
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null
  private isIntentionallyClosed = false

  private messageHandlers: Set<WebSocketMessageHandler> = new Set()
  private statusHandlers: Set<WebSocketStatusHandler> = new Set()

  constructor(private baseUrl: string = WS_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  connect(sessionId: string) {
    this.sessionId = sessionId
    this.isIntentionallyClosed = false
    this.reconnectAttempts = 0
    this.establishConnection()
  }

  private establishConnection() {
    if (!this.sessionId) return

    this.notifyStatus('CONNECTING')
    const wsUrl = `${this.baseUrl}/ws/simulation/${this.sessionId}`

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.reconnectAttempts = 0
        this.notifyStatus('CONNECTED')
      }

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(parsed))
        } catch {
          this.messageHandlers.forEach((handler) => handler(event.data))
        }
      }

      this.socket.onerror = () => {
        this.notifyStatus('ERROR')
      }

      this.socket.onclose = () => {
        this.socket = null
        if (!this.isIntentionallyClosed) {
          this.notifyStatus('RECONNECTING')
          this.scheduleReconnect()
        } else {
          this.notifyStatus('DISCONNECTED')
        }
      }
    } catch {
      this.notifyStatus('ERROR')
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyStatus('DISCONNECTED')
      return
    }

    const delay = Math.min(
      this.baseReconnectDelayMs * Math.pow(2, this.reconnectAttempts),
      10000
    )
    this.reconnectAttempts += 1

    this.reconnectTimeoutId = setTimeout(() => {
      this.establishConnection()
    }, delay)
  }

  disconnect() {
    this.isIntentionallyClosed = true
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId)
      this.reconnectTimeoutId = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.notifyStatus('DISCONNECTED')
  }

  send(data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data)
      this.socket.send(payload)
    } else {
      console.warn('Cannot send message: WebSocket is not open.')
    }
  }

  onMessage(handler: WebSocketMessageHandler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onStatusChange(handler: WebSocketStatusHandler) {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  private notifyStatus(status: ConnectionStatus) {
    this.statusHandlers.forEach((handler) => handler(status))
  }
}

export const wsSimulationClient = new WebSocketSimulationClient()
