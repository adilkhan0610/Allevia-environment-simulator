import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--surface)] py-10 text-xs font-mono">
      <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Motto */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-display font-bold text-sm tracking-widest text-[var(--foreground)]">
            ALLEVIA
          </span>
          <span className="hidden sm:inline text-[var(--foreground-muted)]">•</span>
          <span className="text-[11px] tracking-wider text-[var(--accent)] font-semibold">
            DETECT · UNDERSTAND · ACT
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-[var(--foreground-secondary)]">
          <Link to="/" className="hover:text-[var(--accent)] transition-colors">
            Overview
          </Link>
          <Link to="/lab" className="hover:text-[var(--accent)] transition-colors">
            Simulation Lab
          </Link>
          <Link to="/about" className="hover:text-[var(--accent)] transition-colors">
            About
          </Link>
        </div>

        {/* Data Quarantine Indicator */}
        <div className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] text-center md:text-right">
          SIMULATED DATA · ENGINEERING DEMONSTRATION
        </div>
      </div>
    </footer>
  )
}
