export interface CvBasics {
  full_name: string
  headline: string
  email: string
  phone: string
  location_city: string
  location_state: string
  location_country: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  summary: string
}

export interface CvWorkExperience {
  company_name: string
  job_title: string
  location: string
  start_date: string
  end_date: string
  employment_type: string
  responsibilities: string[]
}

export interface CvEducation {
  institution_name: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string
  grade: string
}

export interface CvLanguage {
  language: string
  proficiency: string
}

export interface CvCertification {
  name: string
  issuing_organization: string
  issue_date: string
  expiration_date: string
  credential_id: string
  credential_url: string
}

export interface CvProject {
  project_name: string
  description: string
  technologies: string[]
  role: string
  start_date: string
  end_date: string
  project_url: string
}

export interface CvResume {
  basics: CvBasics
  work_experience: CvWorkExperience[]
  education: CvEducation[]
  skills: string[]
  languages: CvLanguage[]
  certifications: CvCertification[]
  projects: CvProject[]
  achievements: string[]
  keywords: string[]
}
