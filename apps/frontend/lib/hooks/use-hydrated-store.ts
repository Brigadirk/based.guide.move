'use client'

import { useState, useEffect } from 'react'
import { useFormStore } from '@/lib/stores'

/**
 * Custom hook that safely accesses the Zustand store after hydration
 * Prevents hydration mismatches by ensuring state is only used client-side
 */
export function useHydratedStore() {
  const [hasHydrated, setHasHydrated] = useState(false)
  const store = useFormStore()

  useEffect(() => {
    // Wait for hydration to complete
    setHasHydrated(true)
  }, [])

  // Return default state during SSR and initial render
  if (!hasHydrated) {
    return {
      ...store,
      formData: {
        disclaimer: { accepted: false, dateAccepted: "" },
        destination: { country: "", region: "" },
        personalInformation: {
          dateOfBirth: "",
          nationalities: [],
          maritalStatus: "",
          enduringMaritalStatusInfo: "",
          currentResidency: { country: "", status: "", duration: "" },
          partner: {
            hasPartner: false,
            sameSex: false,
            partnerNationalities: [],
            officialRelationshipDuration: "",
            unofficialRelationshipDuration: "",
          },
          dependents: []
        }
      },
      currentSection: 0,
      isHydrated: false
    }
  }

  // Return actual persisted state after hydration
  return {
    ...store,
    isHydrated: true
  }
}

/**
 * Hook to check if the store has been hydrated
 */
export function useIsHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  return hasHydrated
} 