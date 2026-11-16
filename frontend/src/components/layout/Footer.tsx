import React from 'react'
import { Container } from '@/components/shared/Container'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#08090D] py-6 text-xs text-slate-500 font-mono">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>ALLEVIA Environment Simulator v1.0.0</span>
          <span>•</span>
          <span className="text-cyan-500/80">Phase 1 Foundation</span>
        </div>
        <div className="text-center sm:text-right text-[11px] text-slate-600">
          Strict Data Isolation: <span className="text-amber-500/80">source = &quot;simulated&quot;</span>. No real health data modified.
        </div>
      </Container>
    </footer>
  )
}
