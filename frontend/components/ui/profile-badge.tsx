'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Profile } from "@/types/profile"
import { Baby, Home } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProfileBadgeProps {
  profile: Pick<Profile, 'personalInformation'> & { name?: string }
  variant?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const countryToFlag = (countryCode: string) => {
  // Convert country code to flag emoji (each country code letter is converted to regional indicator symbol)
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

const getCountryCode = (country: string): string => {
  // This is a simplified mapping - in a real app, you'd want a complete country-to-code mapping
  const mapping: Record<string, string> = {
    'United States': 'US',
    'Switzerland': 'CH',
    'Portugal': 'PT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'El Salvador': 'SV',
    // Add more as needed
  }
  return mapping[country] || 'UN' // UN as fallback
}

export function ProfileBadge({ profile, variant = 'md', className }: ProfileBadgeProps) {
  const birthCountry = profile.personalInformation?.nationalities?.[0]?.country
  const residenceCountry = profile.personalInformation?.currentResidency?.country
  
  const birthFlag = birthCountry ? countryToFlag(getCountryCode(birthCountry)) : '🌍'
  const residenceFlag = residenceCountry ? countryToFlag(getCountryCode(residenceCountry)) : '🌍'

  // XS variant - just the flags
  if (variant === 'xs') {
    return (
      <Badge 
        variant="outline" 
        className={cn("gap-1 px-2 py-0.5", className)}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{birthFlag}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Birth country: {birthCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-muted-foreground">•</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{residenceFlag}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current residence: {residenceCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Badge>
    )
  }

  // SM variant - flags with icons
  if (variant === 'sm') {
    return (
      <Badge 
        variant="outline" 
        className={cn("gap-2 px-3", className)}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Baby className="h-3 w-3" />
                {birthFlag}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Birth country: {birthCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-muted-foreground">•</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Home className="h-3 w-3" />
                {residenceFlag}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current residence: {residenceCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Badge>
    )
  }

  // MD variant - includes name
  if (variant === 'md') {
    return (
      <Badge 
        variant="outline" 
        className={cn("gap-2 px-3", className)}
      >
        {profile.name && (
          <>
            <span className="font-medium">{profile.name}</span>
            <span className="text-muted-foreground">•</span>
          </>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Baby className="h-3 w-3" />
                {birthFlag}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Birth country: {birthCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-muted-foreground">•</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Home className="h-3 w-3" />
                {residenceFlag}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current residence: {residenceCountry || 'Unknown'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Badge>
    )
  }

  // LG variant - full information
  return (
    <Badge 
      variant="outline" 
      className={cn("gap-2 px-3", className)}
    >
      {profile.name && (
        <>
          <span className="font-medium">{profile.name}</span>
          <span className="text-muted-foreground">•</span>
        </>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 cursor-help">
              <Baby className="h-3 w-3" />
              <span className="flex items-center gap-1">
                {birthFlag}
                <span className="text-sm">{birthCountry || 'Unknown'}</span>
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Birth country: {birthCountry || 'Unknown'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-muted-foreground">•</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 cursor-help">
              <Home className="h-3 w-3" />
              <span className="flex items-center gap-1">
                {residenceFlag}
                <span className="text-sm">{residenceCountry || 'Unknown'}</span>
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Current residence: {residenceCountry || 'Unknown'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Badge>
  )
} 