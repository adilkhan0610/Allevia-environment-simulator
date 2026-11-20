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
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-3.5 bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] overflow-hidden font-mono text-[11px] transition-colors">
      {/* Top Banner: Live Status + 60s Countdown + Next Send Bar */}
      <div className="space-y-2.5 pb-2.5 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center justify-between gap-2 font-sans">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[12px] font-semibold tracking-tight text-[var(--foreground)] truncate">
              Live Sensor Network (N01–N05)
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
            <span className="text-[var(--muted)] text-[10.5px]">Next send:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/20 text-[10.5px] tabular-nums">
              {countdownSeconds}s
            </span>
          </div>
        </div>

        {/* Countdown Progress Bar (60s cycle) */}
        <div className="w-full h-[2.5px] bg-[var(--border-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_6px_rgba(16,185,129,0.4)]"
            style={{ width: `${((SIMULATION_CADENCE_SECONDS - countdownSeconds) / SIMULATION_CADENCE_SECONDS) * 100}%` }}
          />
        </div>

        {/* Segmented View Tabs */}
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-[var(--surface-card)] rounded-[8px] border border-[var(--border-subtle)] font-sans text-[10.5px]">
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-2 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer text-center truncate ${
              activeTab === 'network'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            All Nodes (Current vs Base)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`px-2 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer text-center truncate ${
              activeTab === 'payload'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            Last Sent Payload (Schema 1)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-2 py-1.5 rounded-[6px] font-medium transition-all cursor-pointer text-center truncate ${
              activeTab === 'logs'
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
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
                  className={`p-2.5 rounded-[10px] border transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-hover)] border-sky-500/40 shadow-xs ring-1 ring-sky-500/20'
                      : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 font-sans">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-[12px] font-mono text-[var(--foreground)] shrink-0">
                        {node.nodeId}
                      </span>
                      <span className="text-[11px] text-[var(--secondary)] truncate">
                        Zone {node.zone} ({node.zoneName})
                      </span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0 whitespace-nowrap">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 whitespace-nowrap">
                      {isSpike ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse shrink-0 whitespace-nowrap">
                          Decaying Spike
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0 whitespace-nowrap">
                          Normal Base
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid: Current vs Baseline */}
                  <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono bg-black/5 dark:bg-black/30 p-2 rounded-[8px] border border-[var(--border-subtle)]">
                    <div className="min-w-0">
                      <div className="text-[var(--muted)] text-[8.5px] uppercase font-semibold tracking-wider">Temp</div>
                      <div className="font-semibold text-[11px] text-[var(--foreground)] truncate">
                        {cur.air_c.toFixed(1)}°C
                      </div>
                      <div className="text-[9px] text-[var(--muted)] truncate">
                        base: {base.air_c.toFixed(1)}°
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[var(--muted)] text-[8.5px] uppercase font-semibold tracking-wider">RH %</div>
                      <div className="font-semibold text-[11px] text-[var(--foreground)] truncate">
                        {Math.round(cur.rh_pct)}%
                      </div>
                      <div className="text-[9px] text-[var(--muted)] truncate">
                        base: {Math.round(base.rh_pct)}%
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[var(--muted)] text-[8.5px] uppercase font-semibold tracking-wider">PM2.5</div>
                      <div className={`font-semibold text-[11px] truncate ${cur.pm25 >= 150 ? 'text-red-400 font-bold' : cur.pm25 >= 55 ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {cur.pm25.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[var(--muted)] truncate">
                        base: {base.pm25.toFixed(1)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[var(--muted)] text-[8.5px] uppercase font-semibold tracking-wider">WBGT</div>
                      <div className={`font-semibold text-[11px] truncate ${cur.wbgt_c >= 32.2 ? 'text-red-400 font-bold' : cur.wbgt_c >= 28.0 ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {cur.wbgt_c.toFixed(1)}°C
                      </div>
                      <div className="text-[9px] text-[var(--muted)] truncate">
                        base: {base.wbgt_c.toFixed(1)}°
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[var(--muted)] text-[8.5px] uppercase font-semibold tracking-wider">Battery</div>
                      <div className="font-semibold text-[11px] text-[var(--foreground)] truncate">
                        {Math.round(cur.battery_pct)}%
                      </div>
                      <div className={`text-[9px] truncate ${cur.flame_ir_detected ? 'text-rose-400 font-bold animate-pulse' : 'text-[var(--muted)]'}`}>
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
          <div className="flex-1 overflow-hidden flex flex-col bg-[var(--surface-card)] p-3 rounded-[10px] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] uppercase tracking-wide mb-2 shrink-0 font-sans">
              <span className="font-semibold text-[var(--foreground)]">Schema 1 Ingest Payload</span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="px-2.5 py-1 rounded-[6px] bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] transition text-[10px] cursor-pointer font-medium"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto text-[10.5px] leading-relaxed text-[var(--foreground)] bg-black/5 dark:bg-black/35 p-2.5 rounded-[8px] border border-[var(--border-subtle)] custom-scrollbar select-text font-mono">
              {JSON.stringify(lastSentPayload, null, 2) || '// Waiting for first network transmission cycle...'}
            </pre>
            <div className="text-[9.5px] text-[var(--muted)] font-sans pt-2 mt-2 border-t border-[var(--border-subtle)]">
              Destination: {POPULATION_API_BASE}/api/v1/ingest/readings (Headers: X-Node-Id, X-Device-Key)
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2.5 bg-[var(--surface-card)] rounded-[10px] border border-[var(--border-subtle)] space-y-1 text-[10.5px] text-[var(--foreground)] custom-scrollbar select-text font-mono leading-relaxed"
          >
            {logs.map((line, idx) => (
              <div key={idx} className="leading-tight py-0.5">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info: Units and EPA Conversion Documentation */}
      <div className="shrink-0 p-2.5 mt-2 bg-[var(--surface-card)] rounded-[10px] border border-[var(--border-subtle)] text-[10px] leading-relaxed text-[var(--secondary)] font-sans">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-subtle)]">
          <span className="font-semibold text-[var(--foreground)]">Cadence & Conversion Specs:</span>
          <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)]">
            60s network interval
          </span>
        </div>
        <div className="text-[9.5px] text-[var(--muted)] leading-normal">
          Air Quality slider is in AQI (0–500), converted to PM2.5 (µg/m³) via standard EPA piecewise linear breakpoints before sending. Overridden spikes decay by k ≈ 0.82 (PM/gas) and k ≈ 0.90 (temp) each 60s cycle.
        </div>
      </div>
    </div>
  )
}
