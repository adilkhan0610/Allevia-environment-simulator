import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { ComponentId } from '../types'

interface SensorsProps {
  explodedProgress: number
  selectedComponent: ComponentId | null
  hoveredComponent: ComponentId | null
  onHover: (id: ComponentId | null) => void
  onClick: (id: ComponentId) => void
}

export const Sensors: React.FC<SensorsProps> = ({
  explodedProgress,
  selectedComponent,
  hoveredComponent,
  onHover,
  onClick,
}) => {
  // Shared materials
  const metalMeshMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#BDC3C7',
        roughness: 0.35,
        metalness: 0.85,
        wireframe: false,
      }),
    []
  )

  const orangeCapMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#E65100', // Distinct MQ-7 Orange
        roughness: 0.45,
        metalness: 0.2,
      }),
    []
  )

  const sensorBaseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#15191D',
        roughness: 0.6,
        metalness: 0.3,
      }),
    []
  )

  const purplePcbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6A1B9A', // BME280 Purple PCB
        roughness: 0.35,
        metalness: 0.15,
      }),
    []
  )

  const irPcbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1A365D', // IR Sensor Deep Blue PCB
        roughness: 0.4,
        metalness: 0.2,
      }),
    []
  )

  const pinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#F1C40F', // Gold Plated Pins
        roughness: 0.2,
        metalness: 0.95,
      }),
    []
  )

  // Calculate dynamic positions based on exploded progress
  // MQ-2: Top-Right
  const mq2Pos: [number, number, number] = [
    1.0 + explodedProgress * 0.4,
    0.3 + explodedProgress * 1.3,
    -0.85 - explodedProgress * 0.35,
  ]

  // MQ-7: Bottom-Right
  const mq7Pos: [number, number, number] = [
    1.1 + explodedProgress * 0.4,
    0.3 + explodedProgress * 1.3,
    0.85 + explodedProgress * 0.35,
  ]

  // MQ-135: Bottom-Left
  const mq135Pos: [number, number, number] = [
    -1.1 - explodedProgress * 0.4,
    0.3 + explodedProgress * 1.3,
    0.85 + explodedProgress * 0.35,
  ]

  // BME280: Top-Left
  const bmePos: [number, number, number] = [
    -1.0 - explodedProgress * 0.4,
    0.2 + explodedProgress * 1.1,
    -0.85 - explodedProgress * 0.35,
  ]

  // IR Sensor: Front-Center
  const irPos: [number, number, number] = [
    0,
    0.25 + explodedProgress * 1.0,
    1.45 + explodedProgress * 0.65,
  ]

  const getHighlightProps = (id: ComponentId) => {
    const isSelected = selectedComponent === id
    const isHovered = hoveredComponent === id
    return {
      emissive: isSelected ? '#00DDF5' : isHovered ? '#00A3B5' : '#000000',
      emissiveIntensity: isSelected ? 0.4 : isHovered ? 0.2 : 0,
    }
  }

  return (
    <group>
      {/* ==================================================
          1. MQ-2 SENSOR (Combustible Gas & Smoke)
          ================================================== */}
      <group
        position={mq2Pos}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('mq2')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('mq2')
        }}
      >
        {/* Breakout PCB */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
          <meshStandardMaterial
            color="#1B5E20"
            {...getHighlightProps('mq2')}
          />
        </mesh>
        {/* Sensor Bakelite Base */}
        <mesh position={[0, -0.05, 0]} material={sensorBaseMaterial}>
          <cylinderGeometry args={[0.38, 0.38, 0.14, 24]} />
        </mesh>
        {/* Silver Stainless Steel Mesh Cap */}
        <mesh position={[0, 0.18, 0]} material={metalMeshMaterial} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.32, 24]} />
        </mesh>
        <mesh position={[0, 0.34, 0]} material={metalMeshMaterial}>
          <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* ==================================================
          2. MQ-7 SENSOR (Carbon Monoxide - Orange Cap)
          ================================================== */}
      <group
        position={mq7Pos}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('mq7')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('mq7')
        }}
      >
        {/* Breakout PCB */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
          <meshStandardMaterial
            color="#1B5E20"
            {...getHighlightProps('mq7')}
          />
        </mesh>
        {/* Sensor Bakelite Base */}
        <mesh position={[0, -0.05, 0]} material={sensorBaseMaterial}>
          <cylinderGeometry args={[0.38, 0.38, 0.14, 24]} />
        </mesh>
        {/* Distinctive Orange Cap */}
        <mesh position={[0, 0.18, 0]} material={orangeCapMaterial} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.32, 24]} />
        </mesh>
        <mesh position={[0, 0.34, 0]} material={orangeCapMaterial}>
          <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Top Metallic Ring */}
        <mesh position={[0, 0.36, 0]} material={metalMeshMaterial}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 16]} />
        </mesh>
      </group>

      {/* ==================================================
          3. MQ-135 SENSOR (Air Quality - Silver Mesh)
          ================================================== */}
      <group
        position={mq135Pos}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('mq135')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('mq135')
        }}
      >
        {/* Breakout PCB */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
          <meshStandardMaterial
            color="#1B5E20"
            {...getHighlightProps('mq135')}
          />
        </mesh>
        {/* Sensor Base */}
        <mesh position={[0, -0.05, 0]} material={sensorBaseMaterial}>
          <cylinderGeometry args={[0.38, 0.38, 0.14, 24]} />
        </mesh>
        {/* Metallic Sensor Mesh Cap */}
        <mesh position={[0, 0.18, 0]} material={metalMeshMaterial} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.32, 24]} />
        </mesh>
        <mesh position={[0, 0.34, 0]} material={metalMeshMaterial}>
          <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* ==================================================
          4. BME280 DIGITAL SENSOR (Purple PCB)
          ================================================== */}
      <group
        position={bmePos}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('bme280')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('bme280')
        }}
      >
        {/* Small Purple Rectangular PCB */}
        <mesh material={purplePcbMaterial} castShadow>
          <boxGeometry args={[0.65, 0.06, 0.85]} />
        </mesh>
        {/* Bosch Metal Lid Sensor Chip */}
        <mesh position={[0, 0.06, -0.1]}>
          <boxGeometry args={[0.22, 0.06, 0.22]} />
          <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* 4 Gold Plated I2C Header Pins (VCC, GND, SCL, SDA) */}
        {[-0.22, -0.07, 0.07, 0.22].map((x, idx) => (
          <mesh key={idx} position={[x, 0.08, 0.32]} material={pinMaterial}>
            <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          </mesh>
        ))}
      </group>

      {/* ==================================================
          5. OPTICAL IR OBSTACLE SENSOR MODULE
          ================================================== */}
      <group
        position={irPos}
        rotation={[0, Math.PI, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('ir')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('ir')
        }}
      >
        {/* Blue PCB Carrier */}
        <mesh material={irPcbMaterial} castShadow>
          <boxGeometry args={[0.7, 0.06, 1.3]} />
        </mesh>
        {/* IR Optical Emitter LED (Clear/White) */}
        <mesh position={[-0.18, 0.14, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
          <meshPhysicalMaterial color="#FFFFFF" transmission={0.8} opacity={0.9} roughness={0.1} transparent />
        </mesh>
        {/* Phototransistor Optical Detector LED (Black lens) */}
        <mesh position={[0.18, 0.14, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Blue Sensitivity Trim Potentiometer */}
        <mesh position={[0, 0.1, -0.15]}>
          <boxGeometry args={[0.3, 0.16, 0.3]} />
          <meshStandardMaterial color="#1976D2" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
