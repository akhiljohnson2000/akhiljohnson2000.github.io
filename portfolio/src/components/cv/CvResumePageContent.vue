<script setup lang="ts">
import { computed } from 'vue'
import type { CvResume } from '@/types/cv-resume'

const props = defineProps<{
  cvData: CvResume
}>()

function formatLocation(b: CvResume['basics']) {
  const parts = [b.location_city, b.location_state, b.location_country].filter(Boolean)
  return parts.join(', ')
}

type ContactHeaderPart =
  | { kind: 'text'; text: string }
  | { kind: 'link'; label: string; href: string }

const contactHeaderParts = computed((): ContactHeaderPart[] => {
  const b = props.cvData.basics
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
</script>

<template>
  <div class="cv-resume-body">
    <!-- Header -->
    <header class="mb-6">
      <h2 class="cv-preview-name font-bold tracking-tight text-gray-900 uppercase">
        {{ cvData.basics.full_name || 'Your Name' }}
      </h2>
      <p v-if="cvData.basics.headline" class="mt-2 text-gray-800 cv-preview-muted">
        {{ cvData.basics.headline }}
      </p>
      <p
        v-if="contactHeaderParts.length"
        class="mt-2 flex flex-wrap items-center gap-x-1.5 text-gray-800 tabular-nums cv-preview-contact"
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
      <div class="space-y-2 text-gray-900">
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
          <div class="flex flex-row items-start justify-between gap-3">
            <div class="min-w-0 pr-2">
              <span v-if="job.company_name" class="font-bold text-gray-900 uppercase cv-preview-strong">{{job.company_name + "&nbsp;"}} </span>
              <span v-if="job.location" class="text-gray-800">{{job.location}}</span>
            </div>
            <div class="font-semibold uppercase text-gray-800 text-right shrink-0 max-w-[48%] cv-preview-meta">
              <span v-if="job.start_date || job.end_date" class="font-normal">
                &nbsp;&nbsp;{{ job.start_date }} — {{ job.end_date }}
              </span>
            </div>
          </div>
          <span v-if="job.job_title" class="text-gray-800">{{job.job_title}}</span>
          <ul
            v-if="job.responsibilities.filter((r) => r.trim()).length"
            class="mt-2 list-disc pl-5 space-y-1 text-gray-900"
          >
            <li v-for="(line, li) in job.responsibilities.filter((r) => r.trim())" :key="li">
              {{ line }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Education -->
    <section v-if="cvData.education.length" class="mb-6">
      <h3 class="cv-section-title">Education</h3>
      <div class="space-y-4">
        <article v-for="(ed, idx) in cvData.education" :key="idx">
          <div class="flex flex-row items-start justify-between gap-3">
            <div class="min-w-0 pr-2">
              <div class="font-bold text-gray-900 uppercase cv-preview-strong">
                {{ ed.institution_name }}
              </div>
              <div class="text-gray-800">
                <span v-if="ed.degree">{{ ed.degree }}</span>
                <span v-if="ed.field_of_study"> • {{ ed.field_of_study }}</span>
                <span v-if="ed.grade" class="font-medium"> • {{ ed.grade }}</span>
              </div>
            </div>
            <div class="uppercase text-gray-800 text-right shrink-0 max-w-[48%] cv-preview-meta">
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
          <p class="flex-1 text-gray-900 whitespace-pre-wrap">
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
          <div class="font-bold text-gray-900 cv-preview-strong">{{ proj.project_name }}</div>
          <p v-if="proj.description" class="text-gray-900 mt-1 whitespace-pre-wrap">
            {{ proj.description }}
          </p>
          <div v-if="proj.technologies.filter((t) => t.trim()).length" class="mt-1 text-gray-800 cv-preview-meta">
            <span class="font-semibold">Tech:</span>
            {{ proj.technologies.filter((t) => t.trim()).join(', ') }}
          </div>
          <div class="text-gray-800 mt-1 cv-preview-meta">
            <span v-if="proj.role">{{ proj.role }}</span>
            <span v-if="proj.start_date || proj.end_date">
              &nbsp;• {{ proj.start_date }} — {{ proj.end_date }}
            </span>
          </div>
          <a
            v-if="proj.project_url"
            :href="proj.project_url"
            class="text-blue-800 underline break-all cv-preview-meta"
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
        <article v-for="(c, idx) in cvData.certifications" :key="idx" class="text-gray-900">
          <div class="font-semibold">{{ c.name }}</div>
          <div v-if="c.issuing_organization" class="text-gray-800">{{ c.issuing_organization }}</div>
          <div class="text-gray-800 cv-preview-meta">
            <span v-if="c.issue_date">Issued {{ c.issue_date }}</span>
            <span v-if="c.expiration_date">&nbsp;• Expires {{ c.expiration_date }}</span>
          </div>
          <div v-if="c.credential_id" class="cv-preview-meta">ID: {{ c.credential_id }}</div>
          <a v-if="c.credential_url" :href="c.credential_url" class="text-blue-800 underline break-all cv-preview-meta">
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
          class="flex gap-3 text-gray-900"
        >
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
      <ul class="list-disc pl-5 space-y-1 text-gray-900">
        <li v-for="(a, i) in cvData.achievements.filter((x) => x.trim())" :key="i">
          {{ a }}
        </li>
      </ul>
    </section>

    <!-- Keywords -->
    <section v-if="cvData.keywords.filter((k) => k.trim()).length">
      <h3 class="cv-section-title">Keywords</h3>
      <p class="text-gray-800 cv-preview-meta">
        {{ cvData.keywords.filter((k) => k.trim()).join(' · ') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.cv-preview-name {
  font-size: 30px;
  line-height: calc(1.15em - 1.15mm);
}

.cv-section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(17 24 39);
  border-bottom: 1px solid rgb(17 24 39);
  padding-bottom: .2rem;
  margin-bottom: 0.75rem;
  line-height: calc(1.2em - 1.15mm);
}

.cv-preview-meta {
  font-size: 11px;
  line-height: calc(1.45em - 1.65mm);
}

.cv-preview-strong {
  font-size: 13px;
}

.cv-preview-contact {
  font-size: 12px;
}

.cv-preview-muted {
  font-size: 13px;
}

.cv-resume-body :deep(a) {
  color: #1e3a8a;
}
</style>
