'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useEffect, useState } from 'react'
import { Profile } from '@/types/profile'
import { Building2, Globe, ArrowRightIcon, Baby, Home } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CountryFlag } from "@/components/features/country/CountryFlag"
import Image from "next/image"

interface ProfileSelectorProps {
  profiles: Profile[]
  selectedProfile: Profile | null
  onSelect: (profile: Profile) => void
  onCreateNew: () => void
  className?: string
}

export function ProfileSelector({ 
  profiles, 
  selectedProfile, 
  onSelect,
  onCreateNew,
  className 
}: ProfileSelectorProps) {
  const [open, setOpen] = useState(false)

  const getProfileSummary = (profile: Profile | null) => {
    if (!profile?.personalInformation) {
      return {
        country: 'Not set',
        nationality: 'Not set',
      }
    }
    const { currentResidency, nationalities } = profile.personalInformation
    return {
      country: currentResidency?.country || 'Not set',
      nationality: nationalities?.[0]?.country || 'Not set',
    }
  }

  const getInitials = (nickname: string | undefined) => {
    if (!nickname) return 'NA'
    return nickname.slice(0, 2).toUpperCase()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            className
          )}
        >
          {selectedProfile ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {selectedProfile.avatar ? (
                  <AvatarImage src={selectedProfile.avatar} alt={selectedProfile.nickname} />
                ) : (
                  <AvatarFallback>
                    {getInitials(selectedProfile.nickname)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium">{selectedProfile.nickname}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Baby className="h-3 w-3" />
                  <CountryFlag 
                    countryCode={selectedProfile.personalInformation?.nationalities?.[0]?.country}
                    size="xs"
                  />
                </div>
                <ArrowRightIcon className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  <CountryFlag 
                    countryCode={selectedProfile.personalInformation?.currentResidency?.country}
                    size="xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            "Select a profile..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          {profiles.map((profile, index) => {
            const summary = getProfileSummary(profile)
            return (
              <Button
                key={profile.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 rounded-none p-4",
                  selectedProfile === profile && "bg-accent"
                )}
                onClick={() => {
                  onSelect(profile)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selectedProfile === profile ? "opacity-100" : "opacity-0"
                  )}
                />
                <Avatar className="h-6 w-6">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.nickname} />
                  ) : (
                    <AvatarFallback>
                      {getInitials(profile.nickname)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{profile.nickname}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Baby className="h-3 w-3" />
                      <CountryFlag 
                        countryCode={profile.personalInformation?.nationalities?.[0]?.country}
                        size="xs"
                      />
                    </div>
                    <ArrowRightIcon className="h-3 w-3" />
                    <div className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      <CountryFlag 
                        countryCode={profile.personalInformation?.currentResidency?.country}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-none border-t p-4"
            onClick={() => {
              onCreateNew()
              setOpen(false)
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Profile</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 