"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useFormStore } from "@/lib/stores"
import { getLanguages } from "@/lib/utils/country-utils"
import { CountryFlag } from "@/components/features/country/CountryFlag"
import { SectionTabs, TabsContent } from "../shared/section-tabs"
import { Languages, Info, Save } from "lucide-react"

export function LanguageProficiencyFull() {
  const { getFormData, updateFormData } = useFormStore()
  
  // Tab state for You/Partner consistency
  const [languageTab, setLanguageTab] = useState("you")
  
  // State for save confirmations
  const [saveStatus, setSaveStatus] = useState<{[key: string]: boolean}>({})
  
  // State for adding new teaching languages
  const [newTeachingLang, setNewTeachingLang] = useState({
    language: '', 
    capability: 'Informally'
  })
  
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const destRegion = getFormData("residencyIntentions.destinationCountry.region") ?? ""
  
  // Family information
  const hasPartner = getFormData("personalInformation.relocationPartner") ?? false
  const numDependents = getFormData("personalInformation.numRelocationDependents") ?? 0
  
  // Get languages for the destination
  const languages = (() => {
    try {
      return getLanguages(destCountry, destRegion)
    } catch {
      return []
    }
  })()
  
  // Get existing language data
  const languageData = getFormData("residencyIntentions.languageProficiency") ?? {}
  const individualProficiency = languageData.individual || {}
  const partnerProficiency = languageData.partner || {}
  const dependentsProficiency = languageData.dependents || []
  const willingToLearn = languageData.willing_to_learn || []
  const partnerWillingToLearn = languageData.partner_willing_to_learn || []
  const willingToTeach = languageData.willing_to_teach || []
  const partnerWillingToTeach = languageData.partner_willing_to_teach || []
  const teachingCredentials = languageData.teaching_credentials || []
  const partnerTeachingCredentials = languageData.partner_teaching_credentials || []
  const canTeach = languageData.can_teach || {}
  const otherLanguages = languageData.other_languages || {}
  
  const proficiencyLabels: {[key: number]: string} = {
    0: "None",
    1: "A1 Basic",
    2: "A2 Elementary", 
    3: "B1 Intermediate",
    4: "B2 Upper Intermediate",
    5: "C1 Advanced",
    6: "C2 Proficient",
    7: "Native Speaker"
  }

  // Unified function to handle willing to learn for both You and Partner
  const toggleWillingToLearn = (lang: string, isPartner: boolean = false) => {
    const currentWillingToLearn = getFormData('residencyIntentions.languageProficiency.willing_to_learn') ?? []
    const partnerWillingToLearn = getFormData('residencyIntentions.languageProficiency.partner_willing_to_learn') ?? []
    
    if (isPartner) {
      const updated = partnerWillingToLearn.includes(lang)
        ? partnerWillingToLearn.filter((l: string) => l !== lang)
        : [...partnerWillingToLearn, lang]
      updateFormData('residencyIntentions.languageProficiency.partner_willing_to_learn', updated)
    } else {
      const updated = currentWillingToLearn.includes(lang)
        ? currentWillingToLearn.filter((l: string) => l !== lang)
        : [...currentWillingToLearn, lang]
      updateFormData('residencyIntentions.languageProficiency.willing_to_learn', updated)
    }
  }

  // Unified function to handle willing to teach for both You and Partner
  const toggleWillingToTeach = (lang: string, isPartner: boolean = false) => {
    const currentWillingToTeach = getFormData('residencyIntentions.languageProficiency.willing_to_teach') ?? []
    const partnerWillingToTeach = getFormData('residencyIntentions.languageProficiency.partner_willing_to_teach') ?? []
    
    if (isPartner) {
      const updated = partnerWillingToTeach.includes(lang)
        ? partnerWillingToTeach.filter((l: string) => l !== lang)
        : [...partnerWillingToTeach, lang]
      updateFormData('residencyIntentions.languageProficiency.partner_willing_to_teach', updated)
    } else {
      const updated = currentWillingToTeach.includes(lang)
        ? currentWillingToTeach.filter((l: string) => l !== lang)
        : [...currentWillingToTeach, lang]
      updateFormData('residencyIntentions.languageProficiency.willing_to_teach', updated)
    }
  }

  // Unified function to handle teaching credentials for both You and Partner
  const toggleTeachingCredentials = (lang: string, isPartner: boolean = false) => {
    const currentCredentials = getFormData('residencyIntentions.languageProficiency.teaching_credentials') ?? []
    const partnerCredentials = getFormData('residencyIntentions.languageProficiency.partner_teaching_credentials') ?? []
    
    if (isPartner) {
      const updated = partnerCredentials.includes(lang)
        ? partnerCredentials.filter((l: string) => l !== lang)
        : [...partnerCredentials, lang]
      updateFormData('residencyIntentions.languageProficiency.partner_teaching_credentials', updated)
    } else {
      const updated = currentCredentials.includes(lang)
        ? currentCredentials.filter((l: string) => l !== lang)
        : [...currentCredentials, lang]
      updateFormData('residencyIntentions.languageProficiency.teaching_credentials', updated)
    }
  }

  // Save function for language proficiency
  const saveLanguageProficiency = (isPartner: boolean = false) => {
    const currentData = getFormData("residencyIntentions.languageProficiency") ?? {}
    
    // Ensure all destination languages are explicitly saved with their current values
    const updatedData = { ...currentData }
    
    if (isPartner) {
      // Ensure partner proficiency object exists and has all destination languages
      if (!updatedData.partner) updatedData.partner = {}
      languages.forEach((lang: string) => {
        const currentValue = Number(partnerProficiency[lang] || 0)
        updatedData.partner[lang] = currentValue
      })
    } else {
      // Ensure individual proficiency object exists and has all destination languages
      if (!updatedData.individual) updatedData.individual = {}
      languages.forEach((lang: string) => {
        const currentValue = Number(individualProficiency[lang] || 0)
        updatedData.individual[lang] = currentValue
      })
    }
    
    updateFormData("residencyIntentions.languageProficiency", {
      ...updatedData,
      saved: true,
      savedAt: new Date().toISOString()
    })
    
    const key = isPartner ? "partner-saved" : "you-saved"
    setSaveStatus(prev => ({ ...prev, [key]: true }))
    
    // Clear save status after 2 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }
  
  if (!destCountry) {
    return (
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Languages className="w-6 h-6 text-amber-600" />
            Language Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
                <AlertDescription>
              Please complete the <strong>Destination</strong> section first to see language requirements.
                </AlertDescription>
              </Alert>
        </CardContent>
      </Card>
    )
  }

  // Check if user has basic language proficiency
  const hasBasicLanguageData = Object.keys(individualProficiency).length > 0

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <Languages className="w-6 h-6 text-indigo-600" />
          Destination Language Skills
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your proficiency in languages for immigration and integration</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Required notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Language proficiency is required to complete this section.</strong> Please fill in your language skills for at least the destination country languages.
            </AlertDescription>
          </Alert>

          {/* Destination Language Info */}
          {languages.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CountryFlag 
                  countryCode={destCountry} 
                  className="w-8 h-6 rounded border border-gray-200 dark:border-gray-700" 
                />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Languages in {destCountry}</h4>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Dominant language{languages.length > 1 ? 's' : ''} in {destCountry}: <strong>{languages.join(', ')}</strong>
                </p>
                {destRegion && destRegion !== "I don't know yet" && (
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Dominant language{languages.length > 1 ? 's' : ''} for {destRegion} region: <strong>{languages.join(', ')}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* You/Partner Language Skills with Tabs */}
          {hasPartner ? (
            <SectionTabs tabState={languageTab} setTabState={setLanguageTab}>
              <TabsContent value="you" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-base">📊 Your Language Skills</h4>
                  {languages.map((lang: string) => {
                    const currentLevel = Number(individualProficiency[lang] || 0)
                    const willingToLearnThis = willingToLearn.includes(lang)
                    
                    return (
                      <div key={`individual-${lang}`} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">Your proficiency in {lang}</Label>
                          <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                        </div>
                        <Slider
                          value={[currentLevel]}
                          onValueChange={(value) => {
                            updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0])
                            // Auto-clear "willing to learn" if Native Speaker is selected
                            if (value[0] === 7 && willingToLearnThis) {
                              toggleWillingToLearn(lang, false)
                            }
                          }}
                          max={7}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                          <span>A1</span>
                          <span>A2</span>
                          <span>B1</span>
                          <span>B2</span>
                          <span>C1</span>
                          <span>C2</span>
                          <span>Native</span>
                        </div>
                        
                        {/* Willing to learn checkbox (hide for Native speakers) */}
                        {currentLevel < 7 && (
                          <div className="flex items-center gap-2 mt-3">
                            <Checkbox
                              id={`willing-${lang}`}
                              checked={willingToLearnThis}
                              onCheckedChange={() => toggleWillingToLearn(lang, false)}
                            />
                            <Label htmlFor={`willing-${lang}`} className="text-sm">
                              Willing to learn {lang}
                            </Label>
                          </div>
                        )}
                        
                        {/* Willing to teach checkbox (B1+ only) */}
                        {currentLevel >= 3 && (
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`teach-${lang}`}
                                checked={willingToTeach.includes(lang)}
                                onCheckedChange={() => toggleWillingToTeach(lang, false)}
                              />
                              <Label htmlFor={`teach-${lang}`} className="text-sm">
                                Willing to teach {lang}
                              </Label>
                            </div>
                            
                            {/* Teaching credentials checkbox */}
                            {willingToTeach.includes(lang) && (
                              <div className="flex items-center gap-2 ml-6">
                                <Checkbox
                                  id={`credentials-${lang}`}
                                  checked={teachingCredentials.includes(lang)}
                                  onCheckedChange={() => toggleTeachingCredentials(lang, false)}
                                />
                                <Label htmlFor={`credentials-${lang}`} className="text-sm text-muted-foreground">
                                  I have teaching credentials for {lang}
                                </Label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Save Button for Your Languages */}
                  <Button 
                    onClick={() => saveLanguageProficiency(false)} 
                    className="w-full"
                    variant={saveStatus["you-saved"] ? "secondary" : "default"}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveStatus["you-saved"] ? "✓ Saved!" : "Save Your Language Proficiency"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="partner" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-base">👥 Partner's Language Skills</h4>
                  {languages.map((lang: string) => {
                    const currentLevel = Number(partnerProficiency[lang] || 0)
                    
                    return (
                      <div key={`partner-${lang}`} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-medium">Partner's proficiency in {lang}</Label>
                          <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                        </div>
                        <Slider
                          value={[currentLevel]}
                          onValueChange={(value) => {
                            updateFormData(`residencyIntentions.languageProficiency.partner.${lang}`, value[0])
                            // Auto-clear "willing to learn" if Native Speaker is selected
                            if (value[0] === 7 && partnerWillingToLearn.includes(lang)) {
                              toggleWillingToLearn(lang, true)
                            }
                          }}
                          max={7}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                          <span>A1</span>
                          <span>A2</span>
                          <span>B1</span>
                          <span>B2</span>
                          <span>C1</span>
                          <span>C2</span>
                          <span>Native</span>
                        </div>
                        
                        {/* Willing to learn checkbox for Partner (hide for Native speakers) */}
                        {currentLevel < 7 && (
                          <div className="flex items-center gap-2 mt-3">
                            <Checkbox
                              id={`partner-willing-${lang}`}
                              checked={partnerWillingToLearn.includes(lang)}
                              onCheckedChange={() => toggleWillingToLearn(lang, true)}
                            />
                            <Label htmlFor={`partner-willing-${lang}`} className="text-sm">
                              Partner willing to learn {lang}
                            </Label>
                          </div>
                        )}
                        
                        {/* Willing to teach checkbox for Partner (B1+ only) */}
                        {currentLevel >= 3 && (
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`partner-teach-${lang}`}
                                checked={partnerWillingToTeach.includes(lang)}
                                onCheckedChange={() => toggleWillingToTeach(lang, true)}
                              />
                              <Label htmlFor={`partner-teach-${lang}`} className="text-sm">
                                Partner willing to teach {lang}
                              </Label>
                            </div>
                            
                            {/* Teaching credentials checkbox for Partner */}
                            {partnerWillingToTeach.includes(lang) && (
                              <div className="flex items-center gap-2 ml-6">
                                <Checkbox
                                  id={`partner-credentials-${lang}`}
                                  checked={partnerTeachingCredentials.includes(lang)}
                                  onCheckedChange={() => toggleTeachingCredentials(lang, true)}
                                />
                                <Label htmlFor={`partner-credentials-${lang}`} className="text-sm text-muted-foreground">
                                  Partner has teaching credentials for {lang}
                                </Label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Save Button for Partner Languages */}
                  <Button 
                    onClick={() => saveLanguageProficiency(true)} 
                    className="w-full"
                    variant={saveStatus["partner-saved"] ? "secondary" : "default"}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveStatus["partner-saved"] ? "✓ Saved!" : "Save Partner's Language Proficiency"}
                  </Button>
                </div>
              </TabsContent>
            </SectionTabs>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-base">📊 Your Language Skills</h4>
              {languages.map((lang: string) => {
                const currentLevel = Number(individualProficiency[lang] || 0)
                const willingToLearnThis = willingToLearn.includes(lang)
                
                return (
                  <div key={`individual-${lang}`} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">Your proficiency in {lang}</Label>
                      <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                    </div>
                    <Slider
                      value={[currentLevel]}
                      onValueChange={(value) => {
                        updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0])
                        // Auto-clear "willing to learn" if Native Speaker is selected
                        if (value[0] === 7 && willingToLearnThis) {
                          toggleWillingToLearn(lang, false)
                        }
                      }}
                      max={7}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>A1</span>
                      <span>A2</span>
                      <span>B1</span>
                      <span>B2</span>
                      <span>C1</span>
                      <span>C2</span>
                      <span>Native</span>
                    </div>
                    
                    {/* Willing to learn checkbox (hide for Native speakers) */}
                    {currentLevel < 7 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Checkbox
                          id={`willing-${lang}`}
                          checked={willingToLearnThis}
                          onCheckedChange={() => toggleWillingToLearn(lang, false)}
                        />
                        <Label htmlFor={`willing-${lang}`} className="text-sm">
                          Willing to learn {lang}
                        </Label>
                      </div>
                    )}
                    
                    {/* Willing to teach checkbox (B1+ only) */}
                    {currentLevel >= 3 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`teach-${lang}`}
                            checked={willingToTeach.includes(lang)}
                            onCheckedChange={() => toggleWillingToTeach(lang, false)}
                          />
                          <Label htmlFor={`teach-${lang}`} className="text-sm">
                            Willing to teach {lang}
                          </Label>
                        </div>
                        
                        {/* Teaching credentials checkbox */}
                        {willingToTeach.includes(lang) && (
                          <div className="flex items-center gap-2 ml-6">
                            <Checkbox
                              id={`credentials-${lang}`}
                              checked={teachingCredentials.includes(lang)}
                              onCheckedChange={() => toggleTeachingCredentials(lang, false)}
                            />
                            <Label htmlFor={`credentials-${lang}`} className="text-sm text-muted-foreground">
                              I have teaching credentials for {lang}
                            </Label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              
              {/* Save Button for Single User */}
              <Button 
                onClick={() => saveLanguageProficiency(false)} 
                className="w-full"
                variant={saveStatus["you-saved"] ? "secondary" : "default"}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStatus["you-saved"] ? "✓ Saved!" : "Save Language Proficiency"}
              </Button>
            </div>
          )}

          {/* Display Saved Destination Languages */}
          {languageData.saved && (
            <div className="space-y-4">
              {/* Your Saved Languages */}
              {(() => {
                const yourSavedLanguages = languages.filter((lang: string) => {
                  const hasProficiency = individualProficiency.hasOwnProperty(lang)
                  const proficiency = Number(individualProficiency[lang] || 0)
                  const willingToLearnThis = willingToLearn.includes(lang)
                  // Show if explicitly saved OR if has willing to learn
                  return (languageData.saved && hasProficiency) || willingToLearnThis
                })
                
                return yourSavedLanguages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-base">Your ability in destination languages</h4>
                    <div className="grid gap-2">
                      {yourSavedLanguages.map((lang: string) => {
                        const proficiency = Number(individualProficiency[lang] || 0)
                        const willingToLearnThis = willingToLearn.includes(lang)
                        const willingToTeachThis = willingToTeach.includes(lang)
                        const hasCredentials = teachingCredentials.includes(lang)
                        
                        return (
                          <div key={`saved-you-${lang}`} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{lang}</span>
                              <div className="flex gap-1">
                                {willingToLearnThis && proficiency === 0 && (
                                  <Badge variant="outline" className="text-xs">Willing to learn</Badge>
                                )}
                                {willingToTeachThis && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    Can teach{hasCredentials ? " (Certified)" : ""}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary">{proficiencyLabels[proficiency]}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Partner's Saved Languages */}
              {hasPartner && (() => {
                const partnerSavedLanguages = languages.filter((lang: string) => {
                  const hasProficiency = partnerProficiency.hasOwnProperty(lang)
                  const proficiency = Number(partnerProficiency[lang] || 0)
                  const willingToLearnThis = partnerWillingToLearn.includes(lang)
                  // Show if explicitly saved OR if has willing to learn
                  return (languageData.saved && hasProficiency) || willingToLearnThis
                })
                
                return partnerSavedLanguages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-base">Partner's ability in destination languages</h4>
                    <div className="grid gap-2">
                      {partnerSavedLanguages.map((lang: string) => {
                        const proficiency = Number(partnerProficiency[lang] || 0)
                        const willingToLearnThis = partnerWillingToLearn.includes(lang)
                        const willingToTeachThis = partnerWillingToTeach.includes(lang)
                        const hasCredentials = partnerTeachingCredentials.includes(lang)
                        
                        return (
                          <div key={`saved-partner-${lang}`} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{lang}</span>
                              <div className="flex gap-1">
                                {willingToLearnThis && proficiency === 0 && (
                                  <Badge variant="outline" className="text-xs">Willing to learn</Badge>
                                )}
                                {willingToTeachThis && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    Can teach{hasCredentials ? " (Certified)" : ""}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary">{proficiencyLabels[proficiency]}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Dependents' Language Skills */}
          {numDependents > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-base">👨‍👩‍👧‍👦 Dependents' Language Skills</h4>
              {Array.from({length: numDependents}, (_, i) => (
                <Card key={i} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Dependent {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {languages.map((lang: string) => {
                      const currentLevel = Number((dependentsProficiency[i] && dependentsProficiency[i][lang]) || 0)
                      
                      return (
                        <div key={`dependent-${i}-${lang}`} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Proficiency in {lang}</Label>
                            <Badge variant="outline" className="text-xs">{proficiencyLabels[currentLevel]}</Badge>
                          </div>
                          <Slider
                            value={[currentLevel]}
                            onValueChange={(value) => {
                              const newDependentsProficiency = [...dependentsProficiency]
                              if (!newDependentsProficiency[i]) {
                                newDependentsProficiency[i] = {}
                              }
                              newDependentsProficiency[i][lang] = value[0]
                              updateFormData('residencyIntentions.languageProficiency.dependents', newDependentsProficiency)
                            }}
                            max={7}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>None</span>
                            <span>A1</span>
                            <span>A2</span>
                            <span>B1</span>
                            <span>B2</span>
                            <span>C1</span>
                            <span>C2</span>
                            <span>Native</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
