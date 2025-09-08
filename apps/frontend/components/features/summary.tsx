"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useFormStore } from "@/lib/stores"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { apiClient } from "@/lib/api-client"
import { 
  FileText, 
  CheckCircle, 
  User, 
  MapPin, 
  GraduationCap, 
  Heart, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  FileEdit,
  Shield,
  Target,
  Info,
  Loader2
} from "lucide-react"
import { PageHeading } from "@/components/ui/page-heading"


interface SummaryProps {
  onNavigateToResults?: () => void
}

export function Summary({ onNavigateToResults }: SummaryProps = {}) {
  const { formData, hasRequiredData, completedSections, isSectionMarkedComplete } = useFormStore()
  
  // Section info modal functionality
  const { 
    isLoading: isCheckingInfo, 
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
    navigateToSection 
  } = useSectionInfo()
  
  // State for individual section stories
  const [sectionStories, setSectionStories] = useState<{[key: string]: string}>({})
  const [loadingSections, setLoadingSections] = useState<{[key: string]: boolean}>({})
  
  // Track skip finance details state to clear cache when it changes
  const skipFinanceDetails = (formData.finance as any)?.skipDetails ?? false
  const [prevSkipFinanceDetails, setPrevSkipFinanceDetails] = useState(skipFinanceDetails)
  
  // Clear financial section stories when skip state changes
  useEffect(() => {
    if (skipFinanceDetails !== prevSkipFinanceDetails) {
      setSectionStories(prev => {
        const updated = { ...prev }
        // Clear all financial section stories
        delete updated.finance
        delete updated.socialSecurity
        delete updated.taxDeductions
        delete updated.futurePlans
        return updated
      })
      setPrevSkipFinanceDetails(skipFinanceDetails)
    }
  }, [skipFinanceDetails, prevSkipFinanceDetails])

  // Function to fetch individual section story
  const fetchSectionStory = async (sectionId: string) => {
    if (sectionStories[sectionId] || loadingSections[sectionId]) return
    
    setLoadingSections(prev => ({ ...prev, [sectionId]: true }))
    
    try {
      let response
      const residencyInfo: any = formData.residencyIntentions as any
      const destData = residencyInfo?.destinationCountry
      const destCountry = typeof destData === 'object' ? destData?.country : residencyInfo?.intendedCountry
      const destRegion = typeof destData === 'object' ? destData?.region : undefined
      
      switch (sectionId) {
        case "destination":
          // Handle destination locally without backend call
          if (destCountry) {
            const story = `Destination Country: ${destCountry}${destRegion && destRegion !== "I don't know yet / open to any" ? `\nRegion: ${destRegion}` : ''}${residencyInfo?.moveType ? `\nMove Type: ${residencyInfo.moveType}` : ''}`
            setSectionStories(prev => ({ ...prev, [sectionId]: story }))
            setLoadingSections(prev => ({ ...prev, [sectionId]: false }))
            return
          } else {
            throw new Error("No destination information found")
          }
        case "personal":
          const personalInfo = formData.personalInformation || {}
          response = await apiClient.getPersonalInformationStory(personalInfo)
          break
        case "education":
          const education = formData.education || {}
          response = await apiClient.getEducationStory(education)
          break
        case "residency":
          const residencyData = formData.residencyIntentions || {}
          response = await apiClient.getResidencyIntentionsStory(residencyData)
          break
        case "finance":
          const finance = formData.finance || {}
          response = await apiClient.getFinanceStory(finance, destCountry, skipFinanceDetails)
          break
        case "socialSecurity":
          const socialSecurity = formData.socialSecurityAndPensions || {}
          response = await apiClient.getSocialSecurityStory(socialSecurity, destCountry, skipFinanceDetails)
          break
        case "taxDeductions":
          const taxDeductions = formData.taxDeductionsAndCredits || {}
          response = await apiClient.getTaxDeductionsStory(taxDeductions, destCountry, skipFinanceDetails)
          break
        case "futurePlans":
          const futurePlans = formData.futureFinancialPlans || {}
          response = await apiClient.getFutureFinancialPlansStory(futurePlans, destCountry, skipFinanceDetails)
          break
        case "additional":
          const additionalInfo = formData.additionalInformation || {}
          response = await apiClient.getAdditionalInformationStory(additionalInfo)
          break
        case "fullSummary":
          // Handle full summary by triggering the complete profile generation
          expandFullInformation()
          return
        default:
          throw new Error(`Unknown section: ${sectionId}`)
      }
      
      setSectionStories(prev => ({ ...prev, [sectionId]: response.story }))
    } catch (error) {
      console.error(`Error fetching story for ${sectionId}:`, error)
      const err: any = error
      const authMsg = err?.message?.toLowerCase().includes('api key') || err?.message?.toLowerCase().includes('authentication')
      setSectionStories(prev => ({
        ...prev,
        [sectionId]: authMsg
          ? "Authentication required: set LOCAL_API_KEY/STAGING_API_KEY/PRODUCTION_API_KEY in both frontend and backend, then restart."
          : "Error loading section information."
      }))
    } finally {
      setLoadingSections(prev => ({ ...prev, [sectionId]: false }))
    }
  }






  // Helper function to format education data for display
  const formatEducationData = (eduData: any) => {
    if (!eduData) return null
    
    const sections = []
    
    // Destination Language Skills
    const languageData = formData.residencyIntentions?.languageProficiency
    if (languageData?.saved) {
      sections.push({
        title: "Destination Language Skills",
        items: []
      })
      
      // Your language abilities
      const individual = languageData.individual || {}
      const willing = languageData.willing_to_learn || []
      const teaching = languageData.willing_to_teach || []
      const credentials = languageData.teaching_credentials || []
      
      const proficiencyLabels = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
      
      Object.entries(individual).forEach(([lang, level]: [string, any]) => {
        const profLevel = proficiencyLabels[level] || "Unknown"
        let desc = `${lang}: ${profLevel}`
        if (willing.includes(lang) && level === 0) desc += " (Willing to learn)"
        if (teaching.includes(lang)) {
          desc += credentials.includes(lang) ? " (Can teach - Certified)" : " (Can teach)"
        }
        sections[sections.length - 1].items.push(desc)
      })
      
      // Partner language abilities
      const partner = languageData.partner || {}
      const partnerWilling = languageData.partner_willing_to_learn || []
      const partnerTeaching = languageData.partner_willing_to_teach || []
      const partnerCredentials = languageData.partner_teaching_credentials || []
      
      if (Object.keys(partner).length > 0) {
        sections.push({
          title: "Partner's Destination Language Skills",
          items: []
        })
        
        Object.entries(partner).forEach(([lang, level]: [string, any]) => {
          const profLevel = proficiencyLabels[level] || "Unknown"
          let desc = `${lang}: ${profLevel}`
          if (partnerWilling.includes(lang) && level === 0) desc += " (Willing to learn)"
          if (partnerTeaching.includes(lang)) {
            desc += partnerCredentials.includes(lang) ? " (Can teach - Certified)" : " (Can teach)"
          }
          sections[sections.length - 1].items.push(desc)
        })
      }
    }
    
    // Other Languages
    if (eduData.otherLanguages?.length > 0) {
      sections.push({
        title: "Your Other Languages",
        items: eduData.otherLanguages.map((lang: any) => {
          const proficiencyLabels = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
          let desc = `${lang.language}: ${proficiencyLabels[lang.proficiency] || "Unknown"}`
          if (lang.willingToTeach) {
            desc += lang.hasCredentials ? " (Can teach - Certified)" : " (Can teach)"
          }
          return desc
        })
      })
    }
    
    if (eduData.partner?.otherLanguages?.length > 0) {
      sections.push({
        title: "Partner's Other Languages", 
        items: eduData.partner.otherLanguages.map((lang: any) => {
          const proficiencyLabels = ["None", "A1 Basic", "A2 Elementary", "B1 Intermediate", "B2 Upper Intermediate", "C1 Advanced", "C2 Proficient", "Native Speaker"]
          let desc = `${lang.language}: ${proficiencyLabels[lang.proficiency] || "Unknown"}`
          if (lang.willingToTeach) {
            desc += lang.hasCredentials ? " (Can teach - Certified)" : " (Can teach)"
          }
          return desc
        })
      })
    }
    
    // Degrees
    if (eduData.previousDegrees?.length > 0) {
      sections.push({
        title: "Your Degrees",
        items: eduData.previousDegrees.map((degree: any) => 
          `${degree.degree} from ${degree.institution} (${degree.start_date} - ${degree.in_progress ? 'Present' : degree.end_date})`
        )
      })
    }
    
    if (eduData.partner?.previousDegrees?.length > 0) {
      sections.push({
        title: "Partner's Degrees",
        items: eduData.partner.previousDegrees.map((degree: any) => 
          `${degree.degree} from ${degree.institution} (${degree.start_date} - ${degree.in_progress ? 'Present' : degree.end_date})`
        )
      })
    }
    
    // Skills & Credentials
    if (eduData.visaSkills?.length > 0) {
      sections.push({
        title: "Your Skills & Credentials",
        items: eduData.visaSkills.map((skill: any) => {
          let desc = skill.skill
          if (skill.credentialName) {
            desc += ` (${skill.credentialName}`
            if (skill.credentialInstitute) desc += ` from ${skill.credentialInstitute}`
            desc += ")"
          }
          return desc
        })
      })
    }
    
    if (eduData.partner?.visaSkills?.length > 0) {
      sections.push({
        title: "Partner's Skills & Credentials",
        items: eduData.partner.visaSkills.map((skill: any) => {
          let desc = skill.skill
          if (skill.credentialName) {
            desc += ` (${skill.credentialName}`
            if (skill.credentialInstitute) desc += ` from ${skill.credentialInstitute}`
            desc += ")"
          }
          return desc
        })
      })
    }
    
    // Work Experience
    if (eduData.workExperience?.length > 0) {
      sections.push({
        title: "Your Work Experience",
        items: eduData.workExperience.map((work: any) => 
          `${work.jobTitle} at ${work.company} (${work.startDate} - ${work.current ? 'Present' : work.endDate})`
        )
      })
    }
    
    if (eduData.partner?.workExperience?.length > 0) {
      sections.push({
        title: "Partner's Work Experience", 
        items: eduData.partner.workExperience.map((work: any) => 
          `${work.jobTitle} at ${work.company} (${work.startDate} - ${work.current ? 'Present' : work.endDate})`
        )
      })
    }
    
    // Professional Licenses
    if (eduData.professionalLicenses?.length > 0) {
      sections.push({
        title: "Your Professional Licenses",
        items: eduData.professionalLicenses.map((license: any) => 
          `${license.licenseName} (${license.licenseType}) from ${license.issuingBody} in ${license.country}${license.active ? ' - Active' : ''}`
        )
      })
    }
    
    if (eduData.partner?.professionalLicenses?.length > 0) {
      sections.push({
        title: "Partner's Professional Licenses",
        items: eduData.partner.professionalLicenses.map((license: any) => 
          `${license.licenseName} (${license.licenseType}) from ${license.issuingBody} in ${license.country}${license.active ? ' - Active' : ''}`
        )
      })
    }
    
    // Military Service
    const military = eduData.militaryService
    if (military?.hasService) {
      sections.push({
        title: "Military Service",
        items: [
          `${military.branch} in ${military.country} (${military.startDate} - ${military.currentlyServing ? 'Present' : military.endDate})`,
          ...(military.rank ? [`Rank: ${military.rank}`] : []),
          ...(military.occupation ? [`Occupation: ${military.occupation}`] : []),
          ...(military.securityClearance && military.securityClearance !== 'None' ? [`Security Clearance: ${military.securityClearance}`] : []),
          ...(military.languages ? [`Languages: ${military.languages}`] : []),
          ...(military.certifications ? [`Certifications: ${military.certifications}`] : []),
          ...(military.leadership ? [`Leadership: ${military.leadership}`] : [])
        ].filter(Boolean)
      })
    }
    
    // Study Plans
    if (eduData.interestedInStudying === true) {
      sections.push({
        title: "Study Plans",
        items: [
          "Interested in studying in destination country",
          ...(eduData.schoolInterestDetails ? [eduData.schoolInterestDetails] : [])
        ]
      })
    }
    
    // Learning Interests
    if (eduData.learningInterests?.length > 0) {
      sections.push({
        title: "Learning & Development Goals",
        items: eduData.learningInterests.map((interest: any) => 
          `${interest.skill} (${interest.status}) - ${interest.months} months, ${interest.hoursPerWeek}h/week at ${interest.institute} (${interest.fundingStatus})`
        )
      })
    }
    
    // School Offers
    if (eduData.schoolOffers?.length > 0) {
      sections.push({
        title: "School Offers & Applications",
        items: eduData.schoolOffers.map((offer: any) => 
          `${offer.program} at ${offer.school} (Starting: ${offer.startDate}) - ${offer.fundingStatus}`
        )
      })
    }
    
    return sections.length > 0 ? sections : null
  }

  // Helper function to format finance data for display
  const formatFinanceData = (financeData: any) => {
    if (!financeData) return null
    
    const sections = []
    
    // Your Income Situation
    if (financeData.incomeSituation) {
      const situationLabels = {
        "continuing_income": "Continue Current Income",
        "current_and_new_income": "Current and New Income",
        "seeking_income": "Seeking New Income",
        "gainfully_unemployed": "Gainfully Unemployed",
        "dependent/supported": "Financially Dependent/Supported"
      }
      let situationText = situationLabels[financeData.incomeSituation] || financeData.incomeSituation
      
      // Add support relationship details
      if (financeData.incomeSituation === "dependent/supported" && financeData.supportedByPartner) {
        situationText += " (supported by partner)"
      }
      
      sections.push({
        title: "Your Income Situation",
        items: [situationText]
      })
    }
    
    // Partner's Income Situation
    if (financeData.partner?.incomeSituation) {
      const situationLabels = {
        "continuing_income": "Continue Current Income",
        "current_and_new_income": "Current and New Income",
        "seeking_income": "Seeking New Income",
        "gainfully_unemployed": "Gainfully Unemployed",
        "dependent/supported": "Financially Dependent/Supported"
      }
      let situationText = situationLabels[financeData.partner.incomeSituation] || financeData.partner.incomeSituation
      
      // Add support relationship details
      if (financeData.partner.incomeSituation === "dependent/supported" && financeData.partner.supportedByMe) {
        situationText += " (supported by you)"
      }
      
      sections.push({
        title: "Partner's Income Situation",
        items: [situationText]
      })
    }
    
    // Your Income Sources
    if (financeData.incomeSources?.length > 0) {
      sections.push({
        title: "Your Income Sources",
        items: financeData.incomeSources.map((source: any) => 
          `${source.category}: ${source.amount?.toLocaleString()} ${source.currency} from ${source.country || 'Unknown'}`
        )
      })
    }
    
    // Partner Income Sources
    if (financeData.partner?.incomeSources?.length > 0) {
      sections.push({
        title: "Partner's Income Sources",
        items: financeData.partner.incomeSources.map((source: any) => 
          `${source.category}: ${source.amount?.toLocaleString()} ${source.currency} from ${source.country || 'Unknown'}`
        )
      })
    }
    
    // Total Wealth
    if (financeData.totalWealth?.total > 0) {
      sections.push({
        title: "Total Wealth",
        items: [
          `Net Worth: ${financeData.totalWealth.total?.toLocaleString()} ${financeData.totalWealth.currency}`,
          `Primary Residence: ${financeData.totalWealth.primaryResidence?.toLocaleString()} ${financeData.totalWealth.currency}`
        ]
      })
    }
    
    // Your Capital Gains
    if (financeData.capitalGains?.futureSales?.length > 0) {
      sections.push({
        title: "Your Planned Asset Sales",
        items: financeData.capitalGains.futureSales.map((sale: any) => {
          const value = (sale.surplusValue ?? sale.currentValue)?.toLocaleString()
          return `${sale.asset}: ${value} ${sale.currency}${sale.saleDate ? ` (Sale: ${sale.saleDate})` : ''}`
        })
      })
    }
    
    // Partner Capital Gains
    if (financeData.partner?.capitalGains?.futureSales?.length > 0) {
      sections.push({
        title: "Partner's Planned Asset Sales",
        items: financeData.partner.capitalGains.futureSales.map((sale: any) => {
          const value = (sale.surplusValue ?? sale.currentValue)?.toLocaleString()
          return `${sale.asset}: ${value} ${sale.currency}${sale.saleDate ? ` (Sale: ${sale.saleDate})` : ''}`
        })
      })
    }
    
    // Your Liabilities
    if (financeData.liabilities?.length > 0) {
      sections.push({
        title: "Your Liabilities & Debts",
        items: financeData.liabilities.map((liability: any) => 
          `${liability.category}: ${liability.amount?.toLocaleString()} ${liability.currency} in ${liability.country}`
        )
      })
    }
    
    // Partner Liabilities
    if (financeData.partner?.liabilities?.length > 0) {
      sections.push({
        title: "Partner's Liabilities & Debts",
        items: financeData.partner.liabilities.map((liability: any) => 
          `${liability.category}: ${liability.amount?.toLocaleString()} ${liability.currency} in ${liability.country}`
        )
      })
    }
    
    return sections.length > 0 ? sections : null
  }

  // Section completion status
  const sections = [
    { id: "destination", name: "Destination Country", icon: MapPin, data: formData.residencyIntentions?.destinationCountry },
    { id: "personal", name: "Personal Information", icon: User, data: formData.personalInformation },
    { 
      id: "education", 
      name: "Education & Skills", 
      icon: GraduationCap, 
      data: formData.education,
      detailedData: formatEducationData(formData.education)
    },
    { id: "residency", name: "Residency Intentions", icon: Heart, data: formData.residencyIntentions },
    { 
      id: "finance", 
      name: "Financial Information", 
      icon: DollarSign, 
      data: formData.finance,
      detailedData: formatFinanceData(formData.finance)
    },
    { id: "socialSecurity", name: "Social Security & Pensions", icon: Shield, data: formData.socialSecurityAndPensions },
    { id: "taxDeductions", name: "Tax Deductions & Credits", icon: Receipt, data: formData.taxDeductionsAndCredits },
    { id: "futurePlans", name: "Future Financial Plans", icon: TrendingUp, data: formData.futureFinancialPlans },
    { id: "additional", name: "Additional Information", icon: FileEdit, data: formData.additionalInformation },
    { id: "fullSummary", name: "Full Summary", icon: FileText, data: { hasData: true }, isSpecial: true }
  ]

  const completedCount = sections.filter(section => 
    !section.isSpecial && (section.data && Object.keys(section.data).length > 0)
  ).length

  const totalRegularSections = sections.filter(section => !section.isSpecial).length
  const completionPercentage = Math.round((completedCount / totalRegularSections) * 100)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Profile Summary"
        icon={<FileText className="w-7 h-7 text-green-600" />}
      />

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
                {completedCount} of {totalRegularSections} sections completed
              </div>
            </div>

            {/* Expandable Section breakdown */}
            <Accordion type="multiple" className="w-full">
              {sections.map((section) => {
                const hasData = section.isSpecial || (section.data && Object.keys(section.data).length > 0)
                const status = hasData
                const isLoading = loadingSections[section.id]
                const story = sectionStories[section.id]
                
                if (!status) {
                  // Show beautiful non-expandable item for incomplete sections
                  return (
                    <div key={section.id} className="flex items-center gap-4 p-5 border border-slate-300 dark:border-slate-600 rounded-xl bg-gradient-to-r from-slate-100/80 to-gray-100/60 dark:from-slate-700/60 dark:to-slate-800/40 shadow-sm hover:shadow-lg transition-all duration-200">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 text-slate-500 dark:text-slate-400 shadow-inner">
                        <section.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-base">{section.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Section not completed</div>
                      </div>
                      <Badge variant="outline" className="bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border-slate-400 dark:border-slate-500 font-semibold px-3 py-1">
                        Incomplete
                      </Badge>
                    </div>
                  )
                }
                
                // Special styling for Full Summary section
                const isFullSummary = section.id === "fullSummary"
                const borderClass = isFullSummary 
                  ? "border-2 border-purple-300 dark:border-purple-700" 
                  : "border-2 border-emerald-300 dark:border-emerald-700"
                const bgClass = isFullSummary 
                  ? "bg-gradient-to-r from-purple-100/90 to-indigo-100/70 dark:from-purple-900/40 dark:to-indigo-900/30" 
                  : "bg-gradient-to-r from-emerald-100/90 to-green-100/70 dark:from-emerald-900/40 dark:to-green-900/30"
                const hoverClass = isFullSummary 
                  ? "hover:bg-purple-100/80 dark:hover:bg-purple-900/50" 
                  : "hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50"
                const iconBgClass = isFullSummary 
                  ? "bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800" 
                  : "bg-gradient-to-br from-emerald-200 to-green-200 dark:from-emerald-800 dark:to-green-800"
                const iconTextClass = isFullSummary 
                  ? "text-purple-700 dark:text-purple-200" 
                  : "text-emerald-700 dark:text-emerald-200"
                const titleClass = isFullSummary 
                  ? "text-purple-900 dark:text-purple-100" 
                  : "text-emerald-900 dark:text-emerald-100"
                const subtitleClass = isFullSummary 
                  ? "text-purple-700 dark:text-purple-300" 
                  : "text-emerald-700 dark:text-emerald-300"
                const badgeClass = isFullSummary 
                  ? "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-100 border-purple-400 dark:border-purple-600" 
                  : "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 border-emerald-400 dark:border-emerald-600"
                
                return (
                  <AccordionItem key={section.id} value={section.id} className={`${borderClass} rounded-xl ${bgClass} shadow-md hover:shadow-lg transition-all duration-200`}>
                    <AccordionTrigger 
                      className={`flex items-center gap-4 p-5 hover:no-underline ${hoverClass} rounded-xl transition-colors duration-200`}
                      onClick={() => fetchSectionStory(section.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${iconBgClass} ${iconTextClass} shadow-inner`}>
                          {isFullSummary ? <section.icon className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-bold ${titleClass} text-base`}>{section.name}</div>
                          <div className={`text-sm ${subtitleClass} mt-1 font-semibold`}>
                            {isFullSummary ? "Click to view complete profile" : "Click to view section summary"}
                          </div>
                        </div>
                        <Badge className={`${badgeClass} font-bold px-3 py-1 text-sm`}>
                          {isFullSummary ? "Available" : "Complete"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4">
                      <div className="ml-11 pt-4">
                        <div className="bg-gradient-to-br from-blue-100/90 to-indigo-100/70 dark:from-blue-900/50 dark:to-indigo-900/40 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 shadow-md">
                          {isLoading ? (
                            <div className="flex items-center gap-4 text-blue-700 dark:text-blue-200">
                              <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </div>
                              <div>
                                <div className="font-bold text-base">Loading section information...</div>
                                <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">Generating personalized summary</div>
                              </div>
                            </div>
                          ) : story ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-300/60 dark:border-blue-600/50">
                                <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                <span className="text-base font-bold text-blue-800 dark:text-blue-200">Section Summary</span>
                              </div>
                              <div className="prose prose-base max-w-none text-slate-800 dark:text-slate-100 leading-relaxed">
                                {story.split('\n').map((paragraph, idx) => (
                                  paragraph.trim() ? (
                                    <p key={idx} className="mb-4 last:mb-0 text-base leading-relaxed font-medium">{paragraph}</p>
                                  ) : null
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                              <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full">
                                <Info className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-base">Click to load section information</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tap the section header to view details</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <div className="w-full flex justify-center">
            <Button
              onClick={() => {
                if (onNavigateToResults) {
                  onNavigateToResults()
                  // Scroll to top when navigating (same as handleNavigateNext)
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              variant="default"
              size="lg"
              className="px-8 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              Information is Correct - Bring Me to Results
            </Button>
          </div>
        </CardFooter>
      </Card>
      
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
        onNavigateToResults={onNavigateToResults}
      />
    </div>
  )
} 