import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { ComponentId } from '../types'

interface HardwareAccessoriesProps {
  explodedProgress: number
  selectedComponent: ComponentId | null
  hoveredComponent: ComponentId | null
  onHover: (id: ComponentId | null) => void
  onClick: (id: ComponentId) => void
}

export const HardwareAccessories: React.FC<HardwareAccessoriesProps> = ({
  explodedProgress,
  selectedComponent,
  hoveredComponent,
  onHover,
  onClick,
}) => {
  const isStandoffSelected = selectedComponent === 'standoffs'
  const isStandoffHovered = hoveredComponent === 'standoffs'
  const isWiresSelected = selectedComponent === 'wires'
  const isWiresHovered = hoveredComponent === 'wires'

  // Brass material
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isStandoffSelected ? '#FFE082' : isStandoffHovered ? '#FFD54F' : '#D4AF37', // Metallic Brass
        roughness: 0.25,
        metalness: 0.85,
        emissive: isStandoffSelected ? '#00DDF5' : isStandoffHovered ? '#00A3B5' : '#000000',
        emissiveIntensity: isStandoffSelected ? 0.3 : isStandoffHovered ? 0.15 : 0,
      }),
    [isStandoffSelected, isStandoffHovered]
  )

  const screwMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#BDC3C7',
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  )

  // 4 Hexagonal mounting standoff corner coordinates on Arduino
  const standoffPositions: [number, number, number][] = [
    [-1.4, -0.32, -1.05],
    [1.4, -0.32, -1.05],
    [-1.4, -0.32, 1.05],
    [1.4, -0.32, 1.05],
  ]

  // Dynamic jumper wire curves between Arduino and Sensors
  const wireGeometries = useMemo(() => {
    // 5 wire curves: Red (VCC), Black (GND), Green (A0-MQ2), Orange (A1-MQ7), Yellow (I2C-BME)
    const wireDefinitions = [
      {
        start: new THREE.Vector3(-0.4, 0.1, -1.0),
        mid: new THREE.Vector3(-0.8, 0.5 + explodedProgress * 0.4, -0.6),
        end: new THREE.Vector3(-1.0, 0.2 + explodedProgress * 1.1, -0.7),
        color: '#E53935', // Red 5V
      },
      {
        start: new THREE.Vector3(-0.2, 0.1, -1.0),
        mid: new THREE.Vector3(-0.6, 0.5 + explodedProgress * 0.4, -0.4),
        end: new THREE.Vector3(-0.9, 0.2 + explodedProgress * 1.1, -0.7),
        color: '#212121', // Black GND
      },
      {
        start: new THREE.Vector3(0.5, 0.1, -1.0),
        mid: new THREE.Vector3(0.8, 0.6 + explodedProgress * 0.4, -0.6),
        end: new THREE.Vector3(1.0, 0.25 + explodedProgress * 1.3, -0.7),
        color: '#43A047', // Green MQ-2 Analog A0
      },
      {
        start: new THREE.Vector3(0.7, 0.1, -1.0),
        mid: new THREE.Vector3(1.0, 0.6 + explodedProgress * 0.4, 0.2),
        end: new THREE.Vector3(1.1, 0.25 + explodedProgress * 1.3, 0.7),
        color: '#FB8C00', // Orange MQ-7 Analog A1
      },
      {
        start: new THREE.Vector3(0.8, 0.1, 1.0),
        mid: new THREE.Vector3(0.4, 0.6 + explodedProgress * 0.4, 1.2),
        end: new THREE.Vector3(0.1, 0.25 + explodedProgress * 1.0, 1.3),
        color: '#1E88E5', // Blue IR Digital D2
      },
    ]

    return wireDefinitions.map((def) => {
      const curve = new THREE.CatmullRomCurve3([def.start, def.mid, def.end])
      const geom = new THREE.TubeGeometry(curve, 20, 0.025, 8, false)
      return { geom, color: def.color }
    })
  }, [explodedProgress])

  const standoffY = -0.32 - explodedProgress * 0.45

  return (
    <group>
      {/* ==================================================
          1. BRASS MOUNTING STANDOFFS (4 Pillars)
          ================================================== */}
      <group
        position={[0, standoffY, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('standoffs')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('standoffs')
        }}
      >
        {standoffPositions.map(([sx, _, sz], idx) => (
          <group key={idx} position={[sx, 0, sz]}>
            {/* Hexagonal Standoff Column */}
            <mesh material={brassMaterial} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.35, 6]} />
            </mesh>
            {/* Top Stainless Steel Screw Head */}
            <mesh position={[0, 0.2, 0]} material={screwMaterial}>
              <cylinderGeometry args={[0.11, 0.11, 0.05, 16]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==================================================
          2. JUMPER WIRE HARNESS (Flexible Ribbon Loops)
          ================================================== */}
      <group
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('wires')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('wires')
        }}
      >
        {wireGeometries.map((wire, idx) => (
          <mesh key={idx} geometry={wire.geom} castShadow>
            <meshStandardMaterial
              color={wire.color}
              roughness={0.5}
              metalness={0.1}
              emissive={isWiresSelected ? '#00DDF5' : isWiresHovered ? '#00A3B5' : '#000000'}
              emissiveIntensity={isWiresSelected ? 0.3 : isWiresHovered ? 0.15 : 0}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
