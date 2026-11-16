import React, { useState } from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { Copy, Check, Download, Trash2, Terminal, ChevronDown, ChevronUp } from 'lucide-react'
import type { TelemetryPacketData } from '@/types/telemetry'

interface TelemetryInspectorProps {
  latestPacket: TelemetryPacketData | null
  onClearHistory: () => void
}

export const TelemetryInspector: React.FC<TelemetryInspectorProps> = ({
  latestPacket,
  onClearHistory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const jsonString = latestPacket ? JSON.stringify(latestPacket, null, 2) : 'No telemetry received yet.'

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `allevia-telemetry-${latestPacket?.sequence_number ?? 0}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <SurfacePanel className="border border-[var(--border-subtle)] p-4 rounded-xl">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-default)] flex items-center gap-2">
              Raw Telemetry Packet Inspector
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-[var(--accent-primary)] rounded border border-cyan-500/20">
                v1.1.0 • SIMULATED
              </span>
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Inspect verified payload JSON structure, sequence numbers, and sensor registers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && latestPacket && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] rounded border border-[var(--border-subtle)] transition-colors"
                title="Copy JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] rounded border border-[var(--border-subtle)] transition-colors"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClearHistory}
                className="p-1.5 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] rounded border border-[var(--border-subtle)] transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--foreground-muted)] mb-2">
            <span>PKT ID: {latestPacket?.packet_id || 'N/A'}</span>
            <span>SEQ: {latestPacket?.sequence_number ?? 0}</span>
            <span>SIM TIME: {latestPacket?.sim_time_sec ?? 0}s</span>
          </div>
          <pre className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-[11px] font-mono text-[var(--accent-primary)] overflow-x-auto max-h-60 custom-scrollbar">
            {jsonString}
          </pre>
        </div>
      )}
    </SurfacePanel>
  )
}
