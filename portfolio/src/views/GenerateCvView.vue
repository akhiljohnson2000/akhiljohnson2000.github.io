<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useDebounceFn, useEventListener, useMediaQuery, useResizeObserver } from '@vueuse/core'
import { RouterLink, useRouter } from 'vue-router'
import { Check, Copy, Download, Home, X } from 'lucide-vue-next'
import type { jsPDF } from 'jspdf'

import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import CvResumePageContent from '@/components/cv/CvResumePageContent.vue'

import defaultCv from '@/data/cv-default.json'
import type { CvResume } from '@/types/cv-resume'
import { normalizeCvResume } from '@/lib/cv-normalize'
import { jsonKeysStructure } from '@/lib/json-structure'

const STORAGE_KEY = 'portfolio-resume-json'
const STORAGE_KEY_LEGACY = 'portfolio-generate-cv-json'

function readStoredJson(): string {
  const fallback = JSON.stringify(defaultCv, null, 2)
  try {
    const s = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY_LEGACY)
    if (s) {
      JSON.parse(s)
      return s
    }
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY_LEGACY)
    } catch {
      /* ignore */
    }
  }
  return fallback
}

const activeTab = ref<'preview' | 'edit'>('preview')
/** md breakpoint — side-by-side JSON + preview; below this, show “desktop only” message */
const isDesktop = useMediaQuery('(min-width: 768px)')

const router = useRouter()

function goBackFromMobileGate() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/services')
  }
}

const jsonText = ref(readStoredJson())
const parseError = ref<string | null>(null)
const cvData = ref<CvResume>(
  (() => {
    try {
      return normalizeCvResume(JSON.parse(jsonText.value))
    } catch {
      return normalizeCvResume(defaultCv)
    }
  })(),
)
const cvPreviewRef = ref<HTMLElement | null>(null)
const exporting = ref(false)

const structureModalOpen = ref(false)
const structureCopied = ref(false)
let structureCopyResetTimer: ReturnType<typeof setTimeout> | null = null

/** Keys-only tree from current JSON when valid; otherwise from the default template. */
const structureFromCurrentJson = computed(() => {
  try {
    return jsonKeysStructure(JSON.parse(jsonText.value))
  } catch {
    return jsonKeysStructure(defaultCv)
  }
})

const structureJsonString = computed(() =>
  JSON.stringify(structureFromCurrentJson.value, null, 2),
)

function openStructureModal() {
  structureModalOpen.value = true
}

function closeStructureModal() {
  structureModalOpen.value = false
  structureCopied.value = false
  if (structureCopyResetTimer) {
    clearTimeout(structureCopyResetTimer)
    structureCopyResetTimer = null
  }
}

async function copyStructureToClipboard() {
  try {
    await navigator.clipboard.writeText(structureJsonString.value)
    structureCopied.value = true
    if (structureCopyResetTimer) clearTimeout(structureCopyResetTimer)
    structureCopyResetTimer = setTimeout(() => {
      structureCopied.value = false
      structureCopyResetTimer = null
    }, 2500)
  } catch {
    structureCopied.value = false
  }
}

onUnmounted(() => {
  if (structureCopyResetTimer) clearTimeout(structureCopyResetTimer)
})

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && structureModalOpen.value) closeStructureModal()
})

/** A4 viewport height in px (one frame); used with translateY for stacked page previews. */
const previewPageCount = ref(1)
const pageSliceHeightPx = ref(0)

function measurePreviewPages() {
  const root = cvPreviewRef.value
  if (!root) return
  const firstSlide = root.querySelector('.cv-page-slide') as HTMLElement | null
  const firstInner = root.querySelector('.cv-page-slide-inner') as HTMLElement | null
  if (!firstSlide || !firstInner) return
  /*
   * Slice height = .cv-page-slide viewport (must match translateY step).
   * firstInner.scrollHeight includes .cv-page-slide-inner padding-bottom (4lh) so page count stays aligned.
   */
  let vh = firstSlide.clientHeight
  if (vh <= 0) {
    vh = firstSlide.offsetHeight
  }
  if (vh <= 0) {
    const parsed = parseFloat(getComputedStyle(firstSlide).height)
    vh = Number.isFinite(parsed) ? parsed : 0
  }
  const ch = firstInner.scrollHeight
  if (vh <= 0 || ch <= 0) return
  pageSliceHeightPx.value = vh
  previewPageCount.value = Math.max(1, Math.ceil(ch / vh - 1e-9))
}

