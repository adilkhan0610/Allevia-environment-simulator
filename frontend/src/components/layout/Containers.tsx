import React from 'react'
import { cn } from '@/utils/cn'

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'narrow' | 'standard' | 'wide' | 'full'
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  size = 'standard',
  className,
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-[var(--layout-narrow)]',
    standard: 'max-w-[var(--layout-standard)]',
    wide: 'max-w-[var(--layout-wide)]',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  spacing?: 'compact' | 'normal' | 'relaxed'
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  spacing = 'normal',
  className,
  ...props
}) => {
  const spacingClasses = {
    compact: 'py-6 sm:py-8 space-y-4',
    normal: 'py-10 sm:py-16 space-y-8',
    relaxed: 'py-16 sm:py-24 space-y-12',
  }

  return (
    <section className={cn('w-full', spacingClasses[spacing], className)} {...props}>
      {children}
    </section>
  )
}
