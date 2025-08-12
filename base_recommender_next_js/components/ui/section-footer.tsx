"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { ArrowRight } from "lucide-react"

interface SectionFooterProps {
  // Check Info Button props
  onCheckInfo: () => void
  isCheckingInfo?: boolean
  sectionId: string
  
  // Continue Button props
  onContinue: () => void
  canContinue?: boolean
  nextSectionName: string
  
  // Optional styling
  className?: string
}

export function SectionFooter({
  onCheckInfo,
  isCheckingInfo = false,
  sectionId,
  onContinue,
  canContinue = true,
  nextSectionName,
  className = ""
}: SectionFooterProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Separator line for visual distinction */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {/* Button Container */}
        <div className="flex gap-4">
          {/* Check My Information Button */}
          <CheckInfoButton
            onClick={onCheckInfo}
            isLoading={isCheckingInfo}
            className="flex-1"
            variant="outline"
            size="lg"
          />
          
          {/* Continue Button */}
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <span className="flex items-center gap-2 justify-center">
              Continue to {nextSectionName}
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
        
        {/* Helper text when disabled */}
        {!canContinue && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please complete the required fields above to continue
          </p>
        )}
      </div>
    </div>
  )
}
