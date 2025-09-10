"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { useFormStore } from "@/lib/stores"

interface FinanceSkipToggleProps {
  variant?: "sidebar" | "section"
}

export function FinanceSkipToggle({ variant = "sidebar" }: FinanceSkipToggleProps) {
  const { getFormData, updateFormData, markSectionComplete, isSectionComplete } = useFormStore()
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  const handleFinanceSkipToggle = (checked: boolean) => {
    const financeeSections = ["finance", "social-security", "tax-deductions", "future-plans"]
    const sectionDataKeys = ["finance", "socialSecurityAndPensions", "taxDeductionsAndCredits", "futureFinancialPlans"]
    
    console.log(`Finance skip toggle: ${checked ? 'ON' : 'OFF'}`)
    
    updateFormData("finance.skipDetails", checked)
    
    if (checked) {
      // PRESERVE ORIGINAL STATE BEFORE SKIP
      
      // 1. Save current completion states
      const originalStates: Record<string, boolean> = {}
      financeeSections.forEach(sectionId => {
        const isComplete = isSectionComplete(sectionId)
        originalStates[sectionId] = isComplete
        console.log(`Section ${sectionId} was originally complete: ${isComplete}`)
      })
      updateFormData("finance.originalCompletionStates", originalStates)
      
      // 2. Save current section data
      const preservedData: Record<string, any> = {}
      sectionDataKeys.forEach(dataKey => {
        const data = getFormData(dataKey)
        if (data && Object.keys(data).length > 0) {
          preservedData[dataKey] = data
          console.log(`Preserved data for ${dataKey}:`, Object.keys(data))
        }
      })
      updateFormData("finance.preservedData", preservedData)
      
      // 3. Mark all finance sections as complete (skip override)
      console.log('Marking finance sections as complete...')
      financeeSections.forEach(sectionId => {
        markSectionComplete(sectionId)
        console.log(`Marked ${sectionId} as complete`)
      })
      
      // 4. Flag that sections were auto-completed by skip
      updateFormData("finance.autoCompletedSections", financeeSections)
      
    } else {
      // RESTORE ORIGINAL STATE AFTER UNFLIP
      
      console.log('Restoring original finance states...')
      
      // 1. Get preserved states and data
      const originalStates = getFormData("finance.originalCompletionStates") ?? {}
      const preservedData = getFormData("finance.preservedData") ?? {}
      
      console.log('Original states to restore:', originalStates)
      console.log('Preserved data to restore:', Object.keys(preservedData))
      
      // 2. Restore original completion states
      financeeSections.forEach(sectionId => {
        const wasOriginallyComplete = originalStates[sectionId] ?? false
        updateFormData(`completedSections.${sectionId}`, wasOriginallyComplete)
        console.log(`Restored ${sectionId} completion state to: ${wasOriginallyComplete}`)
      })
      
      // 3. Restore original section data
      sectionDataKeys.forEach(dataKey => {
        if (preservedData[dataKey]) {
          updateFormData(dataKey, preservedData[dataKey])
          console.log(`Restored data for ${dataKey}`)
        }
      })
      
      // 4. Clear skip flags
      updateFormData("finance.autoCompletedSections", false)
      updateFormData("finance.originalCompletionStates", {})
      updateFormData("finance.preservedData", {})
      
      console.log('Finance skip restore complete')
    }
  }

  if (variant === "sidebar") {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <Label htmlFor="finance-skip" className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Quick Finance Skip
                </Label>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Skip detailed finance sections
                </p>
              </div>
            </div>
            <Switch
              id="finance-skip"
              checked={skipFinanceDetails}
              onCheckedChange={handleFinanceSkipToggle}
            />
          </div>
          {skipFinanceDetails && (
            <div className="mt-3 p-2 rounded bg-green-100 dark:bg-green-900/30">
              <p className="text-xs text-green-800 dark:text-green-200">
                ✅ Finance sections auto-completed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Section variant (wider, for top of finance sections)
  return (
    <Card className="mb-6 border-emerald-200/60 bg-stone-50/50 dark:bg-stone-950/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-stone-100 dark:bg-stone-900/50">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <Label htmlFor="finance-skip-section" className="text-sm font-medium text-stone-800 dark:text-stone-200 cursor-pointer">
                Quick Finance Skip
              </Label>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                Skip detailed finance sections
              </p>
            </div>
          </div>
          <Switch
            id="finance-skip-section"
            checked={skipFinanceDetails}
            onCheckedChange={handleFinanceSkipToggle}
          />
        </div>
        
        {skipFinanceDetails && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                ✅ Finance sections auto-completed
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                You can proceed directly to additional information or continue to results.
              </p>
            </div>
          </div>
        )}
        
        {!skipFinanceDetails && (
          <div className="text-xs text-muted-foreground">
            💡 <strong>Why would I want to do this?</strong> Skip if you prefer general advice without detailed financial analysis.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
