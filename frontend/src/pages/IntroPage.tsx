import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { apiClient } from '@/services/apiClient'
import { useSimulationStore } from '@/store/simulationStore'
import { ArrowRight, Box, Cpu, ShieldAlert, Sparkles } from 'lucide-react'

export const IntroPage: React.FC = () => {
  const scenarios = useSimulationStore((s) => s.scenarios)
  const setScenarios = useSimulationStore((s) => s.setScenarios)

  useEffect(() => {
    apiClient
      .getScenarios()
      .then((res) => setScenarios(res.scenarios))
      .catch((err) => console.warn('Failed to fetch scenarios in intro:', err))
  }, [setScenarios])

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:py-20">
      <Container>
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Virtual Twin Simulator • Standalone Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            ALLEVIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">Detector Box</span> Simulator
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Experience our physical hardware detector box in real-time 3D. Inspect internal sensors,
            simulate environmental hazard scenarios, and observe 10-bit ADC telemetry generation with strict data isolation.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/lab">
                Enter Interactive Lab
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Hardware Architecture</Link>
            </Button>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Box className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">3D Hardware Twin</CardTitle>
              <CardDescription>
                Interactive exploded-view visualization of the Arduino Uno, BME280, MQ-2, MQ-7, MQ-135, and IR sensors.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">6 Environmental Scenarios</CardTitle>
              <CardDescription>
                Simulate heatwaves, toxic carbon monoxide leaks, smoke episodes, and hardware fault conditions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Real-Time Telemetry</CardTitle>
              <CardDescription>
                Low-latency bi-directional WebSocket streaming with 10-bit ADC registers and local simulated risk tiers.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Loaded Scenarios Preview */}
        {scenarios.length > 0 && (
          <div className="mt-12 p-4 rounded-xl border border-slate-800 bg-[#0F1118]/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Available Scenarios ({scenarios.length})</span>
              <StatusBadge status="FOUNDATION READY" variant="cyan" />
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.map((sc) => (
                <span
                  key={sc.id}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {sc.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
