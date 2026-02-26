/**
 * EventLoop - Rotating ring that "checks" queues. Central coordinator.
 */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RING_COLOR = '#06b6d4'

export function EventLoop({ active, tooltipRef }) {
  const ringRef = useRef()

  useFrame((state) => {
    if (!ringRef.current) return
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.2
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.15
  })

  return (
    <group position={[0, -0.3, -0.5]}>
      <mesh
        ref={ringRef}
        onPointerOver={() => tooltipRef?.current?.('Event Loop: Repeatedly checks if Call Stack is empty, then takes one callback from Microtask Queue (until empty), then one from Callback Queue.')}
        onPointerOut={() => tooltipRef?.current?.(null)}
      >
        <torusGeometry args={[0.5, 0.06, 16, 48]} />
        <meshStandardMaterial
          color={RING_COLOR}
          emissive={RING_COLOR}
          emissiveIntensity={active ? 0.6 : 0.2}
        />
      </mesh>
      <group position={[0, -0.75, 0]}>
        <mesh>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color={RING_COLOR} opacity={0.9} transparent />
        </mesh>
      </group>
    </group>
  )
}

export default EventLoop
