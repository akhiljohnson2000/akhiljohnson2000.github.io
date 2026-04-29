<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { useDebounceFn, useEventListener, useMediaQuery } from '@vueuse/core'
import { ArrowLeft, Check, Copy, Download, FileText, PenSquare, Plus, X } from 'lucide-vue-next'
import pdfMakeModule from 'pdfmake/build/pdfmake'
import pdfFontsModule from 'pdfmake/build/vfs_fonts'

import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'
import CvResumeEditorForm from '@/components/cv/CvResumeEditorForm.vue'

import defaultCv from '@/data/cv-default.json'
import type { CvResume } from '@/types/cv-resume'
import { normalizeCvResume } from '@/lib/cv-normalize'
import { jsonKeysStructure } from '@/lib/json-structure'

const STORAGE_KEY_RESUME_LIBRARY = 'portfolio-resume-library-v1'
const STORAGE_KEY = 'portfolio-resume-json'
const STORAGE_KEY_LEGACY = 'portfolio-generate-cv-json'
const STORAGE_KEY_EDIT_MODE = 'portfolio-generate-cv-edit-mode'

type ResumeMeta = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

function makeResumeStorageKey(id: string) {
  return `portfolio-resume-json:${id}`
}

function nowMs() {
  return Date.now()
}

function generateResumeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `resume_${nowMs()}_${Math.random().toString(36).slice(2, 8)}`
}

function readEditMode(): 'json' | 'ui' {
  try {
    const s = localStorage.getItem(STORAGE_KEY_EDIT_MODE)
    if (s === 'json' || s === 'ui') return s
  } catch {
    /* ignore */
  }
  return 'ui'
}

function readResumeLibrary(): ResumeMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUME_LIBRARY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is ResumeMeta => !!item && typeof item === 'object')
      .map((item) => ({
        id: String(item.id ?? ''),
        name: String(item.name ?? ''),
        createdAt: Number(item.createdAt ?? 0),
        updatedAt: Number(item.updatedAt ?? 0),
      }))
      .filter((item) => item.id && item.name)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function saveResumeLibrary(list: ResumeMeta[]) {
  localStorage.setItem(STORAGE_KEY_RESUME_LIBRARY, JSON.stringify(list))
}

const isDesktop = useMediaQuery('(min-width: 768px)')

const editMode = ref<'json' | 'ui'>(readEditMode())

const resumeLibrary = ref<ResumeMeta[]>(readResumeLibrary())
const selectedResumeId = ref<string | null>(null)
const jsonText = ref(JSON.stringify(defaultCv, null, 2))
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
const exporting = ref(false)
const libraryCreateError = ref<string | null>(null)

const selectedResume = computed(() =>
  resumeLibrary.value.find((item) => item.id === selectedResumeId.value) ?? null,
)

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

function touchResume(id: string) {
  const t = nowMs()
  resumeLibrary.value = resumeLibrary.value
    .map((item) => (item.id === id ? { ...item, updatedAt: t } : item))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  saveResumeLibrary(resumeLibrary.value)
}

function loadResumeJsonById(id: string): string {
  const fallback = JSON.stringify(defaultCv, null, 2)
  try {
    const s = localStorage.getItem(makeResumeStorageKey(id))
    if (s) {
      JSON.parse(s)
      return s
    }
  } catch {
    /* ignore */
  }
  return fallback
}

function openResume(id: string) {
  const text = loadResumeJsonById(id)
  selectedResumeId.value = id
  jsonText.value = text
  parseError.value = null
  try {
    cvData.value = normalizeCvResume(JSON.parse(text))
  } catch {
    cvData.value = normalizeCvResume(defaultCv)
  }
  touchResume(id)
}

function goToLibrary() {
  selectedResumeId.value = null
  structureModalOpen.value = false
  parseError.value = null
}

