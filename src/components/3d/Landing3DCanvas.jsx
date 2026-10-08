import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Creates a circular soft radial glow texture for Three.js particles
 */
function createParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(40, 224, 176, 0.85)')
  gradient.addColorStop(0.5, 'rgba(74, 127, 232, 0.4)')
  gradient.addColorStop(1, 'rgba(11, 14, 20, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function Landing3DCanvas({ isWarping = false, onReady = null }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let animationFrameId
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.045)

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
    camera.position.set(0, 0.5, 10.5)

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x101b33, 1.6)
    scene.add(ambientLight)

    const cyanLight = new THREE.PointLight(0x28e0b0, 4.5, 20)
    cyanLight.position.set(4, 3, 5)
    scene.add(cyanLight)

    const blueLight = new THREE.PointLight(0x4a7fe8, 4.0, 20)
    blueLight.position.set(-4, -2, 4)
    scene.add(blueLight)

    const purpleLight = new THREE.PointLight(0x9d4edd, 2.5, 15)
    purpleLight.position.set(0, 4, -2)
    scene.add(purpleLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(2, 6, 8)
    scene.add(dirLight)

    // 5. Central 3D Nexus Holographic Core Group
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // A. Outer Geometric Crystal (Faceted Icosahedron Prism)
    const crystalGeo = new THREE.IcosahedronGeometry(1.65, 0)
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x121b2d,
      emissive: 0x142838,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.85,
      transmission: 0.6,
      thickness: 1.2,
      transparent: true,
      opacity: 0.72,
      reflectivity: 0.9,
    })
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat)
    coreGroup.add(crystalMesh)

    // Crisp glowing wireframe edge overlay
    const edgesGeo = new THREE.EdgesGeometry(crystalGeo)
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x28e0b0,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    })
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat)
    crystalMesh.add(wireframe)

    // B. Inner Pulsing Core (Octahedron)
    const innerGeo = new THREE.OctahedronGeometry(0.9, 0)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x28e0b0,
      emissive: 0x28e0b0,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.5,
      wireframe: true,
    })
    const innerCore = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerCore)

    // C. Glowing Center Energy Sphere
    const sphereGeo = new THREE.SphereGeometry(0.38, 24, 24)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
    const energySphere = new THREE.Mesh(sphereGeo, sphereMat)
    coreGroup.add(energySphere)

    // D. Dual Gimbal Orbital Torus Rings
    const ringMatCyan = new THREE.MeshBasicMaterial({
      color: 0x28e0b0,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
    const ringMatBlue = new THREE.MeshBasicMaterial({
      color: 0x4a7fe8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })

    const ring1Geo = new THREE.TorusGeometry(2.5, 0.02, 16, 90)
    const ring1 = new THREE.Mesh(ring1Geo, ringMatCyan)
    ring1.rotation.x = Math.PI / 3
    coreGroup.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(3.1, 0.018, 16, 90)
    const ring2 = new THREE.Mesh(ring2Geo, ringMatBlue)
    ring2.rotation.y = Math.PI / 4
    ring2.rotation.x = -Math.PI / 6
    coreGroup.add(ring2)

    // E. Orbiting Satellite Data Nodes
    const satelliteGroup = new THREE.Group()
    coreGroup.add(satelliteGroup)

    const satellites = []
    const satCount = 6
    const satGeo = new THREE.SphereGeometry(0.08, 12, 12)
    const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff })

    for (let i = 0; i < satCount; i++) {
      const satMesh = new THREE.Mesh(satGeo, satMat)
      satelliteGroup.add(satMesh)
      satellites.push({
        mesh: satMesh,
        angle: (i / satCount) * Math.PI * 2,
        radius: 2.5 + (i % 2) * 0.6,
        speed: 0.015 * (i % 2 === 0 ? 1 : -1.2),
        elevation: (i % 3 - 1) * 0.6,
      })
    }

    // 6. 3D Cyberspace Ground Grid Plane
    const gridHelper = new THREE.GridHelper(36, 42, 0x28e0b0, 0x1a2638)
    gridHelper.position.y = -3.2
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.45
    scene.add(gridHelper)

    // 7. Dynamic 3D Particle Constellation / Starfield
    const particleCount = 1400
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    const colorPalette = [
      new THREE.Color(0x28e0b0), // Mint cyan
      new THREE.Color(0x4a7fe8), // Electric blue
      new THREE.Color(0xffffff), // Bright white
      new THREE.Color(0x7000ff), // Vivid violet
      new THREE.Color(0x8892a6), // Slate
    ]

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical & Spherical cosmic distribution
      const theta = Math.random() * Math.PI * 2
      const radius = 2.0 + Math.random() * 16.0
      const y = (Math.random() - 0.5) * 14.0
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius - 2.0

      particlePositions[i * 3] = x
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = z

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      particleColors[i * 3] = col.r
      particleColors[i * 3 + 1] = col.g
      particleColors[i * 3 + 2] = col.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleTexture = createParticleTexture()
    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particlePoints = new THREE.Points(particleGeo, particleMat)
    scene.add(particlePoints)

    // 8. Interactive Mouse / Pointer Parallax State
    let mouseX = 0
    let mouseY = 0
    let targetCameraX = 0
    let targetCameraY = 0.5

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      mouseX = (clientX / window.innerWidth) * 2 - 1
      mouseY = -(clientY / window.innerHeight) * 2 + 1
      targetCameraX = mouseX * 1.8
      targetCameraY = 0.5 + mouseY * 1.2
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true })

    // 9. Resize Handling
    const handleResize = () => {
      if (!mountRef.current) return
      const w = mountRef.current.clientWidth || window.innerWidth
      const h = mountRef.current.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', handleResize)

    if (onReady) onReady()

    // 10. Smooth Render Loop
    let clock = new THREE.Clock()
    let initialZoomProgress = 0

    const render = () => {
      animationFrameId = requestAnimationFrame(render)
      const elapsedTime = clock.getElapsedTime()

      // Smooth initial camera swoop from distance into framing
      if (initialZoomProgress < 1) {
        initialZoomProgress += 0.016
        camera.position.z = THREE.MathUtils.lerp(14.0, 7.8, Math.min(1, initialZoomProgress))
      }

      // Parallax smooth interpolation
      camera.position.x += (targetCameraX - camera.position.x) * 0.04
      camera.position.y += (targetCameraY - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      // Core rotation dynamics
      crystalMesh.rotation.x = elapsedTime * 0.28
      crystalMesh.rotation.y = elapsedTime * 0.38
      innerCore.rotation.x = -elapsedTime * 0.45
      innerCore.rotation.z = elapsedTime * 0.52

      // Core breathing pulse
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.06
      innerCore.scale.set(pulse, pulse, pulse)
      energySphere.scale.set(1 + Math.sin(elapsedTime * 6) * 0.15, 1 + Math.sin(elapsedTime * 6) * 0.15, 1 + Math.sin(elapsedTime * 6) * 0.15)

      // Orbital gimbal rings rotation
      ring1.rotation.z = elapsedTime * 0.22
      ring2.rotation.z = -elapsedTime * 0.18
      ring2.rotation.x = -Math.PI / 6 + Math.sin(elapsedTime * 0.5) * 0.15

      // Orbiting satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius
        sat.mesh.position.y = Math.sin(sat.angle * 2) * sat.elevation
      })

      // Lights orbiting core
      cyanLight.position.x = Math.cos(elapsedTime * 0.8) * 4.5
      cyanLight.position.z = Math.sin(elapsedTime * 0.8) * 4.5
      blueLight.position.x = -Math.cos(elapsedTime * 0.7) * 4.5
      blueLight.position.z = -Math.sin(elapsedTime * 0.7) * 4.5

      // Particle constellation drift & rotation
      particlePoints.rotation.y = elapsedTime * 0.025
      particlePoints.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05

      // Ground grid breathing wave
      gridHelper.position.z = (elapsedTime * 0.8) % 1.2

      // Warp speed hyperdrive effect when transitioning to login
      if (mountRef.current?.dataset?.warping === 'true') {
        camera.position.z -= 0.35
        camera.fov = Math.min(105, camera.fov + 0.9)
        camera.updateProjectionMatrix()
        crystalMesh.rotation.y += 0.08
        innerCore.rotation.x += 0.12
        particleMat.size = Math.min(0.4, particleMat.size + 0.01)
      }

      renderer.render(scene, camera)
    }

    render()

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      // Memory disposal
      crystalGeo.dispose()
      crystalMat.dispose()
      edgesGeo.dispose()
      edgesMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      sphereGeo.dispose()
      sphereMat.dispose()
      ring1Geo.dispose()
      ring2Geo.dispose()
      ringMatCyan.dispose()
      ringMatBlue.dispose()
      satGeo.dispose()
      satMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      data-warping={isWarping ? 'true' : 'false'}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    />
  )
}
