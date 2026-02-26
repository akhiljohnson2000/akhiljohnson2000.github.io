/**
 * App - Root layout: code panel, controls, 3D canvas, tooltip.
 * Drives slow-motion animation via GSAP timeline when Run is clicked.
 */
import React, { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { EngineScene } from './components/EngineScene'
import { engineController, STEPS } from './lib/EngineController'
import './App.css'

const DEFAULT_CODE = `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 1000);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");
`

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [consoleLogs, setConsoleLogs] = useState([])
  const [tooltip, setTooltip] = useState(null)
  const tooltipRef = useRef(null)
  const timelineRef = useRef(null)

  const stepDuration = () => 2 / speed

  const advanceStep = useCallback(() => {
    engineController.advance()
    const step = engineController.getCurrentStep()
    if (step === STEPS.LOG_START) setConsoleLogs((l) => [...l, 'Start'])
    if (step === STEPS.LOG_END) setConsoleLogs((l) => [...l, 'End'])
    if (step === STEPS.LOG_PROMISE) setConsoleLogs((l) => [...l, 'Promise'])
    if (step === STEPS.LOG_TIMEOUT) setConsoleLogs((l) => [...l, 'Timeout'])
  }, [])

  const runSlowMotion = useCallback(() => {
    if (running) return
    setRunning(true)
    setPaused(false)
    setConsoleLogs([])
    engineController.reset()
    timelineRef.current?.kill()
    const tl = gsap.timeline()
    const order = engineController.getStepOrder()
    order.forEach((_, i) => {
      tl.call(() => {
        if (engineController.getCurrentStep() === STEPS.DONE) return
        advanceStep()
      })
      if (i < order.length - 1) tl.addPause(stepDuration())
    })
    tl.call(() => setRunning(false))
    timelineRef.current = tl
  }, [running, speed, advanceStep])

  const pauseResume = useCallback(() => {
    if (!timelineRef.current) return
    setPaused((p) => {
      if (p) timelineRef.current.play()
      else timelineRef.current.pause()
      return !p
    })
  }, [])

  const stepOnce = useCallback(() => {
    if (engineController.getCurrentStep() === STEPS.DONE) return
    advanceStep()
  }, [advanceStep])

  const reset = useCallback(() => {
    timelineRef.current?.kill()
    setRunning(false)
    setPaused(false)
    setConsoleLogs([])
    engineController.reset()
  }, [])

  tooltipRef.current = setTooltip

  return (
    <div className="app">
      <div className="panel code-panel">
        <h3>Code</h3>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter JavaScript..."
          rows={12}
        />
        <div className="controls">
          <button className="btn primary" onClick={runSlowMotion} disabled={running}>
            Run in Slow Motion
          </button>
          <button className="btn" onClick={pauseResume} disabled={!running}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn" onClick={stepOnce} disabled={running}>
            Step
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
          <label className="speed-control">
            Speed: {speed}x
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="canvas-wrap">
        <EngineScene tooltipRef={tooltipRef} />
      </div>

      <div className="panel console-panel">
        <h3>Console Output</h3>
        <div className="console-output">
          {consoleLogs.length === 0 ? (
            <div className="console-placeholder">Output will appear here when you run...</div>
          ) : (
            consoleLogs.map((line, i) => (
              <div key={i} className="console-line">
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      {tooltip && (
        <div className="tooltip">
          {tooltip}
        </div>
      )}
    </div>
  )
}
