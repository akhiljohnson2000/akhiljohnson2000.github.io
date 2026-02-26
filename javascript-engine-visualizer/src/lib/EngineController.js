/**
 * EngineController - Central state machine for the JavaScript Engine visualization.
 * Manages execution steps and notifies subscribers so 3D components can animate.
 * Steps follow the real order: Call Stack → Web APIs / Microtask → Event Loop → Callback Queue → etc.
 */

export const STEPS = {
  IDLE: 'idle',
  GLOBAL_ENTER: 'global_enter',
  LOG_START: 'log_start',
  SET_TIMEOUT_TO_WEB_API: 'set_timeout_to_web_api',
  PROMISE_TO_MICROTASK: 'promise_to_microtask',
  LOG_END: 'log_end',
  GLOBAL_EXIT: 'global_exit',
  EVENT_LOOP_CHECK_MICRO: 'event_loop_check_micro',
  PROMISE_TO_STACK: 'promise_to_stack',
  LOG_PROMISE: 'log_promise',
  PROMISE_CALLBACK_EXIT: 'promise_callback_exit',
  TIMEOUT_TO_CALLBACK_QUEUE: 'timeout_to_callback_queue',
  EVENT_LOOP_CHECK_MACRO: 'event_loop_check_macro',
  TIMEOUT_TO_STACK: 'timeout_to_stack',
  LOG_TIMEOUT: 'log_timeout',
  DONE: 'done',
}

const STEP_ORDER = [
  STEPS.GLOBAL_ENTER,
  STEPS.LOG_START,
  STEPS.SET_TIMEOUT_TO_WEB_API,
  STEPS.PROMISE_TO_MICROTASK,
  STEPS.LOG_END,
  STEPS.GLOBAL_EXIT,
  STEPS.EVENT_LOOP_CHECK_MICRO,
  STEPS.PROMISE_TO_STACK,
  STEPS.LOG_PROMISE,
  STEPS.PROMISE_CALLBACK_EXIT,
  STEPS.TIMEOUT_TO_CALLBACK_QUEUE,
  STEPS.EVENT_LOOP_CHECK_MACRO,
  STEPS.TIMEOUT_TO_STACK,
  STEPS.LOG_TIMEOUT,
  STEPS.DONE,
]

class EngineController {
  constructor() {
    this.stepIndex = -1
    this.currentStep = STEPS.IDLE
    this.listeners = new Set()
    this.consoleLogs = []
    this.speed = 1
    this.paused = false
    this.stepMode = false
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  notify(step, data = {}) {
    this.listeners.forEach((fn) => fn(step, data))
  }

  getStepOrder() {
    return STEP_ORDER
  }

  getCurrentStep() {
    return this.currentStep
  }

  getStepIndex() {
    return this.stepIndex
  }

  advance() {
    if (this.currentStep === STEPS.DONE) return
    this.stepIndex = Math.min(this.stepIndex + 1, STEP_ORDER.length - 1)
    this.currentStep = STEP_ORDER[this.stepIndex]
    this.notify(this.currentStep, { stepIndex: this.stepIndex })
  }

  runNextStep() {
    if (this.paused || this.currentStep === STEPS.DONE) return
    this.advance()
  }

  reset() {
    this.stepIndex = -1
    this.currentStep = STEPS.IDLE
    this.consoleLogs = []
    this.notify(STEPS.IDLE, { reset: true })
  }

  start() {
    this.reset()
    this.advance()
  }

  setSpeed(s) {
    this.speed = Math.max(0.5, Math.min(2, s))
  }

  setPaused(p) {
    this.paused = p
    this.notify(this.paused ? 'paused' : 'resumed')
  }

  addConsoleLog(text) {
    this.consoleLogs = [...this.consoleLogs, text]
    this.notify('console', { log: text })
  }

  getConsoleLogs() {
    return this.consoleLogs
  }
}

export const engineController = new EngineController()
export default engineController
