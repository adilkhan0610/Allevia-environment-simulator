import React, { useId } from 'react'

interface LiveChartProps {
  title: string
  unit: string
  data: number[]
  timestamps?: number[]
  color?: string
  min?: number
  max?: number
  height?: number
  warningThreshold?: number
  criticalThreshold?: number
}

export const LiveSparklineChart: React.FC<LiveChartProps> = ({
  title,
  unit,
  data,
  color = '#00f0ff',
  min,
  max,
  height = 90,
  warningThreshold,
  criticalThreshold,
}) => {
  const gradientId = useId()
  const displayData = data.length > 0 ? data : [0]
  const latestValue = displayData[displayData.length - 1]

  // Compute adaptive bounds
  const dataMin = Math.min(...displayData)
  const dataMax = Math.max(...displayData)
  const effectiveMin = min !== undefined ? min : Math.min(dataMin * 0.95, dataMin - 1)
  const effectiveMax = max !== undefined ? max : Math.max(dataMax * 1.05, dataMax + 1)
  const range = Math.max(1e-4, effectiveMax - effectiveMin)

  const width = 300
  const paddingY = 8

  // Build SVG path points
  const points = displayData.map((val, idx) => {
    const x = displayData.length > 1 ? (idx / (displayData.length - 1)) * width : width / 2
    const normalizedY = (val - effectiveMin) / range
    const y = height - paddingY - normalizedY * (height - 2 * paddingY)
    return { x, y }
  })

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
  }, '')

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`
      : ''

  // Warning threshold Y
  const warnY =
    warningThreshold !== undefined && warningThreshold >= effectiveMin && warningThreshold <= effectiveMax
      ? height - paddingY - ((warningThreshold - effectiveMin) / range) * (height - 2 * paddingY)
      : null

  const critY =
    criticalThreshold !== undefined && criticalThreshold >= effectiveMin && criticalThreshold <= effectiveMax
      ? height - paddingY - ((criticalThreshold - effectiveMin) / range) * (height - 2 * paddingY)
      : null

  return (
    <div className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-[var(--foreground-muted)]">
            {title}
          </span>
          <div className="text-xs font-mono text-[var(--foreground-subtle)]">
            SIMULATED TELEMETRY
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-mono font-semibold text-[var(--foreground-default)]">
            {typeof latestValue === 'number' ? latestValue.toFixed(1) : latestValue}
          </span>
          <span className="text-xs font-mono text-[var(--foreground-muted)] ml-1">
            {unit}
          </span>
        </div>
      </div>

      {/* SVG Sparkline */}
      <div className="w-full relative overflow-hidden" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Threshold Lines */}
          {warnY !== null && (
            <line
              x1="0"
              y1={warnY}
              x2={width}
              y2={warnY}
              stroke="#eab308"
              strokeDasharray="3 3"
              strokeWidth="1"
              opacity="0.6"
            />
          )}
          {critY !== null && (
            <line
              x1="0"
              y1={critY}
              x2={width}
              y2={critY}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeWidth="1"
              opacity="0.7"
            />
          )}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

          {/* Line Stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Latest Point Marker */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3.5"
              fill={color}
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--foreground-muted)] mt-1.5 pt-1 border-t border-[var(--border-subtle)]/40">
        <span>Min: {dataMin.toFixed(1)} {unit}</span>
        <span>Max: {dataMax.toFixed(1)} {unit}</span>
      </div>
    </div>
  )
}
