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
      moveType: "",
      intendedTemporaryDurationOfStay: 0,
      showSpecialSituation: false,
      specialSituation: ""
    },
    physicalPresenceIntentions: {
      interestedInMinimumStay: false
    },
    citizenshipInterest: {
      interest: "undecided",
      willingToConsider: {
        naturalization: true,
        familyConnections: false,
        familyConnectionDetails: "",
        investmentPrograms: false,
        militaryService: false,
        otherPrograms: false
      },
      showPartnerSpecialSituation: false,
      partnerSpecialSituation: ""
    },
    centerOfLife: {
      maintainOtherCountryTies: false,
      maintainOtherCountryTiesDetails: "",
      // Legacy fields for backend compatibility
      maintainsSignificantTies: false,
      tiesDescription: ""
    },
    backgroundDisclosures: {
      criminalRecord: false,
      criminalDetails: "",
      taxComplianceIssues: false,
      taxComplianceDetails: "",
      previousVisaDenials: false,
      visaDenialDetails: ""
    },
    backgroundDisclosuresPartner: {
      criminalRecord: false,
      criminalDetails: "",
      taxComplianceIssues: false,
      taxComplianceDetails: "",
      previousVisaDenials: false,
      visaDenialDetails: ""
    },
    userVisa: {
      applyForResidency: true
    },
    partnerVisa: {
      applyForResidency: true,
      citizenshipInterest: "undecided",
      willingToConsider: {
        naturalization: true,
        familyConnections: false,
        familyConnectionDetails: "",
        investmentPrograms: false,
        militaryService: false,
        otherPrograms: false
      }
    },
    dependentsVisa: {
      applyForResidency: false
    },
    residencyPlans: {
      openToVisiting: false,
      exploratoryVisits: {
        details: ""
      }
    },
    moveMotivation: "",
    moveMotivationDetails: "",
    familyCoordination: {
      applicationTiming: "undecided",
      specialFamilyCircumstances: "",
      schoolTimingConsiderations: ""
    }
  },
  finance: {
    skipTaxSections: false,
    skipDetails: false,
    autoCompletedSections: false,
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
  completedSections: {
    "disclaimer": false,
    "destination": false,
    "personal": false,
    "residency": false,
    "education": false,
    "finance": false,
    "social-security": false,
    "tax-deductions": false,
    "future-plans": false,
    "additional": false
  },
  summary: {
    editedFullStory: ""
  }
} 