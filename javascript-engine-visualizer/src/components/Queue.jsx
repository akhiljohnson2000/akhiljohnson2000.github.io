/**
 * Queue - Horizontal conveyor belt. Used for both Callback (yellow) and Microtask (green) queues.
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Queue({ type = 'macro', items = [], tooltipRef }) {
  const beltRef = useRef()
  const isMicro = type === 'micro'
  const color = isMicro ? '#22c55e' : '#eab308'
  const label = isMicro ? 'Microtask Queue' : 'Callback Queue'
  const tip = isMicro
    ? 'Microtask Queue: Promises and queueMicrotask callbacks. Drained after each task before rendering.'
    : 'Callback Queue: setTimeout/setInterval and I/O callbacks. One callback per event loop turn.'

  useFrame((state) => {
    if (!beltRef.current) return
    const speed = isMicro ? 0.15 : 0.08
    beltRef.current.rotation.x = state.clock.elapsedTime * speed
  })

  return (
    <group position={[2.2, isMicro ? 0.8 : -0.5, 0]}>
      <group
        ref={beltRef}
        onPointerOver={() => tooltipRef?.current?.(tip)}
        onPointerOut={() => tooltipRef?.current?.(null)}
      >
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </group>
      {items.map((_, i) => (
        <mesh key={i} position={[0.2 + i * 0.25, 0, 0.55]}>
          <boxGeometry args={[0.2, 0.12, 0.08]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <group position={[0, isMicro ? -0.35 : 0.35, 0.6]}>
        <mesh>
          <planeGeometry args={[1, 0.18]} />
          <meshBasicMaterial color={color} opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default Queue
