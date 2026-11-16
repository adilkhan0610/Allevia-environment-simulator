import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import type { ComponentMetadata } from '../types'
import { cn } from '@/utils/cn'

interface CalloutPinProps {
  component: ComponentMetadata
  position: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
}

export const CalloutPin: React.FC<CalloutPinProps> = ({
  component,
  position,
  isSelected,
  isHovered,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const active = isSelected || isHovered || isOpen

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={11}
        zIndexRange={[100, 0]}
        className="pointer-events-auto select-none"
      >
        <div className="relative flex items-center group">
          {/* Pulsing Target Dot */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen((o) => !o)
              onClick()
            }}
            aria-label={`Inspect ${component.name}`}
            className={cn(
              'relative flex h-5 w-5 items-center justify-center rounded-full cursor-pointer transition-transform duration-200 hover:scale-125 focus:outline-none',
              active ? 'scale-125 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-black' : ''
            )}
          >
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                active ? 'bg-[var(--accent)]' : 'bg-cyan-400'
              )}
            />
            <span
              className={cn(
                'relative inline-flex h-2.5 w-2.5 rounded-full border border-black',
                active ? 'bg-white shadow-[0_0_8px_var(--accent)]' : 'bg-[var(--accent)]'
              )}
            />
          </button>

          {/* Interactive Popover Glass Card */}
          {active && (
            <div
              className={cn(
                'absolute left-7 top-1/2 -translate-y-1/2 w-52 sm:w-60 p-3 rounded-xl border border-[var(--accent)]/40 bg-[#0A0D12]/92 backdrop-blur-md shadow-2xl text-left space-y-1.5 transition-all duration-200 z-50 animate-in fade-in zoom-in-95'
              )}
            >
              {/* Leader Line Accent */}
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                  {component.category}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              </div>

              <h4 className="text-xs font-semibold text-white tracking-wide">
                {component.name}
              </h4>

              <p className="text-[10px] text-slate-300 font-mono leading-tight">
                {component.description}
              </p>

              <div className="pt-1 border-t border-[var(--border-subtle)]">
                <p className="text-[9px] text-[var(--accent)] font-mono leading-tight">
                  {component.specs}
                </p>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
