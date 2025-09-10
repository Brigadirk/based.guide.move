"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { useFormStore } from "@/lib/stores"

interface FinanceSkipToggleProps {
  variant?: "sidebar" | "section"
  onToggle?: (checked: boolean) => void
}

export function FinanceSkipToggle({ variant = "sidebar", onToggle }: FinanceSkipToggleProps) {
  const { getFormData } = useFormStore()
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  const handleFinanceSkipToggle = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked)
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
