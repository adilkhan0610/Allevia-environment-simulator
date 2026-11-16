import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PrimaryButton, SecondaryButton, GhostButton, IconButton } from '@/components/ui/buttons'
import { GlassPanel, SurfacePanel, SectionPanel } from '@/components/ui/panels'
import { StatusIndicator, ConnectionIndicator, SimulatedBadge, TierBadge } from '@/components/ui/status'
import { DisplayHeading, MonoValue, EyebrowLabel } from '@/components/ui/typography'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useThemeStore } from '@/store/themeStore'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DesignSystemPreviewPage } from '@/pages/DesignSystemPreviewPage'
import { Zap } from 'lucide-react'

describe('ALLEVIA Design System Components', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.getState().setTheme('dark')
  })

  describe('Buttons', () => {
    it('renders PrimaryButton and handles click events', () => {
      const handleClick = vi.fn()
      render(
        <PrimaryButton onClick={handleClick} icon={<Zap data-testid="icon" />}>
          Run Simulation
        </PrimaryButton>
      )

      const btn = screen.getByRole('button', { name: /Run Simulation/i })
      expect(btn).toBeInTheDocument()
      expect(screen.getByTestId('icon')).toBeInTheDocument()

      fireEvent.click(btn)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders SecondaryButton, GhostButton, and IconButton', () => {
      render(
        <div>
          <SecondaryButton>Secondary</SecondaryButton>
          <GhostButton>Ghost</GhostButton>
          <IconButton icon={<Zap />} aria-label="Quick Action" />
        </div>
      )

      expect(screen.getByRole('button', { name: /Secondary/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ghost/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Quick Action/i })).toBeInTheDocument()
    })

    it('disables buttons when disabled or loading', () => {
      render(<PrimaryButton disabled>Disabled Action</PrimaryButton>)
      expect(screen.getByRole('button', { name: /Disabled Action/i })).toBeDisabled()
    })
  })

  describe('Panels', () => {
    it('renders GlassPanel with glassmorphism classes', () => {
      const { container } = render(<GlassPanel variant="standard">Glass Content</GlassPanel>)
      expect(screen.getByText('Glass Content')).toBeInTheDocument()
      expect(container.firstChild).toHaveClass('glass-panel')
    })

    it('renders SurfacePanel and SectionPanel', () => {
      render(
        <SectionPanel title="Panel Header" subtitle="Sub-caption">
          <SurfacePanel>Surface Content</SurfacePanel>
        </SectionPanel>
      )

      expect(screen.getByText('Panel Header')).toBeInTheDocument()
      expect(screen.getByText('Sub-caption')).toBeInTheDocument()
      expect(screen.getByText('Surface Content')).toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('renders StatusIndicator, ConnectionIndicator, and TierBadge', () => {
      render(
        <div>
          <StatusIndicator label="SYSTEM NORMAL" variant="green" />
          <ConnectionIndicator status="CONNECTED" />
          <SimulatedBadge />
          <TierBadge tier="RED" />
        </div>
      )

      expect(screen.getByText('SYSTEM NORMAL')).toBeInTheDocument()
      expect(screen.getByText('CONNECTED')).toBeInTheDocument()
      expect(screen.getByText('SIMULATED')).toBeInTheDocument()
      expect(screen.getByText(/TIER: RED/i)).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('renders DisplayHeading, MonoValue with unit, and EyebrowLabel', () => {
      render(
        <div>
          <DisplayHeading as="h1">SYSTEM OVERVIEW</DisplayHeading>
          <MonoValue size="lg" unit="°C">42.5</MonoValue>
          <EyebrowLabel>Telemetry Feed</EyebrowLabel>
        </div>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('SYSTEM OVERVIEW')
      expect(screen.getByText('42.5')).toBeInTheDocument()
      expect(screen.getByText('°C')).toBeInTheDocument()
      expect(screen.getByText('Telemetry Feed')).toBeInTheDocument()
    })
  })

  describe('Theme System', () => {
    it('toggles theme mode and updates document classes and localStorage', () => {
      render(<ThemeToggle />)
      const toggleBtn = screen.getByRole('button', { name: /Switch to light mode/i })
      expect(toggleBtn).toBeInTheDocument()
      expect(useThemeStore.getState().mode).toBe('dark')

      fireEvent.click(toggleBtn)
      expect(useThemeStore.getState().mode).toBe('light')
      expect(localStorage.getItem('allevia-theme-mode')).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)

      fireEvent.click(toggleBtn)
      expect(useThemeStore.getState().mode).toBe('dark')
      expect(localStorage.getItem('allevia-theme-mode')).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('Design System Preview Route', () => {
    it('renders the complete /design-system preview page without error', async () => {
      const router = createMemoryRouter(
        [
          {
            path: '/',
            element: <AppLayout />,
            children: [
              { path: 'design-system', element: <DesignSystemPreviewPage /> },
            ],
          },
        ],
        { initialEntries: ['/design-system'] }
      )

      await act(async () => {
        render(<RouterProvider router={router} />)
      })

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Design System/i)
      expect(screen.getByText(/Core Colour Palette/i)).toBeInTheDocument()
      expect(screen.getByText(/Typography System/i)).toBeInTheDocument()
      expect(screen.getByText(/Glassmorphism Surface Architecture/i)).toBeInTheDocument()
      expect(screen.getByText(/ALLEVIA LED Signature Effects/i)).toBeInTheDocument()
      expect(screen.getByText(/8px Grid Scale/i)).toBeInTheDocument()
    })
  })
})
