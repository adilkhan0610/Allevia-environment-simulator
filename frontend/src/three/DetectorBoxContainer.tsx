import React, { useState } from 'react'
import { DetectorBoxScene } from './DetectorBoxScene'
import { HARDWARE_COMPONENTS, type ComponentId, type DetectorBoxProps } from './types'
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons'
import { RotateCcw, Eye, Layers, Compass, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export const DetectorBoxContainer: React.FC<DetectorBoxProps> = ({
  exploded: defaultExploded = false,
  interactive = true,
  showCallouts: defaultCallouts = true,
  autoRotate: defaultAutoRotate = false,
  className,
}) => {
  const [isExploded, setIsExploded] = useState(defaultExploded)
  const [showCallouts, setShowCallouts] = useState(defaultCallouts)
  const [isAutoRotate, setIsAutoRotate] = useState(defaultAutoRotate)
  const [selectedId, setSelectedId] = useState<ComponentId | null>(null)
  const [sceneKey, setSceneKey] = useState(0)

  const handleResetCamera = () => {
    setSceneKey((k) => k + 1)
    setSelectedId(null)
  }

  const selectedMetadata = selectedId ? HARDWARE_COMPONENTS[selectedId] : null

  return (
    <div
      className={cn(
        'relative w-full h-[480px] sm:h-[540px] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#070A0D] overflow-hidden select-none',
        className
      )}
    >
      {/* 3D Canvas Scene */}
      <div className="absolute inset-0">
        <DetectorBoxScene
          key={sceneKey}
          exploded={isExploded}
          showCallouts={showCallouts}
          selectedComponent={selectedId}
          onSelectComponent={setSelectedId}
          autoRotate={isAutoRotate}
          interactive={interactive}
        />
      </div>

      {/* Top Floating Control Bar */}
      {interactive && (
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left Status Badge */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[#0B0F14]/85 backdrop-blur-md shadow-md text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] led-pulse" />
            <span className="text-[var(--foreground)] font-semibold">
              {isExploded ? 'EXPLODED ASSEMBLY' : 'ASSEMBLED TWIN'}
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Exploded / Assembled Toggle */}
            <PrimaryButton
              size="sm"
              icon={<Layers className="h-3.5 w-3.5" />}
              onClick={() => setIsExploded((e) => !e)}
              className="text-xs"
            >
              {isExploded ? 'Assemble' : 'Explode View'}
            </PrimaryButton>

            {/* Callouts Visibility Toggle */}
            <SecondaryButton
              size="sm"
              icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => setShowCallouts((c) => !c)}
              className={cn('text-xs', showCallouts && 'border-[var(--accent)] text-[var(--accent)]')}
              aria-label="Toggle annotations"
            >
              Callouts
            </SecondaryButton>

            {/* Auto Rotate Toggle */}
            <SecondaryButton
              size="sm"
              icon={<Compass className="h-3.5 w-3.5" />}
              onClick={() => setIsAutoRotate((r) => !r)}
              className={cn('text-xs hidden sm:inline-flex', isAutoRotate && 'border-[var(--accent)] text-[var(--accent)]')}
              aria-label="Toggle auto rotate"
            >
              Rotate
            </SecondaryButton>

            {/* Reset Camera */}
            <SecondaryButton
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={handleResetCamera}
              className="text-xs"
              aria-label="Reset camera position"
            >
              Reset
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* Bottom Component Inspector Drawer (When clicked) */}
      {selectedMetadata && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 z-20 p-4 rounded-xl border border-[var(--accent)]/50 bg-[#0A0D12]/95 backdrop-blur-xl shadow-2xl text-left space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
              {selectedMetadata.category}
            </span>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close component inspection"
              className="text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-white tracking-wide">
            {selectedMetadata.name}
          </h4>

          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            {selectedMetadata.description}
          </p>

          <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--accent)]">
            {selectedMetadata.specs}
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-4 z-10 pointer-events-none text-[10px] font-mono text-[var(--foreground-muted)] hidden sm:block">
        Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom
      </div>
    </div>
  )
}
