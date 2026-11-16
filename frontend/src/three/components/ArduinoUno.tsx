import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { ComponentId } from '../types'

interface ArduinoUnoProps {
  explodedProgress: number
  selectedComponent: ComponentId | null
  hoveredComponent: ComponentId | null
  onHover: (id: ComponentId | null) => void
  onClick: (id: ComponentId) => void
}

export const ArduinoUno: React.FC<ArduinoUnoProps> = ({
  explodedProgress,
  selectedComponent,
  hoveredComponent,
  onHover,
  onClick,
}) => {
  const isSelected = selectedComponent === 'arduino'
  const isHovered = hoveredComponent === 'arduino'

  const pcbMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isSelected ? '#1A6BC0' : isHovered ? '#155BA6' : '#0E4D8A',
        roughness: 0.4,
        metalness: 0.1,
        emissive: isSelected ? '#00DDF5' : isHovered ? '#00A3B5' : '#000000',
        emissiveIntensity: isSelected ? 0.25 : isHovered ? 0.12 : 0,
      }),
    [isSelected, isHovered]
  )

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4D8DC',
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  )

  const headerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#121416',
        roughness: 0.7,
        metalness: 0.2,
      }),
    []
  )

  const chipMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1C2024',
        roughness: 0.5,
        metalness: 0.3,
      }),
    []
  )

  const yPos = -0.15 - explodedProgress * 0.1

  return (
    <group
      position={[0, yPos, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover('arduino')
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation()
        onClick('arduino')
      }}
    >
      {/* 1. Arduino Blue PCB Board (68.6mm x 53.4mm scale) */}
      <mesh material={pcbMaterial} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 2.5]} />
      </mesh>

      {/* 2. Silver USB Type-B Port Connector */}
      <mesh position={[-1.4, 0.22, 0.6]} material={metalMaterial} castShadow>
        <boxGeometry args={[0.7, 0.38, 0.55]} />
      </mesh>

      {/* 3. Black Barrel DC Power Connector Jack */}
      <mesh position={[-1.35, 0.24, -0.65]} material={headerMaterial} castShadow>
        <boxGeometry args={[0.75, 0.42, 0.48]} />
      </mesh>
      <mesh position={[-1.73, 0.24, -0.65]} material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
      </mesh>

      {/* 4. ATmega328P DIP-28 IC Microcontroller */}
      <group position={[0.4, 0.1, 0.1]}>
        <mesh material={chipMaterial} castShadow>
          <boxGeometry args={[1.5, 0.14, 0.45]} />
        </mesh>
        {/* Silver IC lead legs */}
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, idx) => (
          <group key={idx}>
            <mesh position={[x, -0.04, 0.25]} material={metalMaterial}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
            </mesh>
            <mesh position={[x, -0.04, -0.25]} material={metalMaterial}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. Female Pin Headers (Digital 0-13, Analog A0-A5, Power) */}
      {/* Digital Top Header Strip */}
      <mesh position={[0.2, 0.24, 1.12]} material={headerMaterial} castShadow>
        <boxGeometry args={[2.3, 0.4, 0.18]} />
      </mesh>
      {/* Analog/Power Bottom Header Strip */}
      <mesh position={[0.2, 0.24, -1.12]} material={headerMaterial} castShadow>
        <boxGeometry args={[2.3, 0.4, 0.18]} />
      </mesh>

      {/* 6. 16 MHz Crystal Oscillator */}
      <mesh position={[-0.45, 0.12, 0.2]} material={metalMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.4, 16]} />
      </mesh>

      {/* 7. Reset Button (Red Mini Tactile Switch) */}
      <mesh position={[-1.25, 0.12, 1.05]}>
        <boxGeometry args={[0.2, 0.14, 0.2]} />
        <meshStandardMaterial color="#C82020" roughness={0.3} />
      </mesh>

      {/* 8. Power & TX/RX Status LEDs */}
      <mesh position={[-0.3, 0.08, 0.8]}>
        <boxGeometry args={[0.06, 0.04, 0.06]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
      <mesh position={[-0.1, 0.08, 0.8]}>
        <boxGeometry args={[0.06, 0.04, 0.06]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>
    </group>
  )
}
