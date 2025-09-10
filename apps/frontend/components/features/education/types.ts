export type Degree = {
  degree: string
  institution: string
  field: string
  start_date: string
  end_date: string
  in_progress: boolean
}

export type Skill = {
  skill: string
  credentialName?: string
  credentialInstitute?: string
}

export type LearningInterest = {
  skill: string
  status: "planned" | "open"
  institute: string
  months: number
  hoursPerWeek: number
  fundingStatus: string
}

export type SchoolOffer = {
  school: string
  program: string
  startDate: string
  fundingStatus: string
}

export type WorkExperience = {
  jobTitle: string
  company: string
  country: string
  startDate: string
  endDate: string
  current: boolean
}

export type ProfessionalLicense = {
  licenseType: string
  licenseName: string
  issuingBody: string
  country: string
  active: boolean
}

export type MilitaryService = {
  hasService: boolean
  country?: string
  branch?: string
  startDate?: string
  endDate?: string
  currentlyServing?: boolean
  rank?: string
  occupation?: string
  securityClearance?: string
  languages?: string
  certifications?: string
  leadership?: string
}

export type EducationProps = {
  onComplete: () => void
}
