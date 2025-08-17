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
  // String IDs - Comprehensive country mapping
  'afghanistan': 'af',
  'albania': 'al',
  'algeria': 'dz',
  'andorra': 'ad',
  'angola': 'ao',
  'argentina': 'ar',
  'armenia': 'am',
  'australia': 'au',
  'austria': 'at',
  'azerbaijan': 'az',
  'bahrain': 'bh',
  'bangladesh': 'bd',
  'belarus': 'by',
  'belgium': 'be',
  'bolivia': 'bo',
  'bosnia-and-herzegovina': 'ba',
  'brazil': 'br',
  'bulgaria': 'bg',
  'cambodia': 'kh',
  'canada': 'ca',
  'chile': 'cl',
  'china': 'cn',
  'colombia': 'co',
  'costa-rica': 'cr',
  'croatia': 'hr',
  'cyprus': 'cy',
  'czech-republic': 'cz',
  'denmark': 'dk',
  'dominican-republic': 'do',
  'ecuador': 'ec',
  'egypt': 'eg',
  'el-salvador': 'sv',
  'el_salvador': 'sv',
  'el': 'sv',
  'estonia': 'ee',
  'finland': 'fi',
  'france': 'fr',
  'georgia': 'ge',
  'germany': 'de',
  'ghana': 'gh',
  'greece': 'gr',
  'guatemala': 'gt',
  'honduras': 'hn',
  'hungary': 'hu',
  'iceland': 'is',
  'india': 'in',
  'indonesia': 'id',
  'ireland': 'ie',
  'israel': 'il',
  'italy': 'it',
  'japan': 'jp',
  'jordan': 'jo',
  'kazakhstan': 'kz',
  'kenya': 'ke',
  'kuwait': 'kw',
  'latvia': 'lv',
  'lebanon': 'lb',
  'lithuania': 'lt',
  'luxembourg': 'lu',
  'malaysia': 'my',
  'malta': 'mt',
  'mexico': 'mx',
  'moldova': 'md',
  'monaco': 'mc',
  'morocco': 'ma',
  'netherlands': 'nl',
  'new-zealand': 'nz',
  'nicaragua': 'ni',
  'nigeria': 'ng',
  'north-macedonia': 'mk',
  'norway': 'no',
  'oman': 'om',
  'panama': 'pa',
  'paraguay': 'py',
  'peru': 'pe',
  'philippines': 'ph',
  'poland': 'pl',
  'portugal': 'pt',
  'qatar': 'qa',
  'romania': 'ro',
  'russia': 'ru',
  'san-marino': 'sm',
  'saudi-arabia': 'sa',
  'serbia': 'rs',
  'singapore': 'sg',
  'slovakia': 'sk',
  'slovenia': 'si',
  'south-africa': 'za',
  'south-korea': 'kr',
  'spain': 'es',
  'sweden': 'se',
  'switzerland': 'ch',
  'thailand': 'th',
  'tunisia': 'tn',
  'turkey': 'tr',
  'ukraine': 'ua',
  'united-arab-emirates': 'ae',
  'united-kingdom': 'gb',
  'united-states': 'us',
  'uruguay': 'uy',
  'venezuela': 've',
  'vietnam': 'vn',
  // Legacy mappings
  'united': 'us',
  'kingdom': 'gb'
}

// Helper function to convert country ID to ISO code
function getIsoCode(countryId: string): string {
  // If it's already a 2-letter code, return it
  if (/^[a-zA-Z]{2}$/.test(countryId)) {
    return countryId.toLowerCase()
  }

  // Normalize to lowercase for lookup
  const normalizedId = countryId.toLowerCase()

  // Check the mapping
  if (countryToCode[normalizedId]) {
    return countryToCode[normalizedId]
  }

  // Try to extract from UUID description
  const uuidMatch = normalizedId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  if (uuidMatch && countryToCode[normalizedId]) {
    return countryToCode[normalizedId]
  }

  // Handle special cases
  if (normalizedId.includes('united')) {
    if (normalizedId.includes('states')) return 'us'
    if (normalizedId.includes('kingdom')) return 'gb'
  }

  // Default to lowercase ID if no match found
  return normalizedId
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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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
  xl: 'w-16 h-12',
}

export function CountryFlag({
  countryCode,
  className,
  size = 'sm',
  showPlaceholder = false,
}: CountryFlagProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

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
      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded animate-pulse">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
        </div>
      )}
      
      <Image
        src={flagUrl}
        alt={`${code.toUpperCase()} flag`}
        fill
        className="object-contain rounded"
        priority
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded border border-border">
          <span className={`font-mono font-bold text-muted-foreground ${
            size === 'xs' ? 'text-[8px]' : 
            size === 'sm' ? 'text-[10px]' : 
            size === 'md' ? 'text-xs' : 'text-sm'
          }`}>
            {code.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
} 