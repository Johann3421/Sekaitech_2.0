'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Torus, Sparkles, Environment } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function CPUChip() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.0}>
      <group ref={groupRef}>
        {/* Main chip body */}
        <mesh castShadow>
          <boxGeometry args={[2, 0.2, 2]} />
          <meshStandardMaterial color="#0a1628" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Circuit traces */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`trace-${i}`} position={[-0.9 + i * 0.26, 0.11, 0]}>
            <boxGeometry args={[0.02, 0.02, 1.8]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={3.0}
            />
          </mesh>
        ))}
        {/* Chip pins */}
        {Array.from({ length: 6 }).map((_, i) =>
          Array.from({ length: 6 }).map((_, j) => (
            <mesh key={`pin-${i}-${j}`} position={[-0.6 + i * 0.24, -0.25, -0.6 + j * 0.24]}>
              <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
          ))
        )}
        {/* Energy ring */}
        <Torus args={[1.4, 0.04, 16, 80]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={4.0}
          />
        </Torus>
        {/* Data particles */}
        <Sparkles
          count={60}
          scale={[4, 3, 4]}
          size={1.5}
          speed={0.8}
          color="#06b6d4"
          opacity={0.8}
        />
      </group>
    </Float>
  )
}

function CircuitParticles() {
  return (
    <Sparkles
      count={120}
      scale={[12, 8, 12]}
      size={1}
      speed={0.3}
      color="#0f1f38"
      opacity={0.4}
    />
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} color="#06b6d4" intensity={4} />
        <pointLight position={[-3, 1, -2]} color="#8b5cf6" intensity={3} />
        <pointLight position={[0, -3, 2]} color="#22c55e" intensity={1.5} />
        <Environment preset="night" />
        <CPUChip />
        <CircuitParticles />
      </Suspense>
    </Canvas>
  )
}
