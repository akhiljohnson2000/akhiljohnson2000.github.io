/**
 * EngineController - State machine for the JavaScript Engine visualization.
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
} as const

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

type Step = (typeof STEPS)[keyof typeof STEPS]
type Listener = (step: string, data: Record<string, unknown>) => void

class EngineController {
  stepIndex = -1
  currentStep: Step = STEPS.IDLE
  private listeners = new Set<Listener>()
  consoleLogs: string[] = []
  speed = 1
  paused = false

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  notify(step: string, data: Record<string, unknown> = {}) {
    this.listeners.forEach((fn) => fn(step, data))
  }

  getStepOrder() {
    return STEP_ORDER
  }

  advance() {
    if (this.currentStep === STEPS.DONE) return
    this.stepIndex = Math.min(this.stepIndex + 1, STEP_ORDER.length - 1)
    this.currentStep = STEP_ORDER[this.stepIndex]
    this.notify(this.currentStep, { stepIndex: this.stepIndex })
  }

  reset() {
    this.stepIndex = -1
    this.currentStep = STEPS.IDLE
    this.consoleLogs = []
    this.notify(STEPS.IDLE, { reset: true })
  }
}

export const engineController = new EngineController()
