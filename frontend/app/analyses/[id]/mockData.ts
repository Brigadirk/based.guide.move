interface Country {
  id: string
  name: string
}

interface ResidencyIntentions {
  duration: string
  workType: string
  income: string
  householdSize: number
  lifestyle: string
}

export interface AnalysisCategory {
  name: string
  score: number
  details: string
  recommendations: string[]
  mostEligibleVisa?: {
    name: string
    score: number
    summary: string
  }
  otherVisas?: {
    name: string
    score: number
    summary: string
  }[]
}

export interface Analysis {
  id: string
  originCountry: Country
  destinationCountry: Country
  residencyIntentions: ResidencyIntentions
  status: string
  score: number
  summary: string
  createdAt: string
  categories: AnalysisCategory[]
}

export const mockAnalysis: Analysis = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  originCountry: {
    id: "united",
    name: "United States"
  },
  destinationCountry: {
    id: "portugal",
    name: "Portugal"
  },
  residencyIntentions: {
    duration: "1-2 years",
    workType: "Remote work for foreign company",
    income: "$100,000 - $150,000",
    householdSize: 2,
    lifestyle: "Digital Nomad"
  },
  status: "completed",
  score: 85,
  summary: "Based on your residency intentions, moving to Portugal appears to be a strong fit. The combination of your desired lifestyle, budget, and timeline aligns well with what Portugal offers.",
  createdAt: new Date().toISOString(),
  categories: [
    {
      name: "Visa Eligibility",
      score: 90,
      details: "You're highly eligible for the D7 visa based on your profile. Your income sources and financial stability are well-suited for this pathway.",
      recommendations: [
        "Prepare proof of passive income documentation",
        "Gather bank statements from the last 6 months",
        "Consider working with a visa specialist for application review"
      ],
      mostEligibleVisa: {
        name: "D7 Visa",
        score: 90,
        summary: "The D7 visa is ideal for individuals with passive income sources."
      },
      otherVisas: [
        {
          name: "Golden Visa",
          score: 85,
          summary: "The Golden Visa is suitable for those investing in real estate."
        },
        {
          name: "Startup Visa",
          score: 75,
          summary: "The Startup Visa is designed for entrepreneurs looking to establish a business."
        }
      ]
    },
    {
      name: "Cost of Living",
      score: 85,
      details: "Your budget aligns well with living costs in Portugal. Major cities like Lisbon and Porto may require higher budgets, but many beautiful coastal and inland areas fit your range perfectly.",
      recommendations: [
        "Research housing costs in specific regions",
        "Factor in healthcare insurance costs",
        "Consider setting aside funds for initial setup costs"
      ]
    },
    {
      name: "Lifestyle Match",
      score: 88,
      details: "Your lifestyle preferences match well with Portuguese culture. The emphasis on outdoor living, food, and community aligns with your interests.",
      recommendations: [
        "Join local expat groups for community integration",
        "Start learning Portuguese basics",
        "Research local activities and clubs in your areas of interest"
      ]
    },
    {
      name: "Timeline Feasibility",
      score: 78,
      details: "Your planned timeline is somewhat aggressive but achievable. The visa process typically takes 3-6 months.",
      recommendations: [
        "Begin gathering documents immediately",
        "Start Portuguese lessons now",
        "Plan an exploratory visit if possible"
      ]
    }
  ]
} 