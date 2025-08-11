"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { useState, useEffect, useMemo } from "react"
import { SectionHint } from "@/components/ui/section-hint"
import { getLanguages } from "@/lib/utils/country-utils"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Plane, MapPin, Languages, Heart, DollarSign, FileText, Clock, Globe, Target } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"

export function ResidencyIntentions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()

  // Move type
  const moveType = getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const setMoveType = (v: string) => updateFormData("residencyIntentions.destinationCountry.moveType", v)

  // Temporary duration
  const tempDuration = getFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") ?? ""
  const setTempDuration = (v: string) => updateFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay", v)

  // Residency plans
  const applyForResidency = getFormData("residencyIntentions.residencyPlans.applyForResidency") ?? false
  const maxMonths = getFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside") ?? 6
  const openToVisiting = getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false

  // Citizenship plans
  const interestedInCitizenship = getFormData("residencyIntentions.citizenshipPlans.interestedInCitizenship") ?? false
  const willingToRenounceCurrent = getFormData("residencyIntentions.citizenshipPlans.willingToRenounceCurrent") ?? false
  const investmentCitizenship = getFormData("residencyIntentions.citizenshipPlans.investmentCitizenship") ?? false

  // Language proficiency
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const destRegion = getFormData("residencyIntentions.destinationCountry.region") ?? ""
  const languages = useMemo(() => {
    try {
      return getLanguages(destCountry, destRegion)
    } catch {
      return []
    }
  }, [destCountry, destRegion])

  // Other languages
  const [draftLang, setDraftLang] = useState({
    language: '', 
    proficiency: 'Basic', 
    teachingCapability: 'No'
  })
  const [others, setOthers] = useState(getFormData("residencyIntentions.languageProficiency.otherLanguages") ?? [])

  // Motivation
  const motivation = getFormData("residencyIntentions.moveMotivation") ?? ""

  // Tax compliance  
  const taxCompliant = getFormData("residencyIntentions.taxCompliantEverywhere") ?? true

  const handleComplete = () => {
    markSectionComplete("residency")
    onComplete()
  }

  const canContinue = moveType && (moveType !== "Temporary" || tempDuration)

  const canAddLang = draftLang.language.trim().length > 0

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Plane className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Residency Intentions</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us about your plans for residency, citizenship, and life in your destination country
        </p>
      </div>

      <SectionHint title="About this section">
        This section helps us understand your residency intentions, language skills, and citizenship pathways to provide tailored advice for your move.
      </SectionHint>

      {/* Move Type Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Move Type & Duration
          </CardTitle>
          <p className="text-sm text-muted-foreground">What type of move are you planning?</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Type of move *</Label>
              <Select value={moveType} onValueChange={setMoveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select move type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent - I want to stay indefinitely</SelectItem>
                  <SelectItem value="Temporary">Temporary - I have a specific duration in mind</SelectItem>
                  <SelectItem value="Exploratory">Exploratory - I want to test it out first</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {moveType === "Temporary" && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Intended duration *</Label>
                <Input
                  value={tempDuration}
                  onChange={(e) => setTempDuration(e.target.value)}
                  placeholder="e.g., 2 years, 18 months"
                />
                <p className="text-sm text-muted-foreground">
                  How long do you plan to stay in {destCountry || "your destination country"}?
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Residency Plans Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            Residency Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your plans for obtaining legal residency status</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="apply_residency"
                checked={applyForResidency}
                onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.applyForResidency", !!v)}
              />
              <Label htmlFor="apply_residency" className="text-base font-medium">
                I plan to apply for formal residency status
              </Label>
            </div>

            {applyForResidency && (
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Maximum months per year willing to be present</Label>
                  <div className="px-3">
                    <Slider
                      value={[maxMonths]}
                      onValueChange={(value) => updateFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside", value[0])}
                      max={12}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0 months</span>
                      <span className="font-medium">{maxMonths} months</span>
                      <span>12 months</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This affects tax residency requirements and residency obligations.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="open_visiting"
                checked={openToVisiting}
                onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.openToVisiting", !!v)}
              />
              <Label htmlFor="open_visiting" className="text-base font-medium">
                I'm open to visiting first before committing to residency
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citizenship Plans Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Globe className="w-6 h-6 text-green-600" />
            Citizenship Pathways
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your interest in obtaining citizenship in your destination country</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="interested_citizenship"
                checked={interestedInCitizenship}
                onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.interestedInCitizenship", !!v)}
              />
              <Label htmlFor="interested_citizenship" className="text-base font-medium">
                I'm interested in obtaining citizenship
              </Label>
            </div>

            {interestedInCitizenship && (
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="renounce_current"
                    checked={willingToRenounceCurrent}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.willingToRenounceCurrent", !!v)}
                  />
                  <Label htmlFor="renounce_current" className="text-base font-medium">
                    I'm willing to renounce my current citizenship(s) if required
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="investment_citizenship"
                    checked={investmentCitizenship}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.investmentCitizenship", !!v)}
                  />
                  <Label htmlFor="investment_citizenship" className="text-base font-medium">
                    💼 I'm interested in investment-based citizenship routes
                  </Label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Language Skills Card */}
      {destCountry && (
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Languages className="w-6 h-6 text-purple-600" />
              Language Skills
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your proficiency in languages spoken in {destCountry}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Destination country languages */}
              {languages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Languages in {destCountry}</h4>
                  {languages.map((lang) => {
                    const currentLevel = Number(getFormData(`residencyIntentions.languageProficiency.individual.${lang}`) || 0)
                    const proficiencyLabels = ['None', 'A1 (Beginner)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper-Intermediate)', 'C1 (Advanced)', 'C2 (Native-like)']
                    
                    return (
                      <div key={lang} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">{lang} proficiency</Label>
                          <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                        </div>
                        <Slider
                          value={[currentLevel]}
                          onValueChange={(value) => {
                            updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0])
                          }}
                          max={6}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                          <span>Beginner</span>
                          <span>Intermediate</span>
                          <span>Advanced</span>
                          <span>Native</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Other languages */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="font-medium text-base">Other Languages You Speak</h4>
                <p className="text-sm text-muted-foreground">Add any other languages you speak that aren't listed above</p>
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs mb-1">Language you speak:</Label>
                    <Input
                      placeholder="e.g. Spanish, French, Mandarin..."
                      value={draftLang.language}
                      onChange={(e) => setDraftLang({...draftLang, language: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs mb-1">Teaching interest:</Label>
                    <Select
                      value={draftLang.teachingCapability}
                      onValueChange={(v) => setDraftLang({...draftLang, teachingCapability: v})}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">Not interested</SelectItem>
                        <SelectItem value="Maybe, if attractive deal">Maybe, if attractive deal</SelectItem>
                        <SelectItem value="Informally">Informally</SelectItem>
                        <SelectItem value="Formally with credentials">Formally with credentials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canAddLang}
                    onClick={() => {
                      if (canAddLang && !others.some((o: any) => o.language === draftLang.language)) {
                        setOthers([...others, draftLang])
                        setDraftLang({language: '', proficiency: 'Basic', teachingCapability: 'No'})
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                {others.length > 0 && (
                  <div className="space-y-2">
                    {others.map((lang: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-sm text-muted-foreground ml-2">({lang.teachingCapability})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOthers(others.filter((_: any, i: number) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivation & Compliance Card */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Heart className="w-6 h-6 text-amber-600" />
            Motivation & Compliance
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your motivation for moving and tax compliance commitment</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">What's your main motivation for this move?</Label>
              <p className="text-sm text-muted-foreground">Optional but helps us tailor recommendations.</p>
              <Textarea
                value={motivation}
                onChange={(e) => updateFormData("residencyIntentions.moveMotivation", e.target.value)}
                placeholder="e.g. lower taxes, better quality of life, adventure, family reasons..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="tax_compliance"
                checked={taxCompliant}
                onCheckedChange={(v) => updateFormData("residencyIntentions.taxCompliantEverywhere", !!v)}
              />
              <div>
                <Label htmlFor="tax_compliance" className="text-base font-medium">
                  I have been fully tax compliant in every country I have lived in
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Check this if you have always filed and paid taxes as required in every country where you have lived.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {!canContinue && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Complete required fields:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {!moveType && <li>Type of move</li>}
                    {moveType === "Temporary" && !tempDuration && <li>Intended duration for temporary move</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Check My Information Button */}
            <div className="flex justify-center mb-3">
              <CheckInfoButton
                onClick={() => showSectionInfo("residency")}
                isLoading={isCheckingInfo}
                disabled={!canContinue}
              />
            </div>

            <Button
              disabled={!canContinue}
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Continue to Finance
            </Button>
          </div>
        </CardFooter>

        {/* Section Info Modal */}
        <SectionInfoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalTitle}
          story={currentStory}
          isLoading={isCheckingInfo}
          onExpandFullInfo={expandFullInformation}
          onBackToSection={backToSection}
          currentSection={currentSection}
          isFullView={isFullView}
          onGoToSection={goToSection}
          onNavigateToSection={navigateToSection}
        />
      </Card>
    </div>
  )
} 