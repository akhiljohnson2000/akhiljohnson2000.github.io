<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'

import defaultCv from '@/data/cv-default.json'
import type {
  CvCertification,
  CvEducation,
  CvLanguage,
  CvProject,
  CvResume,
  CvWorkExperience,
} from '@/types/cv-resume'

const cv = defineModel<CvResume>({ required: true })

const d = defaultCv as CvResume

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

function newWork(): CvWorkExperience {
  return clone(d.work_experience[0] ?? {
    company_name: '',
    job_title: '',
    location: '',
    start_date: '',
    end_date: '',
    employment_type: '',
    responsibilities: [''],
  })
}

function newEducation(): CvEducation {
  return clone(d.education[0] ?? {
    institution_name: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
  })
}

function newLanguage(): CvLanguage {
  return clone(d.languages[0] ?? { language: '', proficiency: '' })
}

function newCertification(): CvCertification {
  return clone(d.certifications[0] ?? {
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
  })
}

function newProject(): CvProject {
  return clone(d.projects[0] ?? {
    project_name: '',
    description: '',
    responsibilities: [''],
    technologies: [''],
    role: '',
    start_date: '',
    end_date: '',
    project_url: '',
  })
}

function addWork() {
  cv.value.work_experience.push(newWork())
}

function removeWork(i: number) {
  cv.value.work_experience.splice(i, 1)
}

function addResponsibility(jobIdx: number) {
  cv.value.work_experience[jobIdx].responsibilities.push('')
}

function removeResponsibility(jobIdx: number, lineIdx: number) {
  const r = cv.value.work_experience[jobIdx].responsibilities
  r.splice(lineIdx, 1)
  if (r.length === 0) r.push('')
}

function addEducation() {
  cv.value.education.push(newEducation())
}

function removeEducation(i: number) {
  cv.value.education.splice(i, 1)
}

function addSkill() {
  cv.value.skills.push('')
}

function removeSkill(i: number) {
  cv.value.skills.splice(i, 1)
}

function addLanguage() {
  cv.value.languages.push(newLanguage())
}

function removeLanguage(i: number) {
  cv.value.languages.splice(i, 1)
}

function addCertification() {
  cv.value.certifications.push(newCertification())
}

function removeCertification(i: number) {
  cv.value.certifications.splice(i, 1)
}

function addProject() {
  cv.value.projects.push(newProject())
}

function removeProject(i: number) {
  cv.value.projects.splice(i, 1)
}

function addTech(projectIdx: number) {
  cv.value.projects[projectIdx].technologies.push('')
}

function removeTech(projectIdx: number, techIdx: number) {
  const t = cv.value.projects[projectIdx].technologies
  t.splice(techIdx, 1)
  if (t.length === 0) t.push('')
}

function addProjectResponsibility(projectIdx: number) {
  cv.value.projects[projectIdx].responsibilities.push('')
}

function removeProjectResponsibility(projectIdx: number, lineIdx: number) {
  const r = cv.value.projects[projectIdx].responsibilities
  r.splice(lineIdx, 1)
  if (r.length === 0) r.push('')
}

function addAchievement() {
  cv.value.achievements.push('')
}

function removeAchievement(i: number) {
  cv.value.achievements.splice(i, 1)
}

function addKeyword() {
  cv.value.keywords.push('')
}

function removeKeyword(i: number) {
  cv.value.keywords.splice(i, 1)
}
</script>

