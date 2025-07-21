'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// Map of country IDs to ISO 3166-1 alpha-2 codes
const countryToCode: Record<string, string> = {
  // UUIDs
  'a9daf3eb-c719-4a21-b9b6-a17baf4d7692': 'us', // United States
  '593ced75-3cad-4c99-a24d-cd79ff4b1672': 'nl', // Netherlands
  '5c337e62-4176-49d1-9195-d02117dae979': 'pt', // Portugal
  // String IDs
  'spain': 'es',
  'switzerland': 'ch',
  'el-salvador': 'sv',
  'el_salvador': 'sv',
  'el': 'sv',
  'united-states': 'us',
  'united-kingdom': 'gb',
  'germany': 'de',
  'singapore': 'sg',
  'portugal': 'pt',
  'netherlands': 'nl',
  'canada': 'ca',
  'australia': 'au',
  'united': 'us',
  'kingdom': 'gb'
}

// Helper function to convert country ID to ISO code
function getIsoCode(countryId: string): string {
  // If it's already a 2-letter code, return it
  if (/^[a-zA-Z]{2}$/.test(countryId)) {
    return countryId.toLowerCase()
  }

  // Check the mapping
  if (countryToCode[countryId]) {
    return countryToCode[countryId]
  }

  // Try to extract from UUID description
  const uuidMatch = countryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  if (uuidMatch && countryToCode[countryId]) {
    return countryToCode[countryId]
  }

  // Handle special cases
  if (countryId.includes('united')) {
    if (countryId.includes('states')) return 'us'
    if (countryId.includes('kingdom')) return 'gb'
  }

  // Default to lowercase ID if no match found
  return countryId.toLowerCase()
}

export interface CountryFlagProps {
  /**
   * The country ID or ISO code
   * @example 'us', 'united-states', 'a9daf3eb-c719-4a21-b9b6-a17baf4d7692'
   */
  countryCode?: string
  /**
   * Optional className for the container
   */
  className?: string
  /**
   * Size variant of the flag
   * @default 'sm'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * Whether to show a placeholder when country code is missing
   * @default false
   */
  showPlaceholder?: boolean
}

const sizes = {
  xs: 'w-4 h-3',
  sm: 'w-6 h-4',
  md: 'w-8 h-6',
  lg: 'w-12 h-8',
}

export function CountryFlag({
  countryCode,
  className,
  size = 'sm',
  showPlaceholder = false,
}: CountryFlagProps) {
  const [error, setError] = useState(false)

  // If no country code and no placeholder needed, return null
  if (!countryCode || (!countryCode.trim() && !showPlaceholder)) {
    return null
  }

  // Convert country ID to ISO code
  const code = countryCode.trim() ? 
    getIsoCode(countryCode) : 
    (showPlaceholder ? 'un' : '')

  const flagUrl = `https://flagcdn.com/${code}.svg`

  return (
    <div className={cn('relative shrink-0', sizes[size], className)}>
      <Image
        src={flagUrl}
        alt={`${code.toUpperCase()} flag`}
        fill
        className="object-contain rounded"
        priority
        onError={() => {
          setError(true)
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
          <span className="text-xs text-muted-foreground">{code.toUpperCase()}</span>
        </div>
      )}
    </div>
  )
} 