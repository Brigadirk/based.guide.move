import { useState, useEffect } from "react"
import { useFormStore } from "@/lib/stores"
import { canMoveWithinEU, hasEUCitizenship, isEUCountry } from "@/lib/utils/eu-utils"
import { analyzeFamilyVisaRequirements } from "@/lib/utils/family-visa-utils"

export function useAlternativeInterests() {
  const { getFormData, updateFormData, markSectionComplete, setCurrentSection, isSectionMarkedComplete } = useFormStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false)

  // Get all the data we need for detection
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const userNationalities = getFormData("personalInformation.nationalities") ?? []
  const hasSkippedFinance = getFormData("finance.skipDetails") ?? false
  
  // Check if Personal Information section is completed (required to have complete family data)
  const isPersonalInfoComplete = isSectionMarkedComplete("personal")
  
  // Family info for visa analysis
  const partnerInfo = getFormData("personalInformation.relocationPartnerInfo") 
  const dependentsInfo = getFormData("personalInformation.relocationDependents") || []

  // Check if user has visa-free access
  const isAlreadyCitizen = userNationalities.some((nat: any) => nat.country === destCountry)
  const canMoveWithinEUFreedom = destCountry && canMoveWithinEU(userNationalities, destCountry)
  const hasNoVisaRequirement = isAlreadyCitizen || canMoveWithinEUFreedom

  // Analyze family visa requirements
  const familyVisaAnalysis = destCountry ? (() => {
    // Convert partner info to our format
    const partner = partnerInfo ? {
      nationalities: partnerInfo.partnerNationalities || [],
      relationship: 'spouse'
    } : undefined
    
    // Convert dependents info to our format  
    const dependents = dependentsInfo.map((dep: any) => ({
      nationalities: dep.nationalities || [],
      relationship: dep.relationship || 'child',
      age: dep.age || 0,
      dateOfBirth: dep.dateOfBirth
    }))
    
    return analyzeFamilyVisaRequirements(userNationalities, destCountry, partner, dependents)
  })() : null

  const hasNoFamilyVisaIssues = !familyVisaAnalysis || !familyVisaAnalysis.familyRequiresVisas

  // Main detection logic - only show after Personal Information is complete
  const shouldShowAlternativeInterests = isPersonalInfoComplete && hasSkippedFinance && hasNoVisaRequirement && hasNoFamilyVisaIssues && destCountry

  // Effect to automatically show modal when conditions are met
  useEffect(() => {
    if (shouldShowAlternativeInterests && !hasShownModal) {
      // Small delay to ensure page has loaded and user can see the modal properly
      const timer = setTimeout(() => {
        setIsModalOpen(true)
        setHasShownModal(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [shouldShowAlternativeInterests, hasShownModal])

  // Reset the "has shown" flag when conditions change significantly
  useEffect(() => {
    if (!shouldShowAlternativeInterests) {
      setHasShownModal(false)
      setIsModalOpen(false)
    }
  }, [shouldShowAlternativeInterests])

  const openModal = () => {
    setIsModalOpen(true)
    setHasShownModal(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleContinueToSummary = () => {
    // Mark all sections as complete and go to summary
    const allSections = [
      "personal", "education", "residency", "finance", 
      "socialSecurity", "taxDeductions", "futurePlans", "additionalInfo"
    ]
    
    allSections.forEach(section => {
      markSectionComplete(section)
    })
    
    // Set alternative interests as completed reason
    updateFormData("alternativeInterests.completedViaSummary", true)
    
    // Navigate to additional information section
    setCurrentSection(9) // Additional Information is section 9 (0-based index)
  }

  const handleMistake = () => {
    // Unset the finance skip to get them out of this condition
    updateFormData("finance.skipDetails", false)
    
    // Clear alternative interests data
    updateFormData("alternativeInterests", {})
    
    // Reset the modal state
    setHasShownModal(false)
  }

  return {
    shouldShowAlternativeInterests,
    isModalOpen,
    openModal,
    closeModal,
    destCountry,
    hasNoVisaRequirement,
    hasNoFamilyVisaIssues,
    hasSkippedFinance,
    handleContinueToSummary,
    handleMistake
  }
}
