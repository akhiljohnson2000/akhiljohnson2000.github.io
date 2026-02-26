/**
 * Heap - Floating memory cloud with small glowing spheres.
 * Purple theme. Represents dynamically allocated objects.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PURPLE = '#a855f7'
const PURPLE_LIGHT = '#c084fc'

const COUNT = 12

export function Heap({ tooltipRef }) {
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < COUNT; i++) {
      pos.push([
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.5) * 0.8,
      ])
    }
    return pos
  }, [])
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15
    groupRef.current.children.forEach((c, i) => {
      if (c.position) c.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002
    })
  })

  return (
    <group ref={groupRef} position={[0, 1.2, 0]}>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onPointerOver={() => tooltipRef?.current?.('Heap: Unstructured memory where objects, closures, and large data live. Garbage collected.')}
          onPointerOut={() => tooltipRef?.current?.(null)}
        >
          <sphereGeometry args={[0.08 + Math.random() * 0.04, 12, 12]} />
          <meshStandardMaterial
            color={PURPLE}
            emissive={PURPLE_LIGHT}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      <group position={[0, -0.7, 0.5]}>
        <mesh>
          <planeGeometry args={[0.9, 0.2]} />
          <meshBasicMaterial color={PURPLE} opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default Heap