function updatePreviewPageCount() {
  nextTick(() => {
    /* Double rAF: mm-based slide height must settle before offsetHeight is valid. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measurePreviewPages()
        /* If slide still reports 0, retry once after layout (do not use frame height — it breaks slices). */
        if (pageSliceHeightPx.value <= 0) {
          setTimeout(() => measurePreviewPages(), 50)
        }
      })
    })
  })
}

const debouncedPreviewLayout = useDebounceFn(updatePreviewPageCount, 200)

watch(
  () => cvData.value,
  () => {
    debouncedPreviewLayout()
  },
  { deep: true },
)

onMounted(() => {
  updatePreviewPageCount()
})

useResizeObserver(cvPreviewRef, () => {
  debouncedPreviewLayout()
})

function buildPdfFilename(fullName: string) {
  const base = (fullName || 'Resume').replace(/\s+/g, '')
  const now = new Date()
  const d = now.getDate()
  const m = now.getMonth() + 1
  const y = String(now.getFullYear()).slice(-2)
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  // Mirrors "22/3/26_16:45" using filesystem-safe separators.
  return `${base}_${d}-${m}-${y}_${hh}-${mm}.pdf`
}

function applyJson() {
  try {
    const parsed = JSON.parse(jsonText.value)
    parseError.value = null
    cvData.value = normalizeCvResume(parsed)
    localStorage.setItem(STORAGE_KEY, jsonText.value)
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'Invalid JSON'
  }
}

const debouncedApply = useDebounceFn(applyJson, 450)

watch(jsonText, () => {
  debouncedApply()
})

function resetToTemplate() {
  jsonText.value = JSON.stringify(defaultCv, null, 2)
  applyJson()
}

async function exportPdf() {
  if (parseError.value) return
  const el = cvPreviewRef.value
  if (!el) return
  exporting.value = true
  await nextTick()
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const pageEls = Array.from(el.querySelectorAll<HTMLElement>('.cv-page'))
    const targets = pageEls.length ? pageEls : [el]

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    let isFirst = true

    for (const pageEl of targets) {
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      if (!isFirst) pdf.addPage()
      isFirst = false
      addSingleA4PageImage(pdf, imgData, pageWidth, canvas.height, canvas.width)
    }

    pdf.save(buildPdfFilename(cvData.value.basics.full_name))
  } catch (e) {
    console.error(e)
    parseError.value = e instanceof Error ? e.message : 'Could not export PDF'
  } finally {
    exporting.value = false
  }
}

/** Mobile: show one panel at a time; desktop: both columns always visible */
const jsonPanelClass = computed(() => {
  if (isDesktop.value) {
    return 'flex min-h-0 min-w-0 flex-col border-border md:w-1/2 md:max-w-[50%] md:border-r md:border-b-0 border-b'
  }
  return activeTab.value === 'edit'
    ? 'flex min-h-0 flex-1 flex-col border-b border-border'
    : 'hidden'
})

const previewPanelClass = computed(() => {
  if (isDesktop.value) {
    return 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:w-1/2'
  }
  return activeTab.value === 'preview'
    ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
    : 'hidden'
})

/** Avoid an extra PDF page from float / sub-pixel height mismatch (common cause of “black” blank pages). */
const PDF_PAGE_SPLIT_EPS_MM = 3

function fillPdfPageWhite(pdf: jsPDF) {
  const w = pdf.internal.pageSize.getWidth()
  const h = pdf.internal.pageSize.getHeight()
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, w, h, 'F')
}

/** One preview frame ≈ A4; fit to PDF page. Fall back to vertical split if canvas is taller than A4. */
function addSingleA4PageImage(
  pdf: jsPDF,
  imgData: string,
  imgWidthMm: number,
  canvasHeightPx: number,
  canvasWidthPx: number,
) {
  const pageHeightMm = pdf.internal.pageSize.getHeight()
  const imgHeightMm = (canvasHeightPx * imgWidthMm) / canvasWidthPx
  fillPdfPageWhite(pdf)
  if (imgHeightMm <= pageHeightMm + 2) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm)
  } else {
    addCanvasToPdf(pdf, imgData, imgWidthMm, canvasHeightPx, canvasWidthPx)
  }
}

