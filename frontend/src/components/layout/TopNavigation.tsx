import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ConnectionIndicator, SimulatedBadge } from '@/components/ui/status'
import { useTelemetryStore } from '@/store/telemetryStore'
import { Cpu, Box, Activity, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

export const TopNavigation: React.FC = () => {
  const location = useLocation()
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus)

  const navLinks = [
    { name: 'Intro', path: '/', icon: Box },
    { name: 'Interactive Lab', path: '/lab', icon: Activity },
    { name: 'About & Hardware', path: '/about', icon: Info },
  ]

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] w-full border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)] transition-all duration-200 group-hover:border-[var(--accent)] group-hover:shadow-[0_0_16px_var(--accent-glow)]">
            <Cpu className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[var(--accent)] led-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold tracking-wider text-[var(--foreground)] text-sm">
                ALLEVIA
              </span>
              <SimulatedBadge />
            </div>
            <p className="text-[10px] text-[var(--foreground-muted)] font-mono tracking-tight">
              3D Detector Box Twin
            </p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--border)] shadow-sm'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-glass)]'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Action Stack: Connection & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <ConnectionIndicator status={connectionStatus} />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
