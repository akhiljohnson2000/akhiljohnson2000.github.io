<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ImageDown } from 'lucide-vue-next'
import heic2any from 'heic2any'

type FormatKey = 'jpeg' | 'webp' | 'png'

type EncodedCache = {
  key: string
  bytes: number
  width: number
  height: number
  blob: Blob | null
}

type QueueItem = {
  id: number
  file: File
  url: string
  decoded: Blob | null
  width: number
  height: number
  encoded: EncodedCache | null
  error: string | null
}

type ResultRow = {
  ok: boolean
  name: string
  bytes?: number
  original?: number
  error?: string
}

type DirectoryHandleLike = {
  name: string
  queryPermission?: (opts: { mode: 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (opts: { mode: 'readwrite' }) => Promise<PermissionState>
  getDirectoryHandle: (
    name: string,
    opts?: { create?: boolean },
  ) => Promise<{
    getFileHandle: (
      name: string,
      opts?: { create?: boolean },
    ) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>
        close: () => Promise<void>
      }>
    }>
  }>
}

const FORMATS: Record<FormatKey, { mime: string; ext: string; label: string }> = {
  jpeg: { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG' },
  webp: { mime: 'image/webp', ext: 'webp', label: 'WebP' },
  png: { mime: 'image/png', ext: 'png', label: 'PNG' },
}

const files = ref<QueueItem[]>([])
const results = ref<ResultRow[]>([])
const selectedFormat = ref<FormatKey>('jpeg')
const qualityValue = ref(80)
const qualityText = ref('80')
const rootHandle = ref<DirectoryHandleLike | null>(null)
const converting = ref(false)
const estimating = ref(false)
const dragOver = ref(false)
const statusMessage = ref('')
const statusWarn = ref(false)
const statusLocked = ref(false)
const pickerBusy = ref(false)

let fileId = 0
let estimateToken = 0
let estimateTimer = 0
let dragDepth = 0
let pickerPromise: Promise<DirectoryHandleLike> | null = null

const fileInputEl = ref<HTMLInputElement | null>(null)
const hasDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window

const qualityValid = computed(() => {
  if (selectedFormat.value === 'png') return true
  const raw = qualityText.value.trim()
  if (!/^\d+$/.test(raw)) return false
  const n = Number(raw)
  return n >= 1 && n <= 100
})

const currentQuality = computed(() => {
  if (selectedFormat.value === 'png') return 100
  if (!qualityValid.value) return null
  return Number(qualityText.value.trim())
})

const currentKey = computed(() => {
  if (selectedFormat.value === 'png') return 'png'
  const q = currentQuality.value
  if (q == null) return null
  return `${selectedFormat.value}:${q}`
})

const pngMode = computed(() => selectedFormat.value === 'png')

const estimateLabel = computed(() => {
  const list = files.value
  const key = currentKey.value
  if (!list.length) return '—'
  if (!pngMode.value && currentQuality.value == null) return '—'
  const ready = list.filter((item) => item.encoded && item.encoded.key === key && !item.error)
  const failed = list.filter((item) => item.error).length
  const pending = list.length - ready.length - failed
  const bytes = ready.reduce((sum, item) => sum + (item.encoded?.bytes ?? 0), 0)
  if (pending > 0 || estimating.value) return ready.length ? formatBytes(bytes) : 'Estimating…'
  return formatBytes(bytes)
})

const estimateDetail = computed(() => {
  const list = files.value
  const key = currentKey.value
  if (!list.length) return 'Add images to estimate the converted size.'
  if (!pngMode.value && currentQuality.value == null) return 'Enter a quality from 1 to 100.'
  const ready = list.filter((item) => item.encoded && item.encoded.key === key && !item.error)
  const failed = list.filter((item) => item.error).length
  const pending = list.length - ready.length - failed
  const bytes = ready.reduce((sum, item) => sum + (item.encoded?.bytes ?? 0), 0)
  const original = list.reduce((sum, item) => sum + item.file.size, 0)
  if (pending > 0 || estimating.value) return `Estimating ${ready.length} of ${list.length}`
  let detail = `Original ${formatBytes(original)} · ${savingsText(original, bytes)}`
  if (failed) detail += ` · ${failed} unreadable`
  return detail
})

const savedCount = computed(() => results.value.filter((row) => row.ok).length)

const convertDisabled = computed(
  () => converting.value || pickerBusy.value || files.value.length === 0,
)

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 10240) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function savingsText(original: number, next: number) {
  if (!original) return ''
  const pct = Math.round((1 - next / original) * 100)
  if (pct > 0) return `${pct}% smaller`
  if (pct < 0) return `${Math.abs(pct)}% larger`
  return 'same size'
}

