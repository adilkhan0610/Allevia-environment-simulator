import React from 'react'
import { cn } from '@/utils/cn'

export type StatusVariant = 'green' | 'yellow' | 'orange' | 'red' | 'cyan' | 'neutral'

export interface StatusIndicatorProps {
  label: string
  variant?: StatusVariant
  pulse?: boolean
  className?: string
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  label,
  variant = 'cyan',
  pulse = false,
  className,
}) => {
  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    green: {
      badge: 'border-[var(--status-green)]/30 bg-[var(--status-green-bg)] text-[var(--status-green)]',
      dot: 'bg-[var(--status-green)] shadow-[0_0_8px_var(--status-green)]',
    },
    yellow: {
      badge: 'border-[var(--status-yellow)]/30 bg-[var(--status-yellow-bg)] text-[var(--status-yellow)]',
      dot: 'bg-[var(--status-yellow)] shadow-[0_0_8px_var(--status-yellow)]',
    },
    orange: {
      badge: 'border-[var(--status-orange)]/30 bg-[var(--status-orange-bg)] text-[var(--status-orange)]',
      dot: 'bg-[var(--status-orange)] shadow-[0_0_8px_var(--status-orange)]',
    },
    red: {
      badge: 'border-[var(--status-red)]/30 bg-[var(--status-red-bg)] text-[var(--status-red)]',
      dot: 'bg-[var(--status-red)] shadow-[0_0_8px_var(--status-red)]',
    },
    cyan: {
      badge: 'border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)]',
      dot: 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]',
    },
    neutral: {
      badge: 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]',
      dot: 'bg-[var(--foreground-muted)]',
    },
  }

  const current = variantStyles[variant] || variantStyles.neutral

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium tracking-wide',
        current.badge,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              current.dot
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', current.dot)} />
      </span>
      <span>{label}</span>
    </span>
  )
}

export interface ConnectionIndicatorProps {
  status: 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED' | 'ERROR'
  className?: string
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ status, className }) => {
  const statusConfig = {
    CONNECTED: { variant: 'green' as StatusVariant, pulse: true, label: 'CONNECTED' },
    CONNECTING: { variant: 'yellow' as StatusVariant, pulse: true, label: 'CONNECTING' },
    RECONNECTING: { variant: 'yellow' as StatusVariant, pulse: true, label: 'RECONNECTING' },
    DISCONNECTED: { variant: 'neutral' as StatusVariant, pulse: false, label: 'DISCONNECTED' },
    ERROR: { variant: 'red' as StatusVariant, pulse: false, label: 'LINK ERROR' },
  }[status]

  return (
    <StatusIndicator
      label={statusConfig.label}
      variant={statusConfig.variant}
      pulse={statusConfig.pulse}
      className={className}
    />
  )
}

export const SimulatedBadge: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] text-[10px] font-mono tracking-wider uppercase',
        'border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)] font-semibold',
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
      SIMULATED
    </span>
  )
}

export interface TierBadgeProps {
  tier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'FAULT'
  className?: string
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className }) => {
  const tierConfig: Record<string, { label: string; variant: StatusVariant }> = {
    GREEN: { label: 'TIER: GREEN (NORMAL)', variant: 'green' },
    YELLOW: { label: 'TIER: YELLOW (ADVISORY)', variant: 'yellow' },
    ORANGE: { label: 'TIER: ORANGE (WARNING)', variant: 'orange' },
    RED: { label: 'TIER: RED (CRITICAL)', variant: 'red' },
    FAULT: { label: 'SYSTEM FAULT', variant: 'neutral' },
  }

  const config = tierConfig[tier] || tierConfig.GREEN

  return (
    <StatusIndicator
      label={config.label}
      variant={config.variant}
      pulse={tier === 'RED' || tier === 'ORANGE'}
      className={className}
    />
  )
}
