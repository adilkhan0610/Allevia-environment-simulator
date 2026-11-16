import React from 'react'
import { TopNavigation } from './TopNavigation'
import { Footer } from './Footer'

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-[var(--background)]">
      <TopNavigation />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