function isHeic(file: File) {
  if (/^image\/hei[cf](-sequence)?$/i.test(file.type)) return true
  return /\.hei[cf]$/i.test(file.name)
}

function isImage(file: File) {
  if (/^image\/(jpeg|png|webp|gif|bmp|avif|hei[cf](-sequence)?)$/i.test(file.type)) return true
  return /\.(jpe?g|png|webp|gif|bmp|avif|hei[cf])$/i.test(file.name)
}

async function heicToBlob(file: File) {
  const result = await heic2any({ blob: file, toType: 'image/png' })
  return Array.isArray(result) ? result[0] : result
}

async function bitmapSource(item: QueueItem) {
  if (item.decoded) return item.decoded
  if (!isHeic(item.file)) return item.file
  item.decoded = await heicToBlob(item.file)
  return item.decoded
}

function setStatus(message: string, warn = false) {
  statusLocked.value = true
  statusMessage.value = message
  statusWarn.value = warn
}

function idleStatus() {
  statusLocked.value = false
  statusWarn.value = false
  const count = files.value.length === 1 ? '1 image' : `${files.value.length} images`
  if (!hasDirectoryPicker) {
    statusMessage.value = files.value.length
      ? `${count}. Convert downloads files in your browser.`
      : 'Convert downloads reduced images in your browser. Chrome/Edge can also save into a folder.'
    return
  }
  if (rootHandle.value) {
    statusMessage.value = `${files.value.length ? `${count}. ` : ''}Saves to ${rootHandle.value.name}/converted/.`
    return
  }
  statusMessage.value = files.value.length
    ? `${count}. On Convert, select a folder — images are saved in its converted/ folder.`
    : 'On Convert, select a folder. Images are saved in its converted/ folder. You can also download without a folder.'
}

function queueMeta(item: QueueItem) {
  const key = currentKey.value
  if (item.error) return item.error
  if (!item.url && isHeic(item.file)) return `${formatBytes(item.file.size)} · Decoding HEIC…`
  const parts = [formatBytes(item.file.size)]
  if (item.width) parts.push(`${item.width}×${item.height}`)
  if (item.encoded && item.encoded.key === key) parts.push(`est. ${formatBytes(item.encoded.bytes)}`)
  return parts.join(' · ')
}

function breakdownSize(item: QueueItem) {
  const key = currentKey.value
  if (item.error) return 'Failed'
  if (item.encoded && item.encoded.key === key) {
    return `${formatBytes(item.file.size)} → ${formatBytes(item.encoded.bytes)}`
  }
  return '…'
}

async function encode(item: QueueItem, format: FormatKey, quality: number) {
  let bitmap: ImageBitmap
  try {
    const source = await bitmapSource(item)
    bitmap = await createImageBitmap(source)
  } catch {
    throw new Error('Cannot read this image')
  }
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d', { alpha: format !== 'jpeg' })
    if (!ctx) throw new Error('Could not encode this image')
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0)
    const spec = FORMATS[format]
    const q = format === 'png' ? undefined : quality / 100
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          canvas.width = 0
          canvas.height = 0
          if (result) resolve(result)
          else reject(new Error('Could not encode this image'))
        },
        spec.mime,
        q,
      )
    })
    return { blob, width: bitmap.width, height: bitmap.height }
  } finally {
    bitmap.close()
  }
}

function scheduleEstimate() {
  window.clearTimeout(estimateTimer)
  const token = ++estimateToken
  estimateTimer = window.setTimeout(() => {
    void runEstimates(token)
  }, 220)
}