function createResume() {
  const id = generateResumeId()
  const t = nowMs()
  const defaultName = `Resume ${resumeLibrary.value.length + 1}`
  const meta: ResumeMeta = { id, name: defaultName, createdAt: t, updatedAt: t }
  resumeLibrary.value = [meta, ...resumeLibrary.value]
  saveResumeLibrary(resumeLibrary.value)
  const seed = JSON.stringify(defaultCv, null, 2)
  localStorage.setItem(makeResumeStorageKey(id), seed)
  libraryCreateError.value = null
  openResume(id)
}

function renameResume(id: string) {
  const current = resumeLibrary.value.find((item) => item.id === id)
  if (!current) return
  const nextName = window.prompt('Rename resume', current.name)?.trim()
  if (!nextName) return
  const t = nowMs()
  resumeLibrary.value = resumeLibrary.value
    .map((item) => (item.id === id ? { ...item, name: nextName, updatedAt: t } : item))
    .sort((a, b) => b.updatedAt - a.updatedAt)
  saveResumeLibrary(resumeLibrary.value)
}

function migrateLegacyResumeIfNeeded() {
  if (resumeLibrary.value.length > 0) return
  let legacy: string | null = null
  try {
    legacy = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY_LEGACY)
    if (!legacy) return
    JSON.parse(legacy)
  } catch {
    return
  }
  const id = generateResumeId()
  const t = nowMs()
  resumeLibrary.value = [{ id, name: 'Resume 1', createdAt: t, updatedAt: t }]
  saveResumeLibrary(resumeLibrary.value)
  localStorage.setItem(makeResumeStorageKey(id), legacy)
}

migrateLegacyResumeIfNeeded()

function tryApplyJsonSync(): boolean {
  if (!selectedResumeId.value) return false
  try {
    const parsed = JSON.parse(jsonText.value)
    parseError.value = null
    cvData.value = normalizeCvResume(parsed)
    localStorage.setItem(makeResumeStorageKey(selectedResumeId.value), jsonText.value)
    touchResume(selectedResumeId.value)
    return true
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'Invalid JSON'
    return false
  }
}

function applyJson() {
  tryApplyJsonSync()
}

function formatJsonText() {
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    parseError.value = null
  } catch (e) {
    parseError.value = e instanceof Error ? e.message : 'Invalid JSON'
  }
}

function extractJsonErrorLine(message: string, text: string): number | null {
  const lineMatch = message.match(/line\s+(\d+)/i)
  if (lineMatch) {
    const line = Number.parseInt(lineMatch[1], 10)
    return Number.isFinite(line) && line > 0 ? line : null
  }

  const positionMatch = message.match(/position\s+(\d+)/i)
  if (!positionMatch) return null
  const pos = Number.parseInt(positionMatch[1], 10)
  if (!Number.isFinite(pos) || pos < 0) return null

  const snippet = text.slice(0, pos)
  return snippet.split('\n').length
}

const jsonErrorLine = computed(() => {
  if (editMode.value !== 'json' || !parseError.value) return null
  return extractJsonErrorLine(parseError.value, jsonText.value)
})

const jsonTextareaStyle = computed<Record<string, string>>(() => {
  if (!jsonErrorLine.value) return {} as Record<string, string>
  const lineHeightPx = 21
  const top = (jsonErrorLine.value - 1) * lineHeightPx
  const bottom = top + lineHeightPx
  return {
    backgroundImage: `linear-gradient(to bottom, transparent ${top}px, rgba(239,68,68,0.18) ${top}px, rgba(239,68,68,0.18) ${bottom}px, transparent ${bottom}px)`,
    backgroundRepeat: 'no-repeat',
  }
})

const debouncedApply = useDebounceFn(applyJson, 450)

watch(jsonText, () => {
  if (!selectedResumeId.value) return
  if (editMode.value !== 'json') return
  debouncedApply()
})

const debouncedSyncJsonFromCv = useDebounceFn(() => {
  if (!selectedResumeId.value) return
  jsonText.value = JSON.stringify(cvData.value, null, 2)
  try {
    localStorage.setItem(makeResumeStorageKey(selectedResumeId.value), jsonText.value)
    touchResume(selectedResumeId.value)
  } catch {
    /* ignore */
  }
  parseError.value = null
}, 450)

