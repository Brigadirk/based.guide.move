'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from "next/navigation"
import { ScrollableContainer } from "@/components/ui/scrollable-container"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AnalysisHeader } from "@/components/features/analysis/analysis-header"
import { AnalysisInput } from "@/components/features/analysis/analysis-input"
import {
  TaxOverviewCard,
  VisaOverviewCard,
  CostOverviewCard,
  LifestyleOverviewCard,
  TimelineOverviewCard
} from "@/components/features/analysis/overview"
import { VisaEligibilityTab, TaxesTab } from "@/components/features/analysis/tabs"
import { mockAnalysis, Analysis, AnalysisCategory } from './mockData'
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { ProfileCard } from "@/components/ui/profile-card"

export default function AnalysisResultPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const visaCategory = mockAnalysis.categories.find((category: AnalysisCategory) => category.name === "Visa Eligibility")
  const costCategory = mockAnalysis.categories.find((category: AnalysisCategory) => category.name === "Cost of Living")
  const lifestyleCategory = mockAnalysis.categories.find((category: AnalysisCategory) => category.name === "Lifestyle Match")
  const timelineCategory = mockAnalysis.categories.find((category: AnalysisCategory) => category.name === "Timeline Feasibility")

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: (
        <Card>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This overview provides a summary of key aspects of your analysis, including visa eligibility, cost of living, and lifestyle match.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <TaxOverviewCard 
                taxBurden={30000}
                taxSavings={5}
              />
              <VisaOverviewCard 
                score={visaCategory?.score ?? 0}
                visaName={visaCategory?.mostEligibleVisa?.name ?? 'N/A'}
              />
              <CostOverviewCard 
                costDifference="+$5K/y"
                score={costCategory?.score ?? 0}
              />
              <LifestyleOverviewCard 
                matchLevel="Strong"
                score={lifestyleCategory?.score ?? 0}
              />
              <TimelineOverviewCard 
                feasibility="Achievable"
                score={timelineCategory?.score ?? 0}
              />
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      value: "taxes",
      label: "Taxes",
      content: (
        <TaxesTab
          score={8}
          taxBurden={30000}
          taxSavings={5000}
          originCountry="United States"
        />
      )
    },
    {
      value: "visa-eligibility",
      label: "Visa Eligibility",
      content: visaCategory && (
        <VisaEligibilityTab category={visaCategory} />
      )
    },
    {
      value: "cost-of-living",
      label: "Cost of Living",
      content: costCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cost of Living
              <span className="text-sm font-normal">Score: {costCategory.score}/100</span>
            </CardTitle>
            <Progress value={costCategory.score} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{costCategory.details}</p>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {costCategory.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      value: "lifestyle",
      label: "Lifestyle Match",
      content: lifestyleCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Lifestyle Match
              <span className="text-sm font-normal">Score: {lifestyleCategory.score}/100</span>
            </CardTitle>
            <Progress value={lifestyleCategory.score} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{lifestyleCategory.details}</p>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {lifestyleCategory.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      value: "timeline",
      label: "Timeline",
      content: timelineCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Timeline Feasibility
              <span className="text-sm font-normal">Score: {timelineCategory.score}/100</span>
            </CardTitle>
            <Progress value={timelineCategory.score} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{timelineCategory.details}</p>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {timelineCategory.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )
    }
  ]

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <AnalysisHeader analysis={mockAnalysis} />
        <CardContent className="space-y-6">
          <AnalysisInput
            origin={mockAnalysis.originCountry}
            destination={mockAnalysis.destinationCountry}
            intentions={mockAnalysis.residencyIntentions}
          />
          {user?.profiles?.[0] && (
            <div>
              <ProfileCard profile={user.profiles[0]} showFinancials={false} />
            </div>
          )}
          <Tabs defaultValue={tabs[0].value} className="w-full">
            <ScrollableContainer className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-muted/50">
              <div className="container max-w-6xl mx-auto px-4">
                <TabsList className="flex space-x-2">
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </ScrollableContainer>
            <div className="mt-6">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 