import React from 'react'
import { EyebrowLabel } from '@/components/ui/typography'

export const HardwareStrip: React.FC = () => {
  const hardwareChannels = [
    {
      code: 'MCU-01',
      name: 'ARDUINO UNO',
      desc: 'ATmega328P • 10-bit ADC • 16 MHz',
      tag: 'CONTROL',
    },
    {
      code: 'ENV-02',
      name: 'BME280',
      desc: 'Temp • Humidity • Barometric Pressure',
      tag: 'DIGITAL I2C',
    },
    {
      code: 'GAS-03',
      name: 'MQ-2',
      desc: 'Smoke & Combustible Fuel Gases',
      tag: 'ANALOG A0',
    },
    {
      code: 'TOX-04',
      name: 'MQ-7',
      desc: 'Carbon Monoxide (CO) Toxic Detection',
      tag: 'ANALOG A1',
    },
    {
      code: 'AQI-05',
      name: 'MQ-135',
      desc: 'Air Quality • Ammonia • Benzene • NOx',
      tag: 'ANALOG A2',
    },
    {
      code: 'OPT-06',
      name: 'IR SENSOR',
      desc: 'Optical Obstacle & Beam Interrupter',
      tag: 'DIGITAL D2',
    },
  ]

  return (
    <div className="w-full border-y border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md py-6">
      <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-3">
          <EyebrowLabel>INTEGRATED PHYSICAL HARDWARE SUITE</EyebrowLabel>
          <span className="text-[10px] font-mono text-[var(--accent)] tracking-wider">
            6 VERIFIED CHANNELS • NO PM2.5 / GLOBE PROBES
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {hardwareChannels.map((hw) => (
            <div
              key={hw.code}
              className="p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60 hover:border-[var(--accent)]/50 transition-colors duration-200 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-semibold text-[var(--accent)]">
                  {hw.code}
                </span>
                <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-[var(--border)] text-[var(--foreground-muted)]">
                  {hw.tag}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[var(--foreground)] tracking-wide">
                {hw.name}
              </h4>
              <p className="text-[10px] text-[var(--foreground-muted)] font-mono leading-tight">
                {hw.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
