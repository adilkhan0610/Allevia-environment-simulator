import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PrimaryButton } from '@/components/ui/buttons'
import { SimulatedBadge } from '@/components/ui/status'
import { Cpu, Box, Activity, Info, Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export const TopNavigation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Simulation Lab', path: '/lab' },
    { name: 'Hardware & Architecture', path: '/about' },
    { name: 'How It Works', path: '/#how-it-works' },
  ]

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false)
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(path.replace('/#', ''))
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        const el = document.getElementById(path.replace('/#', ''))
        el?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(path)
    }
  }

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] w-full border-b border-[var(--border-subtle)] bg-[var(--surface-glass)] backdrop-blur-xl transition-colors duration-200">
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
            <p className="text-[10px] text-[var(--foreground-muted)] font-mono tracking-tight hidden sm:block">
              3D Detector Box Twin
            </p>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/' && !location.hash
                : location.pathname === link.path || location.hash === link.path.replace('/', '')

            return (
              <button
                key={link.name}
                type="button"
                onClick={() => handleLinkClick(link.path)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-medium cursor-pointer transition-all duration-150',
                  isActive
                    ? 'bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--border)] shadow-sm'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-glass)]'
                )}
              >
                <span>{link.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Actions: Theme Toggle & Start Simulation */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:block">
            <Link to="/lab">
              <PrimaryButton size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                Start Simulation
              </PrimaryButton>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle mobile menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)] text-left"
            >
              <Box className="h-4 w-4 text-[var(--accent)]" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/lab')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)] text-left"
            >
              <Activity className="h-4 w-4 text-[var(--accent)]" />
              <span>Simulation Lab</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/about')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)] text-left"
            >
              <Cpu className="h-4 w-4 text-[var(--accent)]" />
              <span>Hardware &amp; Architecture</span>
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('/#how-it-works')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)] text-left"
            >
              <Info className="h-4 w-4 text-[var(--accent)]" />
              <span>How It Works</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <Link to="/lab" onClick={() => setMobileMenuOpen(false)} className="w-full block">
              <PrimaryButton size="md" className="w-full justify-center">
                Start Simulation
              </PrimaryButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
