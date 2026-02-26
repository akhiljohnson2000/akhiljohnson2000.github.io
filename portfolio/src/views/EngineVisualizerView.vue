<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import gsap from 'gsap'
import { engineController, STEPS } from '@/lib/engineController'

const DEFAULT_CODE = `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 1000);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");
`

const code = ref(DEFAULT_CODE)
const running = ref(false)
const paused = ref(false)
const speed = ref(1)
const consoleLogs = ref<string[]>([])
const tooltip = ref<string | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let css2dRenderer: CSS2DRenderer
let animationId = 0
let timeline: gsap.core.Timeline | null = null

// 3D object refs for showing/hiding based on step
let callStackBlocks: THREE.Mesh[] = []
let webApiMesh: THREE.Mesh | null = null
let microtaskMesh: THREE.Mesh | null = null
let callbackMesh: THREE.Mesh | null = null
let eventLoopRing: THREE.Mesh | null = null
let cleanupThree: (() => void) | null = null

const router = useRouter()

function stepDuration() {
  return 2 / speed.value
}

function advanceStep() {
  engineController.advance()
  const step = engineController.currentStep
  if (step === STEPS.LOG_START) consoleLogs.value = [...consoleLogs.value, 'Start']
  if (step === STEPS.LOG_END) consoleLogs.value = [...consoleLogs.value, 'End']
  if (step === STEPS.LOG_PROMISE) consoleLogs.value = [...consoleLogs.value, 'Promise']
  if (step === STEPS.LOG_TIMEOUT) consoleLogs.value = [...consoleLogs.value, 'Timeout']
}

function runSlowMotion() {
  if (running.value) return
  running.value = true
  paused.value = false
  consoleLogs.value = []
  engineController.reset()
  timeline?.kill()
  timeline = gsap.timeline()
  const order = engineController.getStepOrder()
  const duration = stepDuration()
  order.forEach((_, i) => {
    timeline!.call(() => {
      if (engineController.currentStep === STEPS.DONE) return
      advanceStep()
    })
    if (i < order.length - 1) timeline!.to({}, { duration })
  })
  timeline.call(() => {
    running.value = false
  })
}

function pauseResume() {
  if (!timeline) return
  paused.value = !paused.value
  if (paused.value) timeline.pause()
  else timeline.play()
}

function stepOnce() {
  if (engineController.currentStep === STEPS.DONE) return
  advanceStep()
}

function reset() {
  timeline?.kill()
  timeline = null
  running.value = false
  paused.value = false
  consoleLogs.value = []
  engineController.reset()
}

function goBack() {
  router.push('/')
}

