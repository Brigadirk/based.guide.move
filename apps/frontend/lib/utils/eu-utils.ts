import euCountries from '@/data/eu-countries.json'

/**
 * Check if a country is an EU member state
 */
export function isEUCountry(country: string): boolean {
  return euCountries.includes(country)
}

/**
 * Check if user has EU citizenship
 */
export function hasEUCitizenship(nationalities: any[]): boolean {
  if (!nationalities || !Array.isArray(nationalities)) return false
  
  return nationalities.some((nat: any) => 
    nat?.country && isEUCountry(nat.country)
  )
}

/**
 * Get EU countries from user's nationalities
 */
export function getUserEUCountries(nationalities: any[]): string[] {
  if (!nationalities || !Array.isArray(nationalities)) return []
  
  return nationalities
    .filter((nat: any) => nat?.country && isEUCountry(nat.country))
    .map((nat: any) => nat.country)
}

/**
 * Check if both user has EU citizenship AND destination is EU
 */
export function canMoveWithinEU(userNationalities: any[], destinationCountry: string): boolean {
  return hasEUCitizenship(userNationalities) && isEUCountry(destinationCountry)
}

/**
 * Get the list of all EU countries
 */
export function getAllEUCountries(): string[] {
  return [...euCountries]
}
