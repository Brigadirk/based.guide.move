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
      intendedTemporaryDurationOfStay: "",
      citizenshipStatus: ""
    },
    residencyPlans: {
      applyForResidency: false,
      maxMonthsWillingToReside: 6,
      openToVisiting: false,
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
    languageProficiency: {
      primaryLanguage: "",
      otherLanguages: []
    },
    centerOfLife: {
      familyTies: false,
      businessTies: false,
      socialTies: false,
    },
    moveMotivation: "",
    taxCompliantEverywhere: true,
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