async function runEstimates(token: number) {
  const format = selectedFormat.value
  const quality = format === 'png' ? 100 : currentQuality.value
  if (quality == null || !files.value.length) {
    if (token === estimateToken) estimating.value = false
    return
  }
  estimating.value = true
  const key = format === 'png' ? 'png' : `${format}:${quality}`
  for (const item of [...files.value]) {
    if (token !== estimateToken) return
    if (!files.value.includes(item)) continue
    if (item.encoded && item.encoded.key === key) continue
    try {
      const encoded = await encode(item, format, quality)
      if (token !== estimateToken || !files.value.includes(item)) continue
      item.width = encoded.width
      item.height = encoded.height
      item.error = null
      item.encoded = {
        key,
        bytes: encoded.blob.size,
        width: encoded.width,
        height: encoded.height,
        blob: encoded.blob,
      }
      if (isHeic(item.file) && item.decoded && !item.url) {
        item.url = URL.createObjectURL(item.decoded)
      }
    } catch (err) {
      if (token !== estimateToken || !files.value.includes(item)) continue
      item.encoded = null
      item.error = err instanceof Error ? err.message : 'Cannot read this image'
    }
  }
  if (token !== estimateToken) return
  estimating.value = false
}

async function blobFor(item: QueueItem) {
  const format = selectedFormat.value
  const quality = format === 'png' ? 100 : qualityValue.value
  const key = format === 'png' ? 'png' : `${format}:${quality}`
  if (item.encoded && item.encoded.key === key && item.encoded.blob) return item.encoded
  const encoded = await encode(item, format, quality)
  item.width = encoded.width
  item.height = encoded.height
  item.error = null
  item.encoded = {
    key,
    bytes: encoded.blob.size,
    width: encoded.width,
    height: encoded.height,
    blob: encoded.blob,
  }
  return item.encoded
}

async function preparePreview(item: QueueItem) {
  try {
    if (isHeic(item.file)) {
      item.decoded = await heicToBlob(item.file)
      item.url = URL.createObjectURL(item.decoded)
    } else {
      item.url = URL.createObjectURL(item.file)
    }
  } catch (err) {
    item.error = err instanceof Error ? err.message : 'Cannot read this image'
  }
}

async function addFiles(list: FileList | File[]) {
  let skipped = 0
  const pending: Promise<void>[] = []
  for (const file of Array.from(list)) {
    if (!isImage(file)) {
      skipped += 1
      continue
    }
    const item: QueueItem = {
      id: ++fileId,
      file,
      url: '',
      decoded: null,
      width: 0,
      height: 0,
      encoded: null,
      error: null,
    }
    files.value.push(item)
    pending.push(preparePreview(item))
  }
  if (skipped) {
    setStatus(
      `${skipped}${skipped === 1 ? ' file was' : ' files were'} skipped. Use JPEG, PNG, WebP, GIF, BMP, AVIF, or HEIC.`,
    )
  } else {
    statusLocked.value = false
    idleStatus()
  }
  await Promise.all(pending)
  scheduleEstimate()
}

function removeFile(id: number) {
  const index = files.value.findIndex((item) => item.id === id)
  if (index === -1) return
  URL.revokeObjectURL(files.value[index].url)
  files.value.splice(index, 1)
  statusLocked.value = false
  idleStatus()
  scheduleEstimate()
}

function clearFiles() {
  for (const item of files.value) URL.revokeObjectURL(item.url)
  files.value = []
  estimateToken += 1
  estimating.value = false
  statusLocked.value = false
  idleStatus()
}

