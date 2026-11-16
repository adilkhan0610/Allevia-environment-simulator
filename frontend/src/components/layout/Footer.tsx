import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--surface)] py-6 text-xs text-[var(--foreground-muted)] font-mono">
      <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--foreground-secondary)]">ALLEVIA Environment Simulator</span>
          <span>•</span>
          <span className="text-[var(--accent)]">Design System v2.0</span>
        </div>
        <div className="text-center sm:text-right text-[11px] text-[var(--foreground-muted)]">
          Hardware Sandbox Quarantine • <span className="text-[var(--accent)]">source=&quot;simulated&quot;</span>
        </div>
      </div>
    </footer>
  )
}
