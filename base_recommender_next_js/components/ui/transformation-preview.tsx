/**
 * Transformation preview component
 * Shows users how their data will be transformed for the backend
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Eye, Code, ArrowRight } from "lucide-react"
import { transformFinanceForBackend } from "@/lib/utils/field-transformer"

interface TransformationPreviewProps {
  data: any
  className?: string
}

export function TransformationPreview({ data, className = "" }: TransformationPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  const transformedData = transformFinanceForBackend(data)
  const hasChanges = JSON.stringify(data) !== JSON.stringify(transformedData)

  if (!hasChanges) {
    return null
  }

  const getFieldChanges = () => {
    const changes: Array<{ from: string, to: string, type: string }> = []
    
    // Check for field name changes
    if (data.totalWealth?.primaryResidence !== undefined) {
      changes.push({
        from: 'totalWealth.primaryResidence',
        to: 'total_wealth.primary_residence',
        type: 'field_rename'
      })
    }

    if (data.incomeSources?.some((s: any) => s.continueInDestination !== undefined)) {
      changes.push({
        from: 'incomeSources[].continueInDestination',
        to: 'income_sources[].continue_in_destination',
        type: 'field_rename'
      })
    }

    if (data.capitalGains?.futureSales?.some((s: any) => s.surplusValue !== undefined)) {
      changes.push({
        from: 'capitalGains.futureSales[].surplusValue',
        to: 'capital_gains.future_sales[].surplus_value',
        type: 'field_rename'
      })
    }

    if (data.expectedEmployment) {
      changes.push({
        from: 'expectedEmployment[]',
        to: 'Consolidated into income_sources',
        type: 'structure_change'
      })
    }

    return changes
  }

  const fieldChanges = getFieldChanges()

  return (
    <Card className={`border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Data Transformation Preview
                  </CardTitle>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    See how your data will be formatted for the backend
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {fieldChanges.length} change{fieldChanges.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Field Changes Summary */}
            {fieldChanges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Automatic Transformations:
                </h4>
                <div className="space-y-2">
                  {fieldChanges.map((change, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className={
                        change.type === 'field_rename' ? 'border-blue-300' : 'border-green-300'
                      }>
                        {change.type === 'field_rename' ? 'Field Rename' : 'Structure Change'}
                      </Badge>
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200">
                        {change.from}
                      </code>
                      <ArrowRight className="w-3 h-3 text-blue-600" />
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200">
                        {change.to}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Data Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {showRaw ? 'Showing backend format' : 'Showing summary'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRaw(!showRaw)}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900"
              >
                <Code className="w-3 h-3 mr-1" />
                {showRaw ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>

            {/* Raw Data Display */}
            {showRaw && (
              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Original Frontend Data:
                  </h5>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Transformed Backend Data:
                  </h5>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(transformedData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Info message */}
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 p-3 rounded-md">
              💡 <strong>What's happening:</strong> Your form data is automatically converted to match the backend's expected format. 
              This includes changing field names (camelCase → snake_case) and consolidating related data structures.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
