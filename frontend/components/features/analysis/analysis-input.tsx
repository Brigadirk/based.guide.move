'use client'

import { ArrowRight } from "lucide-react"
import { CountryFlag } from "@/components/features/country/CountryFlag"

interface Country {
  id: string
  name: string
}

interface ResidencyIntentions {
  duration: string
  workType: string
  income: string
}

interface AnalysisInputProps {
  origin: Country
  destination: Country
  intentions: ResidencyIntentions
}

export function AnalysisInput({ origin, destination, intentions }: AnalysisInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-base">
        <div className="flex items-center gap-1.5">
          <CountryFlag countryCode={origin.id} size="xs" />
          <span className="font-serif">{origin.name}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-1.5">
          <CountryFlag countryCode={destination.id} size="xs" />
          <span className="font-serif">{destination.name}</span>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Duration:</span>{" "}
          <span>{intentions.duration}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Work:</span>{" "}
          <span>{intentions.workType}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Income:</span>{" "}
          <span>{intentions.income}</span>
        </div>
      </div>
    </div>
  )
} 