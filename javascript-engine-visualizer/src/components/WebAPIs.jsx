/**
 * WebAPIs - Rotating mechanical gear system (orange).
 * Represents browser APIs like setTimeout, setInterval, fetch.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ORANGE = '#f97316'
const ORANGE_LIGHT = '#fb923c'

export function WebAPIs({ items = [], tooltipRef }) {
  const groupRef = useRef()
  const gear1Ref = useRef()
  const gear2Ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (gear1Ref.current) gear1Ref.current.rotation.z = t * 0.4
    if (gear2Ref.current) gear2Ref.current.rotation.z = -t * 0.4
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.03
  })

  const gearGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    const teeth = 12
    const outer = 0.35
    const inner = 0.28
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? outer : inner
      const a = (i / (teeth * 2)) * Math.PI * 2
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false })
    return g
  }, [])

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      <mesh
        ref={gear1Ref}
        position={[-0.2, 0, 0]}
        onPointerOver={() => tooltipRef?.current?.('Web APIs: Browser provides setTimeout, fetch, DOM events. They run outside the JS thread and push callbacks to queues when done.')}
        onPointerOut={() => tooltipRef?.current?.(null)}
      >
        <primitive object={gearGeometry} attach="geometry" />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={gear2Ref} position={[0.2, 0, 0]}>
        <primitive object={gearGeometry} attach="geometry" />
        <meshStandardMaterial color={ORANGE_LIGHT} emissive={ORANGE} emissiveIntensity={0.15} />
      </mesh>
      {items.map((label, i) => (
        <mesh key={i} position={[0.5 + i * 0.2, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.1]} />
          <meshStandardMaterial color={ORANGE} />
        </mesh>
      ))}
      <group position={[0, -0.6, 0.5]}>
        <mesh>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color={ORANGE} opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default WebAPIs
