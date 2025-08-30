"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Languages } from "lucide-react"
import { SectionTabs, TabsContent } from "../shared/section-tabs"

type LanguageEntry = {
  language: string
  proficiency: number
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
  const [languageDraft, setLanguageDraft] = useState({ language: "", proficiency: 0 })

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
    if (!languageDraft.language || languageDraft.proficiency === 0) return
    
    const newLanguage: LanguageEntry = {
      language: languageDraft.language,
      proficiency: languageDraft.proficiency
    }
    
    if (isPartner) {
      setPartnerOtherLanguages([...partnerOtherLanguages, newLanguage])
    } else {
      setOtherLanguages([...otherLanguages, newLanguage])
    }
    
    setLanguageDraft({ language: "", proficiency: 0 })
  }

  const removeLanguage = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      setPartnerOtherLanguages(partnerOtherLanguages.filter((_, i) => i !== index))
    } else {
      setOtherLanguages(otherLanguages.filter((_, i) => i !== index))
    }
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
                <h4 className="text-sm font-medium text-muted-foreground">Your Other Languages</h4>
                {otherLanguages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{lang.language}</h4>
                        <Badge className={getProficiencyBadgeColor(lang.proficiency)}>
                          {proficiencyLabels[lang.proficiency]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index, false)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Partner's Other Languages */}
            {partnerOtherLanguages.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Partner's Other Languages</h4>
                {partnerOtherLanguages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{lang.language}</h4>
                        <Badge className={getProficiencyBadgeColor(lang.proficiency)}>
                          {proficiencyLabels[lang.proficiency]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index, true)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
                  <Label htmlFor="proficiency_select">Proficiency level *</Label>
                  <Select
                    value={languageDraft.proficiency.toString()}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(proficiencyLabels).map(([level, label]) => (
                        <SelectItem key={level} value={level}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addLanguage(false)} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2 text-white" />
                  Add Your Language
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
                  <Label htmlFor="partner_proficiency_select">Proficiency level *</Label>
                  <Select
                    value={languageDraft.proficiency.toString()}
                    onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(proficiencyLabels).map(([level, label]) => (
                        <SelectItem key={level} value={level}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => addLanguage(true)} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2 text-white" />
                  Add Partner's Language
                </Button>
              </div>
            </TabsContent>
          </SectionTabs>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Single User Mode - Your Other Languages */}
          {otherLanguages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{lang.language}</h4>
                  <Badge className={getProficiencyBadgeColor(lang.proficiency)}>
                    {proficiencyLabels[lang.proficiency]}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLanguage(index, false)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

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
              <Label htmlFor="single_proficiency_select">Proficiency level *</Label>
              <Select
                value={languageDraft.proficiency.toString()}
                onValueChange={(value) => setLanguageDraft(prev => ({ ...prev, proficiency: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(proficiencyLabels).map(([level, label]) => (
                    <SelectItem key={level} value={level}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => addLanguage(false)} className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2 text-white" />
              Add Language
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
