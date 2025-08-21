import { hasEUCitizenship, canMoveWithinEU, isEUCountry } from './eu-utils'

export interface FamilyMember {
  country?: string
  status?: string
  relationship?: string
  age?: number
  nationalities?: Array<{ country: string; willingToRenounce?: boolean }>
  dateOfBirth?: string
  student?: boolean
}

export interface VisaRequirement {
  memberType: 'partner' | 'dependent'
  memberIndex?: number
  requiresVisa: boolean
  visaType?: string
  specialConsiderations: string[]
  euFreedomOfMovement: boolean
  relationship?: string
  age?: number
}

export interface FamilyVisaAnalysis {
  primaryApplicantHasVisa: boolean
  primaryApplicantIsEU: boolean
  familyRequiresVisas: boolean
  visaRequirements: VisaRequirement[]
  specialScenarios: string[]
  summary: string
}

/**
 * Check if a family member needs a visa for the destination country
 */
export function doesFamilyMemberNeedVisa(
  member: FamilyMember,
  destinationCountry: string,
  relationship: string,
  memberIndex?: number
): VisaRequirement {
  const memberNationalities = member.nationalities || []
  
  // Check if member is citizen of destination
  const isCitizen = memberNationalities.some(nat => nat.country === destinationCountry)
  
  // Check EU freedom of movement
  const hasEUMovement = canMoveWithinEU(memberNationalities, destinationCountry)
  
  // Base visa requirement
  const requiresVisa = !isCitizen && !hasEUMovement
  
  // Special considerations based on relationship and visa needs
  const specialConsiderations: string[] = []
  let visaType = ''
  
  if (requiresVisa) {
    if (relationship === 'spouse' || relationship === 'partner') {
      visaType = 'Family Reunion Visa (Spouse/Partner)'
      specialConsiderations.push('May require proof of relationship')
      specialConsiderations.push('May require sponsor financial proof')
      if (destinationCountry && isEUCountry(destinationCountry)) {
        specialConsiderations.push('EU family reunion directive may apply')
      }
    } else if (relationship === 'child' || relationship === 'son' || relationship === 'daughter') {
      const age = member.age || 0
      if (age < 18) {
        visaType = 'Dependent Child Visa'
        specialConsiderations.push('Minor dependent - easier process')
      } else {
        visaType = 'Adult Dependent Visa'
        specialConsiderations.push('Adult dependent - may require proof of dependency')
      }
      specialConsiderations.push('May require birth certificate')
    } else {
      visaType = 'Family Dependent Visa'
      specialConsiderations.push('May require proof of family relationship')
      specialConsiderations.push('May require proof of dependency')
    }
  } else if (hasEUMovement) {
    specialConsiderations.push('EU citizen - freedom of movement applies')
  } else if (isCitizen) {
    specialConsiderations.push('Already a citizen of destination country')
  }
  
  return {
    memberType: relationship === 'spouse' || relationship === 'partner' ? 'partner' : 'dependent',
    memberIndex,
    requiresVisa,
    visaType: visaType || undefined,
    specialConsiderations,
    euFreedomOfMovement: hasEUMovement,
    relationship,
    age: member.age
  }
}

/**
 * Analyze complete family visa situation
 */
