import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/utils/cn'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { mode, toggleTheme } = useThemeStore()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] cursor-pointer',
        'border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-secondary)]',
        'hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        className
      )}
    >
      {mode === 'dark' ? (
        <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
