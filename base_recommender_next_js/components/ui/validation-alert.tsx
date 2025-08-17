"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface ValidationAlertProps {
  errors: string[]
  isComplete?: boolean
  className?: string
}

export function ValidationAlert({ errors, isComplete = false, className = "" }: ValidationAlertProps) {
  if (isComplete) {
    return (
      <Alert className={`border-green-200 bg-green-50 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-200 ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          ✅ <strong>Section Complete!</strong> All required information has been provided.
        </AlertDescription>
      </Alert>
    )
  }

  if (errors.length === 0) {
    return null
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-200 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p><strong>Required fields to continue:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}
