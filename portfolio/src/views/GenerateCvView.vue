<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import { Download, Home } from 'lucide-vue-next'
import type { jsPDF } from 'jspdf'

import Button from '@/components/ui/Button.vue'
import Textarea from '@/components/ui/Textarea.vue'

import defaultCv from '@/data/cv-default.json'
import type { CvResume } from '@/types/cv-resume'
import { normalizeCvResume } from '@/lib/cv-normalize'

const STORAGE_KEY = 'portfolio-generate-cv-json'

function readStoredJson(): string {
  const fallback = JSON.stringify(defaultCv, null, 2)
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) {
      JSON.parse(s)
      return s
    }
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
  return fallback
}

const activeTab = ref<'preview' | 'edit'>('preview')
/** md breakpoint — side-by-side JSON + preview */
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
const cvPreviewRef = ref<HTMLElement | null>(null)
const exporting = ref(false)

function formatLocation(b: CvResume['basics']) {
  const parts = [b.location_city, b.location_state, b.location_country].filter(Boolean)
  return parts.join(', ')
}

type ContactHeaderPart =
  | { kind: 'text'; text: string }
  | { kind: 'link'; label: string; href: string }

/** Single line: email | phone | address | LinkedIn | GitHub | Portfolio (only non-empty parts). */
const contactHeaderParts = computed((): ContactHeaderPart[] => {
  const b = cvData.value.basics
  const parts: ContactHeaderPart[] = []

  const email = (b.email || '').trim()
  if (email) parts.push({ kind: 'text', text: email })

  const phone = (b.phone || '').trim()
  if (phone) parts.push({ kind: 'text', text: phone })

  const loc = formatLocation(b)
  if (loc) parts.push({ kind: 'text', text: loc })

  const li = (b.linkedin_url || '').trim()
  if (li) parts.push({ kind: 'link', label: 'LinkedIn', href: li })

  const gh = (b.github_url || '').trim()
  if (gh) parts.push({ kind: 'link', label: 'GitHub', href: gh })

  const po = (b.portfolio_url || '').trim()
  if (po) parts.push({ kind: 'link', label: 'Portfolio', href: po })

  return parts
})

function summaryParagraphs(summary: string) {
  return summary
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function buildPdfFilename(fullName: string) {
  const base = (fullName || 'CV').replace(/\s+/g, '')
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
      addCanvasToPdf(pdf, imgData, pageWidth, canvas.height, canvas.width)
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
    ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
    : 'hidden'
})