<template>
  <div class="cv-editor-form space-y-10 pb-8 [scrollbar-gutter:stable]">
    <!-- Basics -->
    <section class="space-y-4">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
        Basics
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-medium text-muted-foreground">Full name</label>
          <Input v-model="cv.basics.full_name" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-medium text-muted-foreground">Headline</label>
          <Input v-model="cv.basics.headline" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Email</label>
          <Input v-model="cv.basics.email" type="email" autocomplete="email" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Phone</label>
          <Input v-model="cv.basics.phone" type="tel" autocomplete="tel" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">City</label>
          <Input v-model="cv.basics.location_city" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">State / region</label>
          <Input v-model="cv.basics.location_state" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">Country</label>
          <Input v-model="cv.basics.location_country" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">LinkedIn URL</label>
          <Input v-model="cv.basics.linkedin_url" type="url" autocomplete="url" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-muted-foreground">GitHub URL</label>
          <Input v-model="cv.basics.github_url" type="url" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-medium text-muted-foreground">Portfolio URL</label>
          <Input v-model="cv.basics.portfolio_url" type="url" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="text-xs font-medium text-muted-foreground">Summary</label>
          <Textarea
            v-model="cv.basics.summary"
            autosize
            :rows="4"
            class="min-h-[5rem] font-sans text-sm leading-relaxed"
          />
        </div>
      </div>
    </section>

    <!-- Work experience -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Work experience
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addWork">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add job
        </Button>
      </div>
      <p v-if="!cv.work_experience.length" class="text-sm text-muted-foreground">
        No jobs yet. Click “Add job” to create one.
      </p>
      <div
        v-for="(job, ji) in cv.work_experience"
        :key="'job-' + ji"
        class="rounded-lg border border-border bg-card/40 p-4 space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">Job {{ ji + 1 }}</span>
          <Button type="button" variant="destructive" size="sm" @click="removeWork(ji)">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            Delete job
          </Button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Company</label>
            <Input v-model="job.company_name" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Job title</label>
            <Input v-model="job.job_title" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Location</label>
            <Input v-model="job.location" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Employment type</label>
            <Input v-model="job.employment_type" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Start date</label>
            <Input v-model="job.start_date" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">End date</label>
            <Input v-model="job.end_date" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-medium text-muted-foreground">Responsibilities</span>
            <Button type="button" variant="outline" size="sm" @click="addResponsibility(ji)">
              <Plus class="h-4 w-4" aria-hidden="true" />
              Add line
            </Button>
          </div>
          <div v-for="(_, ri) in job.responsibilities" :key="'r-' + ji + '-' + ri" class="flex gap-2">
            <Textarea
              v-model="job.responsibilities[ri]"
              autosize
              :rows="1"
              class="!min-h-0 flex-1 font-sans text-sm leading-normal"
              placeholder="Bullet point"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-10 w-10 shrink-0 self-start"
              aria-label="Remove responsibility"
              @click="removeResponsibility(ji, ri)"
            >
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Education
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addEducation">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add education
        </Button>
      </div>
      <p v-if="!cv.education.length" class="text-sm text-muted-foreground">
        No entries yet.
      </p>
      <div
        v-for="(ed, ei) in cv.education"
        :key="'ed-' + ei"
        class="rounded-lg border border-border bg-card/40 p-4 space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">School {{ ei + 1 }}</span>
          <Button type="button" variant="destructive" size="sm" @click="removeEducation(ei)">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Institution</label>
            <Input v-model="ed.institution_name" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Degree</label>
            <Input v-model="ed.degree" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Field of study</label>
            <Input v-model="ed.field_of_study" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Start</label>
            <Input v-model="ed.start_date" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">End</label>
            <Input v-model="ed.end_date" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Grade / GPA</label>
            <Input v-model="ed.grade" />
          </div>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Skills
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addSkill">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add skill
        </Button>
      </div>
      <p v-if="!cv.skills.length" class="text-sm text-muted-foreground">
        No skills yet. Click “Add skill”.
      </p>
      <div v-for="(_, si) in cv.skills" :key="'sk-' + si" class="flex gap-2">
        <Input v-model="cv.skills[si]" class="flex-1" placeholder="Skill" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-10 w-10 shrink-0"
          aria-label="Remove skill"
          @click="removeSkill(si)"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>

    <!-- Projects -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Projects
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addProject">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add project
        </Button>
      </div>
      <p v-if="!cv.projects.length" class="text-sm text-muted-foreground">
        No projects yet.
      </p>
      <div
        v-for="(proj, pi) in cv.projects"
        :key="'proj-' + pi"
        class="rounded-lg border border-border bg-card/40 p-4 space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">Project {{ pi + 1 }}</span>
          <Button type="button" variant="destructive" size="sm" @click="removeProject(pi)">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            Delete project
          </Button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Name</label>
            <Input v-model="proj.project_name" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea
              v-model="proj.description"
              autosize
              :rows="3"
              class="min-h-[3.5rem] font-sans text-sm"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Role</label>
            <Input v-model="proj.role" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">URL</label>
            <Input v-model="proj.project_url" type="url" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Start</label>
            <Input v-model="proj.start_date" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">End</label>
            <Input v-model="proj.end_date" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-medium text-muted-foreground">Responsibilities</span>
            <Button type="button" variant="outline" size="sm" @click="addProjectResponsibility(pi)">
              <Plus class="h-4 w-4" aria-hidden="true" />
              Add line
            </Button>
          </div>
          <div v-for="(_, ri) in proj.responsibilities" :key="'pr-' + pi + '-' + ri" class="flex gap-2">
            <Textarea
              v-model="proj.responsibilities[ri]"
              autosize
              :rows="1"
              class="!min-h-0 flex-1 font-sans text-sm leading-normal"
              placeholder="Project responsibility"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-10 w-10 shrink-0 self-start"
              aria-label="Remove project responsibility"
              @click="removeProjectResponsibility(pi, ri)"
            >
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-medium text-muted-foreground">Technologies</span>
            <Button type="button" variant="outline" size="sm" @click="addTech(pi)">
              <Plus class="h-4 w-4" aria-hidden="true" />
              Add tech
            </Button>
          </div>
          <div v-for="(_, ti) in proj.technologies" :key="'t-' + pi + '-' + ti" class="flex gap-2">
            <Input v-model="proj.technologies[ti]" class="flex-1" placeholder="Technology" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="h-10 w-10 shrink-0"
              aria-label="Remove technology"
              @click="removeTech(pi, ti)"
            >
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Languages -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Languages
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addLanguage">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add language
        </Button>
      </div>
      <p v-if="!cv.languages.length" class="text-sm text-muted-foreground">
        No languages yet.
      </p>
      <div
        v-for="(lang, li) in cv.languages"
        :key="'lang-' + li"
        class="rounded-lg border border-border bg-card/40 p-4 space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">Language {{ li + 1 }}</span>
          <Button type="button" variant="destructive" size="sm" @click="removeLanguage(li)">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Language</label>
            <Input v-model="lang.language" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Proficiency</label>
            <Input v-model="lang.proficiency" />
          </div>
        </div>
      </div>
    </section>

    <!-- Certifications -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Certifications
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addCertification">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add certification
        </Button>
      </div>
      <p v-if="!cv.certifications.length" class="text-sm text-muted-foreground">
        No certifications yet.
      </p>
      <div
        v-for="(cert, ci) in cv.certifications"
        :key="'cert-' + ci"
        class="rounded-lg border border-border bg-card/40 p-4 space-y-3"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-medium text-muted-foreground">Certification {{ ci + 1 }}</span>
          <Button type="button" variant="destructive" size="sm" @click="removeCertification(ci)">
            <Trash2 class="h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Name</label>
            <Input v-model="cert.name" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-muted-foreground">Issuing organization</label>
            <Input v-model="cert.issuing_organization" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Issue date</label>
            <Input v-model="cert.issue_date" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Expiration</label>
            <Input v-model="cert.expiration_date" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Credential ID</label>
            <Input v-model="cert.credential_id" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Credential URL</label>
            <Input v-model="cert.credential_url" type="url" />
          </div>
        </div>
      </div>
    </section>

    <!-- Achievements -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Key strengths / achievements
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addAchievement">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add line
        </Button>
      </div>
      <p v-if="!cv.achievements.length" class="text-sm text-muted-foreground">
        No entries yet.
      </p>
      <div v-for="(_, ai) in cv.achievements" :key="'ach-' + ai" class="flex gap-2">
        <Textarea
          v-model="cv.achievements[ai]"
          autosize
          :rows="1"
          class="min-h-[2.75rem] flex-1 font-sans text-sm"
          placeholder="Achievement"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-10 w-10 shrink-0 self-start"
          aria-label="Remove achievement"
          @click="removeAchievement(ai)"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>

    <!-- Keywords -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-foreground">
          Keywords
        </h2>
        <Button type="button" variant="outline" size="sm" @click="addKeyword">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Add keyword
        </Button>
      </div>
      <p v-if="!cv.keywords.length" class="text-sm text-muted-foreground">
        No keywords yet.
      </p>
      <div v-for="(_, ki) in cv.keywords" :key="'kw-' + ki" class="flex gap-2">
        <Input v-model="cv.keywords[ki]" class="flex-1" placeholder="Keyword" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="h-10 w-10 shrink-0"
          aria-label="Remove keyword"
          @click="removeKeyword(ki)"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  </div>
</template>
