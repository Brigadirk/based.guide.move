export interface AnalysisCategory {
  id: string
  title: string
  score: number
  maxScore: number
  description: string
  details: AnalysisDetail[]
  recommendations: string[]
  // Additional visa-specific properties
  mostEligibleVisa?: {
    name: string
    type: string
    description: string
    requirements: string[]
    processingTime: string
    cost: string
    score: number
  }
  alternativeVisas?: Array<{
    type: string
    description: string
    requirements: string[]
    processingTime: string
    cost: string
  }>
}

export interface AnalysisDetail {
  id: string
  title: string
  description: string
  score: number
  maxScore: number
  impact: "positive" | "negative" | "neutral"
  requirements?: string[]
  tips?: string[]
}

export const mockAnalysisData: AnalysisCategory[] = [
  {
    id: "visa",
    title: "Visa Eligibility",
    score: 85,
    maxScore: 100,
    description: "Your visa eligibility for Portugal",
    details: [
      {
        id: "work-visa",
        title: "Work Visa",
        description: "Based on your employment situation",
        score: 90,
        maxScore: 100,
        impact: "positive",
        requirements: ["Job offer", "Qualification recognition"],
        tips: ["Consider remote work arrangements", "Research job market"]
      }
    ],
    recommendations: [
      "Apply for D7 visa for remote workers",
      "Consider starting job search early"
    ],
    mostEligibleVisa: {
      name: "D7 Visa (Passive Income)",
      type: "D7 Visa (Passive Income)",
      description: "For remote workers and those with passive income",
      requirements: [
        "Proof of remote income or passive income",
        "Clean criminal record",
        "Health insurance",
        "Proof of accommodation"
      ],
      processingTime: "3-6 months",
      cost: "€83 + additional fees",
      score: 85
    },
    alternativeVisas: [
      {
        type: "D2 Visa (Investment)",
        description: "For entrepreneurs and investors",
        requirements: [
          "Business plan",
          "Investment capital proof",
          "Portuguese bank account"
        ],
        processingTime: "4-8 months",
        cost: "€83 + legal fees"
      }
    ]
  },
  {
    id: "tax",
    title: "Tax Implications",
    score: 75,
    maxScore: 100,
    description: "Your tax situation in Portugal",
    details: [
      {
        id: "income-tax",
        title: "Income Tax",
        description: "Personal income tax rates",
        score: 80,
        maxScore: 100,
        impact: "neutral",
        requirements: ["Tax residency status"],
        tips: ["Consider NHR program"]
      }
    ],
    recommendations: [
      "Look into Non-Habitual Resident program",
      "Consult with tax advisor"
    ]
  }
]
