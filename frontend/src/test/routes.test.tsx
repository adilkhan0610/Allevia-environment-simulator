import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { IntroPage } from '@/pages/IntroPage'
import { LabPage } from '@/pages/LabPage'
import { AboutPage } from '@/pages/AboutPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const createTestRouter = (initialEntry: string) =>
  createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <IntroPage /> },
          { path: 'lab', element: <LabPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] }
  )

describe('Routing & Page Navigation', () => {
  it('renders IntroPage on route "/"', async () => {
    const router = createTestRouter('/')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/YOUR ENVIRONMENT/i)
    expect(screen.getAllByRole('button', { name: /START SIMULATION/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('renders LabPage on route "/lab"', async () => {
    const router = createTestRouter('/lab')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Simulation Laboratory/i)
    expect(screen.getByText(/Detector Box Digital Twin/i)).toBeInTheDocument()
    expect(screen.getByText(/Environmental Scenarios/i)).toBeInTheDocument()
  })

  it('renders AboutPage on route "/about"', async () => {
    const router = createTestRouter('/about')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/System Architecture & Hardware Twin/i)
    expect(screen.getByText(/Arduino Uno Rev3/i)).toBeInTheDocument()
    expect(screen.getAllByText(/BME280/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders NotFoundPage on unknown route', async () => {
    const router = createTestRouter('/some-nonexistent-route')
    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByText(/404 — ROUTE NOT FOUND/i)).toBeInTheDocument()
  })
})