function uniqueName(original: string, ext: string, used: Set<string>) {
  const base = (original.split(/[/\\]/).pop() || 'image').replace(/\.[^.]+$/, '')
  const stem = (base.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/^\.+/, '') || 'image').slice(0, 80)
  let name = `${stem}.${ext}`
  let n = 2
  while (used.has(name.toLowerCase())) {
    name = `${stem}-${n}.${ext}`
    n += 1
  }
  used.add(name.toLowerCase())
  return name
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('img-reducer', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('kv')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function persistHandle(handle: DirectoryHandleLike) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(handle, 'root')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function loadHandle() {
  const db = await openDb()
  const handle = await new Promise<DirectoryHandleLike | null>((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly')
    const req = tx.objectStore('kv').get('root')
    req.onsuccess = () => resolve((req.result as DirectoryHandleLike) || null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return handle
}

function pickerActiveError(err: unknown) {
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; message?: string }
  return e.name === 'InvalidStateError' || /already active/i.test(e.message || '')
}

function folderBlockedError(err: unknown) {
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; message?: string }
  const message = e.message || ''
  return e.name === 'SecurityError' || /system files|not allowed|permission/i.test(message)
}

async function ensureReadWrite(handle: DirectoryHandleLike) {
  let perm: PermissionState = 'prompt'
  try {
    perm = (await handle.queryPermission?.({ mode: 'readwrite' })) ?? 'prompt'
  } catch {
    perm = 'prompt'
  }
  if (perm === 'granted') return true
  if (perm === 'denied') return false
  try {
    perm = (await handle.requestPermission?.({ mode: 'readwrite' })) ?? 'denied'
  } catch {
    return false
  }
  return perm === 'granted'
}

function chooseFolder() {
  if (pickerPromise) return pickerPromise
  const showDirectoryPicker = (
    window as Window & {
      showDirectoryPicker?: (opts: {
        id?: string
        mode?: 'readwrite'
      }) => Promise<DirectoryHandleLike>
    }
  ).showDirectoryPicker
  if (!showDirectoryPicker) {
    return Promise.reject(new Error('Saving into a folder needs Chrome or Edge.'))
  }
  pickerBusy.value = true
  pickerPromise = showDirectoryPicker({ id: 'imgReducer', mode: 'readwrite' })
    .then(async (handle) => {
      const allowed = await ensureReadWrite(handle)
      if (!allowed) throw new Error('Folder access was not allowed. Click Allow when Chrome asks for permission.')
      rootHandle.value = handle
      try {
        await persistHandle(handle)
      } catch {
        /* The folder still works for this session. */
      }
      return handle
    })
    .finally(() => {
      pickerPromise = null
      pickerBusy.value = false
    })
  return pickerPromise
}

async function folderForConvert() {
  if (rootHandle.value) {
    const allowed = await ensureReadWrite(rootHandle.value)
    if (allowed) return rootHandle.value
  }
  return chooseFolder()
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function convertAll(root: DirectoryHandleLike | null) {
  converting.value = true
  results.value = []
  statusLocked.value = true
  const used = new Set<string>()
  const ext = FORMATS[selectedFormat.value].ext
  let saved = 0
  let failed = 0
  let dir: Awaited<ReturnType<DirectoryHandleLike['getDirectoryHandle']>> | null = null
  if (root) {
    dir = await root.getDirectoryHandle('converted', { create: true })
  }

  for (let i = 0; i < files.value.length; i += 1) {
    const item = files.value[i]
    setStatus(`Converting ${i + 1} of ${files.value.length}…`)
    try {
      const encoded = await blobFor(item)
      const name = uniqueName(item.file.name, ext, used)
      if (!encoded.blob) throw new Error('Could not encode this image')
      if (dir) {
        const fileHandle = await dir.getFileHandle(name, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(encoded.blob)
        await writable.close()
      } else {
        downloadBlob(encoded.blob, name)
      }
      encoded.blob = null
      saved += 1
      results.value.push({ ok: true, name, bytes: encoded.bytes, original: item.file.size })
    } catch (err) {
      failed += 1
      results.value.push({
        ok: false,
        name: item.file.name,
        error: err instanceof Error ? err.message : 'Could not convert',
      })
    }
  }

  converting.value = false
  if (root) {
    const where = `${root.name}/converted/`
    if (saved && failed) setStatus(`Saved ${saved} to ${where}. ${failed} failed.`, true)
    else if (failed) setStatus(`Could not save to ${where}.`, true)
    else setStatus(`Saved ${saved}${saved === 1 ? ' file' : ' files'} to ${where}.`)
  } else if (saved && failed) {
    setStatus(`Downloaded ${saved}. ${failed} failed.`, true)
  } else if (failed) {
    setStatus('Could not convert files.', true)
  } else {
    setStatus(`Downloaded ${saved}${saved === 1 ? ' file' : ' files'}.`)
  }
}

function onDropZoneClick() {
  fileInputEl.value?.click()
}

function onDropZoneKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    fileInputEl.value?.click()
  }
}

function onDragEnter(event: DragEvent) {
  event.preventDefault()
  dragDepth += 1
  dragOver.value = true
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function onDragLeave() {
  dragDepth -= 1
  if (dragDepth <= 0) {
    dragDepth = 0
    dragOver.value = false
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  dragDepth = 0
  dragOver.value = false
  if (event.dataTransfer?.files.length) void addFiles(event.dataTransfer.files)
}

function onFileChange() {
  const input = fileInputEl.value
  if (input?.files?.length) void addFiles(input.files)
  if (input) input.value = ''
}

function onQualityInput() {
  const q = currentQuality.value
  if (q == null) {
    estimateToken += 1
    estimating.value = false
    return
  }
  qualityValue.value = q
  scheduleEstimate()
}

function onQualityBlur() {
  if (currentQuality.value == null) {
    qualityText.value = String(qualityValue.value)
    scheduleEstimate()
  }
}

function onQualityRange(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  qualityValue.value = value
  qualityText.value = String(value)
  scheduleEstimate()
}

function selectFormat(format: FormatKey) {
  if (converting.value) return
  selectedFormat.value = format
  statusLocked.value = false
  idleStatus()
  scheduleEstimate()
}

async function onChooseFolder() {
  if (pickerPromise) return
  if (!hasDirectoryPicker) {
    setStatus('Saving into a folder needs Chrome or Edge.', true)
    return
  }
  try {
    await chooseFolder()
    statusLocked.value = false
    idleStatus()
  } catch (err) {
    if (!err || (err as { name?: string }).name === 'AbortError') return
    if (pickerActiveError(err)) {
      setStatus('A folder window is already open. Switch to it, or reload this page if you do not see it.')
      return
    }
    if (folderBlockedError(err)) {
      setStatus('Chrome blocked that folder. Pick a normal project folder (not Home/root), then click Allow.', true)
      return
    }
    setStatus(err instanceof Error ? err.message : 'Could not open that folder.', true)
  }
}

async function onConvert() {
  if (converting.value || pickerPromise || !files.value.length) return
  const quality = selectedFormat.value === 'png' ? 100 : currentQuality.value
  if (quality == null) {
    setStatus('Enter a quality from 1 to 100.', true)
    return
  }
  qualityValue.value = quality
  try {
    let root: DirectoryHandleLike | null = null
    if (hasDirectoryPicker) {
      try {
        root = await folderForConvert()
      } catch (err) {
        if (err && (err as { name?: string }).name === 'AbortError') {
          // User cancelled folder picker — fall back to downloads.
          root = null
        } else {
          throw err
        }
      }
    }
    await convertAll(root)
  } catch (err) {
    converting.value = false
    if (err && (err as { name?: string }).name === 'AbortError') setStatus('Folder selection cancelled.')
    else if (pickerActiveError(err)) {
      setStatus('A folder window is already open. Switch to it, or reload this page if you do not see it.')
    } else if (folderBlockedError(err)) {
      setStatus('Chrome blocked that folder. Pick a normal project folder (not Home/root), then click Allow.', true)
    } else setStatus(err instanceof Error ? err.message : 'Could not save files.', true)
  }
}

watch(
  () => [selectedFormat.value, qualityText.value, files.value.length] as const,
  () => {
    if (!statusLocked.value) idleStatus()
  },
)

idleStatus()

if (hasDirectoryPicker) {
  loadHandle()
    .then((handle) => {
      if (!handle) return
      rootHandle.value = handle
      statusLocked.value = false
      idleStatus()
    })
    .catch(() => {})
}

onUnmounted(() => {
  window.clearTimeout(estimateTimer)
  for (const item of files.value) URL.revokeObjectURL(item.url)
})
</script>

<template>
  <main class="img-reducer pt-0">
    <div class="app">
      <header class="topbar">
        <div class="topbar-left">
          <RouterLink
            to="/services"
            class="back"
            aria-label="Back to services"
          >
            <ArrowLeft class="h-5 w-5" />
          </RouterLink>
          <div>
            <h1 class="flex items-center gap-2">
              <ImageDown class="h-5 w-5 text-primary" aria-hidden="true" />
              Image Reducer
            </h1>
            <p>Drop images, pick a format and quality, then convert and download or save to a folder.</p>
          </div>
        </div>
      </header>

      <div class="columns">
        <section class="col" aria-labelledby="files-heading">
          <div class="col-head">
            <div class="col-title">
              <h2 id="files-heading">Files</h2>
              <span class="badge">{{ files.length }}</span>
            </div>
            <button
              v-if="files.length"
              class="btn btn-subtle"
              type="button"
              :disabled="converting"
              @click="clearFiles"
            >
              Clear
            </button>
          </div>
          <div class="col-body">
            <div
              class="drop"
              :class="{ 'has-files': files.length > 0, drag: dragOver }"
              tabindex="0"
              role="button"
              aria-label="Add images"
              @click="onDropZoneClick"
              @keydown="onDropZoneKeydown"
              @dragenter="onDragEnter"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 16V5m0 0 3.5 3.5M12 5 8.5 8.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5 15.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              <strong>Drag and drop images</strong>
              <span>or click to browse</span>
              <input
                ref="fileInputEl"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.heic,.heif"
                multiple
                hidden
                @change="onFileChange"
              />
            </div>
            <ul class="list">
              <li
                v-for="item in files"
                :key="item.id"
                class="item"
              >
                <img
                  v-if="item.url"
                  :src="item.url"
                  alt=""
                >
                <div
                  v-else
                  class="thumb"
                >
                  …
                </div>
                <div class="min-w-0">
                  <div
                    class="name"
                    :title="item.file.name"
                  >
                    {{ item.file.name }}
                  </div>
                  <div
                    class="meta"
                    :class="{ error: Boolean(item.error) }"
                  >
                    {{ queueMeta(item) }}
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-icon"
                  :aria-label="`Remove ${item.file.name}`"
                  :disabled="converting"
                  @click="removeFile(item.id)"
                >
                  ×
                </button>
              </li>
            </ul>
          </div>
        </section>

        <section class="col" aria-labelledby="options-heading">
          <div class="col-head">
            <h2 id="options-heading">Convert options</h2>
          </div>
          <div class="col-body">
            <div>
              <span
                id="format-label"
                class="label"
              >Target format</span>
              <div
                class="formats"
                role="radiogroup"
                aria-labelledby="format-label"
              >
                <button
                  v-for="(spec, key) in FORMATS"
                  :key="key"
                  type="button"
                  :aria-pressed="selectedFormat === key"
                  :disabled="converting"
                  @click="selectFormat(key)"
                >
                  {{ spec.label }}
                </button>
              </div>
            </div>

            <div>
              <label
                class="label"
                for="quality"
              >Quality %</label>
              <div class="quality-wrap">
                <input
                  id="quality"
                  v-model="qualityText"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  max="100"
                  step="1"
                  autocomplete="off"
                  :disabled="pngMode || converting"
                  @input="onQualityInput"
                  @blur="onQualityBlur"
                >
                <span
                  class="suffix"
                  aria-hidden="true"
                >%</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                :value="qualityValue"
                aria-label="Quality percent"
                :disabled="pngMode || converting"
                @input="onQualityRange"
              >
              <p class="hint">
                {{
                  pngMode
                    ? 'PNG is lossless, so quality is not used.'
                    : 'Lower percentages make smaller JPEG and WebP files.'
                }}
              </p>
            </div>

            <div class="estimate">
              <div class="label">
                Estimated size
              </div>
              <strong aria-live="polite">{{ estimateLabel }}</strong>
              <p>{{ estimateDetail }}</p>
            </div>

            <div v-if="files.length">
              <div class="subhead">
                By file
              </div>
              <div>
                <div
                  v-for="item in files"
                  :key="`bd-${item.id}`"
                  class="row-line"
                >
                  <span :title="item.file.name">{{ item.file.name }}</span>
                  <span>{{ breakdownSize(item) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="col" aria-labelledby="results-heading">
          <div class="col-head">
            <div class="col-title">
              <h2 id="results-heading">Converted files</h2>
              <span class="badge">{{ savedCount }}</span>
            </div>
          </div>
          <div class="col-body">
            <p
              v-if="!results.length"
              class="empty"
            >
              {{ converting ? 'Converting…' : 'Converted files will show up here.' }}
            </p>
            <ul
              v-else
              class="list"
            >
              <li
                v-for="(row, idx) in results"
                :key="`${row.name}-${idx}`"
                class="item"
              >
                <div
                  class="thumb"
                  :class="row.ok ? 'ok' : 'bad'"
                >
                  {{ row.ok ? 'OK' : '!' }}
                </div>
                <div class="min-w-0">
                  <div
                    class="name"
                    :title="row.name"
                  >
                    {{ row.name }}
                  </div>
                  <div
                    class="meta"
                    :class="{ error: !row.ok }"
                  >
                    <template v-if="row.ok">
                      {{ formatBytes(row.bytes ?? 0) }} · {{ savingsText(row.original ?? 0, row.bytes ?? 0) }}
                    </template>
                    <template v-else>
                      {{ row.error }}
                    </template>
                  </div>
                  <div
                    v-if="row.ok && hasDirectoryPicker && rootHandle"
                    class="path"
                  >
                    converted/{{ row.name }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <footer class="footer">
        <p
          :class="{ warn: statusWarn }"
          aria-live="polite"
        >
          {{ statusMessage }}
        </p>
        <div class="footer-actions">
          <button
            v-if="hasDirectoryPicker"
            class="btn btn-default"
            type="button"
            :disabled="converting || pickerBusy"
            @click="onChooseFolder"
          >
            {{ rootHandle ? 'Change folder' : 'Choose folder' }}
          </button>
          <button
            class="btn btn-filled"
            type="button"
            :disabled="convertDisabled"
            @click="onConvert"
          >
            {{ converting ? 'Converting…' : 'Convert' }}
          </button>
        </div>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.img-reducer {
  --ir-border: hsl(var(--border));
  --ir-muted: hsl(var(--muted-foreground));
  --ir-bg: hsl(var(--background));
  --ir-card: hsl(var(--card));
  --ir-primary: hsl(var(--primary));
  --ir-primary-fg: hsl(var(--primary-foreground));
  --ir-destructive: hsl(var(--destructive));
  height: 100vh;
  min-height: 100dvh;
  background: hsl(var(--muted) / 0.35);
}

.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.topbar {
  flex: none;
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--ir-card);
  border-bottom: 1px solid var(--ir-border);
}

.topbar-left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  color: var(--ir-muted);
  flex: none;
}

.back:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.topbar h1 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.2;
}

.topbar p {
  margin: 2px 0 0;
  color: var(--ir-muted);
  font-size: 0.875rem;
}

.columns {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.col {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--ir-card);
  border: 1px solid var(--ir-border);
  border-radius: 0.75rem;
}

.col-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.col-head h2 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--ir-muted);
  background: hsl(var(--muted));
  border-radius: 2rem;
  padding: 1px 8px;
}

.col-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.drop {
  position: sticky;
  top: 0;
  z-index: 1;
  flex: 1;
  min-height: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  color: var(--ir-muted);
  background: hsl(var(--muted) / 0.45);
  border: 1px dashed hsl(var(--border));
  border-radius: 0.5rem;
}

.drop strong {
  color: hsl(var(--foreground));
  font-size: 0.875rem;
}

.drop span,
.hint,
.meta,
.empty {
  font-size: 0.75rem;
}

.drop.has-files {
  flex: none;
  min-height: 112px;
}

.drop:hover,
.drop.drag {
  border-color: var(--ir-primary);
  background: hsl(var(--primary) / 0.08);
  color: var(--ir-primary);
}

.drop.drag strong,
.drop:hover strong {
  color: var(--ir-primary);
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.formats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  background: hsl(var(--muted));
  border-radius: 0.375rem;
}

.formats button {
  height: 32px;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--ir-muted);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.formats button[aria-pressed='true'] {
  color: hsl(var(--foreground));
  background: var(--ir-card);
  border-color: var(--ir-border);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
}

.quality-wrap {
  position: relative;
}

.quality-wrap input[type='number'] {
  width: 100%;
  height: 36px;
  padding: 0 36px 0 12px;
  color: hsl(var(--foreground));
  background: var(--ir-card);
  border: 1px solid var(--ir-border);
  border-radius: 0.375rem;
  outline: none;
}

.quality-wrap input[type='number']:focus {
  border-color: var(--ir-primary);
}

.quality-wrap input[type='number']::-webkit-inner-spin-button,
.quality-wrap input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quality-wrap input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.quality-wrap input:disabled {
  color: var(--ir-muted);
  background: hsl(var(--muted));
}

.suffix {
  position: absolute;
  z-index: 1;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ir-muted);
  font-size: 0.875rem;
  pointer-events: none;
}

input[type='range'] {
  width: 100%;
  margin: 8px 0 0;
  accent-color: var(--ir-primary);
}

input[type='range']:disabled {
  opacity: 0.45;
}

.hint {
  min-height: 1.4em;
  margin: 6px 0 0;
  color: var(--ir-muted);
}

.estimate {
  padding: 1rem;
  background: hsl(var(--primary) / 0.08);
  border-radius: 0.5rem;
}

.estimate .label {
  margin: 0;
  color: var(--ir-primary);
}

.estimate strong {
  display: block;
  margin-top: 4px;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.estimate p {
  margin: 6px 0 0;
  color: var(--ir-muted);
  font-size: 0.875rem;
}

.subhead {
  margin: 4px 0 0;
  color: var(--ir-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--ir-border);
  border-radius: 0.375rem;
}

.item img,
.thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 0.25rem;
  background: hsl(var(--muted));
}

.thumb {
  display: grid;
  place-items: center;
  color: var(--ir-muted);
  font-size: 10px;
  font-weight: 700;
}

.thumb.ok {
  color: #2b8a3e;
  background: #ebfbee;
}

.thumb.bad {
  color: #f03e3e;
  background: #fff5f5;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
}

.meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ir-muted);
}

