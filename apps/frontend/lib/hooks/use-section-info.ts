"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, SectionStoryResponse } from "@/lib/api-client"
import { useFormStore } from "@/lib/stores"
import { toast } from "sonner"

export function useSectionInfo() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentStory, setCurrentStory] = useState<string>("")
  const [modalTitle, setModalTitle] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState<string>("")
  const [isFullView, setIsFullView] = useState(false)
  
  const { getFormData, setCurrentSection: setAppCurrentSection } = useFormStore()
  const router = useRouter()

  const showSectionInfo = async (sectionType: string) => {
    setIsLoading(true)
    setIsModalOpen(true)
    setCurrentStory("")
    setCurrentSection(sectionType)
    setIsFullView(false)
    
    try {
      let response: SectionStoryResponse
      let sectionTitle: string
      
      // Get destination country for currency calculations
      const destinationCountry = getFormData("residencyIntentions.destinationCountry.country")
      // Get finance skip status for relevant sections
      const skipFinanceDetails = getFormData("finance.skipDetails") ?? false
      
      switch (sectionType) {
        case "personal":
          const personalInfo = getFormData("personalInformation") || {}
          response = await apiClient.getPersonalInformationStory(personalInfo)
          sectionTitle = "Personal Information Summary"
          break
          
        case "education":
          const education = getFormData("education") || {}
          response = await apiClient.getEducationStory(education)
          sectionTitle = "Education Summary"
          break
          
        case "residency":
          const residencyIntentions = getFormData("residencyIntentions") || {}
          response = await apiClient.getResidencyIntentionsStory(residencyIntentions)
          sectionTitle = "Residency Intentions Summary"
          break
          
        case "finance":
          const finance = getFormData("finance") || {}
          response = await apiClient.getFinanceStory(finance, destinationCountry)
          sectionTitle = "Financial Information Summary"
          break
          
        case "social-security":
          const socialSecurity = getFormData("socialSecurityAndPensions") || {}
          response = await apiClient.getSocialSecurityStory(socialSecurity, destinationCountry, skipFinanceDetails)
          sectionTitle = "Social Security & Pensions Summary"
          break
          
        case "tax-deductions":
          const taxDeductions = getFormData("taxDeductionsAndCredits") || {}
          response = await apiClient.getTaxDeductionsStory(taxDeductions, destinationCountry, skipFinanceDetails)
          sectionTitle = "Tax Deductions & Credits Summary"
          break
          
        case "future-plans":
          const futurePlans = getFormData("futureFinancialPlans") || {}
          response = await apiClient.getFutureFinancialPlansStory(futurePlans, destinationCountry, skipFinanceDetails)
          sectionTitle = "Future Financial Plans Summary"
          break
          
        case "additional":
          const additional = getFormData("additionalInformation") || {}
          response = await apiClient.getAdditionalInformationStory(additional)
          sectionTitle = "Additional Information Summary"
          break
          
        case "summary":
          const allData = {
            personalInformation: getFormData("personalInformation") || {},
            education: getFormData("education") || {},
            residencyIntentions: getFormData("residencyIntentions") || {},
            finance: getFormData("finance") || {},
            socialSecurityAndPensions: getFormData("socialSecurityAndPensions") || {},
            taxDeductionsAndCredits: getFormData("taxDeductionsAndCredits") || {},
            futureFinancialPlans: getFormData("futureFinancialPlans") || {},
            additionalInformation: getFormData("additionalInformation") || {},
          }
          response = await apiClient.getSummaryStory(allData)
          sectionTitle = "Complete Profile Summary"
          break
          
        default:
          throw new Error(`Unknown section type: ${sectionType}`)
      }
      
      setModalTitle(sectionTitle)
      setCurrentStory(response.story)
      
    } catch (error) {
      console.error("Error fetching section info:", error)
      
      // Determine if this is a backend connection error
      const isConnectionError = error instanceof Error && 
        (error.message.includes("Failed to fetch") || 
         error.message.includes("fetch") || 
         error.message.includes("NetworkError") ||
         error.message.includes("ERR_NETWORK"))
      
      if (isConnectionError) {
        setModalTitle("Backend Connection Error")
        setCurrentStory(`## ⚠️ Backend Server Not Running

**The backend server appears to be offline or unreachable.**

### To fix this issue:

1. **Open a terminal** and navigate to the backend directory:
   \`\`\`
   cd base_recommender_backend
   \`\`\`

2. **Start the backend server**:
   \`\`\`
   python3.11 app.py --port 5001
   \`\`\`

3. **Wait for the server to start** - you should see:
   \`\`\`
   INFO: Uvicorn running on http://0.0.0.0:5001
   \`\`\`

4. **Try "Check My Information" again** - it should now work!

### Technical Details:
- **Backend communication**: Via secure internal proxy
- **Error**: ${error.message}
- **Status**: Backend server not responding

Once the backend is running, this feature will provide AI-generated summaries and insights about your information.`)
      } else {
        setModalTitle("Error Generating Information")
        setCurrentStory(`## ❌ Unable to Generate Section Information

**An error occurred while processing your request.**

### Error Details:
- **Message**: ${error instanceof Error ? error.message : "Unknown error"}
- **Section**: ${sectionType}

### What you can try:
1. **Check your internet connection**
2. **Refresh the page** and try again
3. **Contact support** if the problem persists

Please try again in a moment.`)
      }
      
      toast.error(isConnectionError ? "Backend server not running - see modal for instructions" : "Failed to generate section information")
    } finally {
      setIsLoading(false)
    }
  }

  const expandFullInformation = async () => {
    setIsLoading(true)
    
    try {
      const destinationCountry = getFormData("residencyIntentions.destinationCountry.country")
      
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
      
      // Get section data and check if they have content
      const sections = [
        { key: "personalInformation", name: "Personal Information", apiCall: () => apiClient.getPersonalInformationStory(getSectionData("personalInformation").data) },
        { key: "education", name: "Education & Skills", apiCall: () => apiClient.getEducationStory(getSectionData("education").data) },
        { key: "residencyIntentions", name: "Residency Intentions", apiCall: () => apiClient.getResidencyIntentionsStory(getSectionData("residencyIntentions").data) },
        { key: "finance", name: "Financial Information", apiCall: () => apiClient.getFinanceStory(getSectionData("finance").data, destinationCountry) },
        { key: "socialSecurityAndPensions", name: "Social Security & Pensions", apiCall: () => apiClient.getSocialSecurityStory(getSectionData("socialSecurityAndPensions").data, destinationCountry) },
        { key: "taxDeductionsAndCredits", name: "Tax Deductions & Credits", apiCall: () => apiClient.getTaxDeductionsStory(getSectionData("taxDeductionsAndCredits").data, destinationCountry) },
        { key: "futureFinancialPlans", name: "Future Financial Plans", apiCall: () => apiClient.getFutureFinancialPlansStory(getSectionData("futureFinancialPlans").data, destinationCountry) },
        { key: "additionalInformation", name: "Additional Information", apiCall: () => apiClient.getAdditionalInformationStory(getSectionData("additionalInformation").data) }
      ]
      
      // Call APIs for sections that have data, or create placeholder for empty ones
      const sectionPromises = sections.map(async (section) => {
        const { hasData } = getSectionData(section.key)
        if (hasData) {
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
      
      // Combine all stories into one comprehensive overview (without summary)
      const fullStory = `${sectionResults.map(result => `## ${result.name}
${result.story}`).join('\n')}`
      
      setModalTitle("Complete Tax Migration Profile - All Information")
      setCurrentStory(fullStory)
      setIsFullView(true)
      
      toast.success("Generated complete profile with all sections!")
      
    } catch (error) {
      console.error("Error generating full profile:", error)
      
      // Determine if this is a backend connection error
      const isConnectionError = error instanceof Error && 
        (error.message.includes("Failed to fetch") || 
         error.message.includes("fetch") || 
         error.message.includes("NetworkError") ||
         error.message.includes("ERR_NETWORK"))
      
      if (isConnectionError) {
        setModalTitle("Backend Connection Error")
        setCurrentStory(`## ⚠️ Backend Server Not Running

**Cannot generate complete profile - backend server is offline.**

### To fix this issue:

1. **Open a terminal** and navigate to the backend directory:
   \`\`\`
   cd base_recommender_backend
   \`\`\`

2. **Start the backend server**:
   \`\`\`
   python3.11 app.py --port 5001
   \`\`\`

3. **Wait for the server to start** and try again

### Technical Details:
- **Error**: ${error.message}
- **Feature**: Complete profile generation requires backend API

Once the backend is running, you'll be able to generate comprehensive summaries across all sections.`)
        toast.error("Backend server not running - cannot generate complete profile")
      } else {
        setCurrentStory(`## ❌ Error Generating Complete Profile

**Failed to generate comprehensive profile information.**

### Error Details:
- **Message**: ${error instanceof Error ? error.message : "Unknown error"}

### What you can try:
1. **Check your internet connection**
2. **Try generating individual section summaries first**
3. **Refresh and try again**

Some sections may have generated successfully - try the individual "Check My Information" buttons for each section.`)
        toast.error("Failed to generate complete profile information")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const backToSection = async () => {
    if (currentSection) {
      await showSectionInfo(currentSection)
    }
  }

  const goToSection = async (sectionKey: string) => {
    await showSectionInfo(sectionKey)
  }

  const navigateToSection = (sectionKey: string) => {
    // Map section keys to section indices based on main app SECTIONS array
    const sectionMap: { [key: string]: number } = {
      "personal": 2,
      "residency": 3,
      "education": 4,
      "finance": 5,
      "social-security": 6,
      "tax-deductions": 7,
      "future-plans": 8,
      "additional": 9
    }
    
    const sectionIndex = sectionMap[sectionKey]
    if (sectionIndex !== undefined) {
      // Use the form store's setCurrentSection to navigate directly
      setAppCurrentSection(sectionIndex)
      // Scroll to top when navigating from modal
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentStory("")
    setModalTitle("")
    setCurrentSection("")
    setIsFullView(false)
  }

  return {
    isLoading,
    currentStory,
    modalTitle,
    isModalOpen,
    currentSection,
    isFullView,
    showSectionInfo,
    closeModal,
    expandFullInformation,
    backToSection,
    goToSection,
    navigateToSection,
  }
}
