import React from 'react'
import { PageContainer } from '@/components/layout/Containers'
import { GlassPanel, SurfacePanel } from '@/components/ui/panels'
import { DisplayHeading, SectionHeading, BodyText } from '@/components/ui/typography'
import { StatusIndicator } from '@/components/ui/status'
import { DetectorBoxLazy } from '@/three/DetectorBoxLazy'
import { Cpu, Layers, ShieldCheck, AlertCircle, Box } from 'lucide-react'

export const AboutPage: React.FC = () => {
  const hardwareSensors = [
    {
      name: 'Arduino Uno Rev3',
      role: 'Core Microcontroller',
      specs: 'ATmega328P @ 16 MHz, 10-bit Successive Approximation ADC (0–1023), 5.0V Reference.',
      pins: 'Digital D0–D13, Analog A0–A5',
    },
    {
      name: 'BME280',
      role: 'Environmental Ambient Sensor',
      specs: 'Temperature (-40 to 85°C), Relative Humidity (0 to 100%), Atmospheric Pressure (300 to 1100 hPa).',
      pins: 'I2C Interface (SDA / SCL)',
    },
    {
      name: 'MQ-2',
      role: 'Combustible Gas & Smoke Sensor',
      specs: 'Metal oxide semiconductor sensor sensitive to LPG, propane, methane, hydrogen, and smoke particles.',
      pins: 'Analog Pin A0',
    },
    {
      name: 'MQ-7',
      role: 'Carbon Monoxide (CO) Sensor',
      specs: 'High/low heat cycling sensor tuned for Carbon Monoxide detection in industrial/workplace environments.',
      pins: 'Analog Pin A1',
    },
    {
      name: 'MQ-135',
      role: 'Air Quality & Volatile Organic Sensor',
      specs: 'Wide-spectrum air quality sensor sensitive to ammonia, nitrogen oxides, alcohol, benzene, and smoke.',
      pins: 'Analog Pin A2',
    },
    {
      name: 'IR Sensor',
      role: 'Optical Obstacle & Beam Interrupter',
      specs: 'Infrared transmitter/receiver pair producing digital flag (0=Clear, 1=Obstructed).',
      pins: 'Digital Pin D2',
    },
  ]

  return (
    <div className="flex-1 py-12">
      <PageContainer size="narrow" className="space-y-10">
        <div>
          <StatusIndicator label="HARDWARE SPECIFICATION" variant="cyan" />
          <DisplayHeading as="h1" className="text-3xl sm:text-4xl mt-3">
            Detector Box Architecture
          </DisplayHeading>
          <BodyText className="mt-2">
            Detailed physical specifications, sensor channels, and architectural constraints governing the virtual simulator twin.
          </BodyText>
        </div>

        {/* Interactive 3D Exploded View Inspection */}
        <div className="space-y-4">
          <SectionHeading as="h2" className="flex items-center gap-2">
            <Box className="h-4 w-4 text-[var(--accent)]" />
            Interactive 3D Assembly &amp; Callout Inspection
          </SectionHeading>
          <DetectorBoxLazy exploded showCallouts className="h-[460px] sm:h-[500px]" />
        </div>

        {/* Physical Hardware Roster */}
        <div className="space-y-4">
          <SectionHeading as="h2" className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[var(--accent)]" />
            Verified Physical Components
          </SectionHeading>

          <div className="grid grid-cols-1 gap-4">
            {hardwareSensors.map((sensor) => (
              <SurfacePanel key={sensor.name} className="p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{sensor.name}</h3>
                  <span className="text-xs font-mono text-[var(--accent)]">{sensor.pins}</span>
                </div>
                <p className="text-xs text-[var(--foreground-muted)] font-medium">{sensor.role}</p>
                <p className="text-xs text-[var(--foreground-secondary)] font-mono leading-relaxed">{sensor.specs}</p>
              </SurfacePanel>
            ))}
          </div>
        </div>

        {/* Strict Physical Constraints Notice */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--status-yellow)]/30 bg-[var(--status-yellow-bg)] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[var(--status-yellow)] font-semibold text-sm">
            <AlertCircle className="h-4 w-4" />
            Negative Hardware Scope Constraints
          </div>
          <div className="space-y-2 text-xs text-[var(--foreground-secondary)] font-mono">
            <p>
              • <strong>NO PM2.5 / Optical Particle Counters:</strong> The physical detector box does not contain laser dust sensors. No PM2.5 metrics are manufactured.
            </p>
            <p>
              • <strong>NO Globe-Temperature Sensors:</strong> No black-globe thermometer exists on the physical assembly. WBGT globe metrics are excluded.
            </p>
            <p>
              • <strong>NO Built-in Arduino Networking:</strong> The physical Uno communicates via serial. The simulator models the packet boundary accurately.
            </p>
          </div>
        </div>

        {/* Data Isolation Principle */}
        <div className="space-y-4">
          <SectionHeading as="h2" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Data Isolation &amp; Integrity
          </SectionHeading>
          <BodyText size="sm" className="font-mono leading-relaxed">
            All packets generated in this simulator carry the immutable flag{' '}
            <code className="text-[var(--accent)] bg-[var(--surface-elevated)] px-1 py-0.5 rounded">source = &quot;simulated&quot;</code> and target the virtual sandbox zone{' '}
            <code className="text-[var(--accent)] bg-[var(--surface-elevated)] px-1 py-0.5 rounded">ZONE-SANDBOX-DEMO</code>. This ensures that mock environmental telemetry
            never pollutes genuine population epidemiology models or workforce health registries.
          </BodyText>
        </div>

        {/* Project Roadmap Summary */}
        <div className="space-y-4">
          <SectionHeading as="h2" className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--accent)]" />
            Phased Engineering Roadmap
          </SectionHeading>
          <GlassPanel variant="subtle" className="p-5 space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--accent)]">Phase 0: Architecture Blueprint</span>
              <span className="text-[var(--status-green)] font-semibold">COMPLETED</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--accent)]">Phase 1: Foundation (Frontend + Backend)</span>
              <span className="text-[var(--status-green)] font-semibold">COMPLETED</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--accent)]">Phase 2: Design System &amp; Visual Identity</span>
              <span className="text-[var(--status-green)] font-semibold">ACTIVE / COMPLETE</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--foreground-muted)]">Phase 3–4: Landing Page &amp; 3D Box</span>
              <span className="text-[var(--foreground-muted)]">NEXT UP</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--foreground-muted)]">Phase 5–8: Simulation Physics &amp; Live Lab</span>
              <span className="text-[var(--foreground-muted)]">SCHEDULED</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[var(--foreground-muted)]">Phase 10: Real Backend Integration</span>
              <span className="text-[var(--foreground-muted)]">PLANNED</span>
            </div>
          </GlassPanel>
        </div>
      </PageContainer>
    </div>
  )
}
