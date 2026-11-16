import React from 'react'
import { cn } from '@/utils/cn'

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'standard' | 'strong' | 'subtle'
  interactive?: boolean
}

export const GlassPanel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ children, variant = 'standard', interactive = false, className, ...props }, ref) => {
    const variantClass = {
      standard: 'glass-panel',
      strong: 'glass-panel-strong',
      subtle: 'glass-panel-subtle',
    }[variant]

    return (
      <div
        ref={ref}
        className={cn(variantClass, interactive && 'glass-hover cursor-pointer', 'p-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassPanel.displayName = 'GlassPanel'

export const SurfacePanel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ children, interactive = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] p-6',
          'transition-all duration-200',
          interactive && 'hover:border-[var(--accent)] hover:shadow-[0_4px_24px_var(--accent-muted)] cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SurfacePanel.displayName = 'SurfacePanel'

export interface SectionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const SectionPanel = React.forwardRef<HTMLDivElement, SectionPanelProps>(
  ({ children, title, subtitle, action, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 sm:p-8 space-y-6',
          className
        )}
        {...props}
      >
        {(title || action) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              {title && <h3 className="text-lg font-medium text-[var(--foreground)]">{title}</h3>}
              {subtitle && <p className="text-xs text-[var(--foreground-muted)] font-mono mt-0.5">{subtitle}</p>}
            </div>
            {action && <div className="flex items-center gap-2">{action}</div>}
          </div>
        )}
        <div>{children}</div>
      </section>
    )
  }
)
SectionPanel.displayName = 'SectionPanel'
