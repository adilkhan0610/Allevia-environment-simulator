import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { Enclosure } from './components/Enclosure'
import { ArduinoUno } from './components/ArduinoUno'
import { Sensors } from './components/Sensors'
import { HardwareAccessories } from './components/HardwareAccessories'
import { CalloutPin } from './components/CalloutPin'
import { HARDWARE_COMPONENTS, type ComponentId, type DetectorBoxProps } from './types'

interface SceneContentProps extends DetectorBoxProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

const SceneContent: React.FC<SceneContentProps> = ({
  exploded = false,
  showCallouts = true,
  selectedComponent = null,
  onSelectComponent,
  autoRotate = false,
  controlsRef,
}) => {
  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(null)
  const currentProgressRef = useRef<number>(exploded ? 1 : 0)
  const [animProgress, setAnimProgress] = useState<number>(exploded ? 1 : 0)

  // Smooth lerp transition between assembled (0) and exploded (1)
  useFrame((_, delta) => {
    const target = exploded ? 1 : 0
    const step = delta * 3.5
    if (Math.abs(currentProgressRef.current - target) > 0.005) {
      currentProgressRef.current = THREE.MathUtils.lerp(currentProgressRef.current, target, step)
      setAnimProgress(currentProgressRef.current)
    } else {
      currentProgressRef.current = target
    }
  })

  const handleComponentClick = (id: ComponentId) => {
    if (onSelectComponent) {
      onSelectComponent(selectedComponent === id ? null : id)
    }
  }

  return (
    <>
      {/* ==================================================
          1. STUDIO LIGHTING RIG
          ================================================== */}
      {/* Soft Ambient Light */}
      <ambientLight intensity={1.2} color="#161B22" />

      {/* Main Studio Key Light (Top-Front-Right) */}
      <directionalLight
        position={[6, 9, 6]}
        intensity={2.0}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Soft Fill Light (Left-Back) */}
      <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#88A8C8" />

      {/* Signature Cyan Rim Light (Back-Right Rim Highlight) */}
      <directionalLight position={[5, 2, -6]} intensity={3.0} color="#00DDF5" />

      {/* Subtle Bottom Bounce */}
      <directionalLight position={[0, -4, 0]} intensity={0.6} color="#05080C" />

      {/* ==================================================
          2. DETECTOR BOX HARDWARE ASSEMBLY
          ================================================== */}
      <group position={[0, -0.2, 0]}>
        {/* Chassis Enclosure (Top Cover, Perimeter LED, Base Housing) */}
        <Enclosure
          explodedProgress={animProgress}
          selectedComponent={selectedComponent}
          hoveredComponent={hoveredComponent}
          onHover={setHoveredComponent}
          onClick={handleComponentClick}
        />

        {/* Arduino Uno Rev3 Microcontroller Board */}
        <ArduinoUno
          explodedProgress={animProgress}
          selectedComponent={selectedComponent}
          hoveredComponent={hoveredComponent}
          onHover={setHoveredComponent}
          onClick={handleComponentClick}
        />

        {/* Sensor Suite (MQ-2, MQ-7, MQ-135, BME280, IR Sensor) */}
        <Sensors
          explodedProgress={animProgress}
          selectedComponent={selectedComponent}
          hoveredComponent={hoveredComponent}
          onHover={setHoveredComponent}
          onClick={handleComponentClick}
        />

        {/* Hardware Accessories (Brass Standoffs, Jumper Wires) */}
        <HardwareAccessories
          explodedProgress={animProgress}
          selectedComponent={selectedComponent}
          hoveredComponent={hoveredComponent}
          onHover={setHoveredComponent}
          onClick={handleComponentClick}
        />

        {/* Component 3D Callout Annotations */}
        {showCallouts &&
          Object.values(HARDWARE_COMPONENTS).map((comp) => {
            const posX = comp.position[0] + (comp.explodedOffset[0] - comp.position[0]) * animProgress
            const posY = comp.position[1] + (comp.explodedOffset[1] - comp.position[1]) * animProgress
            const posZ = comp.position[2] + (comp.explodedOffset[2] - comp.position[2]) * animProgress

            return (
              <CalloutPin
                key={comp.id}
                component={comp}
                position={[posX, posY, posZ]}
                isSelected={selectedComponent === comp.id}
                isHovered={hoveredComponent === comp.id}
                onClick={() => handleComponentClick(comp.id)}
              />
            )
          })}
      </group>

      {/* ==================================================
          3. GROUND CONTACT SHADOW
          ================================================== */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.65}
        scale={10}
        blur={2}
        far={4.5}
        color="#000000"
      />

      {/* ==================================================
          4. ORBIT CAMERA CONTROLS
          ================================================== */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={4.2}
        maxDistance={15.0}
        maxPolarAngle={Math.PI / 2 + 0.08}
        minPolarAngle={0.2}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        makeDefault
      />
    </>
  )
}

export const DetectorBoxScene: React.FC<DetectorBoxProps> = (props) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Performance optimization: bound device pixel ratio
      camera={{ position: [6.2, 5.0, 7.2], fov: 42 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    >
      <SceneContent {...props} controlsRef={controlsRef} />
    </Canvas>
  )
}
