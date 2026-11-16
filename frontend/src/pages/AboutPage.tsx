import React from 'react'
import { Container } from '@/components/shared/Container'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Cpu, Layers, ShieldCheck, AlertCircle } from 'lucide-react'

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
      <Container size="narrow" className="space-y-10">
        <div>
          <StatusBadge status="HARDWARE SPECIFICATION" variant="cyan" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            ALLEVIA Detector Box Architecture
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Detailed physical specifications, sensor channels, and architectural constraints governing the virtual simulator twin.
          </p>
        </div>

        {/* Physical Hardware Roster */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Verified Physical Components
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {hardwareSensors.map((sensor) => (
              <Card key={sensor.name} className="border-slate-800">
                <CardHeader className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <CardTitle className="text-base text-white">{sensor.name}</CardTitle>
                    <span className="text-xs font-mono text-cyan-400">{sensor.pins}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{sensor.role}</span>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">{sensor.specs}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Strict Physical Constraints Notice */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertCircle className="h-4 w-4" />
              Negative Hardware Scope Constraints
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-300 font-mono">
            <p>
              • <strong>NO PM2.5 / Optical Particle Counters:</strong> The physical detector box does not contain laser dust sensors. No PM2.5 metrics are manufactured.
            </p>
            <p>
              • <strong>NO Globe-Temperature Sensors:</strong> No black-globe thermometer exists on the physical assembly. WBGT globe metrics are excluded.
            </p>
            <p>
              • <strong>NO Built-in Arduino Networking:</strong> The physical Uno communicates via serial. The simulator models the packet boundary accurately.
            </p>
          </CardContent>
        </Card>

        {/* Data Isolation Principle */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Data Isolation &amp; Integrity
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
            All packets generated in this simulator carry the immutable flag{' '}
            <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">source = &quot;simulated&quot;</code> and target the virtual sandbox zone{' '}
            <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">ZONE-SANDBOX-DEMO</code>. This ensures that mock environmental telemetry
            never pollutes genuine population epidemiology models or workforce health registries.
          </p>
        </div>

        {/* Project Roadmap Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Phased Engineering Roadmap
          </h2>
          <div className="rounded-xl border border-slate-800 bg-[#0F1118]/80 p-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-cyan-400">Phase 0: Architecture Blueprint</span>
              <span className="text-emerald-400">COMPLETED</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-cyan-400">Phase 1: Foundation (Frontend + Backend)</span>
              <span className="text-emerald-400">ACTIVE / COMPLETE</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Phase 2–4: Design System &amp; 3D Box</span>
              <span className="text-slate-500">PENDING APPROVAL</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Phase 5–8: Simulation Physics &amp; Live Lab</span>
              <span className="text-slate-500">SCHEDULED</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Phase 10: Real Backend Integration</span>
              <span className="text-slate-500">PLANNED</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