function initThree(): () => void {
  const container = canvasRef.value
  if (!container) return () => {}

  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f0f14)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
  camera.position.set(0, 0, 8)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  css2dRenderer = new CSS2DRenderer()
  css2dRenderer.setSize(width, height)
  css2dRenderer.domElement.style.position = 'absolute'
  css2dRenderer.domElement.style.top = '0'
  css2dRenderer.domElement.style.left = '0'
  css2dRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(css2dRenderer.domElement)

  function makeLabel(text: string) {
    const div = document.createElement('div')
    div.className = 'engine-label'
    div.textContent = text
    div.style.color = '#e4e4e7'
    div.style.fontSize = '12px'
    div.style.fontWeight = '600'
    div.style.whiteSpace = 'nowrap'
    div.style.textShadow = '0 0 4px rgba(0,0,0,0.8)'
    return new CSS2DObject(div)
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(5, 5, 5)
  scene.add(dir)

  const blue = 0x3b82f6
  const purple = 0xa855f7
  const orange = 0xf97316
  const green = 0x22c55e
  const yellow = 0xeab308
  const cyan = 0x06b6d4

  // Call Stack - cylinder + stackable boxes
  const callStackLabel = makeLabel('Call Stack')
  callStackLabel.position.set(-2.2, 1.95, 0)
  scene.add(callStackLabel)

  const stackCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.6, 1.8, 32),
    new THREE.MeshStandardMaterial({ color: blue, transparent: true, opacity: 0.2 })
  )
  stackCylinder.position.set(-2.2, 0.9, 0)
  scene.add(stackCylinder)

  const stackBox1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.25, 0.4),
    new THREE.MeshStandardMaterial({ color: blue, emissive: blue, emissiveIntensity: 0.3 })
  )
  stackBox1.position.set(-2.2, 0.5, 0)
  stackBox1.visible = false
  scene.add(stackBox1)
  callStackBlocks.push(stackBox1)

  const stackBox2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.25, 0.4),
    new THREE.MeshStandardMaterial({ color: blue, emissive: blue, emissiveIntensity: 0.3 })
  )
  stackBox2.position.set(-2.2, 0.15, 0)
  stackBox2.visible = false
  scene.add(stackBox2)
  callStackBlocks.push(stackBox2)

  const globalEcLabel = makeLabel('Execution Context (Global)')
  globalEcLabel.position.set(-2.2, 0.5, 0.6)
  scene.add(globalEcLabel)
  const callbackEcLabel = makeLabel('Execution Context (Callback)')
  callbackEcLabel.position.set(-2.2, 0.15, 0.6)
  scene.add(callbackEcLabel)

  // Heap - spheres
  const heapLabel = makeLabel('Heap')
  heapLabel.position.set(0, 1.5, 0)
  scene.add(heapLabel)
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshStandardMaterial({ color: purple, emissive: purple, emissiveIntensity: 0.4 })
    )
    s.position.set(0, 1.2 + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6)
    scene.add(s)
  }

  // Web APIs - box
  const webApiLabel = makeLabel('Web APIs')
  webApiLabel.position.set(0, 0.55, 0)
  scene.add(webApiLabel)
  webApiMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.3, 0.2),
    new THREE.MeshStandardMaterial({ color: orange, emissive: orange, emissiveIntensity: 0.2 })
  )
  webApiMesh.position.set(0, 0.3, 0)
  webApiMesh.visible = false
  scene.add(webApiMesh)

  // Microtask queue - box
  const microtaskLabel = makeLabel('Microtask Queue')
  microtaskLabel.position.set(2, 0.95, 0)
  scene.add(microtaskLabel)
  microtaskMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.15),
    new THREE.MeshStandardMaterial({ color: green, emissive: green, emissiveIntensity: 0.3 })
  )
  microtaskMesh.position.set(2, 0.7, 0)
  microtaskMesh.visible = false
  scene.add(microtaskMesh)

  // Callback queue - box
  const callbackQueueLabel = makeLabel('Callback Queue')
  callbackQueueLabel.position.set(2, -0.15, 0)
  scene.add(callbackQueueLabel)
  callbackMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.2, 0.15),
    new THREE.MeshStandardMaterial({ color: yellow, emissive: yellow, emissiveIntensity: 0.3 })
  )
  callbackMesh.position.set(2, -0.4, 0)
  callbackMesh.visible = false
  scene.add(callbackMesh)

  // Event loop - ring
  const eventLoopLabel = makeLabel('Event Loop')
  eventLoopLabel.position.set(0, -0.1, -0.5)
  scene.add(eventLoopLabel)
  eventLoopRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.06, 16, 48),
    new THREE.MeshStandardMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 0.2 })
  )
  eventLoopRing.position.set(0, -0.5, -0.5)
  scene.add(eventLoopRing)

  // Console panel - flat box
  const consoleLabel = makeLabel('Console')
  consoleLabel.position.set(0, -1.25, 1.2)
  scene.add(consoleLabel)
  const consolePanel = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.6, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x1e1e2e })
  )
  consolePanel.position.set(0, -1.6, 1)
  scene.add(consolePanel)

  const unsub = engineController.subscribe((step, data) => {
    if ((data.reset as boolean)) {
      callStackBlocks.forEach((m) => (m.visible = false))
      if (webApiMesh) webApiMesh.visible = false
      if (microtaskMesh) microtaskMesh.visible = false
      if (callbackMesh) callbackMesh.visible = false
      if (eventLoopRing && eventLoopRing.material instanceof THREE.MeshStandardMaterial) {
        eventLoopRing.material.emissiveIntensity = 0.2
      }
      return
    }
    callStackBlocks.forEach((m) => (m.visible = false))
    if (webApiMesh) webApiMesh.visible = false
    if (microtaskMesh) microtaskMesh.visible = false
    if (callbackMesh) callbackMesh.visible = false

    switch (step) {
      case STEPS.GLOBAL_ENTER:
        if (callStackBlocks[0]) callStackBlocks[0].visible = true
        break
      case STEPS.SET_TIMEOUT_TO_WEB_API:
        if (webApiMesh) webApiMesh.visible = true
        break
      case STEPS.PROMISE_TO_MICROTASK:
        if (microtaskMesh) microtaskMesh.visible = true
        break
      case STEPS.GLOBAL_EXIT:
        if (callStackBlocks[0]) callStackBlocks[0].visible = false
        break
      case STEPS.PROMISE_TO_STACK:
        if (callStackBlocks[1]) callStackBlocks[1].visible = true
        if (microtaskMesh) microtaskMesh.visible = false
        break
      case STEPS.PROMISE_CALLBACK_EXIT:
        if (callStackBlocks[1]) callStackBlocks[1].visible = false
        break
      case STEPS.TIMEOUT_TO_CALLBACK_QUEUE:
        if (webApiMesh) webApiMesh.visible = false
        if (callbackMesh) callbackMesh.visible = true
        break
      case STEPS.TIMEOUT_TO_STACK:
        if (callStackBlocks[1]) callStackBlocks[1].visible = true
        if (callbackMesh) callbackMesh.visible = false
        break
      case STEPS.LOG_TIMEOUT:
        if (callStackBlocks[1]) callStackBlocks[1].visible = false
        break
      case STEPS.EVENT_LOOP_CHECK_MICRO:
      case STEPS.EVENT_LOOP_CHECK_MACRO:
        if (eventLoopRing && eventLoopRing.material instanceof THREE.MeshStandardMaterial) {
          eventLoopRing.material.emissiveIntensity = 0.6
        }
        break
      default:
        if (eventLoopRing && eventLoopRing.material instanceof THREE.MeshStandardMaterial) {
          eventLoopRing.material.emissiveIntensity = 0.2
        }
    }
  })

  function animate() {
    animationId = requestAnimationFrame(animate)
    if (eventLoopRing) eventLoopRing.rotation.x += 0.01
    if (eventLoopRing) eventLoopRing.rotation.z += 0.008
    renderer.render(scene, camera)
    css2dRenderer.render(scene, camera)
  }
  animate()

  return () => {
    unsub()
    cancelAnimationFrame(animationId)
    if (container) {
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
      if (css2dRenderer.domElement.parentNode === container) container.removeChild(css2dRenderer.domElement)
    }
    renderer.dispose()
  }
}

