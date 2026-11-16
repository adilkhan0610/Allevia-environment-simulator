import React, { Suspense, Component, type ErrorInfo } from 'react'
import type { DetectorBoxProps } from './types'
import { Cpu, AlertTriangle } from 'lucide-react'

// Dynamic lazy import of the heavy Three.js container
const DetectorBoxContainer = React.lazy(() =>
  import('./DetectorBoxContainer').then((m) => ({ default: m.DetectorBoxContainer }))
)

// Fallback Loading Skeleton
export const DetectorBoxLoading: React.FC = () => {
  return (
    <div className="w-full h-[480px] sm:h-[540px] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#070A0D] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)]">
        <Cpu className="h-8 w-8 animate-pulse" />
        <span className="absolute inset-0 rounded-2xl border border-[var(--accent)] animate-ping opacity-25" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[var(--foreground)] font-display tracking-wide">
          INITIALIZING 3D HARDWARE TWIN
        </h4>
        <p className="text-xs text-[var(--foreground-muted)] font-mono">
          Loading procedural geometries, shaders, and sensor assemblies...
        </p>
      </div>
    </div>
  )
}

// Error Boundary for WebGL context failure or unsupported environments
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class DetectorBoxErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('DetectorBox 3D WebGL Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="w-full h-[480px] sm:h-[540px] rounded-[var(--radius-xl)] border border-[var(--status-yellow)]/30 bg-[#070A0D] flex flex-col items-center justify-center p-8 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-[var(--status-yellow)]" />
          <h4 className="text-sm font-semibold text-[var(--foreground)] font-mono">
            WEBGL RENDERER NOTICE
          </h4>
          <p className="text-xs text-[var(--foreground-muted)] font-mono max-w-sm">
            Hardware 3D acceleration is currently unavailable in this environment. The system operates normally.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

// Lazy-Loaded Export with Suspense & Error Boundary
export const DetectorBoxLazy: React.FC<DetectorBoxProps> = (props) => {
  return (
    <DetectorBoxErrorBoundary>
      <Suspense fallback={<DetectorBoxLoading />}>
        <DetectorBoxContainer {...props} />
      </Suspense>
    </DetectorBoxErrorBoundary>
  )
}
