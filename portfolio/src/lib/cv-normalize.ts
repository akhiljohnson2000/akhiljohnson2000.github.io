import defaultCv from '@/data/cv-default.json'
import type {
  CvBasics,
  CvCertification,
  CvEducation,
  CvLanguage,
  CvProject,
  CvResume,
  CvWorkExperience,
} from '@/types/cv-resume'

const emptyBasics = (): CvBasics => ({
  full_name: '',
  headline: '',
  email: '',
  phone: '',
  location_city: '',
  location_state: '',
  location_country: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
  summary: '',
})

function mergeBasics(raw: unknown): CvBasics {
  const d = (defaultCv as CvResume).basics
  if (!raw || typeof raw !== 'object') return { ...d }
  const o = raw as Record<string, unknown>
  return {
    full_name: String(o.full_name ?? d.full_name),
    headline: String(o.headline ?? d.headline),
    email: String(o.email ?? d.email),
    phone: String(o.phone ?? d.phone),
    location_city: String(o.location_city ?? d.location_city),
    location_state: String(o.location_state ?? d.location_state),
    location_country: String(o.location_country ?? d.location_country),
    linkedin_url: String(o.linkedin_url ?? d.linkedin_url),
    github_url: String(o.github_url ?? d.github_url),
    portfolio_url: String(o.portfolio_url ?? d.portfolio_url),
    summary: String(o.summary ?? d.summary),
  }
}

function mergeWorkExperience(raw: unknown): CvWorkExperience[] {
  const d = (defaultCv as CvResume).work_experience
  if (!Array.isArray(raw)) return [...d]
  return raw.map((item, idx) => {
    const fb = d[idx] ?? d[d.length - 1] ?? {
      company_name: '',
      job_title: '',
      location: '',
      start_date: '',
      end_date: '',
      employment_type: '',
      responsibilities: [''],
    }
    if (!item || typeof item !== 'object') return { ...fb }
    const o = item as Record<string, unknown>
    const resp = Array.isArray(o.responsibilities)
      ? o.responsibilities.map((s) => String(s))
      : fb.responsibilities
    return {
      company_name: String(o.company_name ?? fb.company_name),
      job_title: String(o.job_title ?? fb.job_title),
      location: String(o.location ?? fb.location),
      start_date: String(o.start_date ?? fb.start_date),
      end_date: String(o.end_date ?? fb.end_date),
      employment_type: String(o.employment_type ?? fb.employment_type),
      responsibilities: resp.length ? resp : [''],
    }
  })
}

function mergeEducation(raw: unknown): CvEducation[] {
  const d = (defaultCv as CvResume).education
  if (!Array.isArray(raw)) return [...d]
  return raw.map((item, idx) => {
    const fb = d[idx] ?? d[d.length - 1] ?? {
      institution_name: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      grade: '',
    }
    if (!item || typeof item !== 'object') return { ...fb }
    const o = item as Record<string, unknown>
    return {
      institution_name: String(o.institution_name ?? fb.institution_name),
      degree: String(o.degree ?? fb.degree),
      field_of_study: String(o.field_of_study ?? fb.field_of_study),
      start_date: String(o.start_date ?? fb.start_date),
      end_date: String(o.end_date ?? fb.end_date),
      grade: String(o.grade ?? fb.grade),
    }
  })
}

function mergeLanguages(raw: unknown): CvLanguage[] {
  const d = (defaultCv as CvResume).languages
  if (!Array.isArray(raw)) return [...d]
  return raw.map((item, idx) => {
    const fb = d[idx] ?? d[d.length - 1] ?? { language: '', proficiency: '' }
    if (!item || typeof item !== 'object') return { ...fb }
    const o = item as Record<string, unknown>
    return {
      language: String(o.language ?? fb.language),
      proficiency: String(o.proficiency ?? fb.proficiency),
    }
  })
}

function mergeCertifications(raw: unknown): CvCertification[] {
  const d = (defaultCv as CvResume).certifications
  if (!Array.isArray(raw)) return [...d]
  return raw.map((item, idx) => {
    const fb = d[idx] ?? d[d.length - 1] ?? {
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiration_date: '',
      credential_id: '',
      credential_url: '',
    }
    if (!item || typeof item !== 'object') return { ...fb }
    const o = item as Record<string, unknown>
    return {
      name: String(o.name ?? fb.name),
      issuing_organization: String(o.issuing_organization ?? fb.issuing_organization),
      issue_date: String(o.issue_date ?? fb.issue_date),
      expiration_date: String(o.expiration_date ?? fb.expiration_date),
      credential_id: String(o.credential_id ?? fb.credential_id),
      credential_url: String(o.credential_url ?? fb.credential_url),
    }
  })
}

function mergeProjects(raw: unknown): CvProject[] {
  const d = (defaultCv as CvResume).projects
  if (!Array.isArray(raw)) return [...d]
  return raw.map((item, idx) => {
    const fb = d[idx] ?? d[d.length - 1] ?? {
      project_name: '',
      description: '',
      responsibilities: [''],
      technologies: [''],
      role: '',
      start_date: '',
      end_date: '',
      project_url: '',
    }
    if (!item || typeof item !== 'object') return { ...fb }
    const o = item as Record<string, unknown>
    const resp = Array.isArray(o.responsibilities)
      ? o.responsibilities.map((s) => String(s))
      : fb.responsibilities
    const tech = Array.isArray(o.technologies) ? o.technologies.map((s) => String(s)) : fb.technologies
    return {
      project_name: String(o.project_name ?? fb.project_name),
      description: String(o.description ?? fb.description),
      responsibilities: resp.length ? resp : [''],
      technologies: tech.length ? tech : [''],
      role: String(o.role ?? fb.role),
      start_date: String(o.start_date ?? fb.start_date),
      end_date: String(o.end_date ?? fb.end_date),
      project_url: String(o.project_url ?? fb.project_url),
    }
  })
}

function mergeStringArray(raw: unknown, fallback: string[]): string[] {
  if (!Array.isArray(raw)) return [...fallback]
  return raw.map((s) => String(s))
}

/** Merge user JSON with schema defaults so preview always has a complete shape. */
export function normalizeCvResume(raw: unknown): CvResume {
  const base = JSON.parse(JSON.stringify(defaultCv)) as CvResume
  if (!raw || typeof raw !== 'object') return base

  const r = raw as Record<string, unknown>

  return {
    basics: mergeBasics(r.basics),
    work_experience: mergeWorkExperience(r.work_experience),
    education: mergeEducation(r.education),
    skills: mergeStringArray(r.skills, base.skills),
    languages: mergeLanguages(r.languages),
    certifications: mergeCertifications(r.certifications),
    projects: mergeProjects(r.projects),
    achievements: mergeStringArray(r.achievements, base.achievements),
    keywords: mergeStringArray(r.keywords, base.keywords),
  }
}

export function emptyCvResume(): CvResume {
  return {
    basics: emptyBasics(),
    work_experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
    achievements: [],
    keywords: [],
  }
}
