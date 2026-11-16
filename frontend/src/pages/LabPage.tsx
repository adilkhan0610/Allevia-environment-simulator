import React, { useEffect, useState } from 'react'
import { Container } from '@/components/shared/Container'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
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

  const tierVariantMap: Record<string, 'green' | 'yellow' | 'orange' | 'red' | 'neutral'> = {
    GREEN: 'green',
    YELLOW: 'yellow',
    ORANGE: 'orange',
    RED: 'red',
    FAULT: 'neutral',
  }

  return (
    <div className="flex-1 py-8">
      <Container size="wide">
        {/* Lab Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Simulation Lab</h1>
              <StatusBadge
                status={`TIER: ${simulatedTier}`}
                variant={tierVariantMap[simulatedTier] || 'neutral'}
              />
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Virtual Hardware Telemetry & Control Cockpit • Session: {sessionId || 'NONE (Offline)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!sessionId ? (
              <Button onClick={handleStartSession} disabled={loading} className="gap-2">
                <Play className="h-4 w-4" />
                Initialize Simulation
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={resetSimulation} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button variant="destructive" onClick={handleStopSession} className="gap-2">
                  <Square className="h-4 w-4" />
                  Terminate Session
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Control Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Scenario Selector
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Active Scenario</label>
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    {scenarios.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name} ({sc.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Intensity Multiplier</span>
                    <span className="text-cyan-400">{intensityMultiplier.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={intensityMultiplier}
                    onChange={(e) => setIntensityMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Simulation Speed</span>
                    <span className="text-cyan-400">{speedMultiplier.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.5"
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Device ID</span>
                  <span className="text-slate-200">{deviceId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Connection</span>
                  <span className="text-cyan-400">{connectionStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Packets Emitted</span>
                  <span className="text-slate-200">{sequenceNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">State</span>
                  <span className="text-slate-200">{status}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column: 3D Viewport Placeholder (Target for Phase 4) */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="flex-1 flex flex-col min-h-[420px] relative overflow-hidden border-slate-800">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <StatusBadge status="3D VIEWPORT • PHASE 4 TARGET" variant="cyan" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-radial from-slate-900 to-[#08090D]">
                <div className="h-24 w-24 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                  <Box className="h-12 w-12 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Virtual 3D Detector Box</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2">
                  Three.js, React Three Fiber, and Drei assembly will render here in Phase 4 with full orbit controls, exploded views, and perimeter glow.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Sensor Telemetry */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5 text-cyan-400" />
              Live Sensor Registers
            </h2>

            {/* BME280 */}
            <Card className="p-4 space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-emerald-400" />
                  BME280 Environment
                </span>
                <span className="text-[10px] font-mono text-slate-500">I2C (0x76)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TEMP</span>
                  <span className="text-sm font-semibold text-white">{readings.bme280.temperature_c.toFixed(1)}°C</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HUM</span>
                  <span className="text-sm font-semibold text-white">{readings.bme280.humidity_pct.toFixed(0)}%</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">BARO</span>
                  <span className="text-xs font-semibold text-white">{readings.bme280.pressure_hpa.toFixed(0)}</span>
                </div>
              </div>
            </Card>

            {/* MQ-2 */}
            <Card className="p-4 space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  MQ-2 Smoke/Gas
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pin A0</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-bold text-white">{readings.mq2_raw}</span>
                <span className="text-xs text-slate-400">/ 1023 ADC</span>
              </div>
            </Card>

            {/* MQ-7 */}
            <Card className="p-4 space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-cyan-400" />
                  MQ-7 Carbon Monoxide
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pin A1</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-bold text-white">{readings.mq7_raw}</span>
                <span className="text-xs text-slate-400">/ 1023 ADC</span>
              </div>
            </Card>

            {/* MQ-135 */}
            <Card className="p-4 space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" />
                  MQ-135 Air Quality
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pin A2</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-bold text-white">{readings.mq135_raw}</span>
                <span className="text-xs text-slate-400">/ 1023 ADC</span>
              </div>
            </Card>

            {/* IR Beam Sensor */}
            <Card className="p-4 space-y-2 border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>IR Beam Interrupter</span>
                <span className="text-[10px] font-mono text-slate-500">Pin D2</span>
              </div>
              <div className="flex items-center justify-between font-mono pt-1">
                <span className="text-xs text-slate-400">State:</span>
                <StatusBadge
                  status={readings.ir_state === 1 ? 'OBSTRUCTED' : 'CLEAR'}
                  variant={readings.ir_state === 1 ? 'red' : 'green'}
                />
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
