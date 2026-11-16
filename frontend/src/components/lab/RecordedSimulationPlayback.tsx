import React, { useState, useEffect } from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { Disc, Play, Pause, RotateCcw } from 'lucide-react'
import type { TelemetryPacketData } from '@/types/telemetry'

interface RecordedSimulationPlaybackProps {
  recordedPackets: TelemetryPacketData[]
  onPacketEmit: (packet: TelemetryPacketData) => void
  onExitPlayback: () => void
}

export const RecordedSimulationPlayback: React.FC<RecordedSimulationPlaybackProps> = ({
  recordedPackets,
  onPacketEmit,
  onExitPlayback,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isPlaying && recordedPackets.length > 0) {
      if (currentIndex < recordedPackets.length) {
        onPacketEmit(recordedPackets[currentIndex])
        const interval = Math.max(100, 1000 / playbackSpeed)
        timer = setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
        }, interval)
      } else {
        setIsPlaying(false)
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isPlaying, currentIndex, recordedPackets, playbackSpeed, onPacketEmit])

  const progressPct =
    recordedPackets.length > 0 ? Math.min(100, (currentIndex / recordedPackets.length) * 100) : 0

  return (
    <SurfacePanel className="border-2 border-amber-500/40 bg-amber-950/10 p-4 rounded-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              RECORDED SIMULATION PLAYBACK
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 rounded border border-amber-500/30">
                OFFLINE REPLAY
              </span>
            </h3>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              Deterministic offline replay of captured telemetry stream ({recordedPackets.length} packets).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExitPlayback}
          className="text-xs font-mono px-3 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-amber-300 border border-amber-500/30 rounded-lg transition-colors"
        >
          Exit Replay Mode
        </button>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--foreground-muted)]">
          <span>
            PACKET: {currentIndex} / {recordedPackets.length}
          </span>
          <span>PROGRESS: {progressPct.toFixed(0)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full bg-amber-400 transition-all duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Transport Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => {
                  if (currentIndex >= recordedPackets.length) setCurrentIndex(0)
                  setIsPlaying(true)
                }}
                className="px-3 py-1.5 bg-amber-400 text-black font-semibold rounded-lg text-xs font-mono flex items-center gap-1.5 hover:bg-amber-300 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play Replay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="px-3 py-1.5 bg-[var(--surface-secondary)] text-amber-300 rounded-lg text-xs font-mono flex items-center gap-1.5 border border-amber-500/30 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false)
                setCurrentIndex(0)
              }}
              className="px-3 py-1.5 bg-[var(--surface-secondary)] text-[var(--foreground-muted)] rounded-lg text-xs font-mono flex items-center gap-1.5 border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          </div>

          {/* Speed Selection */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[10px] text-[var(--foreground-muted)] mr-1">SPEED:</span>
            {[1.0, 2.0, 5.0].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  playbackSpeed === spd
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </SurfacePanel>
  )
}
