import { useEffect } from 'react'
import { wsSimulationClient } from '@/services/wsClient'
import { useTelemetryStore } from '@/store/telemetryStore'
import { useSimulationStore } from '@/store/simulationStore'
import type { TelemetryPacketData } from '@/types/telemetry'

export function useWebSocket(sessionId: string | null) {
  const setConnectionStatus = useTelemetryStore((s) => s.setConnectionStatus)
  const addTelemetryPacket = useTelemetryStore((s) => s.addTelemetryPacket)
  const setSimulatedTier = useSimulationStore((s) => s.setSimulatedTier)

  useEffect(() => {
    if (!sessionId) {
      wsSimulationClient.disconnect()
      return
    }

    const unsubscribeStatus = wsSimulationClient.onStatusChange((status) => {
      setConnectionStatus(status)
    })

    const unsubscribeMessage = wsSimulationClient.onMessage((rawMessage: unknown) => {
      if (typeof rawMessage === 'object' && rawMessage !== null) {
        const msg = rawMessage as Record<string, unknown>
        if (msg.event_type === 'TELEMETRY_PACKET' && msg.payload) {
          const packet = msg.payload as TelemetryPacketData
          addTelemetryPacket(packet)
          if (packet.simulated_tier) {
            setSimulatedTier(packet.simulated_tier)
          }
        }
      }
    })

    wsSimulationClient.connect(sessionId)

    return () => {
      unsubscribeStatus()
      unsubscribeMessage()
      wsSimulationClient.disconnect()
    }
  }, [sessionId, setConnectionStatus, addTelemetryPacket, setSimulatedTier])
}
