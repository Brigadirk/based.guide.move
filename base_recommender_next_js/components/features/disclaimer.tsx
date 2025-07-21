"use client"

/* eslint-disable react/no-unescaped-entities */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield, Clock, Eye } from "lucide-react"
import { useFormData } from "@/lib/hooks/use-form-data"

interface DisclaimerProps {
  onComplete: () => void
}

export function Disclaimer({ onComplete }: DisclaimerProps) {
  const { getFormData, updateFormData } = useFormData()
  const [accepted, setAccepted] = useState(getFormData("disclaimer.accepted") || false)

  const handleAccept = () => {
    updateFormData("disclaimer.accepted", true)
    updateFormData("disclaimer.dateAccepted", new Date().toISOString())
    onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Test Version Notice */}
      <Card className="border-border bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">
                Test Version
              </h3>
              <p className="text-muted-foreground text-sm">
                Your answers are transmitted securely and processed by our AI services to generate your personalised report.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Disclaimer */}
      <Card className="border-border bg-muted">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Important Legal Disclaimer
                </h3>
                <p className="text-muted-foreground text-sm">
                  This questionnaire is for informational purposes only and does not constitute legal, tax, or financial advice.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Not Professional Advice:</strong> The information provided through this questionnaire is general in nature and should not be considered as professional legal, tax, or financial advice. Always consult with qualified professionals for your specific situation.
              </p>
              
              <p>
                <strong>Accuracy of Information:</strong> While we strive to provide accurate and up-to-date information, tax laws and regulations change frequently. The information may not reflect the most current legal developments.
              </p>
              
              <p>
                <strong>Individual Circumstances:</strong> Your specific tax situation depends on many factors including your citizenship, residency, income sources, and the specific countries involved. This tool provides general guidance only.
              </p>
              
              <p>
                <strong>No Guarantees:</strong> We make no guarantees about the accuracy, completeness, or usefulness of the information provided. Your actual tax obligations may differ significantly from any estimates provided.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy */}
      <Card className="border-border bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">
                Data Privacy & Security
              </h3>
              <p className="text-muted-foreground text-sm">
                We send your questionnaire data to the Perplexity AI API for analysis. Data is encrypted in transit and deleted from our systems after your report is created. See our <a href="/privacy-policy" className="underline" target="_blank">Privacy Policy</a> for full details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">
                  How This Works
                </h3>
                <p className="text-muted-foreground text-sm">
                  This questionnaire will help us understand your situation and provide personalized recommendations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">What We'll Ask:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Your personal and family information</li>
                  <li>• Current financial situation</li>
                  <li>• Educational background</li>
                  <li>• Residency intentions</li>
                  <li>• Future financial plans</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">What You'll Get:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Personalized recommendations</li>
                  <li>• Country-specific insights</li>
                  <li>• Downloadable summary</li>
                  <li>• Next steps guidance</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance */}
      <Card className="border-2 border-dashed border-border">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accept-disclaimer"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <div className="space-y-2">
              <Label htmlFor="accept-disclaimer" className="text-base font-medium">
                I understand and accept the terms above
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box, you acknowledge that you have read and understood the disclaimer and agree to use this tool responsibly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleAccept}
          disabled={!accepted}
          size="lg"
          className="px-8"
        >
          Continue to Questionnaire
        </Button>
      </div>

      {/* Link to privacy policy */}
      <div className="text-center text-sm text-muted-foreground">
        <a href="/privacy-policy" target="_blank" className="underline">Read our full Privacy Policy</a>
      </div>
    </div>
  )
} 