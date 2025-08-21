import countryInfo from "@/data/country_info.json"

export function getCountries(): string[] {
  return Object.keys(countryInfo).sort()
}

export function getRegions(country: string): string[] {
  const info = (countryInfo as Record<string, any>)[country]
  if (!info) return []
  const regions = info.regions
  if (!regions) return []
  if (Array.isArray(regions)) return regions
  // if object, keys are region names
  return Object.keys(regions)
}

export function getLanguages(country: string, region?: string): string[] {
  const info = (countryInfo as Record<string, any>)[country]
  if (!info) return []

  const langs = new Set<string>()
  if (Array.isArray(info.dominant_language)) {
    info.dominant_language.forEach((l: string) => langs.add(l))
  } else if (typeof info.dominant_language === "string") {
    langs.add(info.dominant_language)
  }

  if (region && region !== "I don't know yet" && info.regions && typeof info.regions === "object") {
    const regData = info.regions[region]
    if (Array.isArray(regData)) {
      regData.forEach((l: string) => langs.add(l))
    } else if (regData && typeof regData === "object" && Array.isArray(regData.languages)) {
      regData.languages.forEach((l: string) => langs.add(l))
    }
  }

  return Array.from(langs)
} 