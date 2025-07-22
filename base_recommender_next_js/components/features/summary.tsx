"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useFormStore } from "@/lib/stores"
import { 
  Download, 
  FileText, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  User, 
  MapPin, 
  GraduationCap, 
  Heart, 
  DollarSign, 
  PiggyBank, 
  Receipt, 
  TrendingUp, 
  FileEdit,
  Calendar
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Summary() {
  const { formData, hasRequiredData } = useFormStore()
  const [showJSON, setShowJSON] = useState(false)

  const json = JSON.stringify(formData, null, 2)

  const downloadJSON = () => {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tax_migration_profile.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const printPDF = () => {
    window.print()
  }

  const resetAll = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.removeItem("base-recommender-form-data")
      window.location.reload()
    }
  }

  // Helper function to get completion status
  const getSectionStatus = (sectionKey: string) => {
    // Map summary section keys to form store section IDs
    const sectionIdMap: Record<string, string> = {
      'destination': 'destination',
      'personal': 'personal', 
      'education': 'education',
      'residencyIntentions': 'residency',
      'finance': 'finance',
      'socialSecurityAndPensions': 'social-security',
      'taxDeductionsAndCredits': 'tax-deductions',
      'futureFinancialPlans': 'future-plans',
      'additionalInformation': 'additional'
    }
    
    const sectionId = sectionIdMap[sectionKey]
    if (!sectionId) return 'incomplete'
    
    return hasRequiredData(sectionId) ? 'complete' : 'incomplete'
  }

  // Helper function to format data for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not specified'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return Object.keys(value).length + ' items'
    if (typeof value === 'number') return value.toLocaleString()
    return String(value)
  }

  const sections = [
    { key: 'destination', icon: MapPin, title: 'Destination', color: 'blue' },
    { key: 'personal', icon: User, title: 'Personal Information', color: 'green' },
    { key: 'education', icon: GraduationCap, title: 'Education', color: 'purple' },
    { key: 'residencyIntentions', icon: Heart, title: 'Residency Intentions', color: 'pink' },
    { key: 'finance', icon: DollarSign, title: 'Finance', color: 'yellow' },
    { key: 'socialSecurityAndPensions', icon: PiggyBank, title: 'Social Security & Pensions', color: 'indigo' },
    { key: 'taxDeductionsAndCredits', icon: Receipt, title: 'Tax Deductions & Credits', color: 'red' },
    { key: 'futureFinancialPlans', icon: TrendingUp, title: 'Future Financial Plans', color: 'orange' },
    { key: 'additionalInformation', icon: FileEdit, title: 'Additional Information', color: 'gray' }
  ]

  const completedSections = sections.filter(section => getSectionStatus(section.key) === 'complete').length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Print styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Assessment Complete</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          📊 Your Profile Summary
        </h1>
        <p className="text-lg text-muted-foreground">
          Review your information and export your complete assessment
        </p>
      </div>

      {/* Completion Overview */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-green-900">Assessment Progress</h3>
              <p className="text-sm text-green-800">
                You've completed {completedSections} of {sections.length} sections
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">{Math.round((completedSections / sections.length) * 100)}%</div>
              <div className="text-sm text-green-800">Complete</div>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(completedSections / sections.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const status = getSectionStatus(section.key)
          const sectionData = formData[section.key as keyof typeof formData]
          const Icon = section.icon
          
          return (
            <Card key={section.key} className={`transition-all hover:shadow-md ${
              status === 'complete' ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-${section.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 text-${section.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{section.title}</h4>
                    </div>
                  </div>
                  <Badge variant={status === 'complete' ? 'default' : 'secondary'} className="text-xs">
                    {status === 'complete' ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
                
                {/* Key Information Preview */}
                {sectionData && typeof sectionData === 'object' && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {Object.entries(sectionData).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="truncate ml-2 max-w-20">{formatValue(value)}</span>
                      </div>
                    ))}
                    {Object.keys(sectionData).length > 2 && (
                      <div className="text-center text-muted-foreground">
                        +{Object.keys(sectionData).length - 2} more fields
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Export & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
            <Button onClick={downloadJSON} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download JSON Data
            </Button>
            <Button variant="outline" onClick={printPDF} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Print / Save as PDF
            </Button>
          </div>

          <Separator className="no-print" />

          {/* JSON Data Viewer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between no-print">
              <h4 className="font-medium">Raw Data</h4>
              <Button 
                variant="ghost" 
                onClick={() => setShowJSON(!showJSON)}
                className="flex items-center gap-2"
              >
                {showJSON ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showJSON ? 'Hide' : 'Show'} JSON
              </Button>
            </div>
            
            {showJSON && (
              <div className="max-h-[50vh] overflow-auto rounded-md bg-muted p-4 text-sm font-mono">
                <pre className="whitespace-pre-wrap">{json}</pre>
              </div>
            )}
          </div>

          <Separator className="no-print" />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Generated:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sections:</span>
              <span>{completedSections}/{sections.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Ready for Analysis</Badge>
            </div>
          </div>

          <Separator className="no-print" />

          {/* Reset Warning */}
          <Alert className="no-print">
            <AlertDescription className="flex items-center justify-between">
              <span>Need to start over? You can reset all your data, but this action cannot be undone.</span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={resetAll}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Data
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Print Footer */}
      <div className="print-only text-center text-sm text-muted-foreground mt-8 border-t pt-4">
        <p>Generated on {new Date().toLocaleDateString()} • Tax Migration Assessment Profile</p>
      </div>
    </div>
  )
} 