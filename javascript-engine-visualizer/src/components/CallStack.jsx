/**
 * CallStack - Vertical transparent cylinder where execution context blocks stack.
 * Blue theme. Blocks animate in/out based on EngineController steps.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLUE = '#3b82f6'
const BLUE_LIGHT = '#60a5fa'

export function CallStack({ blocks = [], active, tooltipRef }) {
  const groupRef = useRef()
  const cylinderRef = useRef()

  const cylinderGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 32)
    g.translate(0, 0.9, 0)
    return g
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
  })

  return (
    <group ref={groupRef} position={[-2.5, 0, 0]}>
      <mesh
        ref={cylinderRef}
        geometry={cylinderGeometry}
        onPointerOver={() => tooltipRef?.current?.('Call Stack: Where the current execution context runs. Functions stack on top of each other (LIFO).')}
        onPointerOut={() => tooltipRef?.current?.(null)}
      >
        <meshPhysicalMaterial
          color={BLUE}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <mesh geometry={cylinderGeometry}>
        <meshBasicMaterial
          color={BLUE_LIGHT}
          transparent
          opacity={0.25}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Stacked blocks */}
      {blocks.map((label, i) => (
        <mesh
          key={`${label}-${i}`}
          position={[0, 0.3 + i * 0.35, 0]}
          onPointerOver={() => tooltipRef?.current?.(`Execution context: ${label}`)}
          onPointerOut={() => tooltipRef?.current?.(null)}
        >
          <boxGeometry args={[0.7, 0.25, 0.4]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Label */}
      <group position={[0, -1.1, 0.6]}>
        <mesh>
          <planeGeometry args={[1.2, 0.25]} />
          <meshBasicMaterial color={BLUE} opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default CallStack
