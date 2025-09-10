"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Languages, Save } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"

type LanguageEntry = {
  language: string
  proficiency: number
  willingToTeach?: boolean
  hasCredentials?: boolean
}

type OtherLanguagesSectionProps = {
  otherLanguagesTab: string
  setOtherLanguagesTab: (value: string) => void
  hasPartnerSelected: boolean
  getFormData: (path: string) => any
  updateFormData: (path: string, value: any) => void
}

export function OtherLanguagesSection({
  otherLanguagesTab,
  setOtherLanguagesTab,
  hasPartnerSelected,
  getFormData,
  updateFormData
}: OtherLanguagesSectionProps) {
  const [languageDraft, setLanguageDraft] = useState({ 
    language: "", 
    proficiency: 0,
    willingToTeach: false,
    hasCredentials: false
  })
  const [saveStatus, setSaveStatus] = useState<{[key: string]: boolean}>({})

  // Get all available languages
  const getAllLanguages = (): string[] => {
    try {
      const { getAllLanguages } = require("@/lib/utils/country-utils")
      return getAllLanguages()
    } catch {
      return ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Other"]
    }
  }

  const allLanguages = getAllLanguages()

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

  // Your other languages
  const otherLanguages: LanguageEntry[] = getFormData("education.otherLanguages") ?? []
  const setOtherLanguages = (languages: LanguageEntry[]) => updateFormData("education.otherLanguages", languages)

  // Partner's other languages
  const partnerOtherLanguages: LanguageEntry[] = getFormData("education.partner.otherLanguages") ?? []
  const setPartnerOtherLanguages = (languages: LanguageEntry[]) => updateFormData("education.partner.otherLanguages", languages)

  // Unified function - same for both You and Partner
  const addLanguage = (isPartner: boolean = false) => {
    if (!languageDraft.language) return
    
    const newLanguage: LanguageEntry = {
      language: languageDraft.language,
      proficiency: languageDraft.proficiency,
      willingToTeach: languageDraft.willingToTeach,
      hasCredentials: languageDraft.hasCredentials
    }
    
    if (isPartner) {
      setPartnerOtherLanguages([...partnerOtherLanguages, newLanguage])
    } else {
      setOtherLanguages([...otherLanguages, newLanguage])
    }
    
    setLanguageDraft({ 
      language: "", 
      proficiency: 0,
      willingToTeach: false,
      hasCredentials: false
    })
  }

  const removeLanguage = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerOtherLanguages(partnerOtherLanguages.filter((_, i) => i !== index))
    } else {
      setOtherLanguages(otherLanguages.filter((_, i) => i !== index))
    }
  }

  // Save and add function for other languages
  const saveAndAddLanguage = (isPartner: boolean = false) => {
    // First add the language
    addLanguage(isPartner)
    
    // Then show save confirmation
    const key = isPartner ? "partner-other-saved" : "you-other-saved"
    setSaveStatus(prev => ({ ...prev, [key]: true }))
    
    // Clear save status after 2 seconds
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const getProficiencyBadgeColor = (proficiency: number) => {
    if (proficiency >= 6) return "bg-green-100 text-green-800"
    if (proficiency >= 4) return "bg-blue-100 text-blue-800"
    if (proficiency >= 2) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Languages className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Other Languages You Speak</h3>
      </div>
      
      {hasPartnerSelected ? (
        <div className="space-y-6">
          {/* Always show both Your and Partner other languages */}
          <div className="space-y-6">
            {/* Your Other Languages */}
            {otherLanguages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your ability in other languages</h4>
                <div className="grid gap-2">
                  {otherLanguages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{lang.language}</span>
                        <div className="flex gap-1">
                          {lang.willingToTeach && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Can teach{lang.hasCredentials ? " (Certified)" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{proficiencyLabels[lang.proficiency]}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguage(index, false)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partner's Other Languages */}
            {partnerOtherLanguages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Partner's ability in other languages</h4>
                <div className="grid gap-2">
                  {partnerOtherLanguages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{lang.language}</span>
                        <div className="flex gap-1">
                          {lang.willingToTeach && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Can teach{lang.hasCredentials ? " (Certified)" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{proficiencyLabels[lang.proficiency]}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguage(index, true)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab-based form inputs */}
          <SectionTabs tabState={otherLanguagesTab} setTabState={setOtherLanguagesTab}>
            <TabsContent value="you" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-white" />
                  <h4 className="font-medium">Add Your Language</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language_select">Language *</Label>
                  <Select
                    value={languageDraft.language}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="proficiency_slider">Proficiency level *</Label>
                    <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
                  </div>
                  <Slider
                    value={[languageDraft.proficiency]}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: value[0] }))}
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
                
                {/* Willing to teach checkbox (B1+ only) */}
                {languageDraft.proficiency >= 3 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="willing-to-teach"
                        checked={languageDraft.willingToTeach}
                        onCheckedChange={(checked) => setLanguageDraft(prev => ({ 
                          ...prev, 
                          willingToTeach: !!checked,
                          hasCredentials: checked ? prev.hasCredentials : false
                        }))}
                      />
                      <Label htmlFor="willing-to-teach" className="text-sm">
                        Willing to teach this language
                      </Label>
                    </div>
                    
                    {/* Teaching credentials checkbox */}
                    {languageDraft.willingToTeach && (
                      <div className="flex items-center gap-2 ml-6">
                        <Checkbox
                          id="teaching-credentials"
                          checked={languageDraft.hasCredentials}
                          onCheckedChange={(checked) => setLanguageDraft(prev => ({ 
                            ...prev, 
                            hasCredentials: !!checked
                          }))}
                        />
                        <Label htmlFor="teaching-credentials" className="text-sm text-muted-foreground">
                          I have teaching credentials for this language
                        </Label>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Save and Add Button for Your Other Languages */}
                <Button 
                  onClick={() => saveAndAddLanguage(false)} 
                  className="w-full"
                  variant={saveStatus["you-other-saved"] ? "secondary" : "default"}
                  disabled={!languageDraft.language}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus["you-other-saved"] ? "✓ Saved!" : "Save Your Other Languages"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="partner" className="mt-6 space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-white" />
                  <h4 className="font-medium">Add Partner's Language</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner_language_select">Language *</Label>
                  <Select
                    value={languageDraft.language}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="partner_proficiency_slider">Proficiency level *</Label>
                    <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
                  </div>
                  <Slider
                    value={[languageDraft.proficiency]}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: value[0] }))}
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
                
                {/* Save and Add Button for Partner's Other Languages */}
                <Button 
                  onClick={() => saveAndAddLanguage(true)} 
                  className="w-full"
                  variant={saveStatus["partner-other-saved"] ? "secondary" : "default"}
                  disabled={!languageDraft.language}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus["partner-other-saved"] ? "✓ Saved!" : "Save Partner's Other Languages"}
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Other Languages */}
          {otherLanguages.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-base">Your ability in other languages</h4>
              <div className="grid gap-2">
                {otherLanguages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{lang.language}</span>
                      <div className="flex gap-1">
                        {lang.willingToTeach && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Can teach{lang.hasCredentials ? " (Certified)" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{proficiencyLabels[lang.proficiency]}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLanguage(index, false)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-white" />
              <h4 className="font-medium">Add Another Language</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="single_language_select">Language *</Label>
              <Select
                value={languageDraft.language}
                onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {allLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="single_proficiency_slider">Proficiency level *</Label>
                <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
              </div>
              <Slider
                value={[languageDraft.proficiency]}
                onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: value[0] }))}
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
            
            {/* Save and Add Button for Single User Other Languages */}
            <Button 
              onClick={() => saveAndAddLanguage(false)} 
              className="w-full"
              variant={saveStatus["you-other-saved"] ? "secondary" : "default"}
              disabled={!languageDraft.language || languageDraft.proficiency === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveStatus["you-other-saved"] ? "✓ Saved!" : "Save Other Languages"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
