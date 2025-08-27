'use client'

import { useState, useEffect } from 'react'

// Three different personas for comprehensive testing
const personas = {
  "young-professional": {
    name: "🚀 Young Tech Professional",
    description: "28-year-old software engineer from US, moving to Portugal for lifestyle and tax benefits",
    color: "#3b82f6",
    data: {
      personalInformation: {
        personal_information: {
          dateOfBirth: "1995-03-12",
          nationalities: [
            { country: "United States", willingToRenounce: false }
          ],
          maritalStatus: "single",
          enduringMaritalStatusInfo: "Never married, focused on career development",
          currentResidency: {
            country: "United States",
            status: "citizen",
            duration: "28 years"
          },
          partner: {
            hasPartner: false,
            sameSex: false,
            partnerNationalities: [],
            officialRelationshipDuration: "",
            unofficialRelationshipDuration: ""
          },
          dependents: []
        }
      },
      education: {
        education: {
          previousDegrees: [
            {
              degreeName: "Bachelor of Science in Computer Science",
              institution: "University of California, Berkeley",
              startYear: 2013,
              endYear: 2017,
              inProgress: false
            }
          ],
          visaSkills: [
            {
              skill: "Software Development",
              credentialName: "AWS Certified Solutions Architect",
              credentialInstitute: "Amazon Web Services"
            },
            {
              skill: "Machine Learning",
              credentialName: "TensorFlow Developer Certificate",
              credentialInstitute: "Google"
            }
          ],
          learningInterests: [
            {
              type: "Portuguese Language Course",
              hoursPerWeek: 5,
              months: 12,
              status: "planned",
              institution: "Babbel Online",
              funding: "self-funded"
            }
          ]
        }
      },
      residencyIntentions: {
        residency_intentions: {
          destinationCountry: {
            moveType: "permanent",
            intendedTemporaryDurationOfStay: "",
            citizenshipStatus: "interested"
          },
          residencyPlans: {
            applyForResidency: true,
            maxMonthsWillingToReside: 120,
            openToVisiting: true
          },
          citizenshipPlans: {
            interestedInCitizenship: true,
            willingToRenounceCurrent: false,
            investmentCitizenship: false,
            donationCitizenship: false,
            militaryService: false
          },
          languageProficiency: {
            primaryLanguage: "English",
            otherLanguages: [
              {
                language: "Spanish",
                proficiency: "intermediate",
                teachingCapability: "basic"
              }
            ]
          },
          centerOfLife: {
            familyTies: false,
            businessTies: true,
            socialTies: false
          },
          moveMotivation: "Better work-life balance, lower cost of living, and favorable tax environment for remote work",
          taxCompliantEverywhere: true
        }
      },
      finance: {
        finance: {
          skipTaxSections: false,
          totalWealth: {
            total: 250000,
            currency: "USD",
            primary_residence: 0
          },
          incomeStatus: "💰 Self-Funded (No Income)",
          capitalGains: {
            hasGains: true,
            futureSales: [
              {
                asset: "Tech Stock Portfolio",
                expectedGain: 45000,
                holdingPeriod: "long-term"
              }
            ]
          },
          incomeSources: [
            {
              category: "Remote Employment",
              fields: {
                "job_title": "Software Development",
                "employment_type": "Full-time"
              },
              country: "United States",
              amount: 120000,
              currency: "USD",
              continue_in_destination: true
            }
          ],
          liabilities: [
            {
              category: "Student Loan",
              fields: {
                "loan_type": "Federal Student Loan"
              },
              country: "United States", 
              amount: 35000,
              currency: "USD",
              interestRate: 4.5,
              paybackTimeline: "10 years"
            }
          ]
        },
        destination_country: "Portugal"
      },
      socialSecurityAndPensions: {
        social_security_and_pensions: {
          currentCountryContributions: {
            isContributing: true,
            country: "United States",
            yearsOfContribution: 7
          },
          futurePensionContributions: {
            isPlanning: true,
            details: [
              {
                pensionType: "401(k) Rollover",
                country: "United States",
                expectedAmount: 15000,
                startDate: "2024-06-01"
              }
            ]
          }
        },
        destination_country: "Portugal",
        skip_finance_details: false
      },
      taxDeductionsAndCredits: {
        tax_deductions_and_credits: {
          potentialDeductions: [
            {
              type: "Home Office",
              amount: 3000,
              currency: "USD",
              description: "Dedicated home office for remote work"
            },
            {
              type: "Professional Development",
              amount: 2500,
              currency: "USD", 
              description: "Courses and certifications for career advancement"
            }
          ]
        },
        destination_country: "Portugal",
        skip_finance_details: false
      },
      futureFinancialPlans: {
        future_financial_plans: {
          plannedInvestments: [
            {
              type: "Real Estate",
              amount: 200000,
              currency: "EUR",
              timeline: "2-3 years",
              description: "Purchase apartment in Lisbon"
            }
          ],
          businessPlans: [
            {
              type: "Consulting Business",
              expectedRevenue: 50000,
              currency: "EUR",
              timeline: "1 year",
              description: "Freelance software consulting"
            }
          ],
          retirementPlans: [
            {
              type: "IRA Contribution",
              amount: 6000,
              currency: "USD",
              timeline: "Annual",
              description: "Continue US retirement savings"
            }
          ]
        },
        destination_country: "Portugal",
        skip_finance_details: false
      },
      additionalInformation: {
        additional_information: {
          notes: "Planning to work remotely for US company while living in Portugal. Interested in D7 visa pathway.",
          specialCircumstances: "Will maintain US tax residency initially while establishing Portuguese residency",
          specialSections: ["remote-work-taxation", "dual-tax-residency"]
        }
      },
      summary: {
        profile: {
          destination: { country: "Portugal" },
          personalInformation: {
            dateOfBirth: "1995-03-12",
            nationalities: [{ country: "United States", willingToRenounce: false }],
            maritalStatus: "single"
          },
          finance: {
            totalWealth: { total: 250000, currency: "USD" },
            incomeSources: [{ amount: 120000, currency: "USD", category: "Remote Employment" }]
          }
        }
      },
      fullStory: {
        profile: {
          destination: { country: "Portugal" },
          personalInformation: {
            dateOfBirth: "1995-03-12",
            nationalities: [{ country: "United States", willingToRenounce: false }],
            maritalStatus: "single"
          }
        }
      },
      perplexityAnalysis: {
        prompt: "Analyze tax implications and visa requirements for a 28-year-old US software engineer moving to Portugal with $250k in assets and $120k remote income. Focus on D7 visa, NHR tax regime, and US tax obligations.",
        model: "sonar-deep-research"
      }
    }
  },
  
  "family-retiree": {
    name: "👨‍👩‍👧‍👦 Family Retirees",
    description: "Retired couple from UK with teenage children, moving to Spain for lifestyle and healthcare",
    color: "#059669",
    data: {
      personalInformation: {
        personal_information: {
          dateOfBirth: "1968-09-22",
          nationalities: [
            { country: "United Kingdom", willingToRenounce: false }
          ],
          maritalStatus: "married",
          enduringMaritalStatusInfo: "Married for 28 years, stable relationship",
          currentResidency: {
            country: "United Kingdom",
            status: "citizen",
            duration: "55 years"
          },
          partner: {
            hasPartner: true,
            sameSex: false,
            partnerNationalities: [
              { country: "United Kingdom", willingToRenounce: false }
            ],
            officialRelationshipDuration: "28 years",
            unofficialRelationshipDuration: "30 years"
          },
          dependents: [
            {
              relationship: "child",
              age: 16,
              nationalities: [
                { country: "United Kingdom", willingToRenounce: false }
              ]
            },
            {
              relationship: "child", 
              age: 14,
              nationalities: [
                { country: "United Kingdom", willingToRenounce: false }
              ]
            }
          ]
        }
      },
      education: {
        education: {
          previousDegrees: [
            {
              degreeName: "Master of Business Administration",
              institution: "London Business School",
              startYear: 1990,
              endYear: 1992,
              inProgress: false
            },
            {
              degreeName: "Bachelor of Arts in Economics",
              institution: "Oxford University",
              startYear: 1986,
              endYear: 1990,
              inProgress: false
            }
          ],
          visaSkills: [
            {
              skill: "Business Management",
              credentialName: "Chartered Management Institute",
              credentialInstitute: "CMI UK"
            }
          ],
          learningInterests: [
            {
              type: "Spanish Language Course",
              hoursPerWeek: 8,
              months: 18,
              status: "in-progress",
              institution: "Instituto Cervantes",
              funding: "self-funded"
            }
          ]
        }
      },
      residencyIntentions: {
        residency_intentions: {
          destinationCountry: {
            moveType: "permanent",
            intendedTemporaryDurationOfStay: "",
            citizenshipStatus: "considering"
          },
          residencyPlans: {
            applyForResidency: true,
            maxMonthsWillingToReside: 240,
            openToVisiting: false
          },
          citizenshipPlans: {
            interestedInCitizenship: true,
            willingToRenounceCurrent: false,
            investmentCitizenship: false,
            donationCitizenship: false,
            militaryService: false
          },
          languageProficiency: {
            primaryLanguage: "English",
            otherLanguages: [
              {
                language: "Spanish",
                proficiency: "beginner",
                teachingCapability: "none"
              },
              {
                language: "French",
                proficiency: "intermediate",
                teachingCapability: "basic"
              }
            ]
          },
          centerOfLife: {
            familyTies: true,
            businessTies: false,
            socialTies: true
          },
          moveMotivation: "Better climate for health, excellent healthcare system, lower cost of living, and quality education for children",
          taxCompliantEverywhere: true
        }
      },
      finance: {
        finance: {
          skipTaxSections: false,
          totalWealth: {
            total: 850000,
            currency: "GBP",
            primary_residence: 450000
          },
          incomeStatus: "🏖️ Retired",
          capitalGains: {
            hasGains: true,
            futureSales: [
              {
                asset: "UK Property Portfolio",
                expectedGain: 120000,
                holdingPeriod: "long-term"
              },
              {
                asset: "Investment Stocks",
                expectedGain: 35000,
                holdingPeriod: "long-term"
              }
            ]
          },
          incomeSources: [
            {
              category: "Pension",
              fields: {
                "pension_type": "Private Pension",
                "frequency": "Monthly"
              },
              country: "United Kingdom",
              amount: 3200,
              currency: "GBP",
              continue_in_destination: true
            },
            {
              category: "Investment Income",
              fields: {
                "investment_type": "Dividend Income",
                "frequency": "Quarterly"
              },
              country: "United Kingdom", 
              amount: 8000,
              currency: "GBP",
              continue_in_destination: true
            }
          ],
          liabilities: [
            {
              category: "Mortgage",
              fields: {
                "property_type": "Buy-to-Let Property"
              },
              country: "United Kingdom",
              amount: 180000,
              currency: "GBP",
              interestRate: 3.2,
              paybackTimeline: "15 years"
            }
          ]
        },
        destination_country: "Spain"
      },
      socialSecurityAndPensions: {
        social_security_and_pensions: {
          currentCountryContributions: {
            isContributing: false,
            country: "United Kingdom",
            yearsOfContribution: 35
          },
          futurePensionContributions: {
            isPlanning: false,
            details: []
          }
        },
        destination_country: "Spain",
        skip_finance_details: false
      },
      taxDeductionsAndCredits: {
        tax_deductions_and_credits: {
          potentialDeductions: [
            {
              type: "Healthcare Expenses",
              amount: 4500,
              currency: "GBP",
              description: "Private healthcare and medical treatments"
            },
            {
              type: "Education Expenses",
              amount: 12000,
              currency: "GBP",
              description: "International school fees for children"
            }
          ]
        },
        destination_country: "Spain",
        skip_finance_details: false
      },
      futureFinancialPlans: {
        future_financial_plans: {
          plannedInvestments: [
            {
              type: "Real Estate",
              amount: 350000,
              currency: "EUR",
              timeline: "6 months",
              description: "Family home in Valencia"
            }
          ],
          businessPlans: [],
          retirementPlans: [
            {
              type: "Pension Transfer",
              amount: 450000,
              currency: "GBP",
              timeline: "1 year",
              description: "Transfer UK pension to QROPS"
            }
          ]
        },
        destination_country: "Spain",
        skip_finance_details: false
      },
      additionalInformation: {
        additional_information: {
          notes: "Family of four seeking permanent relocation to Spain. Priority on healthcare access and children's education.",
          specialCircumstances: "Need to maintain UK property rental income. Children require international school placement.",
          specialSections: ["family-relocation", "education-planning", "healthcare-access"]
        }
      },
      summary: {
        profile: {
          destination: { country: "Spain" },
          personalInformation: {
            dateOfBirth: "1968-09-22",
            nationalities: [{ country: "United Kingdom", willingToRenounce: false }],
            maritalStatus: "married",
            dependents: [{ age: 16 }, { age: 14 }]
          },
          finance: {
            totalWealth: { total: 850000, currency: "GBP" },
            incomeSources: [{ amount: 3200, currency: "GBP", category: "Pension" }]
          }
        }
      },
      fullStory: {
        profile: {
          destination: { country: "Spain" },
          personalInformation: {
            dateOfBirth: "1968-09-22",
            nationalities: [{ country: "United Kingdom", willingToRenounce: false }],
            maritalStatus: "married"
          }
        }
      },
      perplexityAnalysis: {
        prompt: "Analyze relocation requirements for UK family (2 adults, 2 teenage children) moving to Spain with £850k assets and £3.2k monthly pension. Focus on residency visa, tax implications, healthcare access, and education options.",
        model: "sonar-deep-research"
      }
    }
  },

  "entrepreneur": {
    name: "💼 Serial Entrepreneur", 
    description: "45-year-old business owner from Germany, expanding to Singapore for business opportunities",
    color: "#dc2626",
    data: {
      personalInformation: {
        personal_information: {
          dateOfBirth: "1978-11-08",
          nationalities: [
            { country: "Germany", willingToRenounce: false },
            { country: "Austria", willingToRenounce: true }
          ],
          maritalStatus: "divorced",
          enduringMaritalStatusInfo: "Divorced 3 years ago, co-parenting arrangement",
          currentResidency: {
            country: "Germany",
            status: "citizen",
            duration: "45 years"
          },
          partner: {
            hasPartner: false,
            sameSex: false,
            partnerNationalities: [],
            officialRelationshipDuration: "",
            unofficialRelationshipDuration: ""
          },
          dependents: [
            {
              relationship: "child",
              age: 12,
              nationalities: [
                { country: "Germany", willingToRenounce: false }
              ]
            }
          ]
        }
      },
      education: {
        education: {
          previousDegrees: [
            {
              degreeName: "Master of Science in Engineering",
              institution: "Technical University of Munich",
              startYear: 1998,
              endYear: 2003,
              inProgress: false
            },
            {
              degreeName: "Master of Business Administration",
              institution: "INSEAD",
              startYear: 2008,
              endYear: 2009,
              inProgress: false
            }
          ],
          visaSkills: [
            {
              skill: "Business Development",
              credentialName: "Certified Management Consultant",
              credentialInstitute: "German Management Consultants Association"
            },
            {
              skill: "Technology Innovation",
              credentialName: "Patent Holder - IoT Systems",
              credentialInstitute: "European Patent Office"
            }
          ],
          learningInterests: [
            {
              type: "Mandarin Language Course",
              hoursPerWeek: 4,
              months: 24,
              status: "in-progress",
              institution: "Confucius Institute",
              funding: "company-sponsored"
            }
          ]
        }
      },
      residencyIntentions: {
        residency_intentions: {
          destinationCountry: {
            moveType: "temporary",
            intendedTemporaryDurationOfStay: "3-5 years",
            citizenshipStatus: "not-interested"
          },
          residencyPlans: {
            applyForResidency: true,
            maxMonthsWillingToReside: 60,
            openToVisiting: true
          },
          citizenshipPlans: {
            interestedInCitizenship: false,
            willingToRenounceCurrent: false,
            investmentCitizenship: true,
            donationCitizenship: false,
            militaryService: false
          },
          languageProficiency: {
            primaryLanguage: "German",
            otherLanguages: [
              {
                language: "English",
                proficiency: "fluent",
                teachingCapability: "advanced"
              },
              {
                language: "Mandarin",
                proficiency: "beginner",
                teachingCapability: "none"
              }
            ]
          },
          centerOfLife: {
            familyTies: true,
            businessTies: true,
            socialTies: false
          },
          moveMotivation: "Expand business operations in Asian markets, establish regional headquarters, and access to international talent pool",
          taxCompliantEverywhere: true
        }
      },
      finance: {
        finance: {
          skipTaxSections: false,
          totalWealth: {
            total: 2400000,
            currency: "EUR",
            primary_residence: 650000
          },
          incomeStatus: "🔍 Need New Income Sources",
          capitalGains: {
            hasGains: true,
            futureSales: [
              {
                asset: "Company Shares (Partial Exit)",
                expectedGain: 800000,
                holdingPeriod: "long-term"
              },
              {
                asset: "Real Estate Portfolio",
                expectedGain: 200000,
                holdingPeriod: "long-term"
              }
            ]
          },
          incomeSources: [
            {
              category: "Business Income",
              fields: {
                "business_type": "Company Dividends",
                "frequency": "Annual"
              },
              country: "Germany",
              amount: 180000,
              currency: "EUR",
              continue_in_destination: true
            },
            {
              category: "Expected Employment",
              fields: {
                "job_title": "Regional Director",
                "employment_type": "This is an expected income source after moving (for tax planning)"
              },
              country: "Singapore",
              amount: 250000,
              currency: "SGD",
              continue_in_destination: true
            }
          ],
          liabilities: [
            {
              category: "Business Loan",
              fields: {
                "loan_purpose": "Expansion Capital"
              },
              country: "Germany",
              amount: 450000,
              currency: "EUR",
              interestRate: 2.8,
              paybackTimeline: "7 years"
            },
            {
              category: "Mortgage",
              fields: {
                "property_type": "Primary Residence"
              },
              country: "Germany",
              amount: 320000,
              currency: "EUR",
              interestRate: 1.9,
              paybackTimeline: "12 years"
            }
          ]
        },
        destination_country: "Singapore"
      },
      socialSecurityAndPensions: {
        social_security_and_pensions: {
          currentCountryContributions: {
            isContributing: true,
            country: "Germany",
            yearsOfContribution: 22
          },
          futurePensionContributions: {
            isPlanning: true,
            details: [
              {
                pensionType: "Private Pension Plan",
                country: "Singapore",
                expectedAmount: 25000,
                startDate: "2024-09-01"
              }
            ]
          }
        },
        destination_country: "Singapore",
        skip_finance_details: false
      },
      taxDeductionsAndCredits: {
        tax_deductions_and_credits: {
          potentialDeductions: [
            {
              type: "Business Expenses",
              amount: 45000,
              currency: "EUR",
              description: "International business development and travel"
            },
            {
              type: "R&D Investment",
              amount: 85000,
              currency: "EUR",
              description: "Technology research and patent development"
            },
            {
              type: "Child Support",
              amount: 18000,
              currency: "EUR",
              description: "Child support payments and education expenses"
            }
          ]
        },
        destination_country: "Singapore",
        skip_finance_details: false
      },
      futureFinancialPlans: {
        future_financial_plans: {
          plannedInvestments: [
            {
              type: "Business Expansion",
              amount: 500000,
              currency: "SGD",
              timeline: "18 months",
              description: "Establish Singapore subsidiary and hire local team"
            },
            {
              type: "Real Estate",
              amount: 1200000,
              currency: "SGD",
              timeline: "2 years",
              description: "Purchase condo in Singapore for residency"
            }
          ],
          businessPlans: [
            {
              type: "Tech Startup",
              expectedRevenue: 2000000,
              currency: "SGD",
              timeline: "3 years",
              description: "AI-powered logistics platform for Southeast Asia"
            }
          ],
          retirementPlans: [
            {
              type: "International Pension",
              amount: 50000,
              currency: "EUR",
              timeline: "Annual",
              description: "Maintain German pension contributions"
            }
          ]
        },
        destination_country: "Singapore",
        skip_finance_details: false
      },
      additionalInformation: {
        additional_information: {
          notes: "Seeking to establish regional business presence while maintaining German tax residency initially. Complex international business structure.",
          specialCircumstances: "Dual citizenship (Germany/Austria), co-parenting arrangement requiring frequent travel, significant business assets across multiple jurisdictions",
          specialSections: ["international-business", "dual-citizenship", "co-parenting-arrangements"]
        }
      },
      summary: {
        profile: {
          destination: { country: "Singapore" },
          personalInformation: {
            dateOfBirth: "1978-11-08",
            nationalities: [{ country: "Germany", willingToRenounce: false }, { country: "Austria", willingToRenounce: true }],
            maritalStatus: "divorced",
            dependents: [{ age: 12 }]
          },
          finance: {
            totalWealth: { total: 2400000, currency: "EUR" },
            incomeSources: [{ amount: 180000, currency: "EUR", category: "Business Income" }]
          }
        }
      },
      fullStory: {
        profile: {
          destination: { country: "Singapore" },
          personalInformation: {
            dateOfBirth: "1978-11-08",
            nationalities: [{ country: "Germany", willingToRenounce: false }],
            maritalStatus: "divorced"
          }
        }
      },
      perplexityAnalysis: {
        prompt: "Analyze business expansion and tax strategy for German entrepreneur moving to Singapore with €2.4M assets and €180k business income. Focus on EntrePass visa, tax optimization, international business structure, and maintaining German ties.",
        model: "sonar-deep-research"
      }
    }
  }
}