function onResize() {
  const container = canvasRef.value
  if (!container || !renderer || !camera) return
  const width = container.clientWidth
  const height = container.clientHeight
  renderer.setSize(width, height)
  if (css2dRenderer) css2dRenderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

onMounted(() => {
  cleanupThree = initThree()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cleanupThree?.()
})
</script>

<template>
  <div class="visualizer-page min-h-screen bg-[#0f0f14] text-zinc-200 flex flex-col">
    <header class="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
      <button
        type="button"
        class="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        @click="goBack"
      >
        ← Back to Portfolio
      </button>
      <h1 class="text-lg font-semibold">JavaScript Engine Visualizer</h1>
      <span class="w-24" />
    </header>

    <div class="visualizer-layout flex-1 grid grid-cols-[320px_1fr_260px] min-h-0">
      <aside class="code-panel border-r border-zinc-800 p-4 flex flex-col overflow-auto">
        <h3 class="text-sm font-medium text-zinc-400 mb-2">Code</h3>
        <textarea
          v-model="code"
          class="flex-1 min-h-[200px] w-full rounded-md bg-zinc-900 border border-zinc-700 p-3 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="14"
          spellcheck="false"
        />
        <div class="controls flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="running"
            @click="runSlowMotion"
          >
            Run in Slow Motion
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            :disabled="!running"
            @click="pauseResume"
          >
            {{ paused ? 'Resume' : 'Pause' }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            :disabled="running"
            @click="stepOnce"
          >
            Step
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-700 hover:bg-zinc-600"
            @click="reset"
          >
            Reset
          </button>
        </div>
        <label class="flex items-center gap-2 mt-2 text-sm text-zinc-400">
          Speed: {{ speed }}x
          <input
            v-model.number="speed"
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            class="w-24"
          />
        </label>
      </aside>

      <div ref="canvasRef" class="canvas-container flex-1 min-h-0" />

      <aside class="console-panel border-l border-zinc-800 p-4 flex flex-col">
        <h3 class="text-sm font-medium text-zinc-400 mb-2">Console Output</h3>
        <div class="console-output flex-1 min-h-[120px] rounded-md bg-zinc-900 border border-zinc-700 p-3 text-sm font-mono overflow-auto">
          <div v-if="consoleLogs.length === 0" class="text-zinc-500">
            Output will appear here when you run...
          </div>
          <div v-for="(line, i) in consoleLogs" :key="i" class="text-green-400 mb-1">
            {{ line }}
          </div>
        </div>
      </aside>
    </div>

    <div v-if="tooltip" class="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 z-50 shadow-xl">
      {{ tooltip }}
    </div>
  </div>
</template>

<style scoped>
.visualizer-layout {
  height: calc(100vh - 52px);
}
.canvas-container {
  position: relative;
}
.canvas-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}
@media (max-width: 1024px) {
  .visualizer-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
  .code-panel {
    max-height: 240px;
  }
  .console-panel {
    max-height: 140px;
  }
}
</style>
