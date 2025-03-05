'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreVariant } from "@/components/ui/score-badge"
import { ScoreDisplay } from "@/components/features/scores/score-display"
import { ReactNode } from "react"

interface AnalysisOverviewCardProps {
  title: string
  score?: number
  scoreVariant?: ScoreVariant
  children: ReactNode
  className?: string
}

export function AnalysisOverviewCard({ 
  title, 
  score, 
  scoreVariant = "global",
  children, 
  className 
}: AnalysisOverviewCardProps) {
  return (
    <Card className={`border border-border bg-background ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          {title}
          {score !== undefined && (
            <ScoreDisplay
              variant={scoreVariant}
              score={score}
              size="md"
              showLabel={false}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          {children}
        </div>
      </CardContent>
    </Card>
  )
} 