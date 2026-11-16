import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/Containers'
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons'
import { GlassPanel, SurfacePanel } from '@/components/ui/panels'
import { TierBadge, ConnectionIndicator } from '@/components/ui/status'
import { SectionHeading, BodyText, MonoValue, EyebrowLabel } from '@/components/ui/typography'
import { useSimulationStore } from '@/store/simulationStore'
import { useTelemetryStore } from '@/store/telemetryStore'
import { apiClient } from '@/services/apiClient'
import { useWebSocket } from '@/hooks/useWebSocket'
import {
  Activity,
  Box,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  Square,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react'

export const LabPage: React.FC = () => {
  const {
    sessionId,
    deviceId,
    status,
    selectedScenarioId,
    scenarios,
    simulatedTier,
    speedMultiplier,
    intensityMultiplier,
    setSession,
    clearSession,
    setStatus,
    setSelectedScenarioId,
    setScenarios,
    setSpeedMultiplier,
    setIntensityMultiplier,
    resetSimulation,
  } = useSimulationStore()

  const { readings, connectionStatus, sequenceNumber, resetTelemetry } = useTelemetryStore()
  const [loading, setLoading] = useState(false)

  // Attach WebSocket connection
  useWebSocket(sessionId)

  // Fetch scenarios on mount
  useEffect(() => {
    if (scenarios.length === 0) {
      apiClient.getScenarios().then((res) => setScenarios(res.scenarios)).catch(console.error)
    }
  }, [scenarios.length, setScenarios])

  const handleStartSession = async () => {
    setLoading(true)
    try {
      const session = await apiClient.createSession({
        scenario_id: selectedScenarioId,
        speed_multiplier: speedMultiplier,
        intensity_multiplier: intensityMultiplier,
      })
      setSession(session.session_id, session.device_id)
      setStatus('RUNNING')
    } catch (err) {
      console.error('Failed to create simulation session:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStopSession = async () => {
    if (sessionId) {
      try {
        await apiClient.deleteSession(sessionId)
      } catch (err) {
        console.warn('Failed to delete session on backend:', err)
      }
    }
    clearSession()
    resetTelemetry()
    resetSimulation()
  }

  return (
    <div className="flex-1 py-8">
      <PageContainer size="wide">
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-3">
              <SectionHeading as="h1" className="text-2xl sm:text-3xl">
                Interactive Simulation Lab
              </SectionHeading>
              <TierBadge tier={simulatedTier} />
            </div>
            <p className="text-xs font-mono text-[var(--foreground-muted)] mt-1">
              Virtual Hardware Telemetry &amp; Control Cockpit • Session: {sessionId || 'NONE (Offline)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!sessionId ? (
              <PrimaryButton onClick={handleStartSession} isLoading={loading} icon={<Play className="h-4 w-4" />}>
                Initialize Simulation
              </PrimaryButton>
            ) : (
              <>
                <SecondaryButton onClick={resetSimulation} icon={<RotateCcw className="h-4 w-4" />}>
                  Reset
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleStopSession}
                  className="bg-[var(--status-red)] text-white hover:bg-[var(--status-red)]/90"
                  icon={<Square className="h-4 w-4" />}
                >
                  Terminate Session
                </PrimaryButton>
              </>
            )}
          </div>
        </div>

        {/* Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Control Panel */}
          <div className="lg:col-span-4 space-y-6">
            <SurfacePanel className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-base font-semibold text-[var(--foreground)]">Scenario Selector</h3>
              </div>

              <div className="space-y-2">
                <EyebrowLabel>Active Scenario</EyebrowLabel>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => setSelectedScenarioId(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  {scenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name} ({sc.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-[var(--foreground-muted)]">
                  <span>Intensity Multiplier</span>
                  <span className="text-[var(--accent)]">{intensityMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={intensityMultiplier}
                  onChange={(e) => setIntensityMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-[var(--foreground-muted)]">
                  <span>Simulation Speed</span>
                  <span className="text-[var(--accent)]">{speedMultiplier.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.5"
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            </SurfacePanel>

            <SurfacePanel className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
                <Zap className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Device State</h3>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-muted)]">Device ID</span>
                <span className="text-[var(--foreground)]">{deviceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-muted)]">Connection</span>
                <ConnectionIndicator status={connectionStatus} />
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                <span className="text-[var(--foreground-muted)]">Packets Emitted</span>
                <MonoValue size="sm">{sequenceNumber}</MonoValue>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--foreground-muted)]">Engine State</span>
                <span className="text-[var(--foreground)]">{status}</span>
              </div>
            </SurfacePanel>
          </div>

          {/* Center Column: 3D Viewport Placeholder (Target for Phase 4) */}
          <div className="lg:col-span-5 flex flex-col">
            <GlassPanel variant="strong" className="flex-1 flex flex-col min-h-[420px] relative overflow-hidden led-edge">
              <div className="absolute top-4 left-4 z-10">
                <EyebrowLabel>3D VIEWPORT • PHASE 4 TARGET</EyebrowLabel>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-24 w-24 rounded-[var(--radius-xl)] border border-[var(--accent)]/40 bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] mb-4 shadow-[0_0_30px_var(--accent-glow)]">
                  <Box className="h-12 w-12 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Virtual 3D Detector Box</h3>
                <BodyText size="sm" className="max-w-sm mt-2">
                  Three.js, React Three Fiber, and Drei assembly will render here in Phase 4 with full orbit controls, exploded views, and perimeter glow.
                </BodyText>
              </div>
            </GlassPanel>
          </div>

          {/* Right Column: Live Sensor Telemetry */}
          <div className="lg:col-span-3 space-y-4">
            <EyebrowLabel className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-[var(--accent)]" />
              Live Sensor Registers
            </EyebrowLabel>

            {/* BME280 */}
            <GlassPanel variant="subtle" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-[var(--status-green)]" />
                  BME280 Environment
                </span>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">I2C (0x76)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--foreground-muted)] block">TEMP</span>
                  <MonoValue size="sm" unit="°C">{readings.bme280.temperature_c.toFixed(1)}</MonoValue>
                </div>
                <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--foreground-muted)] block">HUM</span>
                  <MonoValue size="sm" unit="%">{readings.bme280.humidity_pct.toFixed(0)}</MonoValue>
                </div>
                <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--foreground-muted)] block">BARO</span>
                  <MonoValue size="sm">{readings.bme280.pressure_hpa.toFixed(0)}</MonoValue>
                </div>
              </div>
            </GlassPanel>

            {/* MQ-2 */}
            <GlassPanel variant="subtle" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[var(--status-orange)]" />
                  MQ-2 Smoke/Gas
                </span>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Pin A0</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <MonoValue size="lg" highlight>{readings.mq2_raw}</MonoValue>
                <span className="text-xs text-[var(--foreground-muted)]">/ 1023 ADC</span>
              </div>
            </GlassPanel>

            {/* MQ-7 */}
            <GlassPanel variant="subtle" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-[var(--accent)]" />
                  MQ-7 Carbon Monoxide
                </span>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Pin A1</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <MonoValue size="lg" highlight>{readings.mq7_raw}</MonoValue>
                <span className="text-xs text-[var(--foreground-muted)]">/ 1023 ADC</span>
              </div>
            </GlassPanel>

            {/* MQ-135 */}
            <GlassPanel variant="subtle" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[var(--accent)]" />
                  MQ-135 Air Quality
                </span>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Pin A2</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <MonoValue size="lg" highlight>{readings.mq135_raw}</MonoValue>
                <span className="text-xs text-[var(--foreground-muted)]">/ 1023 ADC</span>
              </div>
            </GlassPanel>

            {/* IR Beam Sensor */}
            <GlassPanel variant="subtle" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span>IR Beam Interrupter</span>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Pin D2</span>
              </div>
              <div className="flex items-center justify-between font-mono pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">Beam Status:</span>
                <span className="text-xs font-mono font-medium" style={{ color: readings.ir_state === 1 ? 'var(--status-red)' : 'var(--status-green)' }}>
                  {readings.ir_state === 1 ? 'OBSTRUCTED' : 'CLEAR'}
                </span>
              </div>
            </GlassPanel>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
