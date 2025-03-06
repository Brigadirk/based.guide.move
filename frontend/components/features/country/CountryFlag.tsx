import Image from 'next/image'
import { cn } from '@/lib/utils'

// Map of country names and IDs to ISO 3166-1 alpha-2 codes
const countryToCode: Record<string, string> = {
  // Full names
  'Switzerland': 'ch',
  'United States': 'us',
  'Portugal': 'pt',
  'Spain': 'es',
  'Netherlands': 'nl',
  'El Salvador': 'sv',
  // IDs
  'switzerland': 'ch',
  'united': 'us',
  'portugal': 'pt',
  'spain': 'es',
  'netherlands': 'nl',
  'el-salvador': 'sv',
  'el_salvador': 'sv',
  'el': 'sv',
  // Add more as needed
}

export interface CountryFlagProps {
  /**
   * The country ID, ISO code, or full name
   * @example 'us', 'united', 'United States'
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
  // If no country code and no placeholder needed, return null
  if (!countryCode || (!countryCode.trim() && !showPlaceholder)) {
    return null
  }

  // Convert country name/ID to code if needed
  const code = countryCode.trim() ? 
    (countryToCode[countryCode] || countryCode.toLowerCase()) : 
    (showPlaceholder ? 'un' : '')

  const flagUrl = `https://flagcdn.com/${code}.svg`

  return (
    <div className={cn('relative shrink-0', sizes[size], className)}>
      <Image
        src={flagUrl}
        alt={`${code.toUpperCase()} flag`}
        fill
        className="object-contain rounded"
        priority // This ensures the flag loads immediately
      />
    </div>
  )
} 