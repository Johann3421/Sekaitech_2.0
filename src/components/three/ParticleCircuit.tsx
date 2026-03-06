'use client'

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sparkles } from "@react-three/drei"
import * as THREE from "three"
import { Suspense } from "react"

function Particles() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
  })

  return (
    <group ref={groupRef}>
      <Sparkles
        count={200}
        scale={[20, 10, 20]}
        size={0.8}
        speed={0.2}
        color="#06b6d4"
        opacity={0.3}
      />
      <Sparkles
        count={100}
        scale={[15, 8, 15]}
        size={0.5}
        speed={0.15}
        color="#8b5cf6"
        opacity={0.2}
      />
    </group>
  )
}

export function ParticleCircuit({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  )
}
