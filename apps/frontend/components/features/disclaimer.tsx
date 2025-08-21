"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Shield, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  Brain,
  Target,
  FileText,
  Download
} from "lucide-react"
import { useFormStore } from "@/lib/stores"

interface DisclaimerProps {
  onComplete: () => void
}

export function Disclaimer({ onComplete }: DisclaimerProps) {
  const { getFormData, updateFormData } = useFormStore()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const accepted = getFormData("disclaimer.accepted") || false

  const handleAccept = () => {
    updateFormData("disclaimer.accepted", true)
    updateFormData("disclaimer.dateAccepted", new Date().toISOString())
    onComplete()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">AI-Powered Assessment</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Your Global Move Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get personalized insights for your international relocation with our intelligent assessment tool.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, title: "Tax Analysis", desc: "Smart tax obligation insights", color: "blue" },
          { icon: CheckCircle, title: "Visa Guidance", desc: "Residency requirements", color: "green" },
          { icon: FileText, title: "Financial Planning", desc: "Cross-border strategies", color: "purple" },
          { icon: Download, title: "Custom Report", desc: "Downloadable summary", color: "orange" }
        ].map((feature, i) => (
          <Card 
            key={i}
            className={`transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
              hoveredCard === feature.title ? 'ring-2 ring-blue-200' : ''
            }`}
            onMouseEnter={() => setHoveredCard(feature.title)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${feature.color}-100 flex items-center justify-center`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Important Notes - Compact & Beautiful */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Disclaimer */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">AI-Powered Guidance</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Our AI provides personalized insights based on your situation. Always verify with qualified professionals before making decisions.
                </p>
                <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-700">
                  Informational Only
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Your Privacy Matters</h3>
                <p className="text-sm text-green-800 leading-relaxed">
                  Data is encrypted, processed securely, and not stored. Only used to generate your personalized analysis. 
                  <a 
                    href="/privacy-policy" 
                    target="_blank" 
                    className="underline hover:text-green-900 font-medium ml-1"
                  >
                    Read our Privacy Policy
                  </a>
                </p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                  No Data Storage
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Notice - Minimal */}
      <Card className="border-2 border-dashed border-gray-300 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <strong>Legal Notice:</strong> This assessment provides general information only. Tax laws vary by jurisdiction and change frequently. 
              Consult qualified professionals for specific advice. No guarantees on accuracy or completeness.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance - Beautiful */}
      <Card className={`transition-all duration-300 ${accepted ? 'ring-2 ring-green-200 bg-green-50/50' : 'border-2 border-dashed'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Checkbox
              id="accept-disclaimer"
              checked={accepted}
              onCheckedChange={(checked) => {
                const isChecked = checked as boolean
                updateFormData("disclaimer.accepted", isChecked)
                if (isChecked) {
                  updateFormData("disclaimer.dateAccepted", new Date().toISOString())
                }
              }}
              className="mt-1"
            />
            <div className="space-y-2">
              <Label htmlFor="accept-disclaimer" className="text-base font-medium cursor-pointer">
                I understand and accept the terms above
              </Label>
              <p className="text-sm text-muted-foreground">
                By proceeding, you acknowledge this is for informational purposes and agree to verify all information with professionals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Button - Stunning */}
      <div className="text-center py-6">
        <Button
          onClick={handleAccept}
          disabled={!accepted}
          size="lg"
          className={`px-10 py-4 text-lg transition-all duration-300 ${
            accepted 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'opacity-50'
          }`}
        >
          <span className="flex items-center gap-2">
            Begin Your Assessment
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
        
        {!accepted && (
          <p className="text-sm text-muted-foreground mt-3">
            Please accept the terms above to continue
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center">
        <a 
          href="/privacy-policy" 
          target="_blank" 
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          View Privacy Policy
        </a>
      </div>
    </div>
  )
} 