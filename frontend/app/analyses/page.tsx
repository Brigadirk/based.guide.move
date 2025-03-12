'use client'

import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AnalysisCard } from "@/components/features/analysis/analysis-card"
import { getCountries } from "@/lib/server-api"
import { CountryAnalysis, User } from "@/types/user"
import { Country } from "@/types/api"
import { AnalysisCtaButton } from "@/components/features/analysis/analysis-cta-button"
import { mockAnalysis } from './mockData'

export default function AnalysesPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [countryNames, setCountryNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/analyses')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchCountryNames = async () => {
      try {
        const countries = await getCountries()
        const namesMap = countries.reduce((acc: Record<string, string>, country: Country) => {
          acc[country.id] = country.name
          return acc
        }, {})
        setCountryNames(namesMap)
      } catch (error) {
        console.error('Failed to fetch country names:', error)
      }
    }

    if (isAuthenticated) {
      fetchCountryNames()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || !isAuthenticated || !user) {
    return null
  }

  const analyses = user?.analyzedCountries && user.analyzedCountries.length > 0 ? user.analyzedCountries : [mockAnalysis]

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Your Analyses</h1>
        
        <div className="flex justify-end">
          <AnalysisCtaButton 
            variant="default"
            fullWidth={false}
          />
        </div>
        
        {analyses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {analyses.map((analysis: CountryAnalysis) => (
              <AnalysisCard 
                key={analysis.countryId} 
                analysis={analysis}
                countryName={countryNames[analysis.countryId] || analysis.countryId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              You haven't analyzed any countries yet. 
              Click the analyze button to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 