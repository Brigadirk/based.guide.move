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

export function getAllLanguages(): string[] {
  const allLanguages = new Set<string>()
  
  Object.values(countryInfo).forEach((countryData: any) => {
    if (countryData.dominant_language) {
      if (Array.isArray(countryData.dominant_language)) {
        countryData.dominant_language.forEach((lang: string) => allLanguages.add(lang))
      } else if (typeof countryData.dominant_language === "string") {
        allLanguages.add(countryData.dominant_language)
      }
    }
    
    // Also check regional languages if they exist
    if (countryData.regions && typeof countryData.regions === "object") {
      Object.values(countryData.regions).forEach((regionData: any) => {
        if (Array.isArray(regionData)) {
          regionData.forEach((lang: string) => allLanguages.add(lang))
        } else if (regionData && typeof regionData === "object" && Array.isArray(regionData.languages)) {
          regionData.languages.forEach((lang: string) => allLanguages.add(lang))
        }
      })
    }
  })
  
  return Array.from(allLanguages).sort()
} 