.meta.error {
  color: var(--ir-destructive);
}

.path {
  color: var(--ir-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.empty {
  flex: 1;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 1rem;
  text-align: center;
  color: var(--ir-muted);
}

.row-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ir-border);
  font-size: 0.875rem;
}

.row-line span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-line span:last-child {
  flex: none;
  color: var(--ir-muted);
  font-variant-numeric: tabular-nums;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding-inline: 14px;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
}

.btn-filled {
  height: 42px;
  padding-inline: 22px;
  color: var(--ir-primary-fg);
  background: var(--ir-primary);
  border: 1px solid transparent;
}

.btn-filled:hover:not(:disabled) {
  filter: brightness(0.95);
}

.btn-default {
  height: 42px;
  color: hsl(var(--foreground));
  background: var(--ir-card);
  border: 1px solid var(--ir-border);
}

.btn-default:hover:not(:disabled) {
  background: hsl(var(--muted) / 0.5);
}

.btn-subtle {
  height: 28px;
  padding-inline: 8px;
  color: var(--ir-muted);
  background: transparent;
  border: none;
}

.btn-subtle:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.btn-icon {
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--ir-muted);
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.btn-icon:hover {
  color: var(--ir-destructive);
  background: hsl(var(--destructive) / 0.08);
}

.btn:disabled {
  cursor: not-allowed;
  color: var(--ir-muted);
  background: hsl(var(--muted));
  border-color: transparent;
  opacity: 0.7;
}

.btn:focus-visible,
.formats button:focus-visible,
.drop:focus-visible,
.btn-icon:focus-visible,
.back:focus-visible {
  outline: 2px solid var(--ir-primary);
  outline-offset: 2px;
}

.footer {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: var(--ir-card);
  border-top: 1px solid var(--ir-border);
}

.footer p {
  margin: 0;
  color: var(--ir-muted);
  font-size: 0.875rem;
}

.footer p.warn {
  color: var(--ir-destructive);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

@media (max-width: 960px) {
  .img-reducer {
    height: auto;
    min-height: 100dvh;
  }

  .app {
    height: auto;
    min-height: 100dvh;
  }

  .columns {
    grid-template-columns: 1fr;
  }

  .col {
    min-height: 360px;
  }

  .footer {
    align-items: stretch;
    flex-direction: column;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>
