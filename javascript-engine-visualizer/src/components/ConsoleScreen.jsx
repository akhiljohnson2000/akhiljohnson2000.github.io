/**
 * ConsoleScreen - Digital screen panel showing console output (white).
 */
import React from 'react'
import * as THREE from 'three'

export function ConsoleScreen({ lines = [], tooltipRef }) {
  return (
    <group position={[0, -1.8, 1.2]}>
      <mesh
        onPointerOver={() => tooltipRef?.current?.('Console: Output from console.log(). Runs in order as callbacks execute on the Call Stack.')}
        onPointerOut={() => tooltipRef?.current?.(null)}
      >
        <boxGeometry args={[2.2, 0.8, 0.08]} />
        <meshStandardMaterial color="#1e1e2e" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.0, 0.65]} />
        <meshBasicMaterial color="#0d0d12" />
      </mesh>
      <group position={[0, -0.72, 0.1]}>
        <mesh>
          <planeGeometry args={[1.2, 0.18]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
      </group>
      {/* Text lines rendered via HTML in App or we use sprites - for simplicity we just show the panel; actual log text is in UI overlay */}
    </group>
  )
}

export default ConsoleScreen
