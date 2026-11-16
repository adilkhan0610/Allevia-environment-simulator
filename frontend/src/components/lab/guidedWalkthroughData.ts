export interface GuidedStep {
  timeSec: number
  title: string
  description: string
  expectedSensors: string[]
  expectedTier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'FAULT'
  keyObservations: string
}

export interface ScenarioWalkthrough {
  scenarioId: string
  title: string
  tagline: string
  overview: string
  steps: GuidedStep[]
}

export const SCENARIO_WALKTHROUGHS: Record<string, ScenarioWalkthrough> = {
  'scenario-01': {
    scenarioId: 'scenario-01',
    title: 'Normal Day Walkthrough',
    tagline: 'Clean Indoor Workplace Baseline',
    overview:
      'Demonstrates nominal environmental conditions with mild diurnal temperature variations. All gas sensors operate in their clean air baseline bands.',
    steps: [
      {
        timeSec: 0,
        title: 'Heater Stabilization & Clean Air Baseline',
        description: 'Sensors initialize; heater coils reach stable thermal equilibrium.',
        expectedSensors: ['BME280', 'MQ-2', 'MQ-7', 'MQ-135'],
        expectedTier: 'GREEN',
        keyObservations: 'MQ-2 ADC ~125, MQ-7 ~95, MQ-135 ~150. IR beam unobstructed (0).',
      },
      {
        timeSec: 150,
        title: 'Mild Diurnal Drift',
        description: 'Ambient temperature drifts gently from 22.0°C to 23.5°C with mild humidity drift.',
        expectedSensors: ['BME280'],
        expectedTier: 'GREEN',
        keyObservations: 'Zero warning events generated. System remains safely in GREEN tier.',
      },
      {
        timeSec: 300,
        title: 'Steady State Completion',
        description: 'Baseline stability demonstrated over full 5-minute cycle.',
        expectedSensors: ['BME280', 'MQ-2', 'MQ-7', 'MQ-135'],
        expectedTier: 'GREEN',
        keyObservations: 'All metrics within nominal safety thresholds.',
      },
    ],
  },
  'scenario-02': {
    scenarioId: 'scenario-02',
    title: 'Midday Heatwave Walkthrough',
    tagline: 'Rapid Thermal Escalation & Heat Strain',
    overview:
      'Demonstrates heat illness risk escalation as ambient temperature surges from 25°C to 43.5°C accompanied by dry air (RH dropping to 19%).',
    steps: [
      {
        timeSec: 0,
        title: 'Baseline Ambient Conditions',
        description: 'Initial ambient temperature at 25.0°C with 45% relative humidity.',
        expectedSensors: ['BME280'],
        expectedTier: 'GREEN',
        keyObservations: 'Standard indoor working temperature.',
      },
      {
        timeSec: 80,
        title: 'Advisory Threshold Breach (>32°C)',
        description: 'Temperature surpasses 32.0°C. First advisory heat warning triggers.',
        expectedSensors: ['BME280'],
        expectedTier: 'YELLOW',
        keyObservations: 'Transition to YELLOW tier. Hydration and rest advisories activate.',
      },
      {
        timeSec: 140,
        title: 'Severe Thermal Strain (>38°C)',
        description: 'Temperature hits 38.5°C. Rapid environmental heat load increases.',
        expectedSensors: ['BME280'],
        expectedTier: 'ORANGE',
        keyObservations: 'Transition to ORANGE tier. Warning for heavy physical labor limits.',
      },
      {
        timeSec: 200,
        title: 'Extreme Heat Danger (>42°C)',
        description: 'Peak temperature exceeds 42.0°C with 19% RH. Extreme heat strain danger.',
        expectedSensors: ['BME280'],
        expectedTier: 'RED',
        keyObservations: 'Emergency RED tier alert. High danger of heat exhaustion/stroke.',
      },
    ],
  },
  'scenario-03': {
    scenarioId: 'scenario-03',
    title: 'Humid Heat Walkthrough',
    tagline: 'High Wet-Bulb Heat Index Hazard',
    overview:
      'Simulates high-risk combined thermal stress (35°C at 94% RH) where human sweat evaporation becomes virtually ineffective.',
    steps: [
      {
        timeSec: 0,
        title: 'Tropical Ambient Setup',
        description: 'Warm conditions (26°C) with elevated baseline humidity (55%).',
        expectedSensors: ['BME280'],
        expectedTier: 'GREEN',
        keyObservations: 'Conditions acceptable but humidity climbing.',
      },
      {
        timeSec: 110,
        title: 'Humid Heat Surge (RH > 85%)',
        description: 'Humidity surges to 85% at 34°C, drastically reducing evaporative cooling capacity.',
        expectedSensors: ['BME280'],
        expectedTier: 'ORANGE',
        keyObservations: 'Heat index escalates rapidly beyond dry heat equivalent.',
      },
      {
        timeSec: 180,
        title: 'Wet-Bulb Danger Spike',
        description: 'Temperature peaks at 36.2°C at 94% relative humidity.',
        expectedSensors: ['BME280'],
        expectedTier: 'RED',
        keyObservations: 'Critical RED warning. Physiological heat dissipation impaired.',
      },
    ],
  },
  'scenario-04': {
    scenarioId: 'scenario-04',
    title: 'Smoke or Dust Episode Walkthrough',
    tagline: 'Rapid Particulate Ingress & Optical Flutter',
    overview:
      'Simulates smoke infiltration from smoldering combustion driving steep MQ-2 and MQ-135 spikes and optical IR beam interruptions.',
    steps: [
      {
        timeSec: 0,
        title: 'Clean Atmosphere',
        description: 'Clean air baseline across all particulate and gas channels.',
        expectedSensors: ['MQ-2', 'MQ-135', 'IR'],
        expectedTier: 'GREEN',
        keyObservations: 'MQ-2 ~125 ADC, IR beam clear (0).',
      },
      {
        timeSec: 60,
        title: 'Smoke Onset & Optical Occlusion',
        description: 'Suspended smoke particles begin occluding optical IR beam (flutter 0/1).',
        expectedSensors: ['MQ-2', 'IR'],
        expectedTier: 'YELLOW',
        keyObservations: 'MQ-2 climbs past 350 ADC. IR sensor detects optical break (1).',
      },
      {
        timeSec: 100,
        title: 'Peak Smoke Ingress',
        description: 'Dense smoke signature detected; MQ-2 peaks at 780 ADC; MQ-135 spikes to 690 ADC.',
        expectedSensors: ['MQ-2', 'MQ-135', 'MQ-7'],
        expectedTier: 'RED',
        keyObservations: 'Emergency RED fire/smoke advisory alert with multi-sensor confirmation.',
      },
      {
        timeSec: 240,
        title: 'Ventilation & Slow Recovery',
        description: 'Ventilation activated; sensor resistance begins asymmetric recovery curve.',
        expectedSensors: ['MQ-2', 'MQ-135'],
        expectedTier: 'YELLOW',
        keyObservations: 'ADC readings decay steadily back toward clean air baseline.',
      },
    ],
  },
  'scenario-05': {
    scenarioId: 'scenario-05',
    title: 'Gas Leak Demo Walkthrough',
    tagline: 'Toxic Carbon Monoxide & Fuel Gas Emergency',
    overview:
      'Simulated industrial emergency demonstration exhibiting an exponential Carbon Monoxide (MQ-7) spike accompanied by combustible fuel gas response.',
    steps: [
      {
        timeSec: 0,
        title: 'Baseline Air Monitoring',
        description: 'Clean industrial enclosure baseline.',
        expectedSensors: ['MQ-7', 'MQ-2'],
        expectedTier: 'GREEN',
        keyObservations: 'MQ-7 at clean baseline ~95 ADC.',
      },
      {
        timeSec: 65,
        title: 'Carbon Monoxide Ingress',
        description: 'Steep rise in CO concentration; MQ-7 ADC crosses advisory threshold (250).',
        expectedSensors: ['MQ-7'],
        expectedTier: 'YELLOW',
        keyObservations: 'Advisory toxic gas alarm triggers.',
      },
      {
        timeSec: 110,
        title: 'Critical Emergency Breach (>850 ADC)',
        description: 'Peak hazard CO levels; secondary combustible hydrocarbon response on MQ-2 (>600 ADC).',
        expectedSensors: ['MQ-7', 'MQ-2', 'MQ-135'],
        expectedTier: 'RED',
        keyObservations: 'Critical RED gas leak emergency. Immediate audio-visual cue.',
      },
    ],
  },
  'scenario-06': {
    scenarioId: 'scenario-06',
    title: 'Sensor Fault & Diagnostics Walkthrough',
    tagline: 'Hardware Anomaly & Bus Dropout Detection',
    overview:
      'Demonstrates self-diagnostic algorithms detecting I2C bus lockups, open-circuit pull-ups, and erratic step transients.',
    steps: [
      {
        timeSec: 0,
        title: 'Normal Operation',
        description: 'All sensor channels functional.',
        expectedSensors: ['BME280', 'MQ-7'],
        expectedTier: 'GREEN',
        keyObservations: 'Full telemetry streaming with nominal voltages.',
      },
      {
        timeSec: 51,
        title: 'BME280 I2C Bus Lockup',
        description: 'BME280 drops off I2C bus, emitting -999.0 dropout codes.',
        expectedSensors: ['BME280'],
        expectedTier: 'FAULT',
        keyObservations: 'Diagnostic processor flags HARDWARE_FAULT tier immediately.',
      },
      {
        timeSec: 61,
        title: 'MQ-7 Open Circuit Pull-up',
        description: 'MQ-7 analog pin rails to 1023 ADC counts due to open circuit / wire break.',
        expectedSensors: ['MQ-7'],
        expectedTier: 'FAULT',
        keyObservations: 'Diagnostic alert: Analog wire disconnection detected.',
      },
    ],
  },
}
