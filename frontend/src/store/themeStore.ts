import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem('allevia_sim_theme')
    if (saved === 'dark' || saved === 'light') return saved
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch {
    // Graceful fallback if localStorage or matchMedia is restricted
  }
  return 'light'
}

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  try {
    localStorage.setItem('allevia_sim_theme', theme)
  } catch {
    // localStorage restricted
  }
}

const initialTheme = getInitialTheme()
applyThemeToDOM(initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

  toggleTheme: () => {
    const nextTheme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyThemeToDOM(nextTheme)
    set({ theme: nextTheme })
  },

  setTheme: (theme) => {
    applyThemeToDOM(theme)
    set({ theme })
  },
}))
