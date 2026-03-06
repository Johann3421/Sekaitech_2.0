'use client'

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Float, ContactShadows, Html } from "@react-three/drei"
import { Suspense, useRef, useState } from "react"
import * as THREE from "three"

function ProductPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.05, 1.2]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

function LoadingIndicator() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-ink-secondary font-mono text-sm">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando modelo 3D...
      </div>
    </Html>
  )
}

interface ProductViewer3DProps {
  model3dUrl?: string | null
  productName?: string
}

export function ProductViewer3D({ productName }: ProductViewer3DProps) {
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="relative w-full aspect-square bg-void-900 rounded-2xl border border-void-500 overflow-hidden">
      <Canvas
        camera={{ position: [0, 1, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <ambientLight intensity={0.3} />
          <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#06b6d4" />
          <spotLight position={[-5, 3, -5]} angle={0.3} penumbra={1} intensity={1} color="#8b5cf6" />
          <Environment preset="night" />
          <ProductPlaceholder />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.5} blur={2} color="#06b6d4" />
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-tertiary">
          {productName ?? "Vista 3D"}
        </span>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="font-mono text-xs px-2 py-1 rounded bg-void-800 border border-void-500 text-ink-secondary hover:text-ink-primary transition-colors"
        >
          {autoRotate ? "⏸ Pausar" : "▶ Rotar"}
        </button>
      </div>
    </div>
  )
}
