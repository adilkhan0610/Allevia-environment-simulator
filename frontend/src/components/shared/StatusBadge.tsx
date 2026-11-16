import React from 'react'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: string
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'cyan' | 'neutral'
  pulse?: boolean
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'cyan',
  pulse = false,
  className,
}) => {
  const variantStyles = {
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    yellow: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    orange: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    red: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    neutral: 'border-slate-700 bg-slate-800/50 text-slate-400',
  }

  const dotStyles = {
    green: 'bg-emerald-400',
    yellow: 'bg-amber-400',
    orange: 'bg-orange-400',
    red: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dotStyles[variant],
          pulse && 'animate-ping'
        )}
      />
      {status}
    </span>
  )
}
