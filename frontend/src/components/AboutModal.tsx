import React, { useEffect } from 'react'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About this simulator"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-[16px] bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] shrink-0">
          <h2 className="text-[15px] font-medium text-[var(--foreground)]">
            About this simulator
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-full text-[13px] text-[var(--secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar text-[13px] leading-relaxed text-[var(--foreground)]">
          {/* Section A: What this is */}
          <div>
            <h3 className="text-[12px] font-medium text-[var(--muted)] uppercase tracking-wide mb-1.5">
              What this is
            </h3>
            <p className="text-[var(--secondary)]">
              A virtual copy of a small air-monitoring device so you can try it without the real hardware. It shows how the device measures air conditions and packages data in real time.
            </p>
          </div>

          {/* Section B: Hardware */}
          <div>
            <h3 className="text-[12px] font-medium text-[var(--muted)] uppercase tracking-wide mb-2">
              Hardware
            </h3>
            <ul className="space-y-2.5">
              <li>
                <div className="font-medium text-[var(--foreground)]">Arduino Uno</div>
                <div className="text-[var(--secondary)]">
                  The brain that reads all connected sensors (5V supply, 10-bit analog-to-digital converter, 0 to 1023 counts).
                </div>
              </li>
              <li>
                <div className="font-medium text-[var(--foreground)]">BME280</div>
                <div className="text-[var(--secondary)]">
                  Measures ambient temperature, relative humidity and atmospheric pressure over an I2C digital bus.
                </div>
              </li>
              <li>
                <div className="font-medium text-[var(--foreground)]">MQ2</div>
                <div className="text-[var(--secondary)]">
                  Responds to smoke and flammable combustible gases like propane and methane with an analog voltage signal.
                </div>
              </li>
              <li>
                <div className="font-medium text-[var(--foreground)]">MQ7</div>
                <div className="text-[var(--secondary)]">
                  Measures carbon monoxide concentrations using an internal heated sensing coil.
                </div>
              </li>
              <li>
                <div className="font-medium text-[var(--foreground)]">MQ135</div>
                <div className="text-[var(--secondary)]">
                  Monitors general air quality and tracks common hazardous fumes and pollutants.
                </div>
              </li>
              <li>
                <div className="font-medium text-[var(--foreground)]">IR Sensor</div>
                <div className="text-[var(--secondary)]">
                  Detects infrared light and radiant heat from nearby flames or hot surfaces.
                </div>
              </li>
            </ul>
          </div>

          {/* Section C: How it works */}
          <div>
            <h3 className="text-[12px] font-medium text-[var(--muted)] uppercase tracking-wide mb-2">
              How it works
            </h3>
            <ol className="space-y-1.5 list-decimal list-inside text-[var(--secondary)]">
              <li>Choose your air conditions using the controls on the left.</li>
              <li>Click Start in the top header bar.</li>
              <li>The simulated sensors react to the selected air conditions.</li>
              <li>The Arduino converts the readings into numbers and packages them.</li>
              <li>The log on the right shows each data packet as it is sent.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
