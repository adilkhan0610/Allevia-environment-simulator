import React from 'react'
import { cn } from '@/utils/cn'

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const DisplayHeading: React.FC<HeadingProps> = ({
  children,
  as: Component = 'h1',
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'font-display text-3xl sm:text-5xl lg:text-6xl font-light uppercase tracking-[0.12em] text-[var(--foreground)] leading-tight',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export const SectionHeading: React.FC<HeadingProps> = ({
  children,
  as: Component = 'h2',
  className,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'font-display text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'muted'
  size?: 'sm' | 'md' | 'lg'
}

export const BodyText: React.FC<BodyTextProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}) => {
  const variantColor = {
    primary: 'text-[var(--foreground)]',
    secondary: 'text-[var(--foreground-secondary)]',
    muted: 'text-[var(--foreground-muted)]',
  }[variant]

  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[size]

  return (
    <p
      className={cn('font-body leading-relaxed', sizeClass, variantColor, className)}
      {...props}
    >
      {children}
    </p>
  )
}

export interface MonoValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  highlight?: boolean
}

export const MonoValue: React.FC<MonoValueProps> = ({
  children,
  unit,
  size = 'md',
  highlight = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg sm:text-xl font-semibold',
    xl: 'text-2xl sm:text-3xl font-bold',
  }

  return (
    <span
      className={cn(
        'font-mono tabular-nums inline-flex items-baseline gap-1',
        sizeClasses[size],
        highlight ? 'text-[var(--accent)]' : 'text-[var(--foreground)]',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {unit && (
        <span className="text-[11px] font-normal text-[var(--foreground-muted)] uppercase tracking-normal">
          {unit}
        </span>
      )}
    </span>
  )
}

export const EyebrowLabel: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--foreground-muted)] font-medium select-none',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
