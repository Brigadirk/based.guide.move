/**
 * Debug scenarios for testing the application with realistic user data
 * These scenarios represent different types of people moving internationally
 */

import { FormData } from './stores/form-store'

export interface DebugScenario {
  id: string
  name: string
  description: string
  data: Partial<FormData>
}

export const debugScenarios: DebugScenario[] = [
  {
    id: 'young-professional',
    name: '🎓 Young Professional - Tech Worker',
    description: 'Single 26-year-old software engineer from US moving to Germany for career growth',
    data: {
      disclaimer: {
        accepted: true,
        dateAccepted: new Date().toISOString()
      },
      destination: {
        country: 'Germany',
        region: 'Berlin'
      },
      personalInformation: {
        dateOfBirth: '1998-03-15',
        nationalities: [
          { country: 'United States', willingToRenounce: false }
        ],
        maritalStatus: 'single',
        enduringMaritalStatusInfo: '',
        currentResidency: {
          country: 'United States',
          status: 'citizen',
          duration: 'since_birth'
        },
        relocationPartner: false,
        dependents: []
      },
      education: {
        autoSkipped: false,
        previousDegrees: [
          {
            degreeName: 'Bachelor of Science in Computer Science',
            institution: 'University of California, Berkeley',
            startYear: 2016,
            endYear: 2020,
            inProgress: false
          }
        ],
        visaSkills: [
          {
            skill: 'Software Development',
            credentialName: 'AWS Certified Solutions Architect',
            credentialInstitute: 'Amazon Web Services'
          }
        ],
        learningInterests: [
          {
            type: 'Language Learning',
            hoursPerWeek: 5,
            months: 12,
            status: 'planning',
            institution: 'Goethe Institute',
            funding: 'self_funded'
          }
        ]
      },
      residencyIntentions: {
        destinationCountry: {
          moveType: 'permanent_residency',
          intendedTemporaryDurationOfStay: 0,
          showSpecialSituation: false
        },
        physicalPresenceIntentions: {
          interestedInMinimumStay: true
        },
        citizenshipInterest: {
          interest: 'yes',
          willingToConsider: {
            naturalization: true,
            familyConnections: false,
            investmentPrograms: false,
            militaryService: false,
            otherPrograms: false
          }
        },
        centerOfLife: {
          maintainOtherCountryTies: true,
          maintainOtherCountryTiesDetails: 'Family and friends in the US, may visit regularly'
        },
        backgroundDisclosures: {
          criminalRecord: false,
          taxComplianceIssues: false,
          previousVisaDenials: false
        },
        userVisa: {
          applyForResidency: true
        },
        moveMotivation: 'Career advancement in tech industry and cultural experience',
        moveTiming: 'Within 6 months'
      },
      finance: {
        skipTaxSections: false,
        skipDetails: false,
        incomeSituation: 'continuing_income',
        totalWealth: {
          total: 85000,
          currency: 'USD',
          primaryResidence: 0
        },
        incomeSources: [
          {
            category: 'Employment',
            fields: { employer: 'Google', role: 'Software Engineer' },
            country: 'United States',
            amount: 120000,
            currency: 'USD',
            timeline: 'Current income',
            confidence: 'Confirmed',
            continueInDestination: false,
            notes: 'Will transition to German tech company'
          }
        ],
        capitalGains: {
          futureSales: []
        },
        liabilities: [
          {
            category: 'Other',
            fields: { description: 'Student loans', type: 'Education debt' },
            country: 'United States',
            amount: 35000,
            currency: 'USD',
            paybackYears: 8,
            interestRate: 4.5
          }
        ]
      },
      socialSecurityAndPensions: {
        currentCountryContributions: {
          isContributing: true,
          country: 'United States',
          yearsOfContribution: 4
        },
        futurePensionContributions: {
          isPlanning: true,
          details: [
            {
              pensionType: 'Employer-sponsored plan',
              country: 'Germany',
              expectedAmount: 2000,
              startDate: '2024-06-01'
            }
          ]
        }
      },
      taxDeductionsAndCredits: {
        potentialDeductions: []
      },
      futureFinancialPlans: {
        plannedInvestments: [
          {
            type: 'Stock Market ETFs',
            country: 'Germany',
            estimatedValue: 20000
          }
        ],
        businessPlans: [],
        retirementPlans: [
          {
            country: 'Germany',
            estimatedAmount: 500000,
            timeline: '35 years'
          }
        ]
      },
      additionalInformation: {
        notes: 'Excited about the opportunity to work in Germany and experience European culture.',
        specialCircumstances: '',
        specialSections: []
      }
    }
  },
  {
    id: 'family-with-kids',
    name: '👨‍👩‍👧‍👦 Family with Children - Mid-Career',
    description: 'Married couple (both 38) with 2 kids moving from UK to Canada for better opportunities',
    data: {
      disclaimer: {
        accepted: true,
        dateAccepted: new Date().toISOString()
      },
      destination: {
        country: 'Canada',
        region: 'Ontario'
      },
      personalInformation: {
        dateOfBirth: '1986-07-22',
        nationalities: [
          { country: 'United Kingdom', willingToRenounce: false }
        ],
        maritalStatus: 'married',
        enduringMaritalStatusInfo: 'Married for 12 years',
        currentResidency: {
          country: 'United Kingdom',
          status: 'citizen',
          duration: 'since_birth'
        },
        relocationPartner: true,
        relocationPartnerInfo: {
          dateOfBirth: '1986-05-18',
          relationshipType: 'Spouse',
          sameSex: false,
          partnerNationalities: [
            { country: 'United Kingdom', willingToRenounce: false }
          ],
          officialRelationshipDuration: '12 years',
          fullRelationshipDuration: '14 years',
          currentResidency: {
            country: 'United Kingdom',
            status: 'citizen',
            duration: 'since_birth'
          }
        },
        dependents: [
          {
            relationship: 'child',
            relationshipDetails: {
              biologicalRelationTo: 'both',
              legalRelationTo: 'both',
              custodialRelationTo: 'both'
            },
            dateOfBirth: '2014-09-10',
            age: 10,
            name: 'Emma',
            student: true,
            nationalities: [
              { country: 'United Kingdom', willingToRenounce: false }
            ],
            currentResidency: {
              country: 'United Kingdom',
              status: 'citizen',
              duration: 'since_birth'
            }
          },
          {
            relationship: 'child',
            relationshipDetails: {
              biologicalRelationTo: 'both',
              legalRelationTo: 'both',
              custodialRelationTo: 'both'
            },
            dateOfBirth: '2017-02-18',
            age: 7,
            name: 'Oliver',
            student: true,
            nationalities: [
              { country: 'United Kingdom', willingToRenounce: false }
            ],
            currentResidency: {
              country: 'United Kingdom',
              status: 'citizen',
              duration: 'since_birth'
            }
          }
        ]
      },
      education: {
        autoSkipped: false,
        previousDegrees: [
          {
            degreeName: 'Master of Business Administration',
            institution: 'London Business School',
            startYear: 2008,
            endYear: 2010,
            inProgress: false
          }
        ],
        visaSkills: [
          {
            skill: 'Project Management',
            credentialName: 'PMP Certification',
            credentialInstitute: 'Project Management Institute'
          }
        ],
        learningInterests: []
      },
      residencyIntentions: {
        destinationCountry: {
          moveType: 'permanent_residency',
          intendedTemporaryDurationOfStay: 0
        },
        physicalPresenceIntentions: {
          interestedInMinimumStay: true
        },
        citizenshipInterest: {
          interest: 'yes',
          willingToConsider: {
            naturalization: true,
            familyConnections: false,
            investmentPrograms: false,
            militaryService: false,
            otherPrograms: false
          }
        },
        centerOfLife: {
          maintainOtherCountryTies: true,
          maintainOtherCountryTiesDetails: 'Extended family in UK, property ownership'
        },
        backgroundDisclosures: {
          criminalRecord: false,
          taxComplianceIssues: false,
          previousVisaDenials: false
        },
        backgroundDisclosuresPartner: {
          criminalRecord: false,
          taxComplianceIssues: false,
          previousVisaDenials: false
        },
        userVisa: {
          applyForResidency: true
        },
        partnerVisa: {
          applyForResidency: true,
          citizenshipInterest: 'yes',
          willingToConsider: {
            naturalization: true,
            familyConnections: false,
            investmentPrograms: false,
            militaryService: false,
            otherPrograms: false
          }
        },
        dependentsVisa: {
          applyForResidency: true
        },
        familyCoordination: {
          applicationTiming: 'together',
          specialFamilyCircumstances: 'Moving as complete family unit'
        },
        moveMotivation: 'Better education system for children and career opportunities',
        moveTiming: 'Within 12 months'
      },
      finance: {
        skipTaxSections: false,
        skipDetails: false,
        incomeSituation: 'continuing_income',
        scope: 'joint',
        totalWealth: {
          total: 450000,
          currency: 'GBP',
          primaryResidence: 280000
        },
        incomeSources: [
          {
            category: 'Employment',
            fields: { employer: 'Barclays Bank', role: 'Senior Manager' },
            country: 'United Kingdom',
            amount: 85000,
            currency: 'GBP',
            timeline: 'Current income',
            confidence: 'Confirmed',
            continueInDestination: false
          }
        ],
        partner: {
          incomeSituation: 'continuing_income',
          incomeSources: [
            {
              category: 'Employment',
              fields: { employer: 'NHS', role: 'Nurse Practitioner' },
              country: 'United Kingdom',
              amount: 45000,
              currency: 'GBP',
              timeline: 'Current income',
              confidence: 'Confirmed',
              continueInDestination: false
            }
          ]
        },
        capitalGains: {
          futureSales: [
            {
              asset: 'Primary residence in London',
              type: 'Real Estate',
              holdingTime: '> 10 years',
              surplusValue: 150000,
              currency: 'GBP',
              timeframe: '6-12 months',
              country: 'United Kingdom',
              reason: 'Selling to fund move to Canada'
            }
          ]
        },
        liabilities: [
          {
            category: 'Mortgage',
            fields: { property_description: 'Primary residence', property_type: 'Residential' },
            country: 'United Kingdom',
            amount: 180000,
            currency: 'GBP',
            paybackYears: 15,
            interestRate: 3.2
          }
        ]
      },
      socialSecurityAndPensions: {
        currentCountryContributions: {
          isContributing: true,
          country: 'United Kingdom',
          yearsOfContribution: 15
        },
        futurePensionContributions: {
          isPlanning: true,
          details: [
            {
              pensionType: 'Government pension',
              country: 'Canada',
              expectedAmount: 1200,
              startDate: '2024-09-01'
            }
          ]
        }
      },
      futureFinancialPlans: {
        plannedInvestments: [
          {
            type: 'Real Estate',
            country: 'Canada',
            estimatedValue: 400000
          }
        ],
        businessPlans: [],
        retirementPlans: [
          {
            country: 'Canada',
            estimatedAmount: 800000,
            timeline: '25 years'
          }
        ]
      },
      additionalInformation: {
        notes: 'Looking forward to providing better educational opportunities for our children and building a new life in Canada.',
        specialCircumstances: 'Moving with school-age children requires careful timing around the school year.',
        specialSections: []
      }
    }
  },
  {
    id: 'wealthy-retiree',
    name: '🏖️ Wealthy Retiree - Lifestyle Move',
    description: 'Affluent 62-year-old retired couple moving from US to Portugal for lifestyle and tax benefits',
    data: {
      disclaimer: {
        accepted: true,
        dateAccepted: new Date().toISOString()
      },
      destination: {
        country: 'Portugal',
        region: 'Lisbon'
      },
      personalInformation: {
        dateOfBirth: '1962-11-08',
        nationalities: [
          { country: 'United States', willingToRenounce: false }
        ],
        maritalStatus: 'married',
        enduringMaritalStatusInfo: 'Married for 35 years',
        currentResidency: {
          country: 'United States',
          status: 'citizen',
          duration: 'since_birth'
        },
        relocationPartner: true,
        relocationPartnerInfo: {
          dateOfBirth: '1964-08-12',
          relationshipType: 'Spouse',
          sameSex: false,
          partnerNationalities: [
            { country: 'United States', willingToRenounce: false }
          ],
          officialRelationshipDuration: '35 years',
          fullRelationshipDuration: '37 years',
          currentResidency: {
            country: 'United States',
            status: 'citizen',
            duration: 'since_birth'
          }
        },
        dependents: []
      },
      education: {
        autoSkipped: true,
        previousDegrees: [
          {
            degreeName: 'Master of Business Administration',
            institution: 'Harvard Business School',
            startYear: 1985,
            endYear: 1987,
            inProgress: false
          }
        ],
        visaSkills: [],
        learningInterests: [
          {
            type: 'Language Learning',
            hoursPerWeek: 3,
            months: 24,
            status: 'in_progress',
            institution: 'Local Portuguese School',
            funding: 'self_funded'
          }
        ]
      },
      residencyIntentions: {
        destinationCountry: {
          moveType: 'permanent_residency',
          intendedTemporaryDurationOfStay: 0
        },
        physicalPresenceIntentions: {
          interestedInMinimumStay: false
        },
        citizenshipInterest: {
          interest: 'undecided',
          willingToConsider: {
            naturalization: false,
            familyConnections: false,
            investmentPrograms: true,
            militaryService: false,
            otherPrograms: true
          }
        },
        centerOfLife: {
          maintainOtherCountryTies: true,
          maintainOtherCountryTiesDetails: 'Adult children and grandchildren in US, investment properties'
        },
        backgroundDisclosures: {
          criminalRecord: false,
          taxComplianceIssues: false,
          previousVisaDenials: false
        },
        backgroundDisclosuresPartner: {
          criminalRecord: false,
          taxComplianceIssues: false,
          previousVisaDenials: false
        },
        userVisa: {
          applyForResidency: true
        },
        partnerVisa: {
          applyForResidency: true,
          citizenshipInterest: 'undecided',
          willingToConsider: {
            naturalization: false,
            familyConnections: false,
            investmentPrograms: true,
            militaryService: false,
            otherPrograms: true
          }
        },
        familyCoordination: {
          applicationTiming: 'together'
        },
        moveMotivation: 'Retirement lifestyle, favorable tax treatment, climate and culture',
        moveTiming: 'Within 18 months'
      },
      finance: {
        skipTaxSections: false,
        skipDetails: false,
        incomeSituation: 'gainfully_unemployed',
        scope: 'joint',
        totalWealth: {
          total: 2800000,
          currency: 'USD',
          primaryResidence: 850000
        },
        incomeSources: [
          {
            category: 'Investment Income',
            fields: { investment_type: 'Stocks/Dividends' },
            country: 'United States',
            amount: 120000,
            currency: 'USD',
            timeline: 'Current income',
            confidence: 'Confirmed',
            continueInDestination: true
          },
          {
            category: 'Pension/Retirement',
            fields: { pension_type: 'Private pension' },
            country: 'United States',
            amount: 85000,
            currency: 'USD',
            timeline: 'Current income',
            confidence: 'Confirmed',
            continueInDestination: true
          }
        ],
        partner: {
          incomeSituation: 'gainfully_unemployed',
          incomeSources: [
            {
              category: 'Investment Income',
              fields: { investment_type: 'Bonds/Interest' },
              country: 'United States',
              amount: 45000,
              currency: 'USD',
              timeline: 'Current income',
              confidence: 'Confirmed',
              continueInDestination: true
            }
          ]
        },
        capitalGains: {
          futureSales: [
            {
              asset: 'Vacation home in Florida',
              type: 'Real Estate',
              holdingTime: '> 10 years',
              surplusValue: 400000,
              currency: 'USD',
              timeframe: '1-2 years',
              country: 'United States',
              reason: 'Consolidating assets for Portugal move'
            },
            {
              asset: 'Stock portfolio (tech stocks)',
              type: 'Stocks/ETFs',
              holdingTime: '> 10 years',
              surplusValue: 300000,
              currency: 'USD',
              timeframe: '6-12 months',
              country: 'United States',
              reason: 'Rebalancing portfolio for international living'
            }
          ]
        },
        liabilities: []
      },
      socialSecurityAndPensions: {
        currentCountryContributions: {
          isContributing: false,
          country: 'United States',
          yearsOfContribution: 40
        },
        futurePensionContributions: {
          isPlanning: false,
          details: []
        }
      },
      taxDeductionsAndCredits: {
        potentialDeductions: [
          {
            type: 'Foreign Tax Credit',
            category: 'International',
            country: 'Portugal',
            amount: 15000,
            description: 'Portuguese taxes paid on investment income'
          }
        ]
      },
      futureFinancialPlans: {
        plannedInvestments: [
          {
            type: 'Real Estate',
            country: 'Portugal',
            estimatedValue: 600000
          },
          {
            type: 'Portuguese Government Bonds',
            country: 'Portugal',
            estimatedValue: 200000
          }
        ],
        businessPlans: [],
        retirementPlans: [
          {
            country: 'Portugal',
            estimatedAmount: 2500000,
            timeline: 'Current retirement funds'
          }
        ]
      },
      additionalInformation: {
        notes: 'Seeking a relaxed retirement lifestyle with favorable tax treatment and beautiful weather.',
        specialCircumstances: 'Considering Portugal Golden Visa program for investment-based residency.',
        specialSections: []
      }
    }
  }
]

export function getScenarioById(id: string): DebugScenario | undefined {
  return debugScenarios.find(scenario => scenario.id === id)
}

export function getScenarioNames(): Array<{ id: string; name: string; description: string }> {
  return debugScenarios.map(({ id, name, description }) => ({ id, name, description }))
}
