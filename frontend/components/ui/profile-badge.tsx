'use client'

import { Badge } from "@/components/ui/badge"
import { cn, getCountryFlagUrl } from "@/lib/utils"
import { Profile } from "@/types/profile"
import { Baby, Home } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from "next/image"

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(birthCountry?.toLowerCase() || 'un')}
                    alt={`${birthCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
              <span className="cursor-help">
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(residenceCountry?.toLowerCase() || 'un')}
                    alt={`${residenceCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(birthCountry?.toLowerCase() || 'un')}
                    alt={`${birthCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(residenceCountry?.toLowerCase() || 'un')}
                    alt={`${residenceCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(birthCountry?.toLowerCase() || 'un')}
                    alt={`${birthCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(residenceCountry?.toLowerCase() || 'un')}
                    alt={`${residenceCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(birthCountry?.toLowerCase() || 'un')}
                    alt={`${birthCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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
                <div className="w-4 h-3 relative">
                  <Image
                    src={getCountryFlagUrl(residenceCountry?.toLowerCase() || 'un')}
                    alt={`${residenceCountry || 'Unknown'} flag`}
                    fill
                    className="object-contain rounded"
                  />
                </div>
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