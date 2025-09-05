"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
      {/* Hero Section with Bonobo Office */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Welcome to Mr. Pro Bonobo's Office
          </h1>
        </div>
        
        <div className="mx-auto max-w-2xl relative rounded-2xl overflow-hidden shadow-xl border-4 border-amber-200">
          <Image
            src="/images/bonobo_office.png"
            alt="Mr. Pro Bonobo's Office"
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Step into my professional consultation room. I'll guide you through your international relocation journey with personalized insights and professional advice.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, title: "Tax Analysis", color: "blue", desc: "Comprehensive tax implications analysis" },
          { icon: CheckCircle, title: "Visa Guidance", color: "green", desc: "Step-by-step visa requirements" },
          { icon: FileText, title: "Financial Planning", color: "purple", desc: "Detailed financial roadmap" },
          { icon: Download, title: "Custom Report", color: "orange", desc: "Personalized PDF report" }
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
                  Our AI offers general, personalized insights and does not constitute legal, tax, immigration, or financial advice. Laws and policies change and vary by jurisdiction, so we cannot guarantee accuracy or completeness. Always verify with qualified professionals before making decisions.
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
                  We do not retain your data beyond the active consultation session. To generate your personalised report, your prompts and necessary context are transmitted to Perplexity AI for processing. No permanent storage occurs on our systems.
                  <a 
                    href="/privacy-policy" 
                    target="_blank" 
                    className="underline hover:text-green-900 font-medium ml-1"
                  >
                    See our Privacy Policy (includes a link to Perplexity AI’s Privacy Policy).
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

      {/* Legal Notice merged into AI-Powered Guidance above */}

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
                I have read and agree to the Terms & Conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By proceeding, you acknowledge this consultation is for informational purposes, agree to verify all recommendations with qualified professionals, and agree to our{' '}
                <a
                  href="/terms"
                  target="_blank"
                  className="underline font-medium hover:text-foreground"
                >
                  Terms & Conditions
                </a>
                . I'm ready to begin my consultation with Mr. Pro Bonobo.
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
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'opacity-50'
          }`}
        >
          <span className="flex items-center gap-2">
            Start Your Assessment
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
        
        {!accepted && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check the box above to continue
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center space-x-4">
        <a 
          href="/privacy-policy" 
          target="_blank" 
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Privacy Policy
        </a>
        <span className="text-muted-foreground/60">•</span>
        <a 
          href="/terms" 
          target="_blank" 
          className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Terms & Conditions
        </a>
      </div>
    </div>
  )
} 