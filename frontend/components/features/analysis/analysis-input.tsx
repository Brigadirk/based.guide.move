'use client'

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { getCountryFlagUrl } from "@/lib/utils"

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
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 relative">
            <Image
              src={getCountryFlagUrl(origin.id)}
              alt={`${origin.name} flag`}
              fill
              className="object-contain rounded"
            />
          </div>
          <span className="font-serif">{origin.name}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 relative">
            <Image
              src={getCountryFlagUrl(destination.id)}
              alt={`${destination.name} flag`}
              fill
              className="object-contain rounded"
            />
          </div>
          <span className="font-serif">{destination.name}</span>
        </div>
      </div>

      <div className="space-y-1.5">
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