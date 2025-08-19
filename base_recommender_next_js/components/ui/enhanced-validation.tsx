/**
 * Enhanced validation components for better user feedback
 */

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { ValidationError, ValidationResult } from "@/lib/utils/finance-validation"

interface FieldValidationProps {
  errors: ValidationError[]
  fieldPath: string
  className?: string
}

export function FieldValidation({ errors, fieldPath, className = "" }: FieldValidationProps) {
  const fieldErrors = errors.filter(error => error.field.startsWith(fieldPath))
  
  if (fieldErrors.length === 0) return null

  return (
    <div className={`space-y-1 ${className}`}>
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center gap-2">
          {error.type === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
          {error.type === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
          {error.type === 'info' && <Info className="w-3 h-3 text-blue-500" />}
          <span className={`text-xs ${
            error.type === 'error' ? 'text-red-600' :
            error.type === 'warning' ? 'text-yellow-600' :
            'text-blue-600'
          }`}>
            {error.message}
          </span>
        </div>
      ))}
    </div>
  )
}

interface ValidationSummaryProps {
  validation: ValidationResult
  className?: string
}

export function ValidationSummary({ validation, className = "" }: ValidationSummaryProps) {
  const { isValid, errors, warnings, suggestions } = validation

  if (isValid && warnings.length === 0 && suggestions.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 dark:bg-green-950/20 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          All required information is complete and valid.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Required fields:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong className="text-yellow-800 dark:text-yellow-200">Recommendations:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  {warning.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong className="text-blue-800 dark:text-blue-200">Helpful tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 dark:text-blue-300">
                  {suggestion.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

interface ValidationBadgeProps {
  validation: ValidationResult
  showCount?: boolean
}

export function ValidationBadge({ validation, showCount = true }: ValidationBadgeProps) {
  const { isValid, errors, warnings } = validation

  if (isValid && warnings.length === 0) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Valid
      </Badge>
    )
  }

  if (errors.length > 0) {
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        {showCount ? `${errors.length} Error${errors.length > 1 ? 's' : ''}` : 'Errors'}
      </Badge>
    )
  }

  if (warnings.length > 0) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {showCount ? `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}` : 'Warnings'}
      </Badge>
    )
  }

  return null
}

interface RealTimeValidationProps {
  children: React.ReactNode
  validation: ValidationResult
  fieldPath: string
}

export function RealTimeValidation({ children, validation, fieldPath }: RealTimeValidationProps) {
  const fieldErrors = [...validation.errors, ...validation.warnings, ...validation.suggestions]
    .filter(error => error.field.startsWith(fieldPath))

  return (
    <div className="space-y-2">
      {children}
      <FieldValidation errors={fieldErrors} fieldPath={fieldPath} />
    </div>
  )
}
