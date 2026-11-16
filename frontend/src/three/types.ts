export type ComponentId =
  | 'ir'
  | 'mq2'
  | 'mq7'
  | 'mq135'
  | 'bme280'
  | 'arduino'
  | 'wires'
  | 'standoffs'
  | 'top_cover'
  | 'base_enclosure'

export interface ComponentMetadata {
  id: ComponentId
  name: string
  category: string
  description: string
  specs: string
  position: [number, number, number]
  explodedOffset: [number, number, number]
}

export const HARDWARE_COMPONENTS: Record<ComponentId, ComponentMetadata> = {
  top_cover: {
    id: 'top_cover',
    name: 'Top Cover Enclosure',
    category: 'Chassis',
    description: 'Matte black removable lid with engraved ALLEVIA wordmark and airflow vents.',
    specs: 'Polycarbonate • Beveled edges • Side ventilation grilles',
    position: [0, 0.95, 0],
    explodedOffset: [0, 2.6, 0],
  },
  base_enclosure: {
    id: 'base_enclosure',
    name: 'Base Enclosure Chassis',
    category: 'Chassis',
    description: 'Matte black protective housing with mounting standoffs and port cutouts.',
    specs: 'Internal standoffs • USB/Power cutouts • Cyan perimeter LED ring',
    position: [0, -0.6, 0],
    explodedOffset: [0, -1.2, 0],
  },
  arduino: {
    id: 'arduino',
    name: 'Arduino Uno Rev3',
    category: 'Microcontroller',
    description: 'ATmega328P @ 16 MHz with 10-bit Successive Approximation ADC (0–1023).',
    specs: '14 Digital I/O • 6 Analog In • 5.0V Ref • USB-B Serial',
    position: [0, -0.15, 0],
    explodedOffset: [0, -0.2, 0],
  },
  standoffs: {
    id: 'standoffs',
    name: 'Brass Standoffs',
    category: 'Mounting Hardware',
    description: 'Four hexagonal brass mounting supports anchoring the Arduino Uno PCB.',
    specs: '4x M3 Brass Cylinders • Stainless Steel Screws',
    position: [0, -0.4, 0],
    explodedOffset: [0, -0.7, 0],
  },
  bme280: {
    id: 'bme280',
    name: 'BME280 Sensor',
    category: 'Digital Environment',
    description: 'Calibrated digital sensor measuring temperature, humidity, and barometric pressure.',
    specs: 'Temp: ±0.5°C • Humidity: ±3% • Pressure: ±1 hPa • I2C Bus',
    position: [-1.1, 0.25, -0.9],
    explodedOffset: [-1.5, 1.4, -1.2],
  },
  mq2: {
    id: 'mq2',
    name: 'MQ-2 Gas Sensor',
    category: 'Analog Sensor',
    description: 'Metal oxide sensor detecting smoke, LPG, Propane, Hydrogen, and combustible gases.',
    specs: 'Analog Pin A0 • 0–1023 ADC • SnO2 Sensitive Layer',
    position: [1.0, 0.35, -0.9],
    explodedOffset: [1.4, 1.6, -1.2],
  },
  mq7: {
    id: 'mq7',
    name: 'MQ-7 CO Sensor',
    category: 'Analog Sensor',
    description: 'High/low cycle heated MOS sensor detecting toxic Carbon Monoxide accumulation.',
    specs: 'Analog Pin A1 • 0–1023 ADC • 20–2000 ppm CO Range',
    position: [1.1, 0.35, 0.9],
    explodedOffset: [1.5, 1.6, 1.2],
  },
  mq135: {
    id: 'mq135',
    name: 'MQ-135 Air Quality Sensor',
    category: 'Analog Sensor',
    description: 'Broad-spectrum air quality sensor detecting Ammonia, Benzene, Alcohol, and NOx.',
    specs: 'Analog Pin A2 • 0–1023 ADC • Indoor/Workplace AQI',
    position: [-1.1, 0.35, 0.9],
    explodedOffset: [-1.5, 1.6, 1.2],
  },
  ir: {
    id: 'ir',
    name: 'Optical IR Sensor',
    category: 'Digital Sensor',
    description: 'Infrared transmitter/receiver pair detecting particulate smoke or beam obstruction.',
    specs: 'Digital Pin D2 • Active Low/High Flag • Beam Interrupter',
    position: [0, 0.3, 1.5],
    explodedOffset: [0, 1.3, 2.1],
  },
  wires: {
    id: 'wires',
    name: 'Jumper Wire Harness',
    category: 'Interconnect',
    description: 'Color-coded flexible ribbon jumper cables connecting sensor pins to headers.',
    specs: 'Power (Red), Ground (Black), I2C (Yellow/Blue), ADC (Green/Orange)',
    position: [0, 0.1, 0],
    explodedOffset: [0, 0.7, 0],
  },
}

export interface DetectorBoxProps {
  exploded?: boolean
  interactive?: boolean
  showCallouts?: boolean
  selectedComponent?: ComponentId | null
  onSelectComponent?: (id: ComponentId | null) => void
  autoRotate?: boolean
  className?: string
}
