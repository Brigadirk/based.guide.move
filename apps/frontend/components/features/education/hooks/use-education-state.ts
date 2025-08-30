"use client"

import { useFormStore } from "@/lib/stores"
import type { Degree, Skill, LearningInterest, SchoolOffer } from "../types"

export function useEducationState() {
  const { getFormData, updateFormData } = useFormStore()

  // Get destination country for context
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const countryPhrase = destCountry || "your destination country"

  // Degrees
  const degrees: Degree[] = getFormData("education.previousDegrees") ?? []
  const setDegrees = (next: Degree[]) => updateFormData("education.previousDegrees", next)
  const partnerDegrees: Degree[] = getFormData("education.partner.previousDegrees") ?? []
  const setPartnerDegrees = (next: Degree[]) => updateFormData("education.partner.previousDegrees", next)

  // Skills
  const skills: Skill[] = getFormData("education.visaSkills") ?? []
  const setSkills = (next: Skill[]) => updateFormData("education.visaSkills", next)
  const partnerSkills: Skill[] = getFormData("education.partner.visaSkills") ?? []
  const setPartnerSkills = (next: Skill[]) => updateFormData("education.partner.visaSkills", next)

  // Work Experience
  const workExperience = getFormData("education.workExperience") ?? []
  const setWorkExperience = (next: any[]) => updateFormData("education.workExperience", next)
  const partnerWorkExperience = getFormData("education.partner.workExperience") ?? []
  const setPartnerWorkExperience = (next: any[]) => updateFormData("education.partner.workExperience", next)

  // Professional Licenses
  const professionalLicenses = getFormData("education.professionalLicenses") ?? []
  const setProfessionalLicenses = (next: any[]) => updateFormData("education.professionalLicenses", next)
  const partnerProfessionalLicenses = getFormData("education.partner.professionalLicenses") ?? []
  const setPartnerProfessionalLicenses = (next: any[]) => updateFormData("education.partner.professionalLicenses", next)

  // Study Plans
  const interestedInStudy: boolean = getFormData("education.interestedInStudying") ?? false
  const setInterested = (v: boolean) => updateFormData("education.interestedInStudying", v)
  const studyDetails: string = getFormData("education.schoolInterestDetails") ?? ""
  const setStudyDetails = (txt: string) => updateFormData("education.schoolInterestDetails", txt)

  // Learning Interests
  const learningInterests: LearningInterest[] = getFormData("education.learningInterests") ?? []
  const setLearningInterests = (next: LearningInterest[]) => updateFormData("education.learningInterests", next)

  // School Offers
  const schoolOffers: SchoolOffer[] = getFormData("education.schoolOffers") ?? []
  const setSchoolOffers = (next: SchoolOffer[]) => updateFormData("education.schoolOffers", next)

  // Partner selection
  const hasPartnerSelected = getFormData("personalInformation.relocationPartner") ?? false

  return {
    // Context
    destCountry,
    countryPhrase,
    hasPartnerSelected,
    
    // Degrees
    degrees,
    setDegrees,
    partnerDegrees,
    setPartnerDegrees,
    
    // Skills
    skills,
    setSkills,
    partnerSkills,
    setPartnerSkills,
    
    // Work Experience
    workExperience,
    setWorkExperience,
    partnerWorkExperience,
    setPartnerWorkExperience,
    
    // Professional Licenses
    professionalLicenses,
    setProfessionalLicenses,
    partnerProfessionalLicenses,
    setPartnerProfessionalLicenses,
    
    // Study Plans
    interestedInStudy,
    setInterested,
    studyDetails,
    setStudyDetails,
    
    // Learning Interests
    learningInterests,
    setLearningInterests,
    
    // School Offers
    schoolOffers,
    setSchoolOffers,
    
    // Form store methods
    getFormData,
    updateFormData
  }
}
