import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  neonGlowEnabled: boolean
  toggleTheme: () => void
  setNeonGlowEnabled: (enabled: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  neonGlowEnabled: true,
  toggleTheme: () =>
    set((state) => ({
      mode: state.mode === 'dark' ? 'light' : 'dark',
    })),
  setNeonGlowEnabled: (neonGlowEnabled) => set({ neonGlowEnabled }),
}))
