'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { Torus } from "@react-three/drei"
import { useRef, Suspense } from "react"
import * as THREE from "three"

function Ring() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.5
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
  })

  return (
    <Torus ref={ref} args={[1.5, 0.05, 16, 100]}>
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </Torus>
  )
}

function InnerRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.7
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.3
  })

  return (
    <Torus ref={ref} args={[1.0, 0.03, 16, 80]}>
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={1.5}
        transparent
        opacity={0.6}
      />
    </Torus>
  )
}

export function HologramRing({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[2, 2, 2]} color="#06b6d4" intensity={2} />
          <Ring />
          <InnerRing />
        </Suspense>
      </Canvas>
    </div>
  )
}
