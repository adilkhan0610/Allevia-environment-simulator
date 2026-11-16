import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'

export const DetectorBoxVisual: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative w-full max-w-[460px] mx-auto aspect-square flex items-center justify-center select-none',
        className
      )}
      style={{ perspective: 1200 }}
    >
      {/* Ambient Radial Backlight Glow */}
      <div className="absolute inset-4 rounded-full bg-[var(--accent)] opacity-15 blur-3xl pointer-events-none" />

      {/* Floating 3D Enclosure Chassis */}
      <motion.div
        initial={{ y: 0, rotateX: 6, rotateY: -8 }}
        animate={{
          y: [-6, 6, -6],
          rotateX: [5, 8, 5],
          rotateY: [-10, -5, -10],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-[32px] p-[1.5px] transition-transform duration-500 hover:scale-[1.02]"
        style={{
          transformStyle: 'preserve-3d',
          background:
            'linear-gradient(135deg, var(--accent) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.02) 60%, var(--accent) 100%)',
          boxShadow:
            '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px var(--accent-glow)',
        }}
      >
        {/* Enclosure Outer Surface (Near-black matte polycarbonate texture) */}
        <div className="w-full h-full rounded-[30.5px] bg-[#0A0D10] border border-[var(--border)] p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Subtle Top Inner Bevel Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.25)] to-transparent" />

          {/* Top Row: Technical Hardware Badges & Optical IR Window */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] led-pulse" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--foreground-muted)]">
                REV-3.2 • DETECTOR UNIT
              </span>
            </div>

            {/* Front Optical IR Sensor Window */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[#10151A] text-[9px] font-mono text-[var(--foreground-secondary)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>IR-OPT CLEAR</span>
            </div>
          </div>

          {/* Center: Engraved ALLEVIA Hardware Branding & Sensor Grille */}
          <div className="flex flex-col items-center justify-center my-auto space-y-4 z-10 text-center">
            {/* Hexagonal Airflow Sensor Chamber */}
            <div className="relative w-28 h-28 rounded-2xl border border-[var(--border)] bg-[#12171E] flex items-center justify-center shadow-inner group">
              {/* Concentric Sensor Perimeter Glow */}
              <div className="absolute inset-1.5 rounded-xl border border-[var(--accent)]/30 border-dashed" />
              <div className="absolute inset-3 rounded-lg bg-[#080B0E] flex items-center justify-center">
                {/* Airflow Perforation Vents */}
                <div className="grid grid-cols-4 gap-1.5 opacity-60">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--foreground-muted)]"
                    />
                  ))}
                </div>
              </div>
              <Cpu className="absolute h-6 w-6 text-[var(--accent)] opacity-90 drop-shadow-[0_0_8px_var(--accent)]" />
            </div>

            <div>
              <h4 className="font-display font-bold tracking-[0.2em] text-xl text-white">
                ALLEVIA
              </h4>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent)] mt-0.5">
                Workforce Health Early Warning
              </p>
            </div>
          </div>

          {/* Bottom Row: Hardware Specifications & Pinout Indicators */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)] z-10 text-[9px] font-mono">
            <div className="p-1.5 rounded-md bg-[#12171E] border border-[var(--border-subtle)] text-center">
              <span className="text-[var(--foreground-muted)] block text-[8px]">CORE</span>
              <span className="text-[var(--foreground)] font-semibold">ATmega328P</span>
            </div>
            <div className="p-1.5 rounded-md bg-[#12171E] border border-[var(--border-subtle)] text-center">
              <span className="text-[var(--foreground-muted)] block text-[8px]">BUS</span>
              <span className="text-[var(--foreground)] font-semibold">I2C + 10b ADC</span>
            </div>
            <div className="p-1.5 rounded-md bg-[#12171E] border border-[var(--border-subtle)] text-center">
              <span className="text-[var(--foreground-muted)] block text-[8px]">STATUS</span>
              <span className="text-[var(--accent)] font-semibold flex items-center justify-center gap-1">
                <Zap className="h-2.5 w-2.5 inline" /> ACTIVE
              </span>
            </div>
          </div>

          {/* Subtle Cyber Dust / Grid Background lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      </motion.div>

      {/* Floating Technical Annotation Callouts */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute -bottom-4 right-0 sm:-right-4 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]/90 backdrop-blur-md shadow-xl text-[10px] font-mono flex items-center gap-2"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        <span className="text-[var(--foreground-secondary)]">3D CAD Model (Phase 4 Target)</span>
      </motion.div>
    </div>
  )
}
