"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
  Calendar,
  Shield,
  Target,
  AlertCircle,
  Info
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Summary() {
  const { formData, hasRequiredData, completedSections } = useFormStore()
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

  const resetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.removeItem("tax-migration-form")
      window.location.reload()
    }
  }

  // Section completion status
  const sections = [
    { id: "destination", name: "Destination Country", icon: MapPin, data: formData.destination },
    { id: "personal", name: "Personal Information", icon: User, data: formData.personalInformation },
    { id: "education", name: "Education & Skills", icon: GraduationCap, data: formData.education },
    { id: "residency", name: "Residency Intentions", icon: Heart, data: formData.residencyIntentions },
    { id: "finance", name: "Financial Information", icon: DollarSign, data: formData.finance },
    { id: "socialSecurity", name: "Social Security & Pensions", icon: Shield, data: formData.socialSecurityAndPensions },
    { id: "taxDeductions", name: "Tax Deductions & Credits", icon: Receipt, data: formData.taxDeductionsAndCredits },
    { id: "futurePlans", name: "Future Financial Plans", icon: TrendingUp, data: formData.futureFinancialPlans },
    { id: "additional", name: "Additional Information", icon: FileEdit, data: formData.additionalInformation }
  ]

  const completedCount = sections.filter(section => 
    (section.data && Object.keys(section.data).length > 0)
  ).length

  const completionPercentage = Math.round((completedCount / sections.length) * 100)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Profile Summary</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review your tax migration profile and download your data
        </p>
      </div>

      {/* Completion Overview Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Profile Completion
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your progress through the questionnaire</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Overall progress */}
            <div className="text-center p-6 border rounded-lg bg-card">
              <div className="text-4xl font-bold text-primary mb-2">{completionPercentage}%</div>
              <div className="text-lg font-medium mb-1">Profile Complete</div>
              <div className="text-sm text-muted-foreground">
                {completedCount} of {sections.length} sections completed
              </div>
            </div>

                         {/* Section breakdown */}
             <div className="grid gap-3">
               {sections.map((section) => {
                 const hasData = section.data && Object.keys(section.data).length > 0
                 const status = hasData
                
                return (
                  <div key={section.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${status ? 'bg-green-100 text-green-600' : 'bg-card text-gray-500'}`}>
                      {status ? <CheckCircle className="w-4 h-4" /> : <section.icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{section.name}</div>
                    </div>
                    <Badge variant={status ? "default" : "secondary"}>
                      {status ? "Complete" : "Incomplete"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Overview Card */}
      {formData && (
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              Profile Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">Key information from your profile</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Destination */}
              {formData.destination && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Destination</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.destination.region && formData.destination.region !== "I don't know yet / open to any" 
                      ? `${formData.destination.region}, ${formData.destination.country}`
                      : formData.destination.country}
                  </p>
                </div>
              )}

              {/* Current Country */}
              {formData.personalInformation?.currentResidency?.country && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Current Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.personalInformation.currentResidency.country}
                  </p>
                </div>
              )}

              {/* Move Type */}
              {formData.residencyIntentions?.destinationCountry?.moveType && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Move Type</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.residencyIntentions.destinationCountry.moveType}
                  </p>
                </div>
              )}

                             {/* Income Sources */}
               {formData.finance?.incomeSources && formData.finance.incomeSources.length > 0 && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <DollarSign className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Income Sources</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     {formData.finance.incomeSources.length} source{formData.finance.incomeSources.length !== 1 ? 's' : ''}
                   </p>
                 </div>
               )}

               {/* Education */}
               {formData.education?.previousDegrees && formData.education.previousDegrees.length > 0 && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <GraduationCap className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Education</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     {formData.education.previousDegrees.length} degree{formData.education.previousDegrees.length !== 1 ? 's' : ''}
                   </p>
                 </div>
               )}

               {/* Family */}
               {formData.personalInformation?.partner && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Family</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     Relocating with partner
                     {formData.personalInformation.dependents && formData.personalInformation.dependents.length > 0 && 
                       ` and ${formData.personalInformation.dependents.length} dependent${formData.personalInformation.dependents.length !== 1 ? 's' : ''}`
                     }
                   </p>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Download className="w-6 h-6 text-green-600" />
            Export & Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">Download your profile or manage your data</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={downloadJSON}
                variant="default"
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Profile (JSON)
              </Button>

              <Button
                onClick={printPDF}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print Summary (PDF)
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button
                onClick={() => setShowJSON(!showJSON)}
                variant="ghost"
                className="w-full"
              >
                {showJSON ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showJSON ? "Hide" : "Show"} Raw Data
              </Button>

              <Button
                onClick={resetData}
                variant="destructive"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Display */}
      {showJSON && (
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-600" />
              Raw Profile Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your complete profile in JSON format</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-card p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {json}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes Card */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Info className="w-6 h-6 text-amber-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy:</strong> Your data is stored locally in your browser and is not automatically shared with any third parties. Make sure to download your profile before clearing your browser data.
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Professional Advice:</strong> This profile is a starting point for your tax migration planning. Always consult with qualified tax professionals, immigration lawyers, and financial advisors for your specific situation.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Accuracy:</strong> Tax laws and immigration requirements change frequently. Ensure you have the most current information before making any major decisions based on this profile.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 