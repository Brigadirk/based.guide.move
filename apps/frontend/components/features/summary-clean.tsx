"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { FileText, Pencil, Save, X } from "lucide-react"
import { PageHeading } from "@/components/ui/page-heading"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useFormStore } from "@/lib/stores"
import { toast } from "sonner"

export function Summary({ debugMode }: { debugMode?: boolean }) {
  const { formData, getFormData, updateFormData } = useFormStore()
  const [fullStory, setFullStory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStory, setEditedStory] = useState("")

  // Check for cached edited story
  useEffect(() => {
    const cachedStory = getFormData("summary.editedFullStory")
    if (cachedStory) {
      setFullStory(cachedStory)
      setEditedStory(cachedStory)
    }
  }, [getFormData])

  const generateFullStory = async () => {
    setIsLoading(true)
    try {
      const destinationCountry = getFormData("residencyIntentions.destinationCountry.country")
      const skipFinanceDetails = getFormData("finance.skipDetails") ?? false
      
      // Helper function to check if section has data
      const getSectionData = (section: string) => {
        const data = getFormData(section) || {}
        const hasData = Object.keys(data).length > 0 && 
                       Object.values(data).some(value => 
                         value !== null && value !== undefined && value !== "" && 
                         (Array.isArray(value) ? value.length > 0 : true)
                       )
        return { data, hasData }
      }
      
      // Get effective section data - for finance sections, use preserved data when skip is off
      const getEffectiveSectionData = (sectionKey: string) => {
        const isFinanceSection = ["finance", "socialSecurityAndPensions", "taxDeductionsAndCredits", "futureFinancialPlans"].includes(sectionKey)
        
        if (isFinanceSection && !skipFinanceDetails) {
          // When skip is OFF, try to use preserved data first, then current data
          const preservedData = getFormData("finance.preservedData") ?? {}
          const preserved = preservedData[sectionKey]
          if (preserved && Object.keys(preserved).length > 0) {
            return { data: preserved, hasData: true }
          }
        }
        
        // Default to current data
        return getSectionData(sectionKey)
      }
      
      const sections = [
        { key: "personalInformation", name: "Personal Information", apiCall: () => apiClient.getPersonalInformationStory(getEffectiveSectionData("personalInformation").data) },
        { key: "education", name: "Education & Skills", apiCall: () => apiClient.getEducationStory(getEffectiveSectionData("education").data, getSectionData("residencyIntentions").data) },
        { key: "residencyIntentions", name: "Residency Intentions", apiCall: () => apiClient.getResidencyIntentionsStory(getSectionData("residencyIntentions").data) },
        { key: "finance", name: "Financial Information", apiCall: () => apiClient.getFinanceStory({...getEffectiveSectionData("finance").data, skipDetails: skipFinanceDetails}, destinationCountry, skipFinanceDetails) },
        { key: "socialSecurityAndPensions", name: "Social Security & Pensions", apiCall: () => apiClient.getSocialSecurityStory(getEffectiveSectionData("socialSecurityAndPensions").data, destinationCountry, skipFinanceDetails) },
        { key: "taxDeductionsAndCredits", name: "Tax Deductions & Credits", apiCall: () => apiClient.getTaxDeductionsStory(getEffectiveSectionData("taxDeductionsAndCredits").data, destinationCountry, skipFinanceDetails) },
        { key: "futureFinancialPlans", name: "Future Financial Plans", apiCall: () => apiClient.getFutureFinancialPlansStory(getEffectiveSectionData("futureFinancialPlans").data, destinationCountry, skipFinanceDetails) },
        { key: "additionalInformation", name: "Additional Information", apiCall: () => apiClient.getAdditionalInformationStory(getSectionData("additionalInformation").data) }
      ]
      
      // Call APIs for all sections
      const sectionPromises = sections.map(async (section) => {
        const { hasData } = getEffectiveSectionData(section.key)
        const isFinanceSection = ["finance", "socialSecurityAndPensions", "taxDeductionsAndCredits", "futureFinancialPlans"].includes(section.key)
        
        // For finance sections, always call API (backend will handle skip vs data priority)
        // For non-finance sections, only call if has data
        if (hasData || isFinanceSection) {
          try {
            const response = await section.apiCall()
            return { name: section.name, story: response.story, hasData: true }
          } catch (error) {
            return { name: section.name, story: "Error generating story for this section.", hasData: false }
          }
        } else {
          return { name: section.name, story: "Nothing entered", hasData: false }
        }
      })
      
      const sectionResults = await Promise.all(sectionPromises)
      
      // Combine all stories into one comprehensive overview
      const generatedStory = sectionResults.map(result => `## ${result.name}\n${result.story}`).join('\n\n')
      
      setFullStory(generatedStory)
      setEditedStory(generatedStory)
      toast.success("Generated complete profile!")
      
    } catch (error) {
      console.error("Error generating full story:", error)
      toast.error("Failed to generate complete profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedStory(fullStory)
  }

  const handleSave = () => {
    setFullStory(editedStory)
    updateFormData("summary.editedFullStory", editedStory)
    setIsEditing(false)
    toast.success("Profile summary saved!")
  }

  const handleCancel = () => {
    setEditedStory(fullStory)
    setIsEditing(false)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Summary"
        description="Review your complete profile and generate analysis"
        icon={<FileText className="w-7 h-7 text-green-600" />}
      />

      <Card className="border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 shadow-md">
        <CardHeader className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-stone-900 dark:text-stone-100 text-xl">Full Summary</div>
              <div className="text-sm text-stone-700 dark:text-stone-300 mt-1">
                Complete profile generated from all sections
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {!fullStory ? (
            <div className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
              <CheckInfoButton
                onClick={generateFullStory}
                isLoading={isLoading}
                className="w-full"
                variant="default"
                size="lg"
                loadingText="Generating your complete profile..."
              >
                Generate Complete Profile
              </CheckInfoButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Your Complete Profile</h3>
                {!isEditing && debugMode && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      variant="default"
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <Textarea
                  value={editedStory}
                  onChange={(e) => setEditedStory(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                <div className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {fullStory.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') {
                        return <br key={index} />
                      }
                      
                      // Handle markdown headers (lines that start with ##)
                      if (paragraph.trim().startsWith('## ')) {
                        const headerText = paragraph.trim().substring(3)
                        return (
                          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-stone-900 dark:text-stone-100 border-b border-stone-300 dark:border-stone-600 pb-2">
                            {headerText}
                          </h2>
                        )
                      }
                      
                      // Skip duplicate section headers that end with : (like "Personal Information:")
                      if (paragraph.trim().endsWith(':') && !paragraph.includes('.') && paragraph.trim().length < 50) {
                        return null
                      }
                      
                      // Handle bullet points (lines that start with -)
                      if (paragraph.trim().startsWith('- ')) {
                        return (
                          <li key={index} className="ml-4 mb-2 text-stone-800 dark:text-stone-200">
                            {paragraph.trim().substring(2)}
                          </li>
                        )
                      }
                      
                      // Regular paragraphs
                      return (
                        <p key={index} className="mb-4 leading-relaxed text-stone-800 dark:text-stone-200">
                          {paragraph.trim()}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
