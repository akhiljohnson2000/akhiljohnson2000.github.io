/**
 * EngineScene - Composes all 3D parts and subscribes to EngineController.
 * Derives visual state (stack blocks, queue items, etc.) from current step.
 */
import React, { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { engineController, STEPS } from '../lib/EngineController'
import { CallStack } from './CallStack'
import { Heap } from './Heap'
import { WebAPIs } from './WebAPIs'
import { Queue } from './Queue'
import { EventLoop } from './EventLoop'
import { ConsoleScreen } from './ConsoleScreen'

function SceneContent({ tooltipRef }) {
  const [callStackBlocks, setCallStackBlocks] = useState([])
  const [webApiItems, setWebApiItems] = useState([])
  const [microtaskItems, setMicrotaskItems] = useState([])
  const [callbackItems, setCallbackItems] = useState([])
  const [eventLoopActive, setEventLoopActive] = useState(false)
  const [consoleLines, setConsoleLines] = useState([])

  useEffect(() => {
    const onStep = (step, data) => {
      if (data.reset) {
        setCallStackBlocks([])
        setWebApiItems([])
        setMicrotaskItems([])
        setCallbackItems([])
        setEventLoopActive(false)
        setConsoleLines([])
        return
      }
      switch (step) {
        case STEPS.GLOBAL_ENTER:
          setCallStackBlocks(['Global EC'])
          break
        case STEPS.LOG_START:
          setConsoleLines((l) => [...l, 'Start'])
          break
        case STEPS.SET_TIMEOUT_TO_WEB_API:
          setWebApiItems(['setTimeout'])
          break
        case STEPS.PROMISE_TO_MICROTASK:
          setMicrotaskItems(['Promise.then'])
          break
        case STEPS.LOG_END:
          setConsoleLines((l) => [...l, 'End'])
          break
        case STEPS.GLOBAL_EXIT:
          setCallStackBlocks([])
          break
        case STEPS.EVENT_LOOP_CHECK_MICRO:
          setEventLoopActive(true)
          break
        case STEPS.PROMISE_TO_STACK:
          setCallStackBlocks(['Promise callback'])
          setMicrotaskItems([])
          break
        case STEPS.LOG_PROMISE:
          setConsoleLines((l) => [...l, 'Promise'])
          break
        case STEPS.PROMISE_CALLBACK_EXIT:
          setCallStackBlocks([])
          break
        case STEPS.TIMEOUT_TO_CALLBACK_QUEUE:
          setWebApiItems([])
          setCallbackItems(['Timeout'])
          break
        case STEPS.EVENT_LOOP_CHECK_MACRO:
          setEventLoopActive(true)
          break
        case STEPS.TIMEOUT_TO_STACK:
          setCallStackBlocks(['Timeout callback'])
          setCallbackItems([])
          break
        case STEPS.LOG_TIMEOUT:
          setConsoleLines((l) => [...l, 'Timeout'])
          break
        case STEPS.DONE:
          setCallStackBlocks([])
          setEventLoopActive(false)
          break
        default:
          break
      }
    }
    const unsub = engineController.subscribe(onStep)
    return unsub
  }, [])

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[3, 1, 1]} intensity={0.4} color="#a855f7" />
      <CallStack blocks={callStackBlocks} tooltipRef={tooltipRef} />
      <Heap tooltipRef={tooltipRef} />
      <WebAPIs items={webApiItems} tooltipRef={tooltipRef} />
      <Queue type="micro" items={microtaskItems} tooltipRef={tooltipRef} />
      <Queue type="macro" items={callbackItems} tooltipRef={tooltipRef} />
      <EventLoop active={eventLoopActive} tooltipRef={tooltipRef} />
      <ConsoleScreen lines={consoleLines} tooltipRef={tooltipRef} />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={4} maxDistance={12} />
    </>
  )
}

export function EngineScene({ tooltipRef }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true }}>
      <SceneContent tooltipRef={tooltipRef} />
    </Canvas>
  )
}

export default EngineScene
