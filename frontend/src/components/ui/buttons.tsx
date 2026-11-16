import React from 'react'
import { cn } from '@/utils/cn'

export interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  isLoading?: boolean
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[12px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[16px]',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-[20px]',
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ children, size = 'md', icon, isLoading, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium font-body transition-all duration-200 cursor-pointer select-none',
          'bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] active:scale-[0.98]',
          'shadow-[0_2px_12px_var(--accent-muted)] hover:shadow-[0_4px_20px_var(--accent-glow)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)
PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ children, size = 'md', icon, isLoading, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium font-body transition-all duration-200 cursor-pointer select-none',
          'bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)
SecondaryButton.displayName = 'SecondaryButton'

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonBaseProps>(
  ({ children, size = 'md', icon, isLoading, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium font-body transition-all duration-200 cursor-pointer select-none',
          'bg-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    )
  }
)
GhostButton.displayName = 'GhostButton'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  'aria-label': string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'secondary', className, disabled, ...props }, ref) => {
    const iconSizeClasses = {
      sm: 'h-8 w-8 rounded-[10px]',
      md: 'h-10 w-10 rounded-[14px]',
      lg: 'h-12 w-12 rounded-[18px]',
    }

    const variantStyles = {
      primary: 'bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] shadow-[0_2px_10px_var(--accent-muted)]',
      secondary: 'bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
      ghost: 'bg-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.96]',
          iconSizeClasses[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    )
  }
)
IconButton.displayName = 'IconButton'
