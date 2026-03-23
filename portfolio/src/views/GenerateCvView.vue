<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { useDebounceFn, useEventListener, useMediaQuery } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import { Check, Copy, Download, Home, X } from 'lucide-vue-next'
import pdfMakeModule from 'pdfmake/build/pdfmake'
import pdfFontsModule from 'pdfmake/build/vfs_fonts'

import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'

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

/** md breakpoint — below this, show “desktop only” message */
const isDesktop = useMediaQuery('(min-width: 768px)')

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

function mkLinkRuns(basics: CvResume['basics']) {
  const entries = [
    { label: 'LinkedIn', url: basics.linkedin_url?.trim() || '' },
    { label: 'GitHub', url: basics.github_url?.trim() || '' },
    { label: 'Portfolio', url: basics.portfolio_url?.trim() || '' },
  ].filter((item) => item.url)

  // pdfmake supports mixed text fragments: [{text:'LinkedIn', link:'...'}, ' | ', ...]
  const runs: Array<Record<string, unknown>> = []
  entries.forEach((item, idx) => {
    if (idx > 0) runs.push({ text: ' | ' })
    runs.push({
      text: item.label,
      link: item.url,
      color: '#1e3a8a',
      decoration: 'underline',
    })
  })
  return runs
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

  const linksLine = mkLinkRuns(b)
  // Single "address" line: email/phone/location first, then clickable link labels.
  const addressAndLinksRuns: Array<Record<string, unknown>> = []
  if (contactLine) addressAndLinksRuns.push({ text: contactLine })
  if (contactLine && linksLine.length) addressAndLinksRuns.push({ text: ' | ' })
  addressAndLinksRuns.push(...linksLine)

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
      return [
        { text: project.project_name?.trim(), bold: true, margin: [0, 0, 0, 1] },
        { text: details.join('\n'), margin: [0, 0, 0, 6] },
      ]
    })
    .flat()
    .filter((item) => item.text)

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
      ...(addressAndLinksRuns.length ? [{ text: addressAndLinksRuns, margin: [0, 0, 0, 8] }] : []),
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
  if (parseError.value || exporting.value) return
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
  
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2 shrink-0 px-2 py-2">
        <Button type="button" size="sm" :disabled="!!parseError || exporting" @click="exportPdf">
          <Download class="h-4 w-4" />
          {{ exporting ? 'Exporting…' : 'Export' }}
        </Button>
      </div>
    </header>

    <div class="flex flex-1 flex-col min-h-0 overflow-hidden">
      <!-- JSON editor -->
      <section :class="jsonPanelClass">
        <div
          class="hidden md:flex border-b border-border/60 p-0 shrink-0 items-center justify-between gap-2 px-2 py-2"
        >
        <span v-if="parseError" class="text-sm text-destructive shrink-0">
            {{ parseError }}
        </span>
          <span v-else class="text-xs text-muted-foreground shrink-0">
            JSON is saved in this browser (localStorage). Invalid JSON will not update the preview until fixed.
          </span>
          <Button type="button" variant="outline" size="sm" @click="openStructureModal">
            View JSON structure
          </Button>
        </div>
        <div class="flex flex-1 min-h-0 flex-col p-0 gap-1">
          
          <Textarea
            v-model="jsonText"
            class="min-h-[50vh] md:min-h-0 md:flex-1 font-mono text-[13px] leading-relaxed resize-none"
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