/** Append one canvas image to the PDF, splitting across PDF pages if taller than A4. */
function addCanvasToPdf(
  pdf: jsPDF,
  imgData: string,
  imgWidthMm: number,
  canvasHeightPx: number,
  canvasWidthPx: number,
) {
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeightMm = (canvasHeightPx * imgWidthMm) / canvasWidthPx
  let heightLeft = imgHeightMm
  let position = 0

  fillPdfPageWhite(pdf)
  pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
  heightLeft -= pageHeight

  while (heightLeft > PDF_PAGE_SPLIT_EPS_MM) {
    position = heightLeft - imgHeightMm
    pdf.addPage()
    fillPdfPageWhite(pdf)
    pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
    heightLeft -= pageHeight
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Mobile: desktop-only tool -->
    <div
      v-if="!isDesktop"
      class="flex flex-1 flex-col items-center justify-center p-0 text-center"
    >
      <p class="text-lg font-semibold text-foreground max-w-md">
        This page is not available on mobile devices.
      </p>
      <p class="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed px-2">
        The Resume Generator works best on a desktop or tablet browser. Please open this page on a larger screen.
      </p>
      <Button type="button" class="mt-4" @click="goBackFromMobileGate">
        Go back
      </Button>
    </div>

    <template v-else>
    <div class="flex flex-col flex-1 min-h-0">
    <header
      class="border-b border-border/60 bg-background/95 backdrop-blur p-0 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1 px-2 py-2">
        <RouterLink
          to="/"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Home"
        >
          <Home class="h-5 w-5" aria-hidden="true" />
        </RouterLink>
        <div class="min-w-0">
          <h1 class="text-lg font-semibold tracking-tight">Make Your Resume</h1>
          <p class="text-xs text-muted-foreground">
            <span class="md:hidden">Edit JSON or preview. </span>
            <span class="hidden md:inline">Edit JSON on the left and preview on the right. </span>
            Export matches a classic resume layout (white page, print-ready).
          </p>
        </div>
      </div>
      <!-- Desktop: Reset + Export only -->
      <div class="hidden md:flex flex-wrap items-center justify-end gap-2 shrink-0 px-2 py-2">
        <Button type="button" variant="outline" size="sm" @click="resetToTemplate">
          Reset Template
        </Button>
        <Button type="button" size="sm" :disabled="!!parseError || exporting" @click="exportPdf">
          <Download class="h-4 w-4" />
          {{ exporting ? 'Exporting…' : 'Export' }}
        </Button>
      </div>
      <!-- Mobile: tab switchers + actions per tab -->
      <div class="flex md:hidden flex-wrap items-center justify-end gap-2 shrink-0 w-full sm:w-auto px-2 py-2">
        <template v-if="activeTab === 'preview'">
          <Button type="button" variant="outline" size="sm" @click="activeTab = 'edit'">
            Edit JSON
          </Button>
          <Button type="button" size="sm" :disabled="!!parseError || exporting" @click="exportPdf">
            <Download class="h-4 w-4" />
            {{ exporting ? 'Exporting…' : 'Export' }}
          </Button>
        </template>
        <template v-else>
          <Button type="button" variant="outline" size="sm" @click="activeTab = 'preview'">
            Preview
          </Button>
          <Button type="button" variant="outline" size="sm" @click="resetToTemplate">
            Reset Template
          </Button>
        </template>
      </div>
    </header>

    <div class="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
      <!-- JSON editor -->
      <section :class="jsonPanelClass">
        <div
          class="hidden md:flex border-b border-border/60 p-0 shrink-0 items-center justify-between gap-2 px-2 py-2"
        >
          <span class="text-xs font-medium text-muted-foreground">JSON</span>
          <Button type="button" variant="outline" size="sm" @click="openStructureModal">
            View JSON structure
          </Button>
        </div>
        <div class="flex flex-1 min-h-0 flex-col p-0 gap-1">
          <p v-if="parseError" class="text-sm text-destructive shrink-0">
            {{ parseError }}
          </p>
          <p v-else class="text-xs text-muted-foreground shrink-0">
            JSON is saved in this browser (localStorage). Invalid JSON will not update the preview until fixed.
          </p>
          <Textarea
            v-model="jsonText"
            class="min-h-[50vh] md:min-h-0 md:flex-1 font-mono text-[13px] leading-relaxed resize-none"
            placeholder="{ ... }"
          />
        </div>
      </section>

      <!-- Preview -->
      <section :class="previewPanelClass">
        <div class="hidden md:block border-b border-border/60 p-0 shrink-0 bg-zinc-200/50 dark:bg-zinc-900/50 px-2 py-2">
          <span class="text-xs font-medium text-muted-foreground">Preview</span>
        </div>
        <div
          class="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden bg-zinc-200/80 dark:bg-zinc-950/80"
        >
          <div class="w-full max-w-full m-0 p-0">
            <div
              ref="cvPreviewRef"
              class="cv-preview-pages cv-print-root flex flex-col gap-0 leading-[1.45]"
            >
              <!-- Outer: 210×297mm A4. Inner text: 20mm margin on all sides (170×257mm content box). -->
              <section
                v-for="pageIndex in previewPageCount"
                :key="pageIndex"
                class="cv-page cv-page-frame bg-white text-gray-900 shadow-lg border border-black/10 overflow-hidden"
                :aria-label="`Resume page ${pageIndex}`"
              >
                <!-- translateY must be on the inner, not the slide: moving the slide scrolls the whole
                     clipping box and does not reveal lower content (2nd page looked blank). -->
                <div class="cv-page-slide">
                  <div
                    class="cv-page-slide-inner"
                    :style="{
                      transform: `translateY(-${(pageIndex - 1) * pageSliceHeightPx}px)`,
                    }"
                  >
                    <CvResumePageContent :cv-data="cvData" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
    </template>

    <Teleport to="body">
      <div
        v-if="structureModalOpen"
        class="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden overscroll-contain"
        role="presentation"
      >
        <!-- Blurred dimmed layer behind the dialog -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-md"
          aria-hidden="true"
          @click="closeStructureModal"
        />
        <!-- Scrollable column: centers modal when short; page scrolls when tall -->
        <div
          class="relative z-10 flex min-h-full w-full justify-center p-4 py-8 sm:p-6 sm:py-10"
        >
          <div
            class="my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl max-h-[min(85vh,720px)] min-h-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="json-structure-heading"
            @click.stop
          >
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h2 id="json-structure-heading" class="text-base font-semibold tracking-tight">
                JSON structure
              </h2>
              <button
                type="button"
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Close"
                @click="closeStructureModal"
              >
                <X class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div
              class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 [scrollbar-gutter:stable]"
            >
              <pre
                class="text-[12px] font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words"
              >{{ structureJsonString }}</pre>
            </div>
            <div class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border bg-muted/30 px-4 py-3">
              <Button type="button" variant="outline" size="sm" @click="closeStructureModal">
                Close
              </Button>
              <Button type="button" size="sm" @click="copyStructureToClipboard">
                <Check v-if="structureCopied" class="h-4 w-4 shrink-0" aria-hidden="true" />
                <Copy v-else class="h-4 w-4 shrink-0" aria-hidden="true" />
                {{ structureCopied ? 'Copied' : 'Copy structure' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/*
 * Fixed px sizes only — no breakpoints. Preview looks the same at every viewport width
 * (only line wraps change when the column is narrow).
 */
.cv-preview-pages {
  box-sizing: border-box;
  font-size: 13px;
  /* Body copy: 1.45 line-height minus 0.65 mm */
  line-height: calc(1.45em - 0.65mm);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/*
 * ISO 216 A4 — outer: 210mm × 297mm.
 * Inner content area: 20mm margins on top, bottom, left, right → 170mm × 257mm usable.
 */
.cv-page-frame {
  --cv-a4-margin-left-right: 10mm;
  --cv-a4-margin-top-bottom: 12mm;
  box-sizing: border-box;
  width: 210mm;
  max-width: 100%;
  height: 297mm;
  margin: 0 auto;
  padding: var(--cv-a4-margin-top-bottom) var(--cv-a4-margin-left-right);
  overflow: hidden;
}

.cv-page-slide {
  /* Fixed viewport; inner is translated inside this clip for multi-page preview. */
  width: 100%;
  height: calc(297mm - 2 * var(--cv-a4-margin-top-bottom));
  max-height: calc(297mm - 2 * var(--cv-a4-margin-top-bottom));
  box-sizing: border-box;
  overflow: hidden;
}

.cv-page-slide-inner {
  min-height: 0;
  will-change: transform;
  box-sizing: border-box;
  line-height: inherit;
  /* ~4 lines of breathing room; lh matches inherited line-height (same offset as body) */
  padding-bottom: calc(4 * (1.45em - 0.65mm));
  padding-bottom: 4lh;
}
</style>
