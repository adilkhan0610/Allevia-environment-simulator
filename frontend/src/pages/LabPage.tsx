import React, { useEffect, useState, useMemo } from 'react'
import { PageContainer } from '@/components/layout/Containers'
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons'
import { GlassPanel, SurfacePanel } from '@/components/ui/panels'
import { TierBadge, ConnectionIndicator } from '@/components/ui/status'
import { SectionHeading, MonoValue } from '@/components/ui/typography'
import { useSimulationStore } from '@/store/simulationStore'
import { useTelemetryStore } from '@/store/telemetryStore'
import { apiClient } from '@/services/apiClient'
import { wsSimulationClient } from '@/services/wsClient'
import { useWebSocket } from '@/hooks/useWebSocket'
import { DetectorBoxLazy } from '@/three/DetectorBoxLazy'
import { LiveSparklineChart } from '@/components/lab/LiveCharts'
import { SensorFaultControl } from '@/components/lab/SensorFaultControl'
import { TelemetryInspector } from '@/components/lab/TelemetryInspector'
import { GuidedWalkthrough } from '@/components/lab/GuidedWalkthrough'
import { JudgePresentationModal } from '@/components/lab/JudgePresentationModal'
import { ScenarioComparison } from '@/components/lab/ScenarioComparison'
import { SimulationReportExport } from '@/components/lab/SimulationReportExport'
import { RecordedSimulationPlayback } from '@/components/lab/RecordedSimulationPlayback'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Clock,
  Cpu,
  Flame,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Square,
  Thermometer,
  Tv,
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
    simTimeSec,
    setSession,
    clearSession,
    setStatus,
    setSelectedScenarioId,
    setScenarios,
    setSpeedMultiplier,
    setIntensityMultiplier,
    resetSimulation,
  } = useSimulationStore()

  const {
    readings,
    connectionStatus,
    sequenceNumber,
    activeEvents,
    history,
    latestPacket,
    resetTelemetry,
    clearHistory,
  } = useTelemetryStore()

  const [loading, setLoading] = useState(false)
  const [activeFaults, setActiveFaults] = useState<Record<string, string | null>>({})
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [isPlaybackMode, setIsPlaybackMode] = useState(false)

  // Connect WebSocket to backend session stream
  useWebSocket(sessionId)

  // Fetch scenarios on mount
  useEffect(() => {
    if (scenarios.length === 0) {
      apiClient.getScenarios().then((res) => setScenarios(res.scenarios)).catch(console.error)
    }
  }, [scenarios.length, setScenarios])

  // Session Control Actions
  const handleStartSession = async () => {
    setLoading(true)
    try {
      if (!sessionId) {
        const session = await apiClient.createSession({
          scenario_id: selectedScenarioId,
          speed_multiplier: speedMultiplier,
          intensity_multiplier: intensityMultiplier,
        })
        setSession(session.session_id, session.device_id)
        // Start engine via REST control
        await apiClient.controlEngine(session.session_id, { action: 'start' })
      } else {
        await apiClient.controlEngine(sessionId, { action: 'start' })
        wsSimulationClient.send({ type: 'CONTROL', action: 'start' })
      }
      setStatus('RUNNING')
    } catch (err) {
      console.error('Failed to start simulation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseSession = async () => {
    if (!sessionId) return
    try {
      await apiClient.controlEngine(sessionId, { action: 'pause' })
      wsSimulationClient.send({ type: 'CONTROL', action: 'pause' })
      setStatus('PAUSED')
    } catch (err) {
      console.error('Failed to pause simulation:', err)
    }
  }

  const handleResumeSession = async () => {
    if (!sessionId) return
    try {
      await apiClient.controlEngine(sessionId, { action: 'resume' })
      wsSimulationClient.send({ type: 'CONTROL', action: 'resume' })
      setStatus('RUNNING')
    } catch (err) {
      console.error('Failed to resume simulation:', err)
    }
  }

  const handleStopSession = async () => {
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'stop' })
        await apiClient.deleteSession(sessionId)
      } catch (err) {
        console.warn('Failed to delete session on backend:', err)
      }
    }
    clearSession()
    resetTelemetry()
    resetSimulation()
    setActiveFaults({})
  }

  const handleResetSession = async () => {
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'reset' })
        wsSimulationClient.send({ type: 'CONTROL', action: 'reset' })
      } catch (err) {
        console.warn('Failed to reset backend engine:', err)
      }
    }
    resetTelemetry()
    resetSimulation()
    setActiveFaults({})
  }

  const handleSelectScenario = async (scId: string) => {
    setSelectedScenarioId(scId)
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'scenario', scenario_id: scId })
        wsSimulationClient.send({ type: 'CONTROL', action: 'scenario', scenario_id: scId })
      } catch (err) {
        console.error('Failed to change scenario:', err)
      }
    }
  }

  const handleSpeedChange = async (spd: number) => {
    setSpeedMultiplier(spd)
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'speed', speed_multiplier: spd })
        wsSimulationClient.send({ type: 'CONTROL', action: 'speed', speed_multiplier: spd })
      } catch (err) {
        console.error('Failed to update speed multiplier:', err)
      }
    }
  }

  const handleIntensityChange = async (intensity: number) => {
    setIntensityMultiplier(intensity)
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'intensity', intensity_multiplier: intensity })
      } catch (err) {
        console.error('Failed to update intensity multiplier:', err)
      }
    }
  }

  const handleInjectFault = async (sensorName: string, faultType: string | null) => {
    setActiveFaults((prev) => ({ ...prev, [sensorName]: faultType }))
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, {
          action: 'fault',
          sensor_name: sensorName,
          fault_type: faultType,
        })
        wsSimulationClient.send({
          type: 'CONTROL',
          action: 'fault',
          sensor_name: sensorName,
          fault_type: faultType,
        })
      } catch (err) {
        console.error('Failed to inject fault on backend:', err)
      }
    }
  }

  const handleClearAllFaults = async () => {
    setActiveFaults({})
    if (sessionId) {
      try {
        await apiClient.controlEngine(sessionId, { action: 'clear_faults' })
        wsSimulationClient.send({ type: 'CONTROL', action: 'clear_faults' })
      } catch (err) {
        console.error('Failed to clear faults on backend:', err)
      }
    }
  }

  // Rolling chart series extracted from bounded telemetry history
  const chartData = useMemo(() => {
    const temp: number[] = []
    const hum: number[] = []
    const mq2: number[] = []
    const mq7: number[] = []
    const mq135: number[] = []

    history.forEach((pkt) => {
      temp.push(pkt.readings.bme280.temperature_c)
      hum.push(pkt.readings.bme280.humidity_pct)
      mq2.push(pkt.readings.mq2_raw)
      mq7.push(pkt.readings.mq7_raw)
      mq135.push(pkt.readings.mq135_raw)
    })

    return { temp, hum, mq2, mq7, mq135 }
  }, [history])

  return (
    <div className="flex-1 py-6 sm:py-8">
      <PageContainer size="wide">
        {/* Top Status & Cockpit Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-3">
              <SectionHeading as="h1" className="text-2xl sm:text-3xl">
                Simulation Laboratory
              </SectionHeading>
              <TierBadge tier={simulatedTier} />
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-[var(--accent-primary)] rounded border border-cyan-500/30">
                SIMULATED TWIN
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--foreground-muted)] mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>DEVICE: {deviceId}</span>
              <span>SESSION: {sessionId || 'OFFLINE'}</span>
              <span className="flex items-center gap-1.5">
                <ConnectionIndicator status={connectionStatus} />
                <span>WS {connectionStatus}</span>
              </span>
              <span className="flex items-center gap-1 text-[var(--foreground-default)]">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                SIM TIME: {simTimeSec.toFixed(1)}s
              </span>
            </p>
          </div>

          {/* Master Simulation Transport Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {status !== 'RUNNING' ? (
              <PrimaryButton
                size="sm"
                onClick={status === 'PAUSED' ? handleResumeSession : handleStartSession}
                disabled={loading}
              >
                <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                {status === 'PAUSED' ? 'Resume' : 'Start Simulation'}
              </PrimaryButton>
            ) : (
              <SecondaryButton size="sm" onClick={handlePauseSession}>
                <Pause className="w-3.5 h-3.5 mr-1.5" />
                Pause
              </SecondaryButton>
            )}

            <SecondaryButton size="sm" onClick={handleResetSession} disabled={status === 'IDLE' && simTimeSec === 0}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </SecondaryButton>

            {/* Presentation Mode Toggle */}
            <SecondaryButton
              size="sm"
              onClick={() => setIsPresentationMode(true)}
              className="bg-cyan-500/10 text-[var(--accent-primary)] border-cyan-500/30 hover:bg-cyan-500/20"
            >
              <Tv className="w-3.5 h-3.5 mr-1.5" />
              Judge Presentation Mode
            </SecondaryButton>

            {sessionId && (
              <SecondaryButton size="sm" onClick={handleStopSession} className="text-red-400 hover:text-red-300">
                <Square className="w-3.5 h-3.5 mr-1.5" />
                Stop
              </SecondaryButton>
            )}
          </div>
        </div>

        {/* Speed & Intensity Adjusters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[var(--border-subtle)]/60 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[var(--foreground-muted)] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              SIMULATION SPEED:
            </span>
            {[0.5, 1.0, 2.0, 5.0].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => handleSpeedChange(spd)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  speedMultiplier === spd
                    ? 'bg-[var(--accent-primary)] text-black font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground-default)]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[var(--foreground-muted)]">HAZARD INTENSITY:</span>
            {[0.5, 1.0, 1.5, 2.0].map((intn) => (
              <button
                key={intn}
                type="button"
                onClick={() => handleIntensityChange(intn)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  intensityMultiplier === intn
                    ? 'bg-amber-400 text-black font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground-default)]'
                }`}
              >
                {intn}x
              </button>
            ))}
          </div>
        </div>

        {/* Main Simulation Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: 3D Twin (Desktop 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Guided Walkthrough Progression Card */}
            <GuidedWalkthrough
              scenarioId={selectedScenarioId}
              simTimeSec={simTimeSec}
              onJumpToTime={(t) => console.log('Jumped to timeline:', t)}
            />

            {/* Offline Recorded Playback Banner (if enabled) */}
            {isPlaybackMode && (
              <RecordedSimulationPlayback
                recordedPackets={history}
                onPacketEmit={(pkt) => useTelemetryStore.getState().addTelemetryPacket(pkt)}
                onExitPlayback={() => setIsPlaybackMode(false)}
              />
            )}

            <GlassPanel className="p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/50">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--foreground-default)]">
                    Detector Box Digital Twin
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[var(--foreground-muted)]">
                  <span>VBAT: {readings.battery_voltage_v.toFixed(2)}V</span>
                  <span>PKT #{sequenceNumber}</span>
                </div>
              </div>

              {/* Real-time 3D Scene */}
              <div className="flex-1 w-full relative rounded-lg overflow-hidden mt-3 bg-black/40">
                <DetectorBoxLazy />
              </div>
            </GlassPanel>

            {/* Live Telemetry Charts (5 Streams) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--foreground-muted)] flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  Continuous Telemetry Waveforms (Rolling 60s)
                </h2>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">
                  BUFFER: {history.length}/60 PACKETS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <LiveSparklineChart
                  title="BME280 Temperature"
                  unit="°C"
                  data={chartData.temp}
                  color="#f97316"
                  warningThreshold={32.0}
                  criticalThreshold={42.0}
                />
                <LiveSparklineChart
                  title="BME280 Humidity"
                  unit="%"
                  data={chartData.hum}
                  color="#06b6d4"
                  min={0}
                  max={100}
                  warningThreshold={80.0}
                />
                <LiveSparklineChart
                  title="MQ-2 Smoke/Gas"
                  unit="ADC"
                  data={chartData.mq2}
                  color="#eab308"
                  min={0}
                  max={1023}
                  warningThreshold={350}
                  criticalThreshold={650}
                />
                <LiveSparklineChart
                  title="MQ-7 Carbon Monoxide"
                  unit="ADC"
                  data={chartData.mq7}
                  color="#ef4444"
                  min={0}
                  max={1023}
                  warningThreshold={250}
                  criticalThreshold={600}
                />
                <LiveSparklineChart
                  title="MQ-135 Air Quality"
                  unit="ADC"
                  data={chartData.mq135}
                  color="#a855f7"
                  min={0}
                  max={1023}
                  warningThreshold={320}
                  criticalThreshold={580}
                />
              </div>
            </div>

            {/* Diagnostic Sensor Fault Injection Panel */}
            <SensorFaultControl
              activeFaults={activeFaults}
              onInjectFault={handleInjectFault}
              onClearAllFaults={handleClearAllFaults}
            />

            {/* Scenario Comparative Benchmarks */}
            <ScenarioComparison onSelectScenario={handleSelectScenario} />

            {/* Run Report & Data Export */}
            <SimulationReportExport
              sessionId={sessionId}
              scenarioId={selectedScenarioId}
              simTimeSec={simTimeSec}
              history={history}
            />

            {/* Raw Telemetry JSON Inspector */}
            <TelemetryInspector latestPacket={latestPacket} onClearHistory={clearHistory} />
          </div>

          {/* Right Column: Scenario Selection & Live Sensor Cards (Desktop 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Sensor Register Cards */}
            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)]">
              <h2 className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--foreground-muted)] mb-3 flex items-center justify-between">
                <span>Active Sensor Telemetry</span>
                <span className="text-[10px] text-cyan-400 font-normal">SOURCE: SIMULATED</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {/* BME280 */}
                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--foreground-muted)] text-[11px] font-mono mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span>BME280 Ambient</span>
                  </div>
                  <MonoValue className="text-lg font-bold text-[var(--foreground-default)]">
                    {readings.bme280.temperature_c.toFixed(1)}°C
                  </MonoValue>
                  <div className="text-[10px] font-mono text-[var(--foreground-muted)] mt-1 flex justify-between">
                    <span>RH: {readings.bme280.humidity_pct.toFixed(0)}%</span>
                    <span>{readings.bme280.pressure_hpa.toFixed(0)} hPa</span>
                  </div>
                </div>

                {/* MQ-2 */}
                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--foreground-muted)] text-[11px] font-mono mb-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>MQ-2 Smoke/Gas</span>
                  </div>
                  <MonoValue className="text-lg font-bold text-[var(--foreground-default)]">
                    {readings.mq2_raw} <span className="text-xs font-normal text-[var(--foreground-muted)]">ADC</span>
                  </MonoValue>
                  <div className="text-[10px] font-mono text-[var(--foreground-muted)] mt-1 flex justify-between">
                    <span>{readings.mq2_details?.voltage_v.toFixed(2) ?? '0.61'}V</span>
                    <span className={readings.mq2_raw > 400 ? 'text-amber-400' : 'text-emerald-400'}>
                      {readings.mq2_raw > 400 ? 'ELEVATED' : 'NOMINAL'}
                    </span>
                  </div>
                </div>

                {/* MQ-7 */}
                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--foreground-muted)] text-[11px] font-mono mb-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                    <span>MQ-7 Carbon Monoxide</span>
                  </div>
                  <MonoValue className="text-lg font-bold text-[var(--foreground-default)]">
                    {readings.mq7_raw} <span className="text-xs font-normal text-[var(--foreground-muted)]">ADC</span>
                  </MonoValue>
                  <div className="text-[10px] font-mono text-[var(--foreground-muted)] mt-1 flex justify-between">
                    <span>{readings.mq7_details?.voltage_v.toFixed(2) ?? '0.46'}V</span>
                    <span className={readings.mq7_raw > 300 ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                      {readings.mq7_raw > 300 ? 'HAZARD' : 'CLEAN'}
                    </span>
                  </div>
                </div>

                {/* MQ-135 */}
                <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="flex items-center gap-1.5 text-[var(--foreground-muted)] text-[11px] font-mono mb-1">
                    <Wind className="w-3.5 h-3.5 text-purple-400" />
                    <span>MQ-135 Air Quality</span>
                  </div>
                  <MonoValue className="text-lg font-bold text-[var(--foreground-default)]">
                    {readings.mq135_raw} <span className="text-xs font-normal text-[var(--foreground-muted)]">ADC</span>
                  </MonoValue>
                  <div className="text-[10px] font-mono text-[var(--foreground-muted)] mt-1 flex justify-between">
                    <span>{readings.mq135_details?.voltage_v.toFixed(2) ?? '0.73'}V</span>
                    <span className={readings.mq135_raw > 350 ? 'text-purple-400' : 'text-emerald-400'}>
                      {readings.mq135_raw > 350 ? 'DEGRADED' : 'GOOD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Digital IR & Power Status */}
              <div className="mt-3 p-2.5 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>IR BEAM BREAK (D2):</span>
                  <span className={readings.ir_state === 1 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {readings.ir_state === 1 ? 'BROKEN (1)' : 'CLEAR (0)'}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)]">
                  HEATERS: WARMED UP
                </div>
              </div>
            </SurfacePanel>

            {/* Simulated Warnings & Active Events Panel */}
            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--foreground-muted)] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Local Simulated Events ({activeEvents.length})
                </h2>
                <TierBadge tier={simulatedTier} />
              </div>

              {activeEvents.length === 0 ? (
                <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-center text-xs font-mono text-[var(--foreground-muted)]">
                  All environmental channels within nominal baseline thresholds.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {activeEvents.map((evt) => (
                    <div
                      key={evt.event_id}
                      className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col gap-1 ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : evt.severity === 'HIGH'
                          ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>[{evt.event_category}] {evt.triggering_sensor}</span>
                        <span className="text-[10px] uppercase">{evt.severity}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                        {evt.human_explanation}
                      </p>
                      <div className="text-[9px] opacity-60 flex justify-between mt-0.5">
                        <span>VAL: {evt.observed_value} / THRESHOLD: {evt.threshold_value}</span>
                        <span>SIM: {evt.sim_time_sec.toFixed(1)}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SurfacePanel>

            {/* Scenario Selection Grid (6 Scenarios) */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--foreground-muted)]">
                Environmental Scenarios
              </h2>

              <div className="space-y-2.5">
                {scenarios.map((sc) => {
                  const isSelected = selectedScenarioId === sc.id || selectedScenarioId === sc.slug
                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[var(--surface-elevated)] border-[var(--accent-primary)] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                          : 'bg-[var(--surface-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-subtle)]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[var(--foreground-default)]">
                          {sc.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            sc.expected_tier === 'RED'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : sc.expected_tier === 'ORANGE'
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              : sc.expected_tier === 'YELLOW'
                              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          TIER: {sc.expected_tier}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] line-clamp-2 mb-2 leading-relaxed">
                        {sc.description}
                      </p>
                      {sc.id === 'scenario-05' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90 mb-2">
                          <Info className="w-3 h-3" />
                          <span>Demonstration Profile: Educational Simulation Only</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--foreground-subtle)] pt-2 border-t border-[var(--border-subtle)]/40">
                        <span>THREAT: {sc.primary_threat}</span>
                        <span>{sc.duration_seconds}s</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Judge Fullscreen Presentation Overlay */}
      {isPresentationMode && (
        <JudgePresentationModal
          scenarioName={
            scenarios.find((s) => s.id === selectedScenarioId || s.slug === selectedScenarioId)?.name ||
            'Custom Scenario'
          }
          simTimeSec={simTimeSec}
          status={status}
          latestPacket={latestPacket}
          onPlay={status === 'PAUSED' ? handleResumeSession : handleStartSession}
          onPause={handlePauseSession}
          onReset={handleResetSession}
          onExit={() => setIsPresentationMode(false)}
        />
      )}
    </div>
  )
}
