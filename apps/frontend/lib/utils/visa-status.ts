import { canMoveWithinEU } from "@/lib/utils/eu-utils"

type Nationality = { country: string; willingToRenounce?: boolean }

export interface PersonVisaStatus {
  label: string
  needsVisa: boolean
}

export interface VisaStatusSummary {
  destinationCountry: string
  user: PersonVisaStatus
  partner?: PersonVisaStatus
  dependents: PersonVisaStatus[]
}

export function computeVisaStatus(formData: any): VisaStatusSummary | null {
  const destCountry: string = formData?.residencyIntentions?.destinationCountry?.country ?? ""
  if (!destCountry) return null

  const userNationalities: Nationality[] = formData?.personalInformation?.nationalities ?? []
  const partnerNationalities: Nationality[] = formData?.personalInformation?.relocationPartnerInfo?.partnerNationalities ?? []
  const hasPartner: boolean = !!(formData?.personalInformation?.relocationPartner ?? formData?.personalInformation?.partner?.hasPartner)
  const dependents: any[] = formData?.personalInformation?.dependents ?? []

  const userIsCitizen = userNationalities.some(n => n?.country === destCountry)
  const userCanMoveEU = canMoveWithinEU(userNationalities as any[], destCountry)
  const userNeedsVisa = !(userIsCitizen || userCanMoveEU)

  const partnerIsCitizen = hasPartner && partnerNationalities?.some(n => n?.country === destCountry)
  const partnerCanMoveEU = hasPartner && canMoveWithinEU(partnerNationalities as any[], destCountry)
  const partnerNeedsVisa = hasPartner ? !(partnerIsCitizen || partnerCanMoveEU) : false

  const dependentStatuses: PersonVisaStatus[] = Array.isArray(dependents)
    ? dependents.map((dep, idx) => {
        const depNats: Nationality[] = dep?.nationalities ?? []
        const depIsCitizen = depNats.some(n => n?.country === destCountry)
        const depCanMoveEU = canMoveWithinEU(depNats as any[], destCountry)
        return {
          label: `Dependent ${idx + 1}`,
          needsVisa: !(depIsCitizen || depCanMoveEU)
        }
      })
    : []

  return {
    destinationCountry: destCountry,
    user: { label: "You", needsVisa: userNeedsVisa },
    partner: hasPartner ? { label: "Partner", needsVisa: partnerNeedsVisa } : undefined,
    dependents: dependentStatuses
  }
}