watch(
  cvData,
  () => {
    if (editMode.value !== 'ui') return
    debouncedSyncJsonFromCv()
  },
  { deep: true },
)

function setEditMode(mode: 'json' | 'ui') {
  if (mode === editMode.value) return
  if (mode === 'ui') {
    if (!tryApplyJsonSync()) return
    editMode.value = 'ui'
    try {
      localStorage.setItem(STORAGE_KEY_EDIT_MODE, 'ui')
    } catch {
      /* ignore */
    }
  } else {
    jsonText.value = JSON.stringify(cvData.value, null, 2)
    parseError.value = null
    editMode.value = 'json'
    try {
      localStorage.setItem(STORAGE_KEY_EDIT_MODE, 'json')
    } catch {
      /* ignore */
    }
  }
}

function buildPdfFilename(fullName: string) {
  const base = (fullName || 'Resume').replace(/\s+/g, '')
  const now = new Date()
  const d = now.getDate()
  const m = now.getMonth() + 1
  const y = String(now.getFullYear()).slice(-2)
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${base}_${d}-${m}-${y}_${hh}-${mm}.pdf`
}

function mkLinkLines(basics: CvResume['basics']) {
  return [basics.linkedin_url?.trim(), basics.github_url?.trim(), basics.portfolio_url?.trim()]
    .filter((url): url is string => !!url)
    .map((url) => ({
      text: url,
      link: url,
      color: '#1e3a8a',
      decoration: 'underline',
      margin: [0, 0, 0, 1],
    }))
}

function nonEmptyLines(values: string[]) {
  return values.map((v) => v.trim()).filter(Boolean)
}

function pdfSectionHeader(title: string) {
  return {
    margin: [0, 5, 0, 6],
    stack: [
      { text: title, style: 'sectionTitle', fontSize: 9 },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 535,
            y2: 0,
            lineWidth: .5,
            lineColor: '#111827',
          },
        ],
      },
    ],
  }
}

let pdfMakeReady = false

function getPdfMake() {
  const pdfMake = (pdfMakeModule as any).default ?? pdfMakeModule
  if (!pdfMakeReady) {
    const fonts = (pdfFontsModule as any).default ?? pdfFontsModule
    const vfs = fonts?.vfs ?? fonts?.pdfMake?.vfs ?? fonts

    if (!vfs || typeof vfs !== 'object') {
      throw new Error('Could not initialize pdf fonts (vfs).')
    }
    if (typeof pdfMake.addVirtualFileSystem === 'function') {
      pdfMake.addVirtualFileSystem(vfs)
    } else {
      pdfMake.vfs = vfs
    }
    pdfMakeReady = true
  }
  return pdfMake
}

function buildPdfDocDefinition(data: CvResume): any {
  const b = data.basics
  const contactLine = [
    b.email?.trim(),
    b.phone?.trim(),
    [b.location_city, b.location_state, b.location_country].map((x) => x?.trim()).filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' | ')

  const linkLines = mkLinkLines(b)
  const headerMetaBlocks: any[] = []
  if (contactLine) headerMetaBlocks.push({ text: contactLine, margin: [0, 0, 0, linkLines.length ? 1 : 8] })
  if (linkLines.length) headerMetaBlocks.push({ stack: linkLines, margin: [0, 0, 0, 8] })

  const summaryParagraphs = b.summary
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const workBlocks = data.work_experience
    .map((job) => {
      const responsibilities = nonEmptyLines(job.responsibilities)
      const companyLine = [job.company_name, job.location].filter(Boolean).join(' | ')
      const dateRange = [job.start_date, job.end_date].filter(Boolean).join(' — ')
      const hasTitle = !!job.job_title?.trim()

      const titleMarginBottom = responsibilities.length ? 2 : 6
      const companyMarginBottom = hasTitle ? 1 : titleMarginBottom

      const blocks: any[] = []

      // Left-aligned company text + right-aligned date range.
      if (dateRange) {
        blocks.push({
          columns: [
            { text: companyLine, bold: true },
            { text: dateRange, alignment: 'right' },
          ],
          columnGap: 10,
          margin: [0, 0, 0, companyMarginBottom],
        })
      } else {
        blocks.push({
          text: companyLine,
          bold: true,
          margin: [0, 0, 0, companyMarginBottom],
        })
      }

      if (hasTitle) {
        blocks.push({
          text: job.job_title,
          margin: [0, 0, 0, titleMarginBottom],
        })
      }

      if (responsibilities.length) {
        blocks.push({ ul: responsibilities, margin: [10, 0, 0, 6] })
      }

      return blocks
    })
    .flat()

  const educationBlocks = data.education
    .map((ed) => {
      const institutionWithGrade = [ed.institution_name?.trim(), ed.grade?.trim()]
        .filter(Boolean)
        .join(' - ')
      const dateRange = [ed.start_date?.trim(), ed.end_date?.trim()].filter(Boolean).join(' — ')
      const degreeAndField = [ed.degree?.trim(), ed.field_of_study?.trim()].filter(Boolean).join(' | ')

      const blocks: any[] = []
      if (institutionWithGrade || dateRange) {
        blocks.push({
          columns: [
            { text: institutionWithGrade, bold: true },
            { text: dateRange, alignment: 'right' },
          ],
          columnGap: 10,
          margin: [0, 0, 0, degreeAndField ? 1 : 6],
        })
      }
      if (degreeAndField) {
        blocks.push({
          text: degreeAndField,
          margin: [0, 0, 0, 6],
        })
      }
      return blocks
    })
    .flat()

  const projectBlocks = data.projects
    .map((project) => {
      const responsibilities = nonEmptyLines(project.responsibilities ?? [])
      const details = [
        [project.role, [project.start_date, project.end_date].filter(Boolean).join(' — ')]
          .filter(Boolean)
          .join(' | '),
        project.description?.trim(),
        project.technologies?.filter(Boolean).length
          ? `Technologies: ${project.technologies.filter(Boolean).join(', ')}`
          : '',
        project.project_url?.trim() ? `URL: ${project.project_url.trim()}` : '',
      ].filter(Boolean)
      const blocks: any[] = [{ text: project.project_name?.trim(), bold: true, margin: [0, 0, 0, 1] }]
      if (details.length) {
        blocks.push({ text: details.join('\n'), margin: [0, 0, 0, responsibilities.length ? 2 : 6] })
      }
      if (responsibilities.length) {
        blocks.push({ ul: responsibilities, margin: [10, 0, 0, 6] })
      }
      return blocks
    })
    .flat()
    .filter((item) => item.text || item.ul)

  return {
    pageSize: 'A4',
    pageMargins: [28, 42, 28, 42],
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.1,
    },
    styles: {
      name: { fontSize: 24, bold: true, margin: [0, 0, 0, 0]},
        // Reduce vertical gap to the next "address" line by ~0.1mm.
        // pdfmake margins are in points; 0.1mm ≈ 0.28pt.
        headline: { fontSize: 11, margin: [0, 0, 0, 2] },
      sectionTitle: { fontSize: 11, bold: true, characterSpacing: 1, margin: [0, 0, 0, 2] },
    },
    content: [
      { text: b.full_name || 'Your Name', style: 'name' },
      ...(b.headline?.trim() ? [{ text: b.headline.trim(), style: 'headline' }] : []),
      ...headerMetaBlocks,
      ...(summaryParagraphs.length
        ? [
            pdfSectionHeader('SUMMARY'),
            ...summaryParagraphs.map((p) => ({ text: p, margin: [0, 0, 0, 4] })),
          ]
        : []),
      ...(workBlocks.length
        ? [pdfSectionHeader('EXPERIENCE'), ...workBlocks]
        : []),
      ...(educationBlocks.length
        ? [pdfSectionHeader('EDUCATION'), ...educationBlocks]
        : []),
      ...(data.skills.filter((x) => x.trim()).length
        ? [
            pdfSectionHeader('SKILLS'),
            ...data.skills
              .filter((x) => x.trim())
              .map((skill) => ({ text: skill.trim(), margin: [0, 0, 0, 2] })),
          ]
        : []),
      ...(data.projects.filter((p) => p.project_name?.trim() || p.description?.trim()).length
        ? [pdfSectionHeader('PROJECTS'), ...projectBlocks]
        : []),
      ...(data.languages.filter((l) => l.language.trim()).length
        ? [
            pdfSectionHeader('LANGUAGES'),
            ...data.languages
              .filter((l) => l.language.trim())
              .map((l) => ({
                text: [l.language.trim(), l.proficiency.trim()].filter(Boolean).join(' — '),
                margin: [0, 0, 0, 2],
              })),
          ]
        : []),
      ...(data.certifications.filter((c) => c.name.trim()).length
        ? [
            pdfSectionHeader('CERTIFICATIONS'),
            ...data.certifications
              .filter((c) => c.name.trim())
              .map((c) => ({
                text: [
                  c.name.trim(),
                  [c.issuing_organization.trim(), c.issue_date.trim()].filter(Boolean).join(' | '),
                  c.credential_url.trim(),
                ]
                  .filter(Boolean)
                  .join('\n'),
                margin: [0, 0, 0, 6],
              })),
          ]
        : []),
      ...(data.achievements.filter((a) => a.trim()).length
        ? [
            pdfSectionHeader('KEY STRENGTHS'),
            { ul: data.achievements.filter((a) => a.trim()), margin: [10, 0, 0, 4] },
          ]
        : []),
      ...(data.keywords.filter((k) => k.trim()).length
        ? [
            pdfSectionHeader('KEYWORDS'),
            { text: data.keywords.filter((k) => k.trim()).join(' · ') },
          ]
        : []),
    ],
  }
}

async function exportPdf() {
  if (!selectedResumeId.value || parseError.value || exporting.value) return
  exporting.value = true
  try {
    const pdfMake = getPdfMake()
    const docDefinition = buildPdfDocDefinition(cvData.value)
    pdfMake.createPdf(docDefinition).download(buildPdfFilename(cvData.value.basics.full_name))
  } catch (e) {
    console.error(e)
    parseError.value = e instanceof Error ? e.message : 'Could not export PDF'
  } finally {
    exporting.value = false
  }
}

/** Mobile: show one panel at a time; desktop: both columns always visible */
const jsonPanelClass = computed(() => {
  return isDesktop.value
    ? 'flex min-h-0 min-w-0 flex-1 flex-col border-border'
    : 'flex min-h-0 flex-1 flex-col border-b border-border'
})

</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <div class="flex flex-col flex-1 min-h-0">
    <header
      class="border-b border-border/60 bg-background/95 backdrop-blur p-0 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10"
    >
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 px-2 py-2">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="All resumes"
          @click="goToLibrary"
        >
          <ArrowLeft class="h-5 w-5" aria-hidden="true" />
        </button>
        <span v-if="selectedResume" class="text-sm text-muted-foreground">
          {{ selectedResume.name }}
        </span>
        <div
          v-if="selectedResumeId"
          class="relative inline-grid h-9 min-w-[15.5rem] shrink-0 grid-cols-2 items-stretch rounded-full border border-border/80 bg-muted/70 p-1 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
          role="group"
          aria-label="Editor mode: Text fields or JSON"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-pink-500 shadow-md shadow-pink-500/25 transition-[left,box-shadow] duration-200 ease-out dark:bg-pink-600 dark:shadow-pink-600/30"
            :class="editMode === 'ui' ? 'left-1' : 'left-[calc(50%+2px)]'"
          />
          <button
            type="button"
            class="relative z-10 flex items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-tight tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xs"
            :class="editMode === 'ui' ? 'text-white' : 'text-muted-foreground hover:text-foreground'"
            :aria-pressed="editMode === 'ui'"
            @click="setEditMode('ui')"
          >
            Text fields
          </button>
          <button
            type="button"
            class="relative z-10 flex items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-tight tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-xs"
            :class="editMode === 'json' ? 'text-white' : 'text-muted-foreground hover:text-foreground'"
            :aria-pressed="editMode === 'json'"
            @click="setEditMode('json')"
          >
            JSON
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2 shrink-0 px-2 py-2">
        <Button v-if="selectedResumeId" type="button" size="sm" :disabled="!!parseError || exporting" @click="exportPdf">
          <Download class="h-4 w-4" />
          {{ exporting ? 'Exporting…' : 'Export' }}
        </Button>
      </div>
    </header>

    <div
      class="flex flex-1 flex-col min-h-0 overflow-hidden px-4 sm:px-6 md:px-10 lg:px-12"
    >
      <section v-if="!selectedResumeId" class="flex flex-1 flex-col">
        <div class="flex items-center justify-between gap-3 py-3 border-b border-border/60">
          <p class="text-sm text-muted-foreground">
            Create multiple resumes and manage them as separate tiles.
          </p>
          <Button type="button" size="sm" @click="createResume">
            <Plus class="h-4 w-4" />
            New resume
          </Button>
        </div>
        <div class="py-4">
          <p v-if="libraryCreateError" class="text-sm text-destructive mb-3">{{ libraryCreateError }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              type="button"
              class="group min-h-36 rounded-lg border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2"
              @click="createResume"
            >
              <Plus class="h-6 w-6 text-pink-600" />
              <span class="text-sm font-medium">Create new resume</span>
            </button>

            <div
              v-for="item in resumeLibrary"
              :key="item.id"
              class="rounded-lg border border-border bg-card/50 p-4 flex flex-col gap-3"
            >
              <button
                type="button"
                class="text-left min-h-16"
                @click="openResume(item.id)"
              >
                <div class="flex items-start gap-2">
                  <FileText class="h-4 w-4 mt-0.5 text-pink-600 shrink-0" />
                  <div class="min-w-0">
                    <div class="font-medium break-words">{{ item.name }}</div>
                    <p class="text-xs text-muted-foreground mt-1">
                      Updated {{ new Date(item.updatedAt).toLocaleString() }}
                    </p>
                  </div>
                </div>
              </button>
              <div class="flex justify-end">
                <Button type="button" variant="outline" size="sm" @click="renameResume(item.id)">
                  <PenSquare class="h-4 w-4" />
                  Rename
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else :class="jsonPanelClass">
        <div
          class="flex border-b border-border/60 p-0 shrink-0 flex-wrap items-center justify-between gap-2 py-2"
        >
          <span v-if="parseError" class="text-sm text-destructive shrink-0">
            {{ parseError }}<span v-if="jsonErrorLine"> (line {{ jsonErrorLine }})</span>
          </span>
          <span v-else-if="editMode === 'json'" class="text-xs text-muted-foreground shrink-0 min-w-0">
            JSON is saved in this browser (localStorage). Invalid JSON will not apply until fixed.
          </span>
          <span v-else class="text-xs text-muted-foreground shrink-0 min-w-0">
            Edits are saved in this browser (localStorage) and used when you export.
          </span>
          <div v-if="editMode === 'json'" class="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="shrink-0"
              @click="openStructureModal"
            >
              View JSON structure
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="shrink-0"
              @click="formatJsonText"
            >
              Format
            </Button>
          </div>
        </div>
        <div v-if="editMode === 'ui'" class="flex flex-1 min-h-0 flex-col overflow-y-auto py-3">
          <CvResumeEditorForm v-model="cvData" />
        </div>
        <div v-else class="flex flex-1 min-h-0 flex-col p-0 gap-1 overflow-y-auto">
          <Textarea
            v-model="jsonText"
            autosize
            :rows="2"
            :class="
              parseError
                ? 'min-h-[min(50vh,28rem)] font-mono text-[13px] leading-relaxed border-destructive focus-visible:ring-destructive'
                : 'min-h-[min(50vh,28rem)] font-mono text-[13px] leading-relaxed'
            "
            :style="jsonTextareaStyle"
            placeholder="{ ... }"
          />
        </div>
      </section>

    </div>
    </div>

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
