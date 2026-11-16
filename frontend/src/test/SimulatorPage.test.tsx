import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { SimulatorPage } from '@/pages/SimulatorPage'
import { useSimulatorStore } from '@/store/simulatorStore'
import { useThemeStore } from '@/store/themeStore'

describe('SimulatorPage Single-Screen Component', () => {
  beforeEach(() => {
    act(() => {
      useSimulatorStore.getState().reset()
      useThemeStore.getState().setTheme('light')
    })
  })

  it('renders header with branding, action buttons, theme toggle and about button', () => {
    render(<SimulatorPage />)

    // Left branding
    expect(screen.getByText('Allevia Sim')).toBeInTheDocument()
    expect(screen.getByText('Simulator')).toBeInTheDocument()

    // Center pill button (initial: Start) and Reset Values button on its right side
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Values' })).toBeInTheDocument()

    // Right pill buttons (Theme toggle & About)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'About' })).toBeInTheDocument()
  })

  it('renders three main columns: Parameters, 3D Hardware View with Reset View button, and Transmission Log', () => {
    render(<SimulatorPage />)

    // Left column
    expect(screen.getByLabelText('Sensor Parameters')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('Humidity')).toBeInTheDocument()
    expect(screen.getByText('Air quality')).toBeInTheDocument()
    expect(screen.getByText('Harmful gases')).toBeInTheDocument()

    // Center column
    const centerCol = screen.getByLabelText('Hardware 3D View')
    expect(centerCol).toBeInTheDocument()
    expect(centerCol).toHaveTextContent(/Drag to spin|3D view is not supported/)
    expect(screen.getByRole('button', { name: 'Reset View' })).toBeInTheDocument()

    // Right column
    expect(screen.getByLabelText('Transmission Log')).toBeInTheDocument()
    expect(screen.getByText('Live Data Packet (JSON)')).toBeInTheDocument()
    expect(screen.getByText('Transmission Log')).toBeInTheDocument()
  })

  it('toggles theme between light and dark mode', () => {
    render(<SimulatorPage />)

    const themeBtn = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeBtn).toHaveTextContent('Dark')

    // Click toggle to switch to dark
    fireEvent.click(themeBtn)
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(themeBtn).toHaveTextContent('Light')

    // Click toggle to switch back to light
    fireEvent.click(themeBtn)
    expect(useThemeStore.getState().theme).toBe('light')
    expect(themeBtn).toHaveTextContent('Dark')
  })

  it('toggles About modal open and closed', () => {
    render(<SimulatorPage />)

    // Initially modal is not visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click About button
    fireEvent.click(screen.getByRole('button', { name: 'About' }))

    // Modal is open
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('About this simulator')).toBeInTheDocument()
    expect(within(dialog).getByText('What this is')).toBeInTheDocument()
    expect(within(dialog).getByText('Hardware')).toBeInTheDocument()
    expect(within(dialog).getByText('How it works')).toBeInTheDocument()

    // Close modal via Close button
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('handles Start / Stop / Restart transitions, dirty parameter changes and Reset Values', () => {
    render(<SimulatorPage />)

    const actionBtn = screen.getByRole('button', { name: 'Start' })
    expect(actionBtn).toHaveTextContent('Start')

    // Click Start -> becomes Stop
    fireEvent.click(actionBtn)
    expect(actionBtn).toHaveTextContent('Stop')

    // Click Stop -> becomes Start
    fireEvent.click(actionBtn)
    expect(actionBtn).toHaveTextContent('Start')

    // Change a slider: Temperature
    const tempInput = screen.getByLabelText('Temperature slider')
    fireEvent.change(tempInput, { target: { value: '35' } })
    expect(useSimulatorStore.getState().dirty).toBe(true)
    expect(actionBtn).toHaveTextContent('Start')

    // Click Reset Values button
    const resetValsBtn = screen.getByRole('button', { name: 'Reset Values' })
    fireEvent.click(resetValsBtn)
    expect(useSimulatorStore.getState().dirty).toBe(false)
    expect(useSimulatorStore.getState().params.temperature).toBe(28.0)
  })
})
