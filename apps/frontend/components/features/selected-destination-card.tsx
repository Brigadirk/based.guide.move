'use client'

import { Card, CardContent } from "@/components/ui/card"
import { CountryFlag } from "@/components/features/country/CountryFlag"
import { MapPin, Languages } from "lucide-react"
import { getLanguages } from "@/lib/utils/country-utils"
import { useMemo } from "react"

interface SelectedDestinationCardProps {
  country: string
  region: string
  className?: string
  compact?: boolean
}

// Map country names to flag codes for flagcdn.com - comprehensive mapping for country_info.json
const countryToFlagCode: Record<string, string> = {
  // A
  "Afghanistan": "af",
  "Albania": "al",
  "Algeria": "dz",
  "Andorra": "ad",
  "Angola": "ao",
  "Antigua and Barbuda": "ag",
  "Argentina": "ar",
  "Armenia": "am",
  "Australia": "au",
  "Austria": "at",
  "Azerbaijan": "az",
  
  // B
  "Bahamas": "bs",
  "Bahrain": "bh",
  "Bangladesh": "bd",
  "Barbados": "bb",
  "Belarus": "by",
  "Belgium": "be",
  "Belize": "bz",
  "Benin": "bj",
  "Bhutan": "bt",
  "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba",
  "Botswana": "bw",
  "Brazil": "br",
  "Brunei": "bn",
  "Bulgaria": "bg",
  "Burkina Faso": "bf",
  "Burundi": "bi",
  
  // C
  "Cabo Verde": "cv",
  "Cambodia": "kh",
  "Cameroon": "cm",
  "Canada": "ca",
  "Central African Republic": "cf",
  "Chad": "td",
  "Chile": "cl",
  "China": "cn",
  "Colombia": "co",
  "Comoros": "km",
  "Congo (Congo-Brazzaville)": "cg",
  "Costa Rica": "cr",
  "Croatia": "hr",
  "Cuba": "cu",
  "Cyprus": "cy",
  "Czechia (Czech Republic)": "cz",
  "Czech Republic": "cz",
  "Côte d'Ivoire": "ci",
  
  // D
  "Denmark": "dk",
  "Djibouti": "dj",
  "Dominica": "dm",
  "Dominican Republic": "do",
  
  // E
  "Ecuador": "ec",
  "Egypt": "eg",
  "El Salvador": "sv",
  "Equatorial Guinea": "gq",
  "Eritrea": "er",
  "Estonia": "ee",
  "Eswatini (fmr. Swaziland)": "sz",
  "Ethiopia": "et",
  
  // F
  "Fiji": "fj",
  "Finland": "fi",
  "France": "fr",
  
  // G
  "Gabon": "ga",
  "Gambia": "gm",
  "Georgia": "ge",
  "Germany": "de",
  "Ghana": "gh",
  "Greece": "gr",
  "Grenada": "gd",
  "Guatemala": "gt",
  "Guinea": "gn",
  "Guinea-Bissau": "gw",
  "Guyana": "gy",
  
  // H
  "Haiti": "ht",
  "Honduras": "hn",
  "Hungary": "hu",
  
  // I
  "Iceland": "is",
  "India": "in",
  "Indonesia": "id",
  "Iran": "ir",
  "Iraq": "iq",
  "Ireland": "ie",
  "Israel": "il",
  "Italy": "it",
  
  // J
  "Jamaica": "jm",
  "Japan": "jp",
  "Jordan": "jo",
  
  // K
  "Kazakhstan": "kz",
  "Kenya": "ke",
  "Kiribati": "ki",
  "Kuwait": "kw",
  "Kyrgyzstan": "kg",
  
  // L
  "Laos": "la",
  "Latvia": "lv",
  "Lebanon": "lb",
  "Lesotho": "ls",
  "Liberia": "lr",
  "Libya": "ly",
  "Liechtenstein": "li",
  "Lithuania": "lt",
  "Luxembourg": "lu",
  
  // M
  "Madagascar": "mg",
  "Malawi": "mw",
  "Malaysia": "my",
  "Maldives": "mv",
  "Mali": "ml",
  "Malta": "mt",
  "Marshall Islands": "mh",
  "Mauritania": "mr",
  "Mauritius": "mu",
  "Mexico": "mx",
  "Micronesia": "fm",
  "Moldova": "md",
  "Monaco": "mc",
  "Mongolia": "mn",
  "Montenegro": "me",
  "Morocco": "ma",
  "Mozambique": "mz",
  "Myanmar (formerly Burma)": "mm",
  
  // N
  "Namibia": "na",
  "Nauru": "nr",
  "Nepal": "np",
  "Netherlands": "nl",
  "New Zealand": "nz",
  "Nicaragua": "ni",
  "Niger": "ne",
  "Nigeria": "ng",
  "North Korea": "kp",
  "North Macedonia": "mk",
  "Norway": "no",
  
  // O
  "Oman": "om",
  
  // P
  "Pakistan": "pk",
  "Palau": "pw",
  "Palestine State": "ps",
  "Panama": "pa",
  "Papua New Guinea": "pg",
  "Paraguay": "py",
  "Peru": "pe",
  "Philippines": "ph",
  "Poland": "pl",
  "Portugal": "pt",
  
  // Q
  "Qatar": "qa",
  
  // R
  "Romania": "ro",
  "Russia": "ru",
  "Rwanda": "rw",
  
  // S
  "Saint Kitts and Nevis": "kn",
  "Saint Lucia": "lc",
  "Saint Vincent and the Grenadines": "vc",
  "Samoa": "ws",
  "San Marino": "sm",
  "Sao Tome and Principe": "st",
  "Saudi Arabia": "sa",
  "Senegal": "sn",
  "Serbia": "rs",
  "Seychelles": "sc",
  "Sierra Leone": "sl",
  "Singapore": "sg",
  "Slovakia": "sk",
  "Slovenia": "si",
  "Solomon Islands": "sb",
  "Somalia": "so",
  "South Africa": "za",
  "South Korea": "kr",
  "South Sudan": "ss",
  "Spain": "es",
  "Sri Lanka": "lk",
  "Sudan": "sd",
  "Suriname": "sr",
  "Sweden": "se",
  "Switzerland": "ch",
  "Syria": "sy",
  
  // T
  "Tajikistan": "tj",
  "Tanzania": "tz",
  "Thailand": "th",
  "Timor-Leste": "tl",
  "Togo": "tg",
  "Tonga": "to",
  "Trinidad and Tobago": "tt",
  "Tunisia": "tn",
  "Turkey": "tr",
  "Turkmenistan": "tm",
  "Tuvalu": "tv",
  
  // U
  "Uganda": "ug",
  "Ukraine": "ua",
  "United Arab Emirates": "ae",
  "United Kingdom": "gb",
  "United States of America": "us",
  "United States": "us",
  "Uruguay": "uy",
  "Uzbekistan": "uz",
  
  // V
  "Vanuatu": "vu",
  "Vatican City": "va",
  "Venezuela": "ve",
  "Vietnam": "vn",
  
  // Y
  "Yemen": "ye",
  
  // Z
  "Zambia": "zm",
  "Zimbabwe": "zw"
}

