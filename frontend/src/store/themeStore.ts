import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  neonGlowEnabled: boolean
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  setNeonGlowEnabled: (enabled: boolean) => void
}

const STORAGE_KEY = 'allevia-theme-mode'

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'

  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  // System preference detection fallback
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }

  return 'dark'
}

const applyThemeToDOM = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(mode)
  root.setAttribute('data-theme', mode)
}

// Apply on initial script evaluation
const initialMode = getInitialTheme()
applyThemeToDOM(initialMode)

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode,
  neonGlowEnabled: true,

  toggleTheme: () =>
    set((state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, newMode)
      applyThemeToDOM(newMode)
      return { mode: newMode }
    }),

  setTheme: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    applyThemeToDOM(mode)
    set({ mode })
  },

  setNeonGlowEnabled: (neonGlowEnabled) => set({ neonGlowEnabled }),
}))
