import React, { useEffect, useRef } from 'react'
import { useSimulatorStore, RUN_SECONDS } from '@/store/simulatorStore'
import { useTelemetryStore } from '@/store/telemetryStore'

export const TransmissionLogPanel: React.FC = () => {
  const status = useSimulatorStore((s) => s.status)
  const secondsElapsed = useSimulatorStore((s) => s.secondsElapsed)
  const packetCount = useSimulatorStore((s) => s.packetCount)
  const logs = useSimulatorStore((s) => s.logs)
  const params = useSimulatorStore((s) => s.params)
  const tick = useSimulatorStore((s) => s.tick)

  const latestPacket = useTelemetryStore((s) => s.latestPacket)
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus)

  const logContainerRef = useRef<HTMLDivElement>(null)

  // Simulation timer loop
  useEffect(() => {
    if (status !== 'running') return
    const timer = setInterval(() => {
      tick()
    }, 1000)
    return () => clearInterval(timer)
  }, [status, tick])

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  // Status text mapping
  const getStatusText = () => {
    if (connectionStatus === 'CONNECTED') {
      return 'Live Bridge · Streaming'
    }
    switch (status) {
      case 'running':
        return 'Sending data...'
      case 'completed':
        return 'Data sent successfully'
      case 'stopped':
        return 'Stopped'
      case 'idle':
      default:
        return 'Waiting for start'
    }
  }

  // Realistic sensor and ADC conversion
  const hasSmoke = params.gases.includes('smoke')
  const hasCo = params.gases.includes('co')
  const hasLpg = params.gases.includes('lpg')
  const isRunning = status === 'running'

  const jitter = isRunning ? (packetCount % 3) - 1 : 0
  const mq2Raw = Math.min(1023, Math.max(0, (hasSmoke ? 760 : hasLpg ? 680 : 145) + jitter))
  const mq7Raw = Math.min(1023, Math.max(0, (hasCo ? 840 : 75) + jitter))
  const mq135Raw = Math.min(
    1023,
    Math.max(0, Math.round(90 + (params.airQuality / 500) * 780) + jitter)
  )

  const telemetryPacket = {
    device: 'sim-node-01',
    seq: packetCount,
    uptime_sec: secondsElapsed,
    sensors: {
      bme280: {
        temp_c: params.temperature,
        humidity_pct: params.humidity,
        pressure_hpa: params.pressure,
      },
      mq2_raw: mq2Raw,
      mq7_raw: mq7Raw,
      mq135_raw: mq135Raw,
      ir_raw: params.infrared,
    },
    gases_detected: params.gases.length > 0 ? params.gases : ['none'],
  }

  const progressPercent = Math.min(100, (secondsElapsed / RUN_SECONDS) * 100)

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-4 bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] overflow-hidden font-mono text-[11px] transition-colors">
      {/* Top Status & 1px Progress Bar */}
      <div className="space-y-2 pb-2.5 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center justify-between text-[12px] font-sans">
          <span className="text-[var(--foreground)] font-medium">{getStatusText()}</span>
          <span className="text-[var(--muted)] font-mono text-[11px]">
            {status === 'running' || status === 'completed'
              ? `${secondsElapsed}s / ${RUN_SECONDS}s`
              : 'Idle'}
          </span>
        </div>
        <div className="w-full h-[1px] bg-[var(--border)] overflow-hidden">
          <div
            className="h-full bg-[var(--foreground)] transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Live JSON Payload Block */}
      <div className="flex-1 my-2 overflow-hidden flex flex-col min-h-0 bg-[var(--surface-card)] p-2.5 rounded-[8px] border border-[var(--border-subtle)]">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wide mb-1 shrink-0 font-sans">
          Live Data Packet (JSON)
        </div>
        <pre className="flex-1 overflow-y-auto text-[10.5px] leading-tight text-[var(--foreground)] custom-scrollbar select-text">
          {JSON.stringify(latestPacket || telemetryPacket, null, 2)}
        </pre>
      </div>

      {/* Arduino C++ Snippet */}
      <div className="shrink-0 mb-2 p-2 bg-[var(--surface-card)] rounded-[8px] border border-[var(--border-subtle)] text-[10px] leading-tight text-[var(--secondary)] select-text hidden sm:block">
        <span className="text-[var(--muted)] font-sans block mb-0.5">Arduino Uno — Loop</span>
        <code>
          doc[&quot;temp&quot;] = {params.temperature.toFixed(1)}; doc[&quot;rh&quot;] = {Math.round(params.humidity)};<br />
          doc[&quot;co&quot;] = {mq7Raw}; doc[&quot;smoke&quot;] = {mq2Raw};<br />
          serializeJson(doc, Serial); Serial.println();
        </code>
      </div>

      {/* Transmission Terminal Log */}
      <div className="shrink-0 space-y-1">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wide font-sans">
          Transmission Log
        </div>
        <div
          ref={logContainerRef}
          className="h-20 sm:h-24 overflow-y-auto p-2 bg-[var(--surface-card)] rounded-[8px] border border-[var(--border-subtle)] space-y-1 text-[10.5px] text-[var(--foreground)] custom-scrollbar select-text"
        >
          {logs.map((line, idx) => (
            <div key={idx} className="leading-tight">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