/** Page 2: everything after Experience (education, skills, projects, etc.). */
const hasSecondPage = computed(() => {
  const d = cvData.value
  return (
    d.education.length > 0 ||
    d.skills.some((s) => s.trim()) ||
    d.projects.length > 0 ||
    d.certifications.length > 0 ||
    d.languages.length > 0 ||
    d.achievements.some((a) => a.trim()) ||
    d.keywords.some((k) => k.trim())
  )
})

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

  pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm)
    heightLeft -= pageHeight
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background pt-4 md:pt-6">
    <header
      class="border-b border-border/60 bg-background/95 backdrop-blur px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10"
    >
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <RouterLink
          to="/"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Home"
        >
          <Home class="h-5 w-5" aria-hidden="true" />
        </RouterLink>
        <div class="min-w-0">
          <h1 class="text-lg font-semibold tracking-tight">Generate CV</h1>
          <p class="text-xs text-muted-foreground">
            <span class="md:hidden">Edit JSON or preview. </span>
            <span class="hidden md:inline">Edit JSON on the left and preview on the right. </span>
            Export matches the classic CV layout (white page, print-ready).
          </p>
        </div>
      </div>
      <!-- Desktop: Reset + Export only -->
      <div class="hidden md:flex flex-wrap items-center justify-end gap-2 shrink-0">
        <Button type="button" variant="outline" size="sm" @click="resetToTemplate">
          Reset Template
        </Button>
        <Button type="button" size="sm" :disabled="!!parseError || exporting" @click="exportPdf">
          <Download class="h-4 w-4" />
          {{ exporting ? 'Exporting…' : 'Export' }}
        </Button>
      </div>
      <!-- Mobile: tab switchers + actions per tab -->
      <div class="flex md:hidden flex-wrap items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
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
        <div class="hidden md:block border-b border-border/60 px-4 py-2 shrink-0">
          <span class="text-xs font-medium text-muted-foreground">JSON</span>
        </div>
        <div class="flex flex-1 min-h-0 flex-col px-4 py-3 gap-2">
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
        <div class="hidden md:block border-b border-border/60 px-4 py-2 shrink-0 bg-zinc-200/50 dark:bg-zinc-900/50">
          <span class="text-xs font-medium text-muted-foreground">Preview</span>
        </div>
        <div class="flex-1 min-h-0 overflow-auto bg-zinc-200/80 dark:bg-zinc-950/80">
          <div class="min-h-full flex justify-center p-4 md:p-6">
            <div
              ref="cvPreviewRef"
              class="cv-preview-pages flex w-full max-w-[210mm] flex-col gap-8 text-[13px] leading-relaxed"
            >
              <!-- Page 1: profile, summary, experience -->
              <section class="cv-page cv-print-root bg-white text-gray-900 shadow-lg border border-black/10 px-8 py-10">
                <div class="flex items-center justify-between gap-3 border-b border-dashed border-gray-300 pb-2 mb-6">
                  <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Page 1</span>
                  <span class="text-[10px] text-gray-400">A4 preview</span>
                </div>
              <!-- Header -->
              <header class="mb-6">
                <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 uppercase">
                  {{ cvData.basics.full_name || 'Your Name' }}
                </h2>
                <p v-if="cvData.basics.headline" class="mt-1 text-[13px] text-gray-800">
                  {{ cvData.basics.headline }}
                </p>
                <p
                  v-if="contactHeaderParts.length"
                  class="mt-2 flex flex-wrap items-center gap-x-1.5 text-[12px] text-gray-800 tabular-nums"
                >
                  <template v-for="(part, i) in contactHeaderParts" :key="i">
                    <span v-if="i > 0" class="text-gray-500 select-none" aria-hidden="true"> | </span>
                    <a
                      v-if="part.kind === 'link'"
                      :href="part.href"
                      class="text-blue-800 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >{{ part.label }}</a>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </p>
              </header>

              <!-- Summary -->
              <section v-if="cvData.basics.summary" class="mb-6">
                <h3 class="cv-section-title">Summary</h3>
                <div class="space-y-2 text-[12px] text-gray-900">
                  <p v-for="(p, i) in summaryParagraphs(cvData.basics.summary)" :key="i" class="whitespace-pre-wrap">
                    {{ p }}
                  </p>
                </div>
              </section>

              <!-- Experience -->
              <section v-if="cvData.work_experience.length" class="mb-6">
                <h3 class="cv-section-title">Experience</h3>
                <div class="space-y-5">
                  <article v-for="(job, idx) in cvData.work_experience" :key="idx">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <div>
                        <span v-if="job.company_name" class="font-bold text-[13px] text-gray-900 uppercase">{{job.company_name + "&nbsp;"}} </span>
                        <span v-if="job.location" class="text-[12px] text-gray-800">{{job.location}}</span>
                      </div>
                      <div class="text-[11px] font-semibold uppercase text-gray-800 sm:text-right shrink-0">
                        {{ job.job_title }}
                        <span v-if="job.start_date || job.end_date" class="font-normal">
                          &nbsp;&nbsp;{{ job.start_date }} — {{ job.end_date }}
                        </span>
                      </div>
                    </div>
                    <ul
                      v-if="job.responsibilities.filter((r) => r.trim()).length"
                      class="mt-2 list-disc pl-5 space-y-1 text-[12px] text-gray-900"
                    >
                      <li v-for="(line, li) in job.responsibilities.filter((r) => r.trim())" :key="li">
                        {{ line }}
                      </li>
                    </ul>
                  </article>
                </div>
              </section>
              </section>

              <!-- Page 2: education, skills, and the rest -->
              <section
                v-if="hasSecondPage"
                class="cv-page cv-print-root bg-white text-gray-900 shadow-lg border border-black/10 px-8 py-10"
              >
                <div class="flex items-center justify-between gap-3 border-b border-dashed border-gray-300 pb-2 mb-6">
                  <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Page 2</span>
                  <span class="text-[10px] text-gray-400">A4 preview</span>
                </div>

              <!-- Education -->
              <section v-if="cvData.education.length" class="mb-6">
                <h3 class="cv-section-title">Education</h3>
                <div class="space-y-4">
                  <article v-for="(ed, idx) in cvData.education" :key="idx">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <div>
                        <div class="font-bold text-[13px] text-gray-900 uppercase">
                          {{ ed.institution_name }}
                        </div>
                        <div class="text-[12px] text-gray-800">
                          <span v-if="ed.degree">{{ ed.degree }}</span>
                          <span v-if="ed.field_of_study"> • {{ ed.field_of_study }}</span>
                          <span v-if="ed.grade" class="font-medium"> • {{ ed.grade }}</span>
                        </div>
                      </div>
                      <div class="text-[11px] uppercase text-gray-800 sm:text-right shrink-0">
                        {{ ed.start_date }} — {{ ed.end_date }}
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              <!-- Skills -->
              <section v-if="cvData.skills.filter((s) => s.trim()).length" class="mb-6">
                <h3 class="cv-section-title">Skills &amp; Competencies</h3>
                <div class="space-y-3">
                  <div
                    v-for="(skill, i) in cvData.skills.filter((s) => s.trim())"
                    :key="i"
                    class="flex gap-3"
                  >
                    <!-- <span class="text-[11px] font-bold text-gray-400 select-none w-6">#{{ i + 1 }}</span> -->
                    <p class="flex-1 text-[12px] text-gray-900 whitespace-pre-wrap">
                      {{ skill }}
                    </p>
                  </div>
                </div>
              </section>

              <!-- Projects -->
              <section v-if="cvData.projects.length" class="mb-6">
                <h3 class="cv-section-title">Projects</h3>
                <div class="space-y-4">
                  <article v-for="(proj, idx) in cvData.projects" :key="idx">
                    <div class="font-bold text-[13px] text-gray-900">{{ proj.project_name }}</div>
                    <p v-if="proj.description" class="text-[12px] text-gray-900 mt-1 whitespace-pre-wrap">
                      {{ proj.description }}
                    </p>
                    <div v-if="proj.technologies.filter((t) => t.trim()).length" class="text-[11px] mt-1 text-gray-800">
                      <span class="font-semibold">Tech:</span>
                      {{ proj.technologies.filter((t) => t.trim()).join(', ') }}
                    </div>
                    <div class="text-[11px] text-gray-800 mt-1">
                      <span v-if="proj.role">{{ proj.role }}</span>
                      <span v-if="proj.start_date || proj.end_date">
                        &nbsp;• {{ proj.start_date }} — {{ proj.end_date }}
                      </span>
                    </div>
                    <a
                      v-if="proj.project_url"
                      :href="proj.project_url"
                      class="text-[11px] text-blue-800 underline break-all"
                    >
                      {{ proj.project_url }}
                    </a>
                  </article>
                </div>
              </section>

              <!-- Certifications -->
              <section v-if="cvData.certifications.length" class="mb-6">
                <h3 class="cv-section-title">Certifications</h3>
                <div class="space-y-3">
                  <article v-for="(c, idx) in cvData.certifications" :key="idx" class="text-[12px] text-gray-900">
                    <div class="font-semibold">{{ c.name }}</div>
                    <div v-if="c.issuing_organization" class="text-gray-800">{{ c.issuing_organization }}</div>
                    <div class="text-[11px] text-gray-800">
                      <span v-if="c.issue_date">Issued {{ c.issue_date }}</span>
                      <span v-if="c.expiration_date">&nbsp;• Expires {{ c.expiration_date }}</span>
                    </div>
                    <div v-if="c.credential_id" class="text-[11px]">ID: {{ c.credential_id }}</div>
                    <a v-if="c.credential_url" :href="c.credential_url" class="text-[11px] text-blue-800 underline break-all">
                      {{ c.credential_url }}
                    </a>
                  </article>
                </div>
              </section>

              <!-- Languages -->
              <section v-if="cvData.languages.length" class="mb-6">
                <h3 class="cv-section-title">Languages</h3>
                <div class="space-y-2">
                  <div
                    v-for="(lang, i) in cvData.languages"
                    :key="i"
                    class="flex gap-3 text-[12px] text-gray-900"
                  >
                    <!-- <span class="text-[11px] font-bold text-gray-400 w-6">#{{ i + 1 }}</span> -->
                    <span>
                      {{ lang.language }}
                      <span v-if="lang.proficiency" class="text-gray-700"> — {{ lang.proficiency }}</span>
                    </span>
                  </div>
                </div>
              </section>

              <!-- Achievements / Key strengths -->
              <section v-if="cvData.achievements.filter((a) => a.trim()).length" class="mb-6">
                <h3 class="cv-section-title">Key Strengths</h3>
                <ul class="list-disc pl-5 space-y-1 text-[12px] text-gray-900">
                  <li v-for="(a, i) in cvData.achievements.filter((x) => x.trim())" :key="i">
                    {{ a }}
                  </li>
                </ul>
              </section>

              <!-- Keywords -->
              <section v-if="cvData.keywords.filter((k) => k.trim()).length">
                <h3 class="cv-section-title">Keywords</h3>
                <p class="text-[11px] text-gray-800 leading-snug">
                  {{ cvData.keywords.filter((k) => k.trim()).join(' · ') }}
                </p>
              </section>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-section-title {
  @apply text-[12px] font-bold tracking-[0.12em] uppercase text-gray-900 border-b border-gray-900 pb-1 mb-3;
}
.cv-print-root a {
  color: #1e3a8a;
}

/* A4-sized sheets in the preview (content can grow beyond one printed page). */
.cv-page {
  min-height: 297mm;
  box-sizing: border-box;
}
</style>
