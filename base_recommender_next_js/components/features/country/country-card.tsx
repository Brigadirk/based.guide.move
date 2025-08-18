'use client'

import { Country } from "@/types/country"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TaxScore, VisaScore } from "@/components/features/scores/score-display"
import Link from "next/link"
import Image from "next/image"
import { CountryFlag } from "@/components/features/country/CountryFlag"

const countryImageMap: Record<string, string> = {
  'a9daf3eb-c719-4a21-b9b6-a17baf4d7692': 'united-states',
  '593ced75-3cad-4c99-a24d-cd79ff4b1672': 'netherlands',
  '5c337e62-4176-49d1-9195-d02117dae979': 'portugal',
  'spain': 'spain',
  'switzerland': 'switzerland',
  'el-salvador': 'el-salvador',
  '7375db84-6d5d-4fac-8378-ae061fd848a2': 'default',
  'e5effdd0-d4ee-40f3-8d2e-691cf265c85d': 'default'
}

interface CountryCardProps {
  country: Country
}

export function CountryCard({ country }: CountryCardProps) {
  const imageId = countryImageMap[country.id] || 'default'
  const landscapeImageUrl = `/images/countries/${imageId}.${imageId === 'default' ? 'svg' : 'jpg'}`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/countries/${country.id}`}>
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={landscapeImageUrl}
            alt={`${country.name} landscape`}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              // If the image fails to load, use the default image
              const target = e.target as HTMLImageElement
              target.src = '/images/countries/default.jpg'
            }}
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CountryFlag countryCode={country.id} size="sm" />
            <CardTitle className="text-xl">{country.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">Tax Score</div>
              <TaxScore 
                score={country.scores?.tax || 0}
                size="lg"
                showLabel={false}
              />
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">Visa Access</div>
              <VisaScore
                score={country.scores?.visa || 0}
                size="lg"
                showLabel={false}
              />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
} 