// Current selected persona and mock data
const defaultPersona = "young-professional"

interface ApiResponse {
  success?: boolean
  data?: any
  error?: string
  status?: number
}

export default function BackendTester() {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [selectedPersona, setSelectedPersona] = useState(defaultPersona)
  const [editableData, setEditableData] = useState(personas[defaultPersona].data)
  const [converterAmount, setConverterAmount] = useState('100')
  const [converterFrom, setConverterFrom] = useState('USD')
  const [converterTo, setConverterTo] = useState('EUR')
  
  // Backend URL management
  const [backendUrl, setBackendUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedUrl = localStorage.getItem('backend-tester-url')
      // Clean up any old localhost URLs and replace with IPv4
      if (storedUrl && storedUrl.includes('localhost')) {
        const cleanedUrl = storedUrl.replace('http://localhost:', 'http://127.0.0.1:')
        localStorage.setItem('backend-tester-url', cleanedUrl)
        return cleanedUrl
      }
      return storedUrl || getDefaultBackendUrl()
    }
    return getDefaultBackendUrl()
  })
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
  
  // Test connection on initial load
  useEffect(() => {
    testConnection().then(isConnected => setConnectionStatus(isConnected ? 'connected' : 'error'))
  }, [backendUrl])
  
  function getDefaultBackendUrl() {
    const normalize = (u?: string) => (u ? u.replace('://localhost', '://127.0.0.1') : u)
    // Priority order: try to use environment variables, fallback to reasonable defaults
    if (process.env.NODE_ENV === 'production') {
      // In production, use public URL
      return normalize(process.env.NEXT_PUBLIC_API_URL) || 'https://example.invalid'
    } else {
      // In development, prefer local, then public URL
      return normalize(process.env.NEXT_PUBLIC_LOCAL_URL) ||
             normalize(process.env.NEXT_PUBLIC_API_URL) ||
             'http://127.0.0.1:5001' // Last resort fallback for development
    }
  }

  // Get backend URL for display purposes
  const getBackendUrl = () => {
    const normalize = (u?: string) => (u ? u.replace('://localhost', '://127.0.0.1') : u)
    if (process.env.NODE_ENV === 'production') {
      // In production, use public URL
      return normalize(process.env.NEXT_PUBLIC_API_URL) || 'https://example.invalid'
    } else {
      // In development, prefer local then public URL
      return normalize(process.env.NEXT_PUBLIC_LOCAL_URL) ||
             normalize(process.env.NEXT_PUBLIC_API_URL) ||
             'http://127.0.0.1:5001'
    }
  }

  // Test backend connection
  const testConnection = async (url: string = backendUrl) => {
    try {
      // Test the health endpoint directly (not through API proxy)
      // Use the provided URL parameter, not environment variables
      const healthUrl = url ? `${url}/health` : 'http://127.0.0.1:5001/health'

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // Save backend URL to localStorage when it changes
  const updateBackendUrl = async (newUrl: string) => {
    // Ensure we always use IPv4 address for localhost
    const cleanUrl = newUrl.replace('http://localhost:', 'http://127.0.0.1:')
    setBackendUrl(cleanUrl)
    if (typeof window !== 'undefined') {
      localStorage.setItem('backend-tester-url', cleanUrl)
    }

    // Test connection to new URL
    setConnectionStatus('unknown')
    const isConnected = await testConnection(cleanUrl)
    setConnectionStatus(isConnected ? 'connected' : 'error')
  }

  // Handle persona change
  const handlePersonaChange = (personaKey: string) => {
    setSelectedPersona(personaKey)
    setEditableData(personas[personaKey as keyof typeof personas].data as any)
    // Clear previous responses when switching personas
    setResponses({})
  }

  const callApi = async (endpoint: string, method: 'GET' | 'POST' = 'POST', data?: any) => {
    const key = endpoint.replace(/\//g, '_')
    setLoading(prev => ({ ...prev, [key]: true }))

    try {
      console.log(`Calling ${method} ${endpoint}`)
      console.log('Data:', data)

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (data && method === 'POST') {
        options.body = JSON.stringify(data)
      }

      // Always use API proxy so headers (API key, base URL) are applied uniformly
      // Pass selected backend base URL via header so proxy can target the right origin
      const proxyOptions: RequestInit = {
        ...options,
        headers: {
          ...(options.headers as Record<string, string>),
          'x-backend-base-url': backendUrl,
        },
      }

      const response = await fetch(`/api/backend${endpoint}`, proxyOptions)

      let result
      try {
        console.log(`[callApi] Response status: ${response.status}`)
        console.log(`[callApi] Response headers:`, Object.fromEntries(response.headers.entries()))
        result = await response.json()
        console.log(`[callApi] Successfully parsed JSON:`, result)
      } catch (parseError) {
        console.error('[callApi] JSON parse error:', parseError)
        console.error('[callApi] Response status:', response.status)
        console.error('[callApi] Response statusText:', response.statusText)
        result = {
          error: 'Invalid JSON response',
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          status: response.status,
          statusText: response.statusText
        }
      }

      setResponses(prev => ({
        ...prev,
        [key]: {
          success: response.ok,
          data: result,
          status: response.status,
        },
      }))
      
    } catch (error) {
      console.error('API call failed:', error)
      setResponses(prev => ({
        ...prev,
        [key]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  const TestButton = ({ 
    endpoint, 
    method = 'POST', 
    label, 
    dataKey 
  }: { 
    endpoint: string
    method?: 'GET' | 'POST'
    label: string
    dataKey?: string
  }) => {
    const key = endpoint.replace(/\//g, '_')
    const isLoading = loading[key]
    const response = responses[key]
    const data = dataKey ? editableData[dataKey as keyof typeof editableData] : null
    const isExchangeRate = endpoint.includes('exchange-rates')
    
    return (
      <div style={{ marginBottom: '24px', border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => callApi(endpoint, method, data)}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Loading...' : `${method} ${label}`}
          </button>
          
          <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
            {endpoint}
          </span>
        </div>

        {dataKey && data && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '12px' }}>
              Request Data (editable):
            </label>
            <textarea
              value={JSON.stringify(data, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setEditableData(prev => ({ ...prev, [dataKey]: parsed }))
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              style={{
                width: '100%',
                height: '120px',
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}
            />
          </div>
        )}

        {isExchangeRate && response?.success && response.data && (
          <ExchangeRateDisplay rates={response.data} />
        )}

        {response && (
          <div style={{ 
            backgroundColor: response.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${response.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: response.success ? '#155724' : '#721c24',
              marginBottom: '8px'
            }}>
              {response.success ? '✅ SUCCESS' : '❌ ERROR'} 
              {response.status && ` (${response.status})`}
            </div>
            
            <pre style={{ 
              margin: 0, 
              fontSize: '11px', 
              whiteSpace: 'pre-wrap',
              maxHeight: '300px',
              overflow: 'auto',
              backgroundColor: response.success ? '#f8f9fa' : '#fff',
              padding: '8px',
              borderRadius: '4px'
            }}>
              {response.error || JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const ExchangeRateDisplay = ({ rates }: { rates: any }) => {
    if (!rates || !rates.rates) return null
    
    const rateEntries = Object.entries(rates.rates).slice(0, 10)
    const totalRates = Object.keys(rates.rates).length
    
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Exchange Rates (USD Base) - Showing {rateEntries.length} of {totalRates} currencies
        </div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
          Last Updated: {rates.metadata?.last_updated || 'Unknown'} 
          ({rates.metadata?.file_age_hours ? `${rates.metadata.file_age_hours}h ago` : 'Unknown age'})
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          {rateEntries.map(([currency, rate]) => (
            <div key={currency} style={{ 
              padding: '4px 8px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              fontSize: '11px',
              border: '1px solid #e9ecef'
            }}>
              <strong>{currency}</strong>: {typeof rate === 'number' ? rate.toFixed(4) : String(rate)}
            </div>
          ))}
        </div>
        {totalRates > 10 && (
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
            ...and {totalRates - 10} more currencies (see full response below)
          </div>
        )}
      </div>
    )
  }

  const BackendUrlSwitcher = () => {
    const [customUrl, setCustomUrl] = useState('')
    const [showCustomInput, setShowCustomInput] = useState(false)
    const [activePreset, setActivePreset] = useState<string | null>(null)
    
      const presetUrls = [
    {
      label: 'Production',
      url: process.env.NEXT_PUBLIC_PRODUCTION_API_URL,
      description: 'Production Backend URL',
      envVar: 'NEXT_PUBLIC_PRODUCTION_API_URL'
    },
    {
      label: 'Staging',
      url: process.env.NEXT_PUBLIC_STAGING_API_URL,
      description: 'Staging Backend URL',
      envVar: 'NEXT_PUBLIC_STAGING_API_URL'
    },
    {
      label: 'Railway Public',
      url: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001',
      description: 'Public Railway URL (accessible from internet)',
      envVar: 'NEXT_PUBLIC_API_URL'
    },
    {
      label: 'Local Development',
      url: process.env.NEXT_PUBLIC_LOCAL_URL || 'http://127.0.0.1:5001',
      description: 'Local backend server',
      envVar: 'NEXT_PUBLIC_LOCAL_URL'
    }
  ]
    
    const handlePresetSelect = async (preset: any) => {
      // Always attempt to update; when not set, we still pass a safe default
      const targetUrl = preset.url && typeof preset.url === 'string' && preset.url.trim().length > 0
        ? preset.url
        : (preset.envVar === 'NEXT_PUBLIC_INTERNAL_API_URL' ? 'http://bonobo-backend.railway.internal' : 'http://127.0.0.1:5001')

      await updateBackendUrl(targetUrl)
      setShowCustomInput(false)
      setActivePreset(preset.label)
    }
    
    const handleCustomSubmit = async () => {
      if (customUrl.trim()) {
        await updateBackendUrl(customUrl.trim())
        setShowCustomInput(false)
        setCustomUrl('')
        setActivePreset(null) // Clear active preset when using custom URL
      }
    }
    
    return (
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#0c4a6e' }}>
          🔗 Backend URL Configuration
        </div>
        
        {/* Debug: Show environment variables */}
        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '8px', fontFamily: 'monospace', backgroundColor: '#f9fafb', padding: '4px 8px', borderRadius: '4px' }}>
          Debug: Public={process.env.NEXT_PUBLIC_API_URL || 'undefined'} |
          ProdURL={process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'undefined'} |
          StagingURL={process.env.NEXT_PUBLIC_STAGING_API_URL || 'undefined'} |
          Local={process.env.NEXT_PUBLIC_LOCAL_URL || 'undefined'} |
          Env={process.env.NODE_ENV || 'development'} |
          Active URL={getBackendUrl()}
        </div>
        
        <div style={{ marginBottom: '12px' }} suppressHydrationWarning>
          <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Current: <strong>{backendUrl}</strong></span>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              backgroundColor: connectionStatus === 'connected' ? '#dcfce7' : connectionStatus === 'error' ? '#fecaca' : '#f3f4f6',
              color: connectionStatus === 'connected' ? '#166534' : connectionStatus === 'error' ? '#dc2626' : '#6b7280'
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%',
                backgroundColor: connectionStatus === 'connected' ? '#16a34a' : connectionStatus === 'error' ? '#dc2626' : '#9ca3af'
              }}></span>
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Unknown'}
            </span>
            <button
              onClick={() => testConnection().then(isConnected => setConnectionStatus(isConnected ? 'connected' : 'error'))}
              style={{
                padding: '2px 6px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Test
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {presetUrls.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: activePreset === preset.label ? '#0ea5e9' : preset.url ? 'white' : '#f3f4f6',
                  color: activePreset === preset.label ? 'white' : preset.url ? '#0c4a6e' : '#6b7280',
                  border: `1px solid ${preset.url ? '#0ea5e9' : '#d1d5db'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activePreset === preset.label ? 'bold' : 'normal',
                  opacity: preset.url ? 1 : 0.7
                }}
                title={preset.url ? `${preset.description}\nURL: ${preset.url}` : `${preset.description}\nNot configured - set ${preset.envVar}`}
              >
                {preset.label} {!preset.url && '(not set)'}
              </button>
            ))}
            
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#0c4a6e',
                border: '1px solid #0ea5e9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Custom URL
            </button>
          </div>
          
          {showCustomInput && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-backend-url.com"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #0ea5e9',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <button
                onClick={handleCustomSubmit}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Set
              </button>
            </div>
          )}
        </div>
        
        <div style={{ fontSize: '11px', color: '#0c4a6e', opacity: 0.8 }}>
          💡 Switch between internal Railway network (secure) and public URLs for testing
        </div>
      </div>
    )
  }

  const CurrencyConverter = () => {
    const exchangeRateResponse = responses['api_v1_exchange-rates']
    if (!exchangeRateResponse?.success || !exchangeRateResponse.data?.rates) {
      return (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Currency Converter</div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            Please fetch exchange rates first to use the converter
          </div>
        </div>
      )
    }

    const rates = exchangeRateResponse.data.rates
    const currencies = Object.keys(rates).sort()
    if (!currencies.includes('USD')) {
      currencies.unshift('USD')
    }
    
    const convertCurrency = () => {
      const amount = parseFloat(converterAmount) || 0
      if (converterFrom === converterTo) return amount
      
      let result = amount
      if (converterFrom !== 'USD') {
        const fromRate = rates[converterFrom]
        if (!fromRate) return 'Invalid currency'
        result = amount / fromRate
      }
      if (converterTo !== 'USD') {
        const toRate = rates[converterTo]
        if (!toRate) return 'Invalid currency'
        result = result * toRate
      }
      return result.toFixed(4)
    }

    return (
      <div style={{ 
        backgroundColor: '#e7f3ff', 
        border: '1px solid #b3d9ff', 
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>Currency Converter</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            value={converterAmount}
            onChange={(e) => setConverterAmount(e.target.value)}
            style={{
              padding: '6px',
              width: '100px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Amount"
          />
          <select
            value={converterFrom}
            onChange={(e) => setConverterFrom(e.target.value)}
            style={{
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold' }}>→</span>
          <select
            value={converterTo}
            onChange={(e) => setConverterTo(e.target.value)}
            style={{
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <span style={{ fontWeight: 'bold', color: '#0c5460' }}>
            = {convertCurrency()} {converterTo}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#0c5460', marginTop: '8px' }}>
          Using exchange rates from: {exchangeRateResponse.data.metadata?.last_updated || 'Unknown'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '24px' }}>
        🧪 Backend API Tester - BasedGuide
      </h1>
      
      <BackendUrlSwitcher />
      
      {/* Persona Selector */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#495057' }}>👤 Test Personas</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {Object.entries(personas).map(([key, persona]) => (
            <button
              key={key}
              onClick={() => handlePersonaChange(key)}
              style={{
                padding: '12px 16px',
                backgroundColor: selectedPersona === key ? persona.color : 'white',
                color: selectedPersona === key ? 'white' : persona.color,
                border: `2px solid ${persona.color}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              {persona.name}
            </button>
          ))}
        </div>
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          borderRadius: '6px',
          border: `2px solid ${personas[selectedPersona as keyof typeof personas].color}20`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: personas[selectedPersona as keyof typeof personas].color }}>
            {personas[selectedPersona as keyof typeof personas].name}
          </div>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {personas[selectedPersona as keyof typeof personas].description}
          </div>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Environment Info:</h3>
        <p style={{ margin: 0, fontFamily: 'monospace' }}>
          Active Backend: <strong>{backendUrl}</strong><br/>
          Environment: <strong>{process.env.NODE_ENV || 'development'}</strong><br/>
          Default URL: <strong>{getDefaultBackendUrl()}</strong><br/>
          Selected Persona: <strong style={{ color: personas[selectedPersona as keyof typeof personas].color }}>
            {personas[selectedPersona as keyof typeof personas].name}
          </strong>
        </p>
      </div>

      <h2>Health & System Endpoints</h2>
      <TestButton endpoint="/health" method="GET" label="Health Check" />
      <TestButton endpoint="/api/v1/ping" method="GET" label="API Ping" />
      <TestButton endpoint="/api/v1/exchange-rates/files" method="GET" label="List Exchange Rate Files" />
      <TestButton endpoint="/api/v1/exchange-rates/file/latest" method="GET" label="Read Latest Exchange Rate File" />

      <h2>Section Story Endpoints</h2>
      <TestButton 
        endpoint="/api/v1/section/personal-information" 
        dataKey="personalInformation"
        label="Personal Information Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/education" 
        dataKey="education"
        label="Education Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/residency-intentions" 
        dataKey="residencyIntentions"
        label="Residency Intentions Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/finance" 
        dataKey="finance"
        label="Finance Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/social-security-pensions" 
        dataKey="socialSecurityAndPensions"
        label="Social Security & Pensions Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/tax-deductions-credits" 
        dataKey="taxDeductionsAndCredits"
        label="Tax Deductions & Credits Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/future-financial-plans"
        dataKey="futureFinancialPlans"
        label="Future Financial Plans Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/additional-information"
        dataKey="additionalInformation"
        label="Additional Information Story" 
      />
      <TestButton 
        endpoint="/api/v1/section/summary"
        dataKey="summary"
        label="Complete Summary Story" 
      />

      <h2>Advanced Analysis Endpoints</h2>
      <TestButton 
        endpoint="/api/v1/generate-full-story"
        dataKey="fullStory"
        label="Generate Full Story" 
      />
      <TestButton 
        endpoint="/api/v1/perplexity-analysis"
        dataKey="perplexityAnalysis"
        label="Perplexity AI Analysis" 
      />

      <h2>Exchange Rate Endpoints</h2>
      <CurrencyConverter />
      <TestButton 
        endpoint="/api/v1/exchange-rates" 
        method="GET"
        label="Get Exchange Rates" 
      />
      <TestButton 
        endpoint="/api/v1/exchange-rates/refresh" 
        method="POST"
        label="Refresh Exchange Rates" 
      />
    </div>
  )
}
