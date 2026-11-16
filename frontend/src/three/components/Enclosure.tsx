import React, { useMemo } from 'react'
import * as THREE from 'three'
import type { ComponentId } from '../types'

interface EnclosureProps {
  explodedProgress: number
  selectedComponent: ComponentId | null
  hoveredComponent: ComponentId | null
  onHover: (id: ComponentId | null) => void
  onClick: (id: ComponentId) => void
}

export const Enclosure: React.FC<EnclosureProps> = ({
  explodedProgress,
  selectedComponent,
  hoveredComponent,
  onHover,
  onClick,
}) => {
  // Rounded rectangle shape for procedural chassis
  const roundedRectShape = useMemo(() => {
    const shape = new THREE.Shape()
    const width = 4.4
    const height = 4.4
    const radius = 0.55
    const x = -width / 2
    const y = -height / 2

    shape.moveTo(x + radius, y)
    shape.lineTo(x + width - radius, y)
    shape.quadraticCurveTo(x + width, y, x + width, y + radius)
    shape.lineTo(x + width, y + height - radius)
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    shape.lineTo(x + radius, y + height)
    shape.quadraticCurveTo(x, y + height, x, y + height - radius)
    shape.lineTo(x, y + radius)
    shape.quadraticCurveTo(x, y, x + radius, y)
    return shape
  }, [])

  // Materials
  const matteBlackMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0D1013',
        roughness: 0.65,
        metalness: 0.25,
      }),
    []
  )

  const selectedLidMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: selectedComponent === 'top_cover' ? '#18242A' : hoveredComponent === 'top_cover' ? '#141A20' : '#0E1115',
        roughness: 0.55,
        metalness: 0.35,
        emissive: selectedComponent === 'top_cover' ? '#00DDF5' : hoveredComponent === 'top_cover' ? '#00A3B5' : '#000000',
        emissiveIntensity: selectedComponent === 'top_cover' ? 0.2 : hoveredComponent === 'top_cover' ? 0.1 : 0,
      }),
    [selectedComponent, hoveredComponent]
  )

  const selectedBaseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: selectedComponent === 'base_enclosure' ? '#18242A' : hoveredComponent === 'base_enclosure' ? '#141A20' : '#0B0D10',
        roughness: 0.7,
        metalness: 0.2,
        emissive: selectedComponent === 'base_enclosure' ? '#00DDF5' : hoveredComponent === 'base_enclosure' ? '#00A3B5' : '#000000',
        emissiveIntensity: selectedComponent === 'base_enclosure' ? 0.2 : hoveredComponent === 'base_enclosure' ? 0.1 : 0,
      }),
    [selectedComponent, hoveredComponent]
  )

  const ledCyanMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00DDF5',
        emissive: '#00DDF5',
        emissiveIntensity: 1.8,
        toneMapped: false,
      }),
    []
  )

  const topY = 0.65 + explodedProgress * 2.8
  const baseY = -0.55 - explodedProgress * 0.9

  return (
    <group>
      {/* ==================================================
          1. TOP COVER (Removable Lid)
          ================================================== */}
      <group
        position={[0, topY, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('top_cover')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('top_cover')
        }}
      >
        {/* Main Lid Geometry */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={selectedLidMaterial} castShadow receiveShadow>
          <extrudeGeometry
            args={[
              roundedRectShape,
              {
                depth: 0.45,
                bevelEnabled: true,
                bevelSegments: 4,
                steps: 1,
                bevelSize: 0.08,
                bevelThickness: 0.08,
              },
            ]}
          />
        </mesh>

        {/* Top Center Airflow Vent Grille Slots */}
        <group position={[0, 0.48, 0]}>
          {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((offset, idx) => (
            <mesh key={idx} position={[offset, 0, 0]}>
              <boxGeometry args={[0.07, 0.02, 1.4]} />
              <meshBasicMaterial color="#050709" />
            </mesh>
          ))}
        </group>

        {/* Front Status Indicator LED */}
        <mesh position={[0, 0.22, 2.22]} material={ledCyanMaterial} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
        </mesh>

        {/* ALLEVIA Branding Plate Graphic */}
        <mesh position={[0, 0.49, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 0.35]} />
          <meshBasicMaterial color="#050709" />
        </mesh>
      </group>

      {/* ==================================================
          2. CYAN-BLUE PERIMETER LED ILLUMINATION RING
          ================================================== */}
      <group position={[0, 0.05 + explodedProgress * 0.4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={ledCyanMaterial}>
          <extrudeGeometry
            args={[
              roundedRectShape,
              {
                depth: 0.06,
                bevelEnabled: false,
              },
            ]}
          />
        </mesh>
      </group>

      {/* ==================================================
          3. BASE CHASSIS ENCLOSURE
          ================================================== */}
      <group
        position={[0, baseY, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover('base_enclosure')
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          onClick('base_enclosure')
        }}
      >
        {/* Main Base Housing */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={selectedBaseMaterial} castShadow receiveShadow>
          <extrudeGeometry
            args={[
              roundedRectShape,
              {
                depth: 0.85,
                bevelEnabled: true,
                bevelSegments: 4,
                steps: 1,
                bevelSize: 0.08,
                bevelThickness: 0.08,
              },
            ]}
          />
        </mesh>

        {/* USB Type-B Port Cutout on Left Wall */}
        <mesh position={[-2.22, 0.45, 0.2]} material={matteBlackMaterial}>
          <boxGeometry args={[0.08, 0.35, 0.45]} />
        </mesh>

        {/* Barrel Power Jack Cutout on Left Wall */}
        <mesh position={[-2.22, 0.45, -0.7]} material={matteBlackMaterial} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        </mesh>

        {/* Four Rubber Corner Feet on Underside */}
        {[
          [-1.7, -0.06, -1.7],
          [1.7, -0.06, -1.7],
          [-1.7, -0.06, 1.7],
          [1.7, -0.06, 1.7],
        ].map(([fx, fy, fz], idx) => (
          <mesh key={idx} position={[fx, fy, fz]}>
            <cylinderGeometry args={[0.2, 0.22, 0.12, 16]} />
            <meshStandardMaterial color="#050608" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
