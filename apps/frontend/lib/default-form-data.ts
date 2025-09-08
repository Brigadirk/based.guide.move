import { FormData } from "@/lib/stores"

export const defaultFormData: FormData = {
  disclaimer: {
    accepted: false,
    dateAccepted: ""
  },
  destination: {
    country: "",
    region: ""
  },
  personalInformation: {
    dateOfBirth: "",
    nationalities: [],
    maritalStatus: "",
    enduringMaritalStatusInfo: "",
    currentResidency: {
      country: "",
      status: "",
      duration: ""
    },
    partner: {
      hasPartner: false,
      sameSex: false,
      partnerNationalities: [],
      officialRelationshipDuration: "",
      unofficialRelationshipDuration: "",
    },
    dependents: []
  },
  education: {
    previousDegrees: [],
    visaSkills: [],
    learningInterests: []
  },
  residencyIntentions: {
    destinationCountry: {
      country: "",
      region: "",
      moveType: "",
      intendedTemporaryDurationOfStay: 0,
      citizenshipStatus: "",
      currentlyInDestination: false,
      currentStatus: ""
    },
    residencyPlans: {
      applyForResidency: false,
      maxMonthsWillingToReside: 6,
      openToVisiting: false,
    },
    physicalPresenceIntentions: {
      minDaysInDestinationPerYear: undefined,
      maxDaysOutsidePerYear: undefined,
      flexibleOnMinimumStay: undefined,
      plansForMaintainingOtherCountryTies: ""
    },
    familyVisaPlanning: {
      applicationTimeline: undefined,
      relocationPriority: undefined,
      concerns: [],
      specialCircumstances: "",
    },
    citizenshipPlans: {
      interestedInCitizenship: false,
      willingToRenounceCurrent: false,
      investmentCitizenship: false,
      donationCitizenship: false,
      militaryService: false,
    },
    citizenshipInterest: {
      interest: undefined,
      willingToConsider: {
        familyConnections: false,
        investmentPrograms: false,
        militaryService: false,
        otherPrograms: false,
        otherDetails: ""
      }
    },
    languageProficiency: {
      primaryLanguage: "",
      otherLanguages: []
    },
    centerOfLife: {
      familyTies: false,
      businessTies: false,
      socialTies: false,
    },
    backgroundDisclosures: {
      criminalRecord: false,
      criminalDetails: "",
      taxComplianceIssues: false,
      taxComplianceDetails: "",
      previousVisaDenials: false,
      visaDenialDetails: "",
      otherRelevantFactors: ""
    },
    userVisa: {
      applyForResidency: false,
      physicalPresenceDays: undefined,
      exploratoryVisits: { details: "" },
      citizenshipInterest: undefined as any
    },
    partnerVisa: {
      applyForResidency: false,
      physicalPresenceDays: undefined,
      exploratoryVisits: { details: "" },
      citizenshipInterest: undefined as any
    },
    dependentsVisa: [],
    moveMotivation: "",
    moveMotivationDetails: "",
    taxCompliantEverywhere: true,
    familyCoordination: {
      partnerVisaStatusInDestination: "",
      dependentsVisaStatusInDestination: "",
      applicationTiming: undefined,
      documentPreparationReadiness: "",
      specialFamilyCircumstances: "",
      schoolTimingConsiderations: ""
    }
  },
  finance: {
    skipTaxSections: false,
    totalWealth: {
      total: 0,
      currency: "USD",
      primary_residence: 0
    },
    incomeStatus: "",
    capitalGains: {
      hasGains: false,
      futureSales: []
    },
    incomeSources: [],
    liabilities: [],
  },
  socialSecurityAndPensions: {
    currentCountryContributions: {
      isContributing: undefined,
      country: "",
      yearsOfContribution: 0,
    },
    futurePensionContributions: {
      isPlanning: false,
      details: []
    }
  },
  taxDeductionsAndCredits: {
    potentialDeductions: []
  },
  futureFinancialPlans: {
    plannedInvestments: [],
    businessPlans: [],
    retirementPlans: []
  },
  additionalInformation: {
    notes: "",
    specialCircumstances: "",
    specialSections: []
  },
  completedSections: {}
} 