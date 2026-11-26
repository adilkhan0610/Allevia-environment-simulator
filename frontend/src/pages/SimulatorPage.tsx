import React, { useState } from 'react'
import { APP_NAME } from '@/config/brand'
import { useSimulatorStore } from '@/store/simulatorStore'
import { useThemeStore } from '@/store/themeStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { apiClient } from '@/services/apiClient'
import { ParametersPanel } from '@/components/ParametersPanel'
import { HardwareModel } from '@/three/HardwareModel'
import { TransmissionLogPanel } from '@/components/TransmissionLogPanel'
import { AboutModal } from '@/components/AboutModal'

export const SimulatorPage: React.FC = () => {
  const [aboutOpen, setAboutOpen] = useState(false)
  const sessionId = null
  useWebSocket(sessionId)

  const start = useSimulatorStore((s) => s.start)
  const reset = useSimulatorStore((s) => s.reset)
  const status = useSimulatorStore((s) => s.status)
  const selectedNode = useSimulatorStore((s) => s.params.selectedNode)

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const handleAction = async () => {
    start()
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'start' })
      } catch (e) {
        // Backend session warning
      }
    }
  }

  const actionLabel = `Trigger Spike · Zone ${['A', 'B', 'C', 'D', 'E'][selectedNode - 1] || 'A'}`

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--background)] text-[var(--foreground)] select-none transition-colors">
      {/* 56px Header */}
      <header className="h-14 min-h-[56px] max-h-[56px] px-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md z-20 transition-colors">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
            {APP_NAME}
          </span>
          <span className="text-[11px] font-normal text-[var(--secondary)] px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)]">
            Simulator
          </span>
        </div>

        {/* Center: Controls (Start/Stop/Restart + Reset Values on the right side of Start) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAction}
            className={`px-6 py-1.5 rounded-full text-xs font-medium transition shadow-sm cursor-pointer ${
              status === 'running'
                ? 'bg-[var(--foreground)] text-[var(--background)] ring-2 ring-red-500/30'
                : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98]'
            }`}
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-[var(--secondary)] hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition active:scale-[0.98] cursor-pointer"
          >
            Reset Values
          </button>
        </div>

        {/* Right: Theme Toggle + About Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--secondary)] hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition active:scale-[0.98] cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
          >
            About
          </button>
        </div>
      </header>

      {/* Main Single-Screen Three-Column Layout (fits 100dvh without scrolling) */}
      <main className="flex-1 grid grid-cols-[280px_minmax(0,1fr)_340px] gap-3 p-3 overflow-hidden h-[calc(100dvh-56px)]">
        {/* Left Column: Editable Parameters */}
        <section className="h-full overflow-hidden" aria-label="Sensor Parameters">
          <ParametersPanel />
        </section>

        {/* Center Column: 3D Hardware Model */}
        <section className="h-full overflow-hidden" aria-label="Hardware 3D View">
          <HardwareModel />
        </section>

        {/* Right Column: Transmission Log */}
        <section className="h-full overflow-hidden" aria-label="Transmission Log">
          <TransmissionLogPanel />
        </section>
      </main>

      {/* Centered Minimal About Modal */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
