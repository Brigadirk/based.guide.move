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
import { CountryFlag } from "@/components/features/country/CountryFlag"

interface ProfileBadgeProps {
  profile: Pick<Profile, 'personalInformation'> & { name?: string }
  variant?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function ProfileBadge({ profile, variant = 'md', className }: ProfileBadgeProps) {
  const birthCountry = profile.personalInformation?.nationalities?.[0]?.country
  const residenceCountry = profile.personalInformation?.currentResidency?.country
  
  // XS variant - just the flags
  if (variant === 'xs') {
    return (
      <Badge 
        variant="outline" 
        className={cn("gap-1 px-2 py-0.5", className)}
      >
        {birthCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <CountryFlag countryCode={birthCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Birth country: {birthCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {birthCountry && residenceCountry && (
          <span className="text-muted-foreground">•</span>
        )}
        {residenceCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <CountryFlag countryCode={residenceCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current residence: {residenceCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
        {birthCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Baby className="h-3 w-3" />
                  <CountryFlag countryCode={birthCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Birth country: {birthCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {birthCountry && residenceCountry && (
          <span className="text-muted-foreground">•</span>
        )}
        {residenceCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Home className="h-3 w-3" />
                  <CountryFlag countryCode={residenceCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current residence: {residenceCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
        {birthCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Baby className="h-3 w-3" />
                  <CountryFlag countryCode={birthCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Birth country: {birthCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {birthCountry && residenceCountry && (
          <span className="text-muted-foreground">•</span>
        )}
        {residenceCountry && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <Home className="h-3 w-3" />
                  <CountryFlag countryCode={residenceCountry} size="xs" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current residence: {residenceCountry}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
      {birthCountry && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Baby className="h-3 w-3" />
                <span className="flex items-center gap-1">
                  <CountryFlag countryCode={birthCountry} size="xs" />
                  <span className="text-sm">{birthCountry}</span>
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Birth country: {birthCountry}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {birthCountry && residenceCountry && (
        <span className="text-muted-foreground">•</span>
      )}
      {residenceCountry && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Home className="h-3 w-3" />
                <span className="flex items-center gap-1">
                  <CountryFlag countryCode={residenceCountry} size="xs" />
                  <span className="text-sm">{residenceCountry}</span>
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current residence: {residenceCountry}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </Badge>
  )
} 