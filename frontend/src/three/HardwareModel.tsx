import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useSimulatorStore } from '@/store/simulatorStore'

export type HardwarePartId = 'arduino' | 'bme280' | 'mq2' | 'mq7' | 'mq135' | 'ir'

interface PartInfo {
  name: string
  desc: string
}

const PART_DESCRIPTIONS: Record<HardwarePartId, PartInfo> = {
  arduino: {
    name: 'Arduino Uno',
    desc: 'Reads the sensors and converts their signals into digital data.',
  },
  bme280: {
    name: 'BME280',
    desc: 'Measures air temperature, humidity and barometric pressure.',
  },
  mq2: {
    name: 'MQ2',
    desc: 'Responds to smoke and flammable gases like methane and LPG.',
  },
  mq7: {
    name: 'MQ7',
    desc: 'Measures carbon monoxide concentrations in the surrounding air.',
  },
  mq135: {
    name: 'MQ135',
    desc: 'Monitors general air quality and tracks common hazardous fumes.',
  },
  ir: {
    name: 'IR Sensor',
    desc: 'Detects infrared light and radiant heat from nearby sources.',
  },
}

export const HardwareModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const resetCameraRef = useRef<() => void>(() => {})
  const [selectedPart, setSelectedPart] = useState<HardwarePartId | null>(null)
  const [webGlSupported, setWebGlSupported] = useState(true)

  // Simulation parameters from store to drive atmospheric air orbs
  const status = useSimulatorStore((s) => s.status)
  const temperature = useSimulatorStore((s) => s.params.temperature)
  const humidity = useSimulatorStore((s) => s.params.humidity)
  const airQuality = useSimulatorStore((s) => s.params.airQuality)
  const gases = useSimulatorStore((s) => s.params.gases)

  // Refs to pass values into the Three.js loop without tearing down the scene
  const animStateRef = useRef({
    isRunning: false,
    temperature: 28.0,
    humidity: 50,
    airQuality: 45,
    gases: [] as string[],
    focusedPart: null as HardwarePartId | null,
  })

  useEffect(() => {
    animStateRef.current.isRunning = status === 'running'
    animStateRef.current.temperature = temperature
    animStateRef.current.humidity = humidity
    animStateRef.current.airQuality = airQuality
    animStateRef.current.gases = gases
    animStateRef.current.focusedPart = selectedPart
  }, [status, temperature, humidity, airQuality, gases, selectedPart])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) {
        setWebGlSupported(false)
        return
      }
    } catch {
      setWebGlSupported(false)
      return
    }

    const cleanups: Array<() => void> = []

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setWebGlSupported(false)
      return
    }

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    cleanups.push(() => {
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
      renderer.dispose()
    })

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.minDistance = 5.0
    controls.maxDistance = 22
    controls.minPolarAngle = 0.1
    controls.maxPolarAngle = Math.PI * 0.48
    controls.rotateSpeed = 0.55
    controls.zoomSpeed = 0.7

    const defaultTarget = new THREE.Vector3(0, 1.15, 0)
    const defaultPosition = new THREE.Vector3(0, 5.2, 8.4)
    camera.position.copy(defaultPosition)
    controls.target.copy(defaultTarget)

    cleanups.push(() => controls.dispose())

    // Studio Environment map & Lighting Setup
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04)
    scene.environment = env.texture
    scene.environmentIntensity = 0.75
    room.dispose()
    pmrem.dispose()
    cleanups.push(() => env.texture.dispose())

    const hemi = new THREE.HemisphereLight(0xffffff, 0xdbe7f4, 1.6)
    scene.add(hemi)

    // Key Light with High-Resolution Soft Contact Shadows
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 3.4)
    keyLight.position.set(-5, 12, 7)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.bias = -0.0003
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.camera.left = -4.2
    keyLight.shadow.camera.right = 4.2
    keyLight.shadow.camera.top = 4.2
    keyLight.shadow.camera.bottom = -4.2
    keyLight.shadow.camera.near = 2.0
    keyLight.shadow.camera.far = 24.0
    scene.add(keyLight)

    // Soft Studio Fill Light
    const fillLight = new THREE.DirectionalLight(0xdce9f8, 1.8)
    fillLight.position.set(5, 7, -6)
    scene.add(fillLight)

    // Studio Rim Backlight for Razor-Sharp Edge Contours
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0)
    rimLight.position.set(0, 9, -8)
    scene.add(rimLight)

    // Gentle Underside Floor Bounce
    const softBounce = new THREE.DirectionalLight(0xffffff, 0.9)
    softBounce.position.set(0, -4, 0)
    scene.add(softBounce)

    // Dual Interior Illumination (makes all circuitry, headers, and wires crystal-clear)
    const interiorLight1 = new THREE.PointLight(0xffffff, 1.8, 7)
    interiorLight1.position.set(-0.6, 1.15, 0.15)
    scene.add(interiorLight1)

    const interiorLight2 = new THREE.PointLight(0xe8f2ff, 1.0, 7)
    interiorLight2.position.set(1.4, 1.15, -0.2)
    scene.add(interiorLight2)

    // Materials Library
    const mat = (
      color: number,
      metalness = 0.1,
      roughness = 0.4,
      extra: THREE.MeshStandardMaterialParameters = {}
    ) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })

    const M = {
      body: mat(0x30363f, 0.75, 0.28),
      base: mat(0x292f37, 0.85, 0.3),
      acrylic: new THREE.MeshPhysicalMaterial({
        color: 0xf5f9ff,
        transparent: true,
        opacity: 0.16,
        roughness: 0.03,
        metalness: 0.04,
        transmission: 0.95,
        ior: 1.49,
        thickness: 0.08,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        depthWrite: false,
      }),
      clearGlass: new THREE.MeshPhysicalMaterial({
        color: 0xfafcff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        transmission: 0.92,
        ior: 1.52,
        thickness: 0.06,
        clearcoat: 1.0,
      }),
      chrome: mat(0xd4dadf, 0.95, 0.14),
      dark: mat(0x14181e, 0.35, 0.35),
      copper: mat(0xd6894d, 0.88, 0.22),
      black: mat(0x0a0d10, 0, 0.5),
      enc: mat(0x1a1f26, 0.55, 0.32),
      pcb: mat(0x0f5b99, 0.2, 0.4),
      sensorBlue: mat(0x1965ce, 0.2, 0.42),
      purple: mat(0x632ca6, 0.2, 0.4),
      gold: mat(0xf5c342, 0.95, 0.15),
      orange: mat(0xeb671c, 0.4, 0.32),
      neutralLed: mat(0xffffff, 0.2, 0.3, { emissive: 0xffffff, emissiveIntensity: 1.2 }),
      greenLed: mat(0x2ecc71, 0.2, 0.2, { emissive: 0x27ae60, emissiveIntensity: 1.8 }),
      redLed: mat(0xe74c3c, 0.2, 0.2, { emissive: 0xc0392b, emissiveIntensity: 1.8 }),
      amberLed: mat(0xf39c12, 0.2, 0.2, { emissive: 0xd35400, emissiveIntensity: 1.8 }),
    }

    const geometries = new Map<string, THREE.BufferGeometry>()
    cleanups.push(() => {
      geometries.forEach((g) => g.dispose())
      geometries.clear()
    })

    function boxGeo(w: number, h: number, d: number, r = 0.04) {
      const k = `b${w},${h},${d},${r}`
      if (!geometries.has(k)) {
        geometries.set(
          k,
          r
            ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3))
            : new THREE.BoxGeometry(w, h, d)
        )
      }
      return geometries.get(k)!
    }

    function box(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = M.body,
      r = 0.04
    ) {
      const o = new THREE.Mesh(boxGeo(w, h, d, r), m)
      o.position.set(x, y, z)
      o.castShadow = true
      o.receiveShadow = true
      parent.add(o)
      return o
    }

    function cyl(
      parent: THREE.Object3D,
      r: number,
      h: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = M.chrome,
      r2: number = r,
      segments = 24
    ) {
      const k = `c${r},${r2},${h},${segments}`
      if (!geometries.has(k)) geometries.set(k, new THREE.CylinderGeometry(r, r2, h, segments))
      const o = new THREE.Mesh(geometries.get(k)!, m)
      o.position.set(x, y, z)
      o.castShadow = true
      o.receiveShadow = true
      parent.add(o)
      return o
    }

    function ball(
      parent: THREE.Object3D,
      r: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material = M.chrome
    ) {
      const k = `s${r}`
      if (!geometries.has(k)) geometries.set(k, new THREE.SphereGeometry(r, 16, 12))
      const o = new THREE.Mesh(geometries.get(k)!, m)
      o.position.set(x, y, z)
      parent.add(o)
      return o
    }

    function screw(parent: THREE.Object3D, x: number, y: number, z: number) {
      cyl(parent, 0.055, 0.026, x, y, z, M.chrome, undefined, 14)
      box(parent, 0.068, 0.005, 0.009, x, y + 0.014, z, M.dark, 0)
    }

    function canvasTexture(
      w: number,
      h: number,
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    ) {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      draw(ctx, w, h)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      cleanups.push(() => t.dispose())
      return { texture: t, canvas: c, ctx }
    }

    function print(
      ctx: CanvasRenderingContext2D,
      txt: string,
      x: number,
      y: number,
      size = 20,
      color = '#f4f1ea',
      weight = 500,
      align: CanvasTextAlign = 'left'
    ) {
      ctx.fillStyle = color
      ctx.textAlign = align
      ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      ctx.fillText(txt, x, y)
      ctx.textAlign = 'left'
    }

    function screen(
      parent: THREE.Object3D,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      tex: { texture: THREE.Texture },
      transparent = false
    ) {
      const o = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex.texture, toneMapped: false, transparent })
      )
      o.position.set(x, y, z)
      parent.add(o)
      return o
    }

    // High-Resolution Stainless Steel Micro-Mesh for MQ Sensors
    const meshTex = canvasTexture(512, 512, (c, w, h) => {
      c.fillStyle = '#9aa4ac'
      c.fillRect(0, 0, w, h)
      c.strokeStyle = '#252a30'
      c.lineWidth = 2.5
      for (let i = 0; i <= w; i += 16) {
        c.beginPath()
        c.moveTo(i, 0)
        c.lineTo(i, h)
        c.moveTo(0, i)
        c.lineTo(w, i)
        c.stroke()
      }
      c.strokeStyle = '#c4cbd2'
      c.lineWidth = 14
      c.beginPath()
      c.arc(w / 2, h / 2, w / 2 - 8, 0, Math.PI * 2)
      c.stroke()
    }).texture

    // Base detector node group centered at (0, 0, 0)
    const node = new THREE.Group()
    node.position.set(0, 0, 0)
    scene.add(node)

    // Base enclosure walls and floor
    box(node, 6.4, 0.2, 4.4, 0, 0.1, 0, M.enc, 0.06)
    box(node, 6.4, 1.1, 0.16, 0, 0.65, 2.12, M.enc, 0.05)
    box(node, 6.4, 1.1, 0.16, 0, 0.65, -2.12, M.enc, 0.05)
    box(node, 0.16, 1.1, 4.08, -3.12, 0.65, 0, M.enc, 0.05)
    box(node, 0.16, 1.1, 4.08, 3.12, 0.65, 0, M.enc, 0.05)

    // Crystal-Clear Acrylic Top Platform (reveals all internal connections underneath)
    const topPlate = box(node, 6.46, 0.05, 4.46, 0, 1.2, 0, M.acrylic, 0.04)
    topPlate.renderOrder = 3
    topPlate.castShadow = false

    // 4 Corner Machine Screws & Brass Bushings Securing the Acrylic Lid
    for (const sx of [-3.05, 3.05]) {
      for (const sz of [-2.05, 2.05]) {
        cyl(node, 0.09, 0.06, sx, 1.2, sz, M.gold, undefined, 12)
        screw(node, sx, 1.23, sz)
      }
    }

    // Side vent grilles
    for (let i = 0; i < 9; i++) {
      const s1 = box(node, 0.03, 0.6, 0.07, 3.21, 0.65, -1.4 + i * 0.35, M.black, 0)
      s1.rotation.x = 0.5
      const s2 = box(node, 0.03, 0.6, 0.07, -3.21, 0.65, -1.4 + i * 0.35, M.black, 0)
      s2.rotation.x = 0.5
    }
    for (let i = 0; i < 6; i++) {
      box(node, 0.07, 0.55, 0.03, 1.9 + i * 0.22, 0.62, 2.215, M.black, 0)
    }

    // Front status LED and node badge
    const ledBar = box(node, 1.3, 0.07, 0.03, 0, 0.28, 2.215, M.neutralLed, 0.01)
    const nodePlaque = canvasTexture(768, 130, (c, w, h) => {
      c.fillStyle = '#151a20'
      c.fillRect(0, 0, w, h)
      print(c, 'Allevia Sim', 28, 62, 38, '#e6e8e6', 600)
      print(c, 'DETECTOR NODE 001', 28, 98, 20, '#8e98a2', 500)
    })
    screen(node, 3.0, 0.5, -1.7, 0.75, 2.215, nodePlaque)

    // Pickable objects map
    const pickables: THREE.Object3D[] = []
    const partWorldPositions = new Map<HardwarePartId, THREE.Vector3>()

    function registerPickable(root: THREE.Object3D, partId: HardwarePartId) {
      root.traverse((o) => {
        o.userData.part = partId
        pickables.push(o)
      })
    }

    // ==========================================
    // ARDUINO UNO MICROCONTROLLER (Internal Twin)
    // ==========================================
    const AX = -0.6
    const AY = 0.72
    const AZ = 0.15

    for (const sx of [-1.45, 1.45]) {
      for (const sz of [-1.0, 1.0]) {
        cyl(node, 0.1, 0.5, AX + sx, 0.45, AZ + sz, M.gold, undefined, 6)
        screw(node, AX + sx, AY + 0.05, AZ + sz)
      }
    }

    const ardu = new THREE.Group()
    ardu.position.set(AX, AY, AZ)
    node.add(ardu)
    box(ardu, 3.43, 0.07, 2.67, 0, 0, 0, M.pcb, 0.04)

    // High-Resolution Vector Silkscreen
    const silk = canvasTexture(1536, 1200, (c) => {
      c.clearRect(0, 0, 1536, 1200)
      const px = (x: number) => ((x + 1.7) / 3.4) * 1536
      const pz = (z: number) => ((z + 1.32) / 2.64) * 1200
      c.strokeStyle = 'rgba(255,255,255,.85)'
      c.lineWidth = 4
      c.strokeRect(16, 16, 1504, 1168)

      print(c, 'ARDUINO', px(0.55) - 120, pz(0.25) + 160, 68, '#ffffff', 700)
      print(c, 'UNO', px(0.55) + 110, pz(0.25) + 160, 56, '#ffffff', 600)
      print(c, 'DIGITAL (PWM~)', px(0.05), 130, 32, '#eaf2f8', 600)
      print(c, 'POWER', px(-0.55), 1070, 32, '#eaf2f8', 600)
      print(c, 'ANALOG IN', px(0.75), 1070, 32, '#eaf2f8', 600)

      const digPins = ['AREF', 'GND', '13', '12', '~11', '~10', '~9', '8', '7', '~6', '~5', '4', '~3', '2', 'TX>1', 'RX<0']
      digPins.forEach((lbl, idx) => {
        print(c, lbl, 280 + idx * 72, 70, 20, '#dbe7f2', 500, 'center')
      })

      const pwrPins = ['IOREF', 'RESET', '3.3V', '5V', 'GND', 'GND', 'VIN']
      pwrPins.forEach((lbl, idx) => {
        print(c, lbl, 400 + idx * 72, 1140, 20, '#dbe7f2', 500, 'center')
      })

      const anaPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']
      anaPins.forEach((lbl, idx) => {
        print(c, lbl, 980 + idx * 72, 1140, 20, '#dbe7f2', 500, 'center')
      })

      c.strokeStyle = 'rgba(255,255,255,0.7)'
      c.lineWidth = 3
      c.strokeRect(px(0.35) - 315, pz(0.08) - 90, 630, 180)
      print(c, 'ATMEGA328P-PU', px(0.35), pz(0.08) + 8, 24, '#ffffff', 600, 'center')
    })
    const silkPlane = screen(ardu, 3.4, 2.64, 0, 0.037, 0, silk, true)
    silkPlane.rotation.x = -Math.PI / 2

    // USB-B Connector (cleanly seated inside below the acrylic lid)
    box(ardu, 0.82, 0.44, 0.7, -1.55, 0.22, -0.55, M.chrome, 0.02)
    box(ardu, 0.6, 0.25, 0.05, -1.96, 0.22, -0.55, M.dark, 0.01)

    // DC Power Barrel Jack
    box(ardu, 0.7, 0.42, 0.6, -1.58, 0.21, 0.72, M.dark, 0.03)
    cyl(ardu, 0.06, 0.25, -1.88, 0.21, 0.72, M.chrome, undefined, 12)

    // ATmega328P DIP-28 Microcontroller IC Body & Lead Frame
    box(ardu, 1.4, 0.16, 0.4, 0.35, 0.12, 0.08, M.dark, 0.02)
    cyl(ardu, 0.05, 0.02, -0.32, 0.2, 0.08, M.body, undefined, 12) // Pin 1 Index Notch
    for (let i = 0; i < 14; i++) {
      for (const sz of [-1, 1]) {
        box(ardu, 0.05, 0.03, 0.09, -0.28 + i * 0.1, 0.05, 0.08 + sz * 0.23, M.chrome, 0)
      }
    }

    // 16 MHz Quartz Crystal Oscillator Can
    box(ardu, 0.38, 0.08, 0.18, -0.15, 0.08, -0.48, M.chrome, 0.03)

    // Tactile Reset Push Button with Red Plunger
    box(ardu, 0.32, 0.08, 0.32, -1.45, 0.08, -1.05, M.chrome, 0.02)
    cyl(ardu, 0.08, 0.06, -1.45, 0.14, -1.05, M.redLed, undefined, 16)

    // Active SMD Status LEDs
    cyl(ardu, 0.03, 0.03, -0.35, 0.05, 0.65, M.greenLed, undefined, 8) // ON
    cyl(ardu, 0.03, 0.03, -0.25, 0.05, -0.75, M.amberLed, undefined, 8) // L (Pin 13)
    cyl(ardu, 0.03, 0.03, -0.65, 0.05, -0.25, M.amberLed, undefined, 8) // TX
    cyl(ardu, 0.03, 0.03, -0.65, 0.05, -0.35, M.amberLed, undefined, 8) // RX

    // Voltage Regulator & Filter Capacitors
    box(ardu, 0.35, 0.09, 0.32, -1.05, 0.08, 0.58, M.dark, 0.01)
    box(ardu, 0.15, 0.03, 0.25, -0.85, 0.08, 0.58, M.chrome, 0)
    cyl(ardu, 0.14, 0.32, -0.9, 0.2, 0.95, M.chrome, undefined, 16)
    cyl(ardu, 0.12, 0.28, -0.55, 0.18, 0.95, M.chrome, undefined, 16)

    // ICSP 6-Pin Programming Header (2x3 gold pins)
    box(ardu, 0.28, 0.12, 0.42, 1.4, 0.1, 0.08, M.dark, 0.01)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        cyl(ardu, 0.02, 0.22, 1.33 + c * 0.14, 0.22, -0.06 + r * 0.14, M.gold, undefined, 6)
      }
    }

    // Female Header Sockets with Gold Pin Contacts
    const TIPY = AY + 0.36
    const PITCH = 0.14
    const hdrX0 = { dig1: -1.0, dig2: 0.55, pwr: -0.55, ana: 0.8 }
    const hdrN = { dig1: 10, dig2: 8, pwr: 8, ana: 6 }
    type Hdr = keyof typeof hdrX0
    for (const h of Object.keys(hdrX0) as Hdr[]) {
      const z = h === 'dig1' || h === 'dig2' ? -1.22 : 1.22
      const w = hdrN[h] * PITCH
      box(ardu, w, 0.2, 0.12, hdrX0[h] + w / 2, 0.135, z, M.dark, 0.01)
      for (let i = 0; i < hdrN[h]; i++) {
        box(ardu, 0.035, 0.16, 0.035, hdrX0[h] + (i + 0.5) * PITCH, 0.27, z, M.gold, 0)
      }
    }

    const pinPos = (h: Hdr, i: number): [number, number, number] => [
      AX + hdrX0[h] + (i + 0.5) * PITCH,
      TIPY,
      AZ + (h === 'dig1' || h === 'dig2' ? -1.22 : 1.22),
    ]

    registerPickable(ardu, 'arduino')
    partWorldPositions.set('arduino', new THREE.Vector3(AX, AY + 0.5, AZ))

    // ==========================================
    // JUMPER WIRES (Curved Flexible PVC Harness)
    // ==========================================
    const wiresGrp = new THREE.Group()
    node.add(wiresGrp)

    const wireMats = {
      vcc: mat(0xd63031, 0.1, 0.35),
      gnd: mat(0x2d3436, 0.1, 0.4),
      sig: mat(0x74b9ff, 0.1, 0.35),
    }

    let laneCounter = 0
    function jumper(a: [number, number, number], b: [number, number, number], m: THREE.Material) {
      const lane = (laneCounter++ % 7) - 3
      const A = new THREE.Vector3(...a)
      const B = new THREE.Vector3(...b)
      const p1 = A.clone().add(new THREE.Vector3(0, -0.4, 0))
      const p3 = B.clone().add(new THREE.Vector3(0, 0.5, 0))
      const mid = p1.clone().lerp(p3, 0.5)
      mid.y += 0.1 + lane * 0.035
      mid.x += lane * 0.05
      mid.z += lane * 0.07
      const curve = new THREE.CatmullRomCurve3([A, p1, mid, p3, B], false, 'centripetal')
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.028, 8, false), m)
      mesh.castShadow = true
      wiresGrp.add(mesh)
      box(wiresGrp, 0.11, 0.18, 0.11, A.x, A.y + 0.04, A.z, M.dark, 0.015)
      box(wiresGrp, 0.11, 0.18, 0.11, B.x, B.y, B.z, M.dark, 0.015)
    }

    // ==========================================
    // HIGH-PRECISION SENSOR BREAKOUT SUITE
    // ==========================================
    type SensorDef = {
      id: HardwarePartId
      kind: 'bme' | 'ir' | 'mq'
      pos: [number, number, number]
      cap?: 'steel' | 'orange'
      pins: Array<['vcc' | 'gnd' | 'sig', Hdr, number]>
    }

    const sensorDefs: SensorDef[] = [
      {
        id: 'bme280',
        kind: 'bme',
        pos: [-2.4, 1.85, 1.1],
        pins: [
          ['vcc', 'pwr', 3],
          ['gnd', 'pwr', 5],
          ['sig', 'ana', 4],
          ['sig', 'ana', 5],
        ],
      },
      {
        id: 'ir',
        kind: 'ir',
        pos: [-1.4, 2.05, -1.1],
        pins: [
          ['vcc', 'pwr', 4],
          ['gnd', 'pwr', 6],
          ['sig', 'dig2', 5],
        ],
      },
      {
        id: 'mq2',
        kind: 'mq',
        cap: 'steel',
        pos: [-0.3, 2.25, 1.2],
        pins: [
          ['vcc', 'pwr', 4],
          ['gnd', 'pwr', 5],
          ['sig', 'ana', 0],
        ],
      },
      {
        id: 'mq7',
        kind: 'mq',
        cap: 'orange',
        pos: [0.85, 2.1, -1.0],
        pins: [
          ['vcc', 'pwr', 4],
          ['gnd', 'pwr', 6],
          ['sig', 'ana', 1],
        ],
      },
      {
        id: 'mq135',
        kind: 'mq',
        cap: 'steel',
        pos: [2.0, 2.2, -0.7],
        pins: [
          ['vcc', 'pwr', 4],
          ['gnd', 'pwr', 5],
          ['sig', 'ana', 2],
        ],
      },
    ]

    sensorDefs.forEach((def) => {
      const g = new THREE.Group()
      g.position.set(...def.pos)
      node.add(g)

      const bme = def.kind === 'bme'
      const w = bme ? 0.85 : 1.05
      const d = bme ? 0.75 : 0.9
      box(g, w, 0.07, d, 0, 0, 0, bme ? M.purple : M.sensorBlue, 0.03)

      const n = def.pins.length
      const xs = n === 4 ? [-0.3, -0.1, 0.1, 0.3] : [-0.2, 0, 0.2]
      box(g, n * 0.2, 0.1, 0.12, 0, -0.07, 0.36, M.dark, 0.01)
      xs.forEach((x) => cyl(g, 0.022, 0.3, x, -0.22, 0.36, M.gold, undefined, 8))

      if (def.kind === 'mq') {
        const capMat = def.cap === 'orange' ? M.orange : M.chrome
        cyl(g, 0.42, 0.08, 0, 0.07, -0.02, M.copper, undefined, 28)
        cyl(g, 0.37, 0.44, 0, 0.31, -0.02, capMat, undefined, 28)
        const topMat = new THREE.MeshStandardMaterial({
          color: 0xc4cbd2,
          metalness: 0.95,
          roughness: 0.25,
          map: meshTex,
        })
        cyl(g, 0.32, 0.02, 0, 0.54, -0.02, topMat, undefined, 28)
        cyl(g, 0.08, 0.04, 0, 0.25, -0.02, M.orange, undefined, 12) // internal sensor coil
      } else if (def.kind === 'ir') {
        // High-Precision IR Receiver (Photodiode)
        cyl(g, 0.115, 0.35, 0.2, 0.22, -0.1, M.black, undefined, 24)
        ball(g, 0.115, 0.2, 0.4, -0.1, M.dark)

        // Optical IR Transmitter LED (Water-Clear Glass Dome)
        cyl(g, 0.115, 0.35, -0.2, 0.22, -0.1, M.clearGlass, undefined, 24)
        ball(g, 0.115, -0.2, 0.4, -0.1, M.clearGlass)

        // Blue 10k Sensitivity Trim Potentiometer with Brass Tuning Screw
        box(g, 0.28, 0.2, 0.26, 0, 0.12, 0.12, M.sensorBlue, 0.02)
        cyl(g, 0.06, 0.03, 0, 0.23, 0.12, M.gold, undefined, 12)

        // Power & Digital Signal Indicator LEDs
        cyl(g, 0.025, 0.02, -0.15, 0.045, 0.18, M.greenLed, undefined, 8)
        cyl(g, 0.025, 0.02, 0.15, 0.045, 0.18, M.redLed, undefined, 8)
      } else {
        // BME280 Laser-Stamped Brushed Metal Can
        box(g, 0.28, 0.09, 0.28, 0, 0.085, -0.02, M.chrome, 0.012)
        cyl(g, 0.02, 0.01, 0.05, 0.135, -0.05, M.dark, undefined, 8) // barometric port
        box(g, 0.08, 0.04, 0.06, -0.2, 0.055, 0.12, M.dark, 0)
        box(g, 0.08, 0.04, 0.06, 0.2, 0.055, 0.12, M.dark, 0)
      }

      // Wiring from Sensor Pin Stems to Arduino Uno Headers
      def.pins.forEach(([role, hdr, idx], i) => {
        const a: [number, number, number] = [def.pos[0] + xs[i], def.pos[1] - 0.46, def.pos[2] + 0.36]
        const t = pinPos(hdr, idx)
        const b: [number, number, number] = [t[0], t[1] + 0.1, t[2]]
        jumper(a, b, wireMats[role])
      })

      registerPickable(g, def.id)
      partWorldPositions.set(def.id, new THREE.Vector3(...def.pos))
    })

    // Circular Soft Glow Orb Sprite Texture
    const orbTex = canvasTexture(64, 64, (c, w, h) => {
      const grad = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2 - 2)
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)')
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      c.fillStyle = grad
      c.fillRect(0, 0, w, h)
    }).texture

    // 1. Main Atmospheric & Gas Orbs (color depends on gas; density depends on AQI)
    const maxGasCount = 450
    const gasGeo = new THREE.BufferGeometry()
    const gasPositions = new Float32Array(maxGasCount * 3)
    const gasSpeeds = new Float32Array(maxGasCount)

    for (let i = 0; i < maxGasCount; i++) {
      gasPositions[i * 3] = (Math.random() - 0.5) * 6.0
      gasPositions[i * 3 + 1] = 1.25 + Math.random() * 2.2
      gasPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0
      gasSpeeds[i] = 0.5 + Math.random() * 0.8
    }

    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPositions, 3))
    const gasMat = new THREE.PointsMaterial({
      map: orbTex,
      size: 0.085,
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
    const gasPoints = new THREE.Points(gasGeo, gasMat)
    scene.add(gasPoints)

    // 2. Thermal Temperature Particles (soft red, low density based on temperature)
    const maxTempCount = 50
    const tempGeo = new THREE.BufferGeometry()
    const tempPositions = new Float32Array(maxTempCount * 3)
    const tempSpeeds = new Float32Array(maxTempCount)

    for (let i = 0; i < maxTempCount; i++) {
      tempPositions[i * 3] = (Math.random() - 0.5) * 5.6
      tempPositions[i * 3 + 1] = 1.25 + Math.random() * 2.2
      tempPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.6
      tempSpeeds[i] = 0.6 + Math.random() * 0.8
    }

    tempGeo.setAttribute('position', new THREE.BufferAttribute(tempPositions, 3))
    const tempMat = new THREE.PointsMaterial({
      map: orbTex,
      size: 0.065,
      color: 0xef4444,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
    const tempPoints = new THREE.Points(tempGeo, tempMat)
    scene.add(tempPoints)

    // 3. Moisture Humidity Particles (soft blue, low density based on humidity)
    const maxHumCount = 50
    const humGeo = new THREE.BufferGeometry()
    const humPositions = new Float32Array(maxHumCount * 3)
    const humSpeeds = new Float32Array(maxHumCount)

    for (let i = 0; i < maxHumCount; i++) {
      humPositions[i * 3] = (Math.random() - 0.5) * 5.6
      humPositions[i * 3 + 1] = 1.25 + Math.random() * 2.2
      humPositions[i * 3 + 2] = (Math.random() - 0.5) * 3.6
      humSpeeds[i] = 0.5 + Math.random() * 0.7
    }

    humGeo.setAttribute('position', new THREE.BufferAttribute(humPositions, 3))
    const humMat = new THREE.PointsMaterial({
      map: orbTex,
      size: 0.06,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
    const humPoints = new THREE.Points(humGeo, humMat)
    scene.add(humPoints)

    cleanups.push(() => {
      gasGeo.dispose()
      gasMat.dispose()
      tempGeo.dispose()
      tempMat.dispose()
      humGeo.dispose()
      humMat.dispose()
    })

    // Raycasting for Tap-to-Inspect
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let isDragging = false
    let downX = 0
    let downY = 0

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = false
      downX = e.clientX
      downY = e.clientY
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) {
        isDragging = true
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) return

      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(pickables, true)

      if (hits.length > 0) {
        let partId: HardwarePartId | null = null
        for (const hit of hits) {
          if (hit.object.userData.part) {
            partId = hit.object.userData.part as HardwarePartId
            break
          }
        }

        if (partId) {
          setSelectedPart((prev) => (prev === partId ? null : partId))
          return
        }
      }

      // Tap on empty space closes inspection
      setSelectedPart(null)
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerup', handlePointerUp)

    cleanups.push(() => {
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerup', handlePointerUp)
    })

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return
      const { width, height } = entries[0].contentRect
      if (width === 0 || height === 0) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    })

    resizeObserver.observe(container)
    cleanups.push(() => resizeObserver.disconnect())

    // Animation render loop
    let animId = 0
    let clock = 0

    const targetLookAt = new THREE.Vector3().copy(defaultTarget)
    const targetCamPos = new THREE.Vector3().copy(defaultPosition)

    const animate = () => {
      animId = requestAnimationFrame(animate)
      clock += 0.016

      const {
        isRunning,
        temperature: currentTemp,
        humidity: currentHumidity,
        airQuality: currentAqi,
        gases: currentGases,
        focusedPart,
      } = animStateRef.current

      // 1. Gas / AQI Orbs Density & Color
      // Density: scales with AQI (40 particles for clean AQI up to 450 particles for bad AQI)
      const clampedAqi = Math.min(500, Math.max(0, currentAqi ?? 45))
      const targetGasCount = Math.round(40 + (clampedAqi / 500) * 410)
      gasGeo.setDrawRange(0, targetGasCount)

      // Color mapping:
      // - CO: light green
      // - Smoke: black / dark grey
      // - LPG: yellow
      // - None: white / light grey
      const gasList = currentGases ?? []
      if (gasList.includes('smoke')) {
        gasMat.color.lerp(new THREE.Color(0x2d3748), 0.12) // dark grey / black
        gasMat.opacity = THREE.MathUtils.lerp(gasMat.opacity, 0.35 + (clampedAqi / 500) * 0.45, 0.1)
      } else if (gasList.includes('co')) {
        gasMat.color.lerp(new THREE.Color(0x68d391), 0.12) // light green
        gasMat.opacity = THREE.MathUtils.lerp(gasMat.opacity, 0.3 + (clampedAqi / 500) * 0.4, 0.1)
      } else if (gasList.includes('lpg')) {
        gasMat.color.lerp(new THREE.Color(0xfacc15), 0.12) // yellow
        gasMat.opacity = THREE.MathUtils.lerp(gasMat.opacity, 0.3 + (clampedAqi / 500) * 0.4, 0.1)
      } else {
        gasMat.color.lerp(new THREE.Color(0xe2e8f0), 0.12) // white / light grey
        gasMat.opacity = THREE.MathUtils.lerp(gasMat.opacity, 0.25 + (clampedAqi / 500) * 0.35, 0.1)
      }

      // Animate Gas particle positions
      const gasPos = gasGeo.attributes.position.array as Float32Array
      const gasSpeedMul = isRunning ? 1.0 + (currentTemp - 20) * 0.03 : 0.25
      for (let i = 0; i < targetGasCount; i++) {
        gasPos[i * 3 + 2] += 0.007 * gasSpeeds[i] * gasSpeedMul
        if (gasPos[i * 3 + 2] > 2.5) {
          gasPos[i * 3 + 2] = -2.5
          gasPos[i * 3] = (Math.random() - 0.5) * 6.0
        }
      }
      gasGeo.attributes.position.needsUpdate = true

      // 2. Temperature Particles (Red, low density based on temperature value)
      const clampedTemp = Math.min(60, Math.max(0, currentTemp ?? 28))
      const targetTempCount = Math.round(6 + (clampedTemp / 60) * 36) // 6 to 42 particles (low density)
      tempGeo.setDrawRange(0, targetTempCount)
      const tempPos = tempGeo.attributes.position.array as Float32Array
      const tempSpeedMul = isRunning ? 1.2 : 0.35
      for (let i = 0; i < targetTempCount; i++) {
        tempPos[i * 3 + 1] += 0.008 * tempSpeeds[i] * tempSpeedMul // thermal convection upward
        if (tempPos[i * 3 + 1] > 3.6) {
          tempPos[i * 3 + 1] = 1.25
          tempPos[i * 3] = (Math.random() - 0.5) * 5.6
          tempPos[i * 3 + 2] = (Math.random() - 0.5) * 3.6
        }
      }
      tempGeo.attributes.position.needsUpdate = true

      // 3. Humidity Particles (Blue, low density based on humidity value)
      const clampedHum = Math.min(100, Math.max(0, currentHumidity ?? 50))
      const targetHumCount = Math.round(6 + (clampedHum / 100) * 36) // 6 to 42 particles (low density)
      humGeo.setDrawRange(0, targetHumCount)
      const humPos = humGeo.attributes.position.array as Float32Array
      const humSpeedMul = isRunning ? 1.0 : 0.3
      for (let i = 0; i < targetHumCount; i++) {
        humPos[i * 3 + 2] += 0.006 * humSpeeds[i] * humSpeedMul
        humPos[i * 3 + 1] += Math.sin(clock * 2 + i) * 0.002
        if (humPos[i * 3 + 2] > 2.5) {
          humPos[i * 3 + 2] = -2.5
          humPos[i * 3] = (Math.random() - 0.5) * 5.6
        }
      }
      humGeo.attributes.position.needsUpdate = true

      // Smooth camera easing when a part is inspected
      if (focusedPart && partWorldPositions.has(focusedPart)) {
        const pos = partWorldPositions.get(focusedPart)!
        targetLookAt.lerp(pos, 0.05)
        const offset = new THREE.Vector3(0, 2.6, 4.4)
        targetCamPos.lerp(pos.clone().add(offset), 0.05)
      } else {
        targetLookAt.lerp(defaultTarget, 0.05)
        targetCamPos.lerp(defaultPosition, 0.05)
      }

      // Subtle neutral LED pulse while running
      if (ledBar) {
        const ledMat = ledBar.material as THREE.MeshStandardMaterial
        if (isRunning) {
          const pulse = (Math.sin(clock * 4) + 1) * 0.5
          ledMat.emissiveIntensity = 0.8 + pulse * 1.0
        } else {
          ledMat.emissiveIntensity = 0.4
        }
      }

      controls.update()
      renderer.render(scene, camera)
    }

    resetCameraRef.current = () => {
      setSelectedPart(null)
      targetLookAt.copy(defaultTarget)
      targetCamPos.copy(defaultPosition)
      camera.position.copy(defaultPosition)
      controls.target.copy(defaultTarget)
      controls.update()
    }

    animate()
    cleanups.push(() => cancelAnimationFrame(animId))

    return () => {
      for (const fn of cleanups.reverse()) fn()
    }
  }, [])

  if (!webGlSupported) {
    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)]">
        <div className="flex-1 w-full h-full flex items-center justify-center text-[13px] text-[var(--secondary)]">
          3D view is not supported on this device
        </div>
        <div className="absolute bottom-2.5 inset-x-0 px-3 flex items-center justify-between pointer-events-none">
          <div className="text-[11px] text-[var(--muted)] pl-1 select-none">
            Drag to spin · Scroll to zoom · Tap parts to inspect
          </div>
          <button
            type="button"
            onClick={() => resetCameraRef.current()}
            className="pointer-events-auto px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--secondary)] hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)]/90 hover:bg-[var(--surface)] backdrop-blur-md shadow-xs transition active:scale-[0.98] cursor-pointer"
          >
            Reset View
          </button>
        </div>
      </div>
    )
  }

  const partInfo = selectedPart ? PART_DESCRIPTIONS[selectedPart] : null

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] transition-colors">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Tap-to-Inspect Tooltip Card (Bottom-Left) */}
      {partInfo && (
        <div className="absolute bottom-11 left-3.5 z-20 max-w-[260px] p-3 rounded-[12px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-[var(--shadow-panel)] text-[12px] space-y-1 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-medium text-[var(--foreground)]">
            <span>{partInfo.name}</span>
            <button
              type="button"
              onClick={() => setSelectedPart(null)}
              className="px-1.5 py-0.5 rounded text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-[var(--secondary)] text-[11px] leading-snug">{partInfo.desc}</p>
        </div>
      )}

      {/* Bottom Controls Bar: Interaction Caption + Reset View Button */}
      <div className="absolute bottom-2.5 inset-x-0 px-3 flex items-center justify-between pointer-events-none">
        <div className="text-[11px] text-[var(--muted)] pl-1 select-none">
          Drag to spin · Scroll to zoom · Tap parts to inspect
        </div>
        <button
          type="button"
          onClick={() => resetCameraRef.current()}
          className="pointer-events-auto px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--secondary)] hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)]/90 hover:bg-[var(--surface)] backdrop-blur-md shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          Reset View
        </button>
      </div>
    </div>
  )
}
