import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { IntroPage } from '@/pages/IntroPage'
import { LabPage } from '@/pages/LabPage'
import { AboutPage } from '@/pages/AboutPage'

const createTestRouter = (initialEntry: string = '/') =>
  createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <IntroPage /> },
          { path: 'lab', element: <LabPage /> },
          { path: 'about', element: <AboutPage /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] }
  )

describe('ALLEVIA Landing Page (Phase 3)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the hero section with exact headlines, eyebrow, and description', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    // Eyebrow
    expect(screen.getByText(/ENVIRONMENTAL INTELLIGENCE SYSTEM/i)).toBeInTheDocument()

    // Main Headline
    expect(screen.getByText(/YOUR ENVIRONMENT\./i)).toBeInTheDocument()
    expect(screen.getByText(/UNDER OBSERVATION\./i)).toBeInTheDocument()

    // Supporting Description
    expect(
      screen.getByText(/A virtual window into the ALLEVIA sensing system/i)
    ).toBeInTheDocument()

    // Simulated demonstration identifier
    expect(screen.getByText(/SIMULATED DEMONSTRATION/i)).toBeInTheDocument()
  })

  it('contains primary START SIMULATION and secondary EXPLORE THE SYSTEM buttons', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    const startButtons = screen.getAllByRole('button', { name: /START SIMULATION/i })
    expect(startButtons.length).toBeGreaterThanOrEqual(1)

    const exploreButton = screen.getByRole('button', { name: /EXPLORE THE SYSTEM/i })
    expect(exploreButton).toBeInTheDocument()
  })

  it('renders the sophisticated DetectorBoxVisual placeholder', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByText(/REV-3.2 • DETECTOR UNIT/i)).toBeInTheDocument()
    expect(screen.getByText(/IR-OPT CLEAR/i)).toBeInTheDocument()
    expect(screen.getByText(/Workforce Health Early Warning/i)).toBeInTheDocument()
    expect(screen.getByText(/3D CAD Model \(Phase 4 Target\)/i)).toBeInTheDocument()
  })

  it('renders the technical hardware strip with all 6 physical sensors', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByText('ARDUINO UNO')).toBeInTheDocument()
    expect(screen.getByText('BME280')).toBeInTheDocument()
    expect(screen.getByText('MQ-2')).toBeInTheDocument()
    expect(screen.getByText('MQ-7')).toBeInTheDocument()
    expect(screen.getByText('MQ-135')).toBeInTheDocument()
    expect(screen.getByText('IR SENSOR')).toBeInTheDocument()
  })

  it('renders the How It Works preview with all 4 linear steps', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('DETECT')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('TRANSMIT')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('UNDERSTAND')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
    expect(screen.getByText('ACT')).toBeInTheDocument()
  })

  it('renders the footer with required branding, motto, and data quarantine tags', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByText(/DETECT · UNDERSTAND · ACT/i)).toBeInTheDocument()
    expect(
      screen.getByText(/SIMULATED DATA · ENGINEERING DEMONSTRATION/i)
    ).toBeInTheDocument()
  })

  it('toggles mobile navigation drawer when clicking the hamburger button', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    const hamburger = screen.getByRole('button', { name: /Toggle mobile menu/i })
    expect(hamburger).toBeInTheDocument()

    // Click to open
    fireEvent.click(hamburger)
    expect(screen.getAllByText('Simulation Lab').length).toBeGreaterThanOrEqual(1)

    // Click to close
    fireEvent.click(hamburger)
  })
})
