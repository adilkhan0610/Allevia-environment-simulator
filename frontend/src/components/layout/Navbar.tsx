import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useTelemetryStore } from '@/store/telemetryStore'
import { Activity, Box, Cpu, Info } from 'lucide-react'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus)

  const navLinks = [
    { name: 'Intro', path: '/', icon: Box },
    { name: 'Interactive Lab', path: '/lab', icon: Activity },
    { name: 'About & Hardware', path: '/about', icon: Info },
  ]

  const statusVariantMap: Record<string, 'green' | 'yellow' | 'red' | 'neutral' | 'cyan'> = {
    CONNECTED: 'green',
    CONNECTING: 'yellow',
    RECONNECTING: 'yellow',
    ERROR: 'red',
    DISCONNECTED: 'neutral',
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#08090D]/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-white text-sm">ALLEVIA</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Detector Box 3D Twin</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700/60 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Connection & Mode Badges */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500 border-r border-slate-800 pr-3">
            MODE: <span className="text-cyan-400 font-semibold">STANDALONE</span>
          </span>
          <StatusBadge
            status={connectionStatus}
            variant={statusVariantMap[connectionStatus] || 'neutral'}
            pulse={connectionStatus === 'CONNECTED'}
          />
        </div>
      </Container>
    </header>
  )
}
