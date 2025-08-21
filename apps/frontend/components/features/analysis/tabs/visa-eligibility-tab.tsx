'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { VisaScore } from "@/components/features/scores/score-display"
import { AnalysisCategory } from "@/app/analyses/[id]/mockData"

interface VisaEligibilityTabProps {
  category: AnalysisCategory
}

export function VisaEligibilityTab({ category }: VisaEligibilityTabProps) {
  if (!category.mostEligibleVisa) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <span className="text-2xl font-bold">
            {category.mostEligibleVisa.name}
          </span>
          <VisaScore 
            score={category.mostEligibleVisa.score} 
            size="lg"
            showLabel={false} 
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Most Eligible Visa</h4>
          <VisaScore 
            score={category.mostEligibleVisa.score} 
            size="lg"
            showLabel={true} 
          />
          <p className="text-muted-foreground">{category.mostEligibleVisa.description}</p>
        </div>
        {category.alternativeVisas && (
          <Accordion type="single" collapsible>
            {category.alternativeVisas.map((visa, index) => (
              <AccordionItem key={index} value={visa.name.toLowerCase().replace(" ", "-")}
                className="border-b">
                <AccordionTrigger>
                  <VisaScore 
                    score={visa.score} 
                    size="md"
                    showLabel={true} 
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{visa.description}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
} 