function getCountryFlagCode(countryName: string): string {
  // Direct match
  if (countryToFlagCode[countryName]) {
    return countryToFlagCode[countryName]
  }
  
  // Try case-insensitive match
  const lowerCountry = countryName.toLowerCase()
  for (const [name, code] of Object.entries(countryToFlagCode)) {
    if (name.toLowerCase() === lowerCountry) {
      return code
    }
  }
  
  // Try partial matches for common variations
  if (lowerCountry.includes('united states') || lowerCountry.includes('usa')) return 'us'
  if (lowerCountry.includes('united kingdom') || lowerCountry.includes('uk')) return 'gb'
  if (lowerCountry.includes('south korea')) return 'kr'
  if (lowerCountry.includes('north korea')) return 'kp'
  if (lowerCountry.includes('saudi')) return 'sa'
  if (lowerCountry.includes('emirates') || lowerCountry.includes('uae')) return 'ae'
  if (lowerCountry.includes('czech')) return 'cz'
  if (lowerCountry.includes('bosnia')) return 'ba'
  if (lowerCountry.includes('macedonia')) return 'mk'
  
  // Default fallback - try first two letters of country name
  return countryName.toLowerCase().substring(0, 2)
}

export function SelectedDestinationCard({ 
  country, 
  region, 
  className = "",
  compact = false 
}: SelectedDestinationCardProps) {
  console.log("🎯 SelectedDestinationCard rendered:", { 
    country, 
    region, 
    compact,
    timestamp: new Date().toLocaleTimeString(),
    flagCode: getCountryFlagCode(country)
  })
  
  const flagCode = getCountryFlagCode(country)
  
  const languages = useMemo(() => {
    try {
      return getLanguages(country, region)
    } catch {
      return []
    }
  }, [country, region])

  if (!country || !region) {
    console.log("❌ SelectedDestinationCard: Missing country or region")
    return null
  }

  return (
    <Card className={`border-primary/20 bg-primary/5 transition-all duration-200 hover:bg-primary/10 ${className}`}>
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CountryFlag 
              countryCode={flagCode} 
              size="xl" 
              showPlaceholder={true}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-foreground leading-tight truncate mb-2`}>
              {country}
            </h3>
            
            {languages.length > 0 && (
              <div className="flex items-start gap-1">
                <Languages className={`${compact ? 'w-3 h-3' : 'w-3 h-3'} text-muted-foreground flex-shrink-0 mt-0.5`} />
                <p className={`${compact ? 'text-xs' : 'text-xs'} text-muted-foreground leading-tight line-clamp-2`}>
                  {languages.length > 3 
                    ? `${languages.slice(0, 3).join(", ")}${languages.length > 3 ? ` +${languages.length - 3}` : ''}`
                    : languages.join(", ")
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 