export function analyzeFamilyVisaRequirements(
  userNationalities: Array<{ country: string }>,
  destinationCountry: string,
  partner?: FamilyMember,
  dependents: FamilyMember[] = []
): FamilyVisaAnalysis {
  if (!destinationCountry) {
    return {
      primaryApplicantHasVisa: false,
      primaryApplicantIsEU: false,
      familyRequiresVisas: false,
      visaRequirements: [],
      specialScenarios: [],
      summary: 'No destination selected'
    }
  }
  
  // Analyze primary applicant
  const primaryIsCitizen = userNationalities.some(nat => nat.country === destinationCountry)
  const primaryHasEU = canMoveWithinEU(userNationalities, destinationCountry)
  const primaryApplicantHasVisa = primaryIsCitizen || primaryHasEU
  const primaryApplicantIsEU = hasEUCitizenship(userNationalities)
  
  const visaRequirements: VisaRequirement[] = []
  const specialScenarios: string[] = []
  
  // Analyze partner
  if (partner && partner.nationalities && partner.nationalities.length > 0) {
    const partnerRequirement = doesFamilyMemberNeedVisa(
      partner,
      destinationCountry,
      'spouse' // Simplify to spouse for visa purposes
    )
    visaRequirements.push(partnerRequirement)
    
    // Special scenarios for partner
    if (primaryApplicantHasVisa && partnerRequirement.requiresVisa) {
      specialScenarios.push('Primary applicant can sponsor partner')
    }
    if (primaryApplicantIsEU && partnerRequirement.requiresVisa && isEUCountry(destinationCountry)) {
      specialScenarios.push('EU family reunion directive applies to partner')
    }
  }
  
  // Analyze dependents
  dependents.forEach((dependent, index) => {
    if (dependent.nationalities && dependent.nationalities.length > 0) {
      const dependentRequirement = doesFamilyMemberNeedVisa(
        dependent,
        destinationCountry,
        dependent.relationship || 'child',
        index
      )
      visaRequirements.push(dependentRequirement)
      
      // Special scenarios for dependents
      if (primaryApplicantHasVisa && dependentRequirement.requiresVisa) {
        specialScenarios.push(`Dependent ${index + 1} can be sponsored by primary applicant`)
      }
    }
  })
  
  const familyRequiresVisas = visaRequirements.some(req => req.requiresVisa)
  
  // Generate summary
  let summary = ''
  if (!familyRequiresVisas) {
    summary = 'All family members have visa-free access'
  } else {
    const visaCount = visaRequirements.filter(req => req.requiresVisa).length
    const totalFamily = visaRequirements.length
    summary = `${visaCount} of ${totalFamily} family members require visas`
  }
  
  return {
    primaryApplicantHasVisa,
    primaryApplicantIsEU,
    familyRequiresVisas,
    visaRequirements,
    specialScenarios,
    summary
  }
}

/**
 * Get family visa complexity level
 */
export function getFamilyVisaComplexity(analysis: FamilyVisaAnalysis): 'simple' | 'moderate' | 'complex' {
  if (!analysis.familyRequiresVisas) return 'simple'
  
  const visaCount = analysis.visaRequirements.filter(req => req.requiresVisa).length
  const hasSpecialScenarios = analysis.specialScenarios.length > 0
  
  if (visaCount === 1 && !hasSpecialScenarios) return 'moderate'
  if (visaCount > 2 || hasSpecialScenarios) return 'complex'
  
  return 'moderate'
}

/**
 * Get family visa planning recommendations
 */
export function getFamilyVisaPlanningSteps(analysis: FamilyVisaAnalysis): string[] {
  const steps: string[] = []
  
  if (!analysis.familyRequiresVisas) {
    steps.push('No visa applications needed for family members')
    return steps
  }
  
  if (analysis.primaryApplicantHasVisa) {
    steps.push('Primary applicant can act as sponsor for family visas')
  }
  
  analysis.visaRequirements.forEach((req, index) => {
    if (req.requiresVisa) {
      const memberDesc = req.memberType === 'partner' ? 'Partner' : `Dependent ${(req.memberIndex || 0) + 1}`
      steps.push(`Apply for ${req.visaType} for ${memberDesc}`)
      
      req.specialConsiderations.forEach(consideration => {
        steps.push(`  • ${consideration}`)
      })
    }
  })
  
  if (analysis.primaryApplicantIsEU && isEUCountry(analysis.visaRequirements[0]?.relationship || '')) {
    steps.push('Consider EU family reunion benefits and timelines')
  }
  
  return steps
}
