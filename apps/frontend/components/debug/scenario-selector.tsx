"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, User, Users, Plane } from 'lucide-react'
import { debugScenarios, getScenarioById } from '@/lib/debug-scenarios'
import { useFormStore } from '@/lib/stores/form-store'

interface ScenarioSelectorProps {
  onScenarioApplied?: (scenarioId: string) => void
}

export function ScenarioSelector({ onScenarioApplied }: ScenarioSelectorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')
  const [isApplying, setIsApplying] = useState(false)
  const { updateFormData, markSectionComplete, resetFormData } = useFormStore()

  const handleApplyScenario = async () => {
    if (!selectedScenarioId) return

    setIsApplying(true)
    
    try {
      const scenario = getScenarioById(selectedScenarioId)
      if (!scenario) return

      // Reset form data first
      resetFormData()

      // Apply scenario data
      Object.entries(scenario.data).forEach(([key, value]) => {
        updateFormData(key, value)
      })

      // Mark relevant sections as complete
      const sectionsToComplete = [
        'disclaimer',
        'destination', 
        'personal',
        'education',
        'residency',
        'finance',
        'social-security',
        'tax-deductions',
        'future-plans',
        'additional'
      ]

      sectionsToComplete.forEach(sectionId => {
        markSectionComplete(sectionId)
      })

      onScenarioApplied?.(selectedScenarioId)
    } catch (error) {
      console.error('Error applying scenario:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const selectedScenario = selectedScenarioId ? getScenarioById(selectedScenarioId) : null

  const getScenarioIcon = (scenarioId: string) => {
    switch (scenarioId) {
      case 'young-professional':
        return <User className="w-5 h-5" />
      case 'family-with-kids':
        return <Users className="w-5 h-5" />
      case 'wealthy-retiree':
        return <Plane className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="w-5 h-5" />
          🧪 Debug: Test Scenarios
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Load pre-filled data for different types of people moving internationally. 
          This will reset all current form data and fill in realistic information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Select Test Scenario
          </label>
          <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
            <SelectTrigger className="bg-white dark:bg-gray-900">
              <SelectValue placeholder="Choose a scenario to test..." />
            </SelectTrigger>
            <SelectContent>
              {debugScenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center gap-2">
                    {getScenarioIcon(scenario.id)}
                    <span>{scenario.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedScenario && (
          <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              {getScenarioIcon(selectedScenario.id)}
              <div className="flex-1 space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {selectedScenario.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedScenario.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedScenario.id === 'young-professional' && 'Single • Young • Tech'}
                    {selectedScenario.id === 'family-with-kids' && 'Married • 2 Kids • Mid-Career'}
                    {selectedScenario.id === 'wealthy-retiree' && 'Married • Retired • Wealthy'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleApplyScenario}
            disabled={!selectedScenarioId || isApplying}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isApplying ? 'Applying Scenario...' : 'Apply Scenario & Fill Form'}
          </Button>
          {selectedScenarioId && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedScenarioId('')}
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
          <strong>⚠️ Warning:</strong> This will completely reset your current form data and replace it with the scenario data. 
          All sections will be marked as complete so you can jump directly to Summary & Results.
        </div>
      </CardContent>
    </Card>
  )
}
