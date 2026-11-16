import React, { useState } from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { ArrowRight, Server, Radio, Database, Cpu, ShieldAlert, Layers } from 'lucide-react'

export const SystemArchitectureDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const steps = [
    {
      id: 1,
      name: 'Environmental Dynamics',
      tag: 'SIMULATION INPUTS',
      desc: 'Configurable time curves for temperature, humidity, pressure, and gas exposure keyframes (linear, exponential, step).',
      icon: Layers,
    },
    {
      id: 2,
      name: 'Virtual Sensor Suite',
      tag: 'PHYSICS MODELS',
      desc: 'Models SnO2 surface conductivity, pre-heating coil warm-up, thermal drift, Gaussian noise, and 10-bit SAR ADC quantization.',
      icon: Cpu,
    },
    {
      id: 3,
      name: 'Local Simulation Engine',
      tag: 'FASTAPI + ASYNCIO',
      desc: 'Python-based deterministic simulation state machine managing clock ticks, speed multipliers, and hardware fault injection.',
      icon: Server,
    },
    {
      id: 4,
      name: 'Telemetry Packet Generator',
      tag: 'SCHEMA V1.1.0',
      desc: 'Packages validated JSON frames watermarked with source="simulated", timestamps, sequence IDs, and sensor registers.',
      icon: Database,
    },
    {
      id: 5,
      name: 'WebSocket Streaming Hub',
      tag: 'REAL-TIME BROADCAST',
      desc: 'Bidirectional streaming service providing sub-second telemetry delivery and client control synchronization.',
      icon: Radio,
    },
    {
      id: 6,
      name: 'Interactive Simulation Lab',
      tag: 'REACT 19 + THREE.JS',
      desc: 'Interactive 3D digital twin cockpit, 5 live SVG waveform sparklines, scenario walkthroughs, and diagnostic controls.',
      icon: Cpu,
    },
    {
      id: 7,
      name: 'Local Event Processor',
      tag: 'DEMONSTRATION TIERS',
      desc: 'Local threshold evaluation evaluating thermal, smoke, and toxic gas events into GREEN, YELLOW, ORANGE, and RED tiers.',
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((st, idx) => {
          const Icon = st.icon
          const isSelected = activeStep === st.id
          return (
            <SurfacePanel
              key={st.id}
              onClick={() => setActiveStep(isSelected ? null : st.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'border-[var(--accent-primary)] bg-cyan-950/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:border-[var(--border-subtle)]/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--accent-primary)] font-semibold">
                    STEP 0{st.id}
                  </span>
                  <span className="text-[var(--foreground-muted)]">{st.tag}</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h4 className="text-sm font-semibold text-[var(--foreground-default)]">{st.name}</h4>
                </div>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{st.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--accent-primary)]">
                  <span>NEXT STAGE</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </SurfacePanel>
          )
        })}
      </div>

      {/* Planned Future Backend Integration Boundary */}
      <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4" />
            PLANNED INTEGRATION BOUNDARY — NOT CURRENTLY CONNECTED
          </div>
          <p className="text-xs text-[var(--foreground-muted)] max-w-2xl leading-relaxed">
            In Phase 10, an isolated backend adapter will bridge validated simulated packets to the real ALLEVIA
            ingestion pipeline. Currently, the simulator operates completely independently with zero production dependencies.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[11px] whitespace-nowrap">
          Phase 10 Target
        </div>
      </div>
    </div>
  )
}
