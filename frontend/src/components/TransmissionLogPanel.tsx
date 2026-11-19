import React, { useState, useEffect, useRef } from 'react'
import {
  useSimulatorStore,
  NODE_PROFILES,
} from '@/store/simulatorStore'
import { SIMULATION_CADENCE_SECONDS, POPULATION_API_BASE } from '@/services/simulationNetwork'

export const TransmissionLogPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'network' | 'payload' | 'logs'>('network')
  const [copied, setCopied] = useState(false)

  const countdownSeconds = useSimulatorStore((s) => s.countdownSeconds)
  const nodeStates = useSimulatorStore((s) => s.nodeStates)
  const lastSentPayload = useSimulatorStore((s) => s.lastSentPayload)
  const logs = useSimulatorStore((s) => s.logs)
  const tickSecond = useSimulatorStore((s) => s.tickSecond)
  const dispatchNetworkCycle = useSimulatorStore((s) => s.dispatchNetworkCycle)
  const params = useSimulatorStore((s) => s.params)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const currentNode = NODE_PROFILES[params.selectedNode] || NODE_PROFILES[1]

  // Continuous 1-second interval loop powering 60s network cycle and countdown
  useEffect(() => {
    const timer = setInterval(() => {
      tickSecond()
    }, 1000)
    return () => clearInterval(timer)
  }, [tickSecond])

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const handleCopyPayload = () => {
    if (!lastSentPayload) return
    navigator.clipboard.writeText(JSON.stringify(lastSentPayload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nodesList = Object.values(nodeStates)

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-4 bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] overflow-hidden font-mono text-[11px] transition-colors">
      {/* Top Banner: 60s Countdown + Next Send Bar */}
      <div className="space-y-2 pb-2.5 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center justify-between font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-[var(--foreground)]">
              Live Sensor Network (N01–N05)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-[var(--muted)]">Next send:</span>
            <span className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-emerald-400 font-bold border border-[var(--border)]">
              {countdownSeconds}s
            </span>
            <button
              type="button"
              onClick={() => dispatchNetworkCycle()}
              className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-95 cursor-pointer transition shadow-sm"
              title="Trigger immediate 60s network transmission for all nodes"
            >
              Send Now
            </button>
          </div>
        </div>

        {/* Countdown Progress Bar (60s cycle) */}
        <div className="w-full h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${((SIMULATION_CADENCE_SECONDS - countdownSeconds) / SIMULATION_CADENCE_SECONDS) * 100}%` }}
          />
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 font-sans text-[11px] pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-2.5 py-1 rounded-[6px] font-medium transition cursor-pointer ${
              activeTab === 'network'
                ? 'bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            All Nodes (Current vs Base)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`px-2.5 py-1 rounded-[6px] font-medium transition cursor-pointer ${
              activeTab === 'payload'
                ? 'bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            Last Sent Payload (Schema 1)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-2.5 py-1 rounded-[6px] font-medium transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            Transmission Logs
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="flex-1 my-2 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'network' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {nodesList.map((node) => {
              const isSelected = node.nodeId === currentNode.nodeId
              const isSpike = Boolean(node.override)
              const cur = node.current
              const base = node.baseline

              return (
                <div
                  key={node.nodeId}
                  className={`p-2 rounded-[8px] border transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface-hover)] border-[var(--foreground)]/40 shadow-sm'
                      : 'bg-[var(--surface-card)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[12px] text-[var(--foreground)]">
                        {node.nodeId}
                      </span>
                      <span className="text-[11px] text-[var(--secondary)]">
                        Zone {node.zone} ({node.zoneName})
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-sky-500/20 text-sky-400 font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      {isSpike ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                          Decaying Spike
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Normal Base
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid: Current vs Baseline */}
                  <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono bg-black/10 dark:bg-black/25 p-1.5 rounded-[6px]">
                    <div>
                      <div className="text-[var(--muted)] text-[9px] uppercase">Temp</div>
                      <div className="font-semibold text-[var(--foreground)]">
                        {cur.air_c.toFixed(1)}°C
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">
                        base: {base.air_c.toFixed(1)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--muted)] text-[9px] uppercase">RH %</div>
                      <div className="font-semibold text-[var(--foreground)]">
                        {Math.round(cur.rh_pct)}%
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">
                        base: {Math.round(base.rh_pct)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--muted)] text-[9px] uppercase">PM2.5</div>
                      <div className={`font-semibold ${cur.pm25 >= 150 ? 'text-red-400 font-bold' : cur.pm25 >= 55 ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {cur.pm25.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">
                        base: {base.pm25.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--muted)] text-[9px] uppercase">WBGT</div>
                      <div className={`font-semibold ${cur.wbgt_c >= 32.2 ? 'text-red-400 font-bold' : cur.wbgt_c >= 28.0 ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {cur.wbgt_c.toFixed(1)}°C
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">
                        base: {base.wbgt_c.toFixed(1)}°
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--muted)] text-[9px] uppercase">Battery</div>
                      <div className="font-semibold text-[var(--foreground)]">
                        {Math.round(cur.battery_pct)}%
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">
                        {cur.flame_ir_detected ? 'FLAME!' : 'nominal'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'payload' && (
          <div className="flex-1 overflow-hidden flex flex-col bg-[var(--surface-card)] p-2.5 rounded-[8px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] uppercase tracking-wide mb-1 shrink-0 font-sans">
              <span>Schema 1 Ingest Payload</span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] transition text-[10px] cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto text-[10.5px] leading-tight text-[var(--foreground)] custom-scrollbar select-text font-mono">
              {JSON.stringify(lastSentPayload, null, 2) || '// Waiting for first network transmission cycle...'}
            </pre>
            <div className="text-[9.5px] text-[var(--muted)] font-sans pt-1 mt-1 border-t border-[var(--border-subtle)]">
              Destination: {POPULATION_API_BASE}/api/v1/ingest/readings (Headers: X-Node-Id, X-Device-Key)
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2 bg-[var(--surface-card)] rounded-[8px] border border-[var(--border-subtle)] space-y-1 text-[10.5px] text-[var(--foreground)] custom-scrollbar select-text font-mono"
          >
            {logs.map((line, idx) => (
              <div key={idx} className="leading-tight">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info: Units and EPA Conversion Documentation */}
      <div className="shrink-0 p-2 bg-[var(--surface-card)] rounded-[8px] border border-[var(--border-subtle)] text-[10px] leading-tight text-[var(--secondary)] font-sans">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[var(--foreground)]">Cadence & Conversion Specs:</span>
          <span className="font-mono text-[9.5px]">60s network interval</span>
        </div>
        <div className="text-[9.5px] text-[var(--muted)] mt-0.5">
          Air Quality slider is in AQI (0–500), converted to PM2.5 (µg/m³) via standard EPA piecewise linear breakpoints before sending. Overridden spikes decay by k ≈ 0.82 (PM/gas) and k ≈ 0.90 (temp) each 60s cycle.
        </div>
      </div>
    </div>
  )
}
