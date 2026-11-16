import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HARDWARE_COMPONENTS, type ComponentId } from '@/three/types'
import { DetectorBoxLoading, DetectorBoxErrorBoundary } from '@/three/DetectorBoxLazy'

describe('Interactive 3D ALLEVIA Detector Box (Phase 4)', () => {
  it('contains the complete catalog of all 10 required hardware components', () => {
    const requiredIds: ComponentId[] = [
      'ir',
      'mq2',
      'mq7',
      'mq135',
      'bme280',
      'arduino',
      'wires',
      'standoffs',
      'top_cover',
      'base_enclosure',
    ]

    expect(Object.keys(HARDWARE_COMPONENTS).length).toBe(10)
    requiredIds.forEach((id) => {
      const comp = HARDWARE_COMPONENTS[id]
      expect(comp).toBeDefined()
      expect(comp.name).toBeTruthy()
      expect(comp.category).toBeTruthy()
      expect(comp.description).toBeTruthy()
      expect(comp.specs).toBeTruthy()
      expect(comp.position.length).toBe(3)
      expect(comp.explodedOffset.length).toBe(3)
    })
  })

  it('renders DetectorBoxLoading skeleton correctly', () => {
    render(<DetectorBoxLoading />)
    expect(screen.getByText(/INITIALIZING 3D HARDWARE TWIN/i)).toBeInTheDocument()
    expect(screen.getByText(/Loading procedural geometries/i)).toBeInTheDocument()
  })

  it('handles WebGL errors gracefully via DetectorBoxErrorBoundary', () => {
    const ProblemComponent = () => {
      throw new Error('WebGLContextCreationError: Simulation mock error')
    }

    render(
      <DetectorBoxErrorBoundary>
        <ProblemComponent />
      </DetectorBoxErrorBoundary>
    )

    expect(screen.getByText(/WEBGL RENDERER NOTICE/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Hardware 3D acceleration is currently unavailable/i)
    ).toBeInTheDocument()
  })
})
