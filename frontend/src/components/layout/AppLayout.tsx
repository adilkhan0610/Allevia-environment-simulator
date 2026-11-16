import React from 'react'
import { Outlet } from 'react-router-dom'

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Outlet />
    </div>
  )
}
