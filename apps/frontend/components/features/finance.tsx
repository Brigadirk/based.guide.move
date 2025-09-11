"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"

import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { getCountries } from "@/lib/utils/country-utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, DollarSign, TrendingUp, Wallet, CreditCard, Target, Info, Zap } from "lucide-react"
import { validateFinanceData } from "@/lib/utils/finance-validation"
import { ValidationSummary, ValidationBadge, RealTimeValidation } from "@/components/ui/enhanced-validation"
import { useAutoSave, useAutoSaveStatus } from "@/lib/hooks/use-auto-save"
import { SaveStatus } from "@/components/ui/loading-states"
import { FinanciallySupportedSection } from "./financially-supported-section"
import { PageHeading } from "@/components/ui/page-heading"
import { FinanceSkipToggle } from "@/components/features/finance-skip-toggle"

// Income Categories (Streamlit structure)
const INCOME_CATEGORIES = {
  "Employment": {
    fields: ["employer", "role"],
    help: "Traditional employment with regular salary or wages"
  },
  "Self-Employment": {
    fields: ["business_name", "business_type"],
    help: "Freelance, consulting, or business income"
  },
  "Investments": {
    fields: ["investment_type", "issuer"],
    help: "Dividends, interest, capital gains distributions"
  },
  "Rental Income": {
    fields: ["property_description", "property_type"],
    help: "Income from residential or commercial property rentals"
  },
  "Other": {
    fields: ["source_name", "source_type"],
    help: "Alimony, grants, prizes, royalties, etc."
  }
}

// Liability Categories (Streamlit structure)
const LIABILITY_CATEGORIES = {
  "Mortgage": {
    fields: ["property_description", "property_type"],
    help: "Debt secured by a property"
  },
  "Loan": {
    fields: ["lender", "purpose"],
    help: "Unsecured loan or personal loan"
  },
  "Credit Card": {
    fields: ["card_issuer"],
    help: "Credit card debt"
  },
  "Other": {
    fields: ["description", "type"],
    help: "Alimony, child support, student loans, etc."
  }
}

export function Finance({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Get skip status (controlled from sidebar)
  const skipDetails = getFormData("finance.skipDetails") ?? false

  // Income situation state (exactly matching Streamlit)
  const incomeSituation = getFormData("finance.incomeSituation") ?? ""
  const partnerIncomeSituation = getFormData("finance.partner.incomeSituation") ?? ""
  const jointIncomeSituation = getFormData("finance.joint.incomeSituation") ?? ""
  const partnerSupportedByMe = getFormData("finance.partner.supportedByMe") ?? false
  const supportedByPartner = getFormData("finance.supportedByPartner") ?? false
  
  // Total Wealth (Streamlit structure - simple total + primary residence)
  const totalWealth = getFormData("finance.totalWealth") ?? { currency: "USD", total: 0, primaryResidence: 0 }
  
  // Income Sources (Streamlit structure)
  const incomeSources = getFormData("finance.incomeSources") ?? []
  const partnerIncomeSources = getFormData("finance.partner.incomeSources") ?? []
  
  // Capital Gains - Future Sales (Streamlit structure)
  const capitalGains = getFormData("finance.capitalGains") ?? { futureSales: [] }
  const partnerCapitalGains = getFormData("finance.partner.capitalGains") ?? { futureSales: [] }
  
  // Liabilities (Streamlit structure)
  const liabilities = getFormData("finance.liabilities") ?? []
  const partnerLiabilities = getFormData("finance.partner.liabilities") ?? []
  
  // Partner selection
  const hasPartnerSelected = getFormData("personalInformation.relocationPartner") ?? false
  const financeScope = getFormData("finance.scope") ?? (hasPartnerSelected ? "joint" : "me")
  const partnerEnabled = hasPartnerSelected

  // Debug partner status
  console.log("Finance Debug - Partner Status:", {
    hasPartnerSelected,
    financeScope,
    partnerEnabled,
    personalInformationData: getFormData("personalInformation"),
    relocationPartner: getFormData("personalInformation.relocationPartner")
  })

  // Enhanced validation with memoization
  const financeData = useMemo(() => ({
    skipDetails,
    incomeSituation,
    totalWealth,
    incomeSources,
    capitalGains,
    liabilities
  }), [skipDetails, incomeSituation, totalWealth, incomeSources, capitalGains, liabilities])

  const validation = useMemo(() => 
    validateFinanceData(financeData), 
    [financeData]
  )

  // Auto-save functionality
  const { manualSave, isAutoSaveEnabled } = useAutoSave(financeData, 'finance')
  const { isSaving, lastSaved } = useAutoSaveStatus()

  // Tab states for You/Partner sections
  const [incomeTab, setIncomeTab] = useState("you")
  const [capitalGainsTab, setCapitalGainsTab] = useState("you")
  const [liabilitiesTab, setLiabilitiesTab] = useState("you")
  
  // Income situation draft state
  const [currentIncomeSituation, setCurrentIncomeSituation] = useState("")
  const [incomeSituationOwnership, setIncomeSituationOwnership] = useState<"you" | "partner" | "joint">("joint")

  const [newIncomeSource, setNewIncomeSource] = useState({
    category: "Employment",
    fields: {} as Record<string, string>,
    country: "",
    amount: 0,
    currency: "USD",
    continueInDestination: true,
    // Enhanced fields from Expected Employment
    timeline: "Within 3 months",
    confidence: "High",
    notes: ""
  })

  const [newPartnerIncomeSource, setNewPartnerIncomeSource] = useState({
    category: "Employment",
    fields: {} as Record<string, string>,
    country: "",
    amount: 0,
    currency: "USD",
    continueInDestination: true,
    // Enhanced fields from Expected Employment
    timeline: "Within 3 months",
    confidence: "High",
    notes: ""
  })

  // Auto-adjust continueInDestination based on income situation
  useEffect(() => {
    if (incomeSituation === "seeking_income" && newIncomeSource.continueInDestination) {
      setNewIncomeSource(prev => ({
        ...prev,
        continueInDestination: false
      }))
    }
  }, [incomeSituation, newIncomeSource.continueInDestination])

  // Auto-adjust partner continueInDestination based on partner income situation
  useEffect(() => {
    if (partnerIncomeSituation === "seeking_income" && newPartnerIncomeSource.continueInDestination) {
      setNewPartnerIncomeSource(prev => ({
        ...prev,
        continueInDestination: false
      }))
    }
  }, [partnerIncomeSituation, newPartnerIncomeSource.continueInDestination])

  const [newCapitalGain, setNewCapitalGain] = useState({
    asset: "",
    type: "Real Estate",
    holdingTime: "< 12 months (short-term)",
    surplusValue: 0,
    currency: "USD",
    reason: ""
  })

  const [newLiability, setNewLiability] = useState({
    category: "Mortgage",
    fields: {} as Record<string, string>,
    country: "",
    amount: 0,
    currency: "USD",
    paybackYears: 0,
    interestRate: 0
  })



  // Performance optimized callbacks
  const handleComplete = useCallback(() => {
    markSectionComplete("finance")
    onComplete()
  }, [markSectionComplete, onComplete])

  const handleUpdateFormData = useCallback((path: string, value: any) => {
    updateFormData(path, value)
  }, [updateFormData])

  // Save income situation function
  const saveIncomeSituation = useCallback(() => {
    if (!currentIncomeSituation) return
    
    if (incomeSituationOwnership === "you") {
      updateFormData("finance.incomeSituation", currentIncomeSituation)
    } else if (incomeSituationOwnership === "partner") {
      updateFormData("finance.partner.incomeSituation", currentIncomeSituation)
    } else if (incomeSituationOwnership === "joint") {
      // For joint, save to both
      updateFormData("finance.incomeSituation", currentIncomeSituation)
      updateFormData("finance.partner.incomeSituation", currentIncomeSituation)
    }
    
    setCurrentIncomeSituation("")
  }, [currentIncomeSituation, incomeSituationOwnership, updateFormData])

  // Toggle "supported by me" flag
  const toggleSupportedByMe = useCallback(() => {
    const newValue = !partnerSupportedByMe
    updateFormData("finance.partner.supportedByMe", newValue)
  }, [partnerSupportedByMe, updateFormData])

  // Toggle "supported by partner" flag
  const toggleSupportedByPartner = useCallback(() => {
    const newValue = !supportedByPartner
    updateFormData("finance.supportedByPartner", newValue)
  }, [supportedByPartner, updateFormData])

  // Income situation validation
  const incomeValidation = useMemo(() => {
    if (skipDetails) return { isValid: true, message: "" }
    
    if (partnerEnabled) {
      const hasYourSituation = Boolean(incomeSituation)
      const hasPartnerSituation = Boolean(partnerIncomeSituation)
      
      if (!hasYourSituation && !hasPartnerSituation) {
        return { 
          isValid: false, 
          message: "Both you and your partner must enter income situations" 
        }
      } else if (!hasYourSituation) {
        return { 
          isValid: false, 
          message: "You must enter your income situation" 
        }
      } else if (!hasPartnerSituation) {
        return { 
          isValid: false, 
          message: "Your partner must enter their income situation" 
        }
      }
    } else {
      if (!incomeSituation) {
        return { 
          isValid: false, 
          message: "You must enter your income situation" 
        }
      }
    }
    
    return { isValid: true, message: "" }
  }, [skipDetails, partnerEnabled, incomeSituation, partnerIncomeSituation])

  // Income Sources section visibility logic
  const shouldShowIncomeSources = useMemo(() => {
    // If no income situation is set for the user, don't show
    if (!incomeSituation) return false
    
    // For single person (no partner), only check user's situation
    if (!partnerEnabled) {
      const userNeedsIncomeDetails = [
        "continuing_income", 
        "current_and_new_income", 
        "seeking_income",
        "gainfully_unemployed"  // Self-funded also needs to show source
      ].includes(incomeSituation)
      
      return userNeedsIncomeDetails
    }
    
    // For couples, check both partners
    const userNeedsIncomeDetails = incomeSituation && [
      "continuing_income", 
      "current_and_new_income", 
      "seeking_income"
    ].includes(incomeSituation)
    
    const partnerNeedsIncomeDetails = partnerIncomeSituation && [
      "continuing_income", 
      "current_and_new_income", 
      "seeking_income"
    ].includes(partnerIncomeSituation)
    
    // Check support relationships
    const userSupportedByPartner = incomeSituation === "dependent/supported" && supportedByPartner
    const partnerSupportedByUser = partnerIncomeSituation === "dependent/supported" && partnerSupportedByMe
    
    // Check if both are self-funded
    const userSelfFunded = incomeSituation === "gainfully_unemployed"
    const partnerSelfFunded = partnerIncomeSituation === "gainfully_unemployed"
    const bothSelfFunded = userSelfFunded && partnerSelfFunded
    
    // Show income sources if:
    // 1. Either partner has income/seeking income AND is not supported by the other
    // 2. Both are self-funded (need to show source of funds for at least one)
    if (userNeedsIncomeDetails && !userSupportedByPartner) return true
    if (partnerNeedsIncomeDetails && !partnerSupportedByUser) return true
    if (bothSelfFunded) return true
    
    return false
  }, [
    partnerEnabled,
    incomeSituation, 
    partnerIncomeSituation, 
    supportedByPartner, 
    partnerSupportedByMe
  ])

  // Enhanced validation status
  const canContinue = useMemo(() => 
    skipDetails || (validation.isValid && incomeValidation.isValid),
    [skipDetails, validation.isValid, incomeValidation.isValid]
  )

  // Helper functions for form management
  const getCountryOptions = () => getCountries()

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Debug Partner Status */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🐛 Debug: Partner Status</h3>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <p><strong>Has Partner Selected:</strong> {hasPartnerSelected ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Partner Enabled:</strong> {partnerEnabled ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Finance Scope:</strong> {financeScope}</p>
          <p><strong>Raw Partner Data:</strong> {JSON.stringify(getFormData("personalInformation.relocationPartner"))}</p>
        </div>
      </div>

      {/* Page Header */}
      <PageHeading 
        title="Income and Assets"
        description="Provide your financial profile to inform tax and visa recommendations"
        icon={<CreditCard className="w-7 h-7 text-green-600" />}
      />

      {/* Finance Skip Toggle */}
      <FinanceSkipToggle variant="section" onToggle={(checked) => {
        // This will be handled by the main app's handleFinanceSkipToggle
        const event = new CustomEvent('financeSkipToggle', { detail: { checked } })
        window.dispatchEvent(event)
      }} />

      {/* Finance scope selector */}
      {!skipDetails && hasPartnerSelected && (
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Apply finance and taxes to</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={financeScope === "me" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => updateFormData("finance.scope", "me")}
                >
                  Only me
                </Button>
                <Button
                  variant={financeScope === "joint" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => updateFormData("finance.scope", "joint")}
                >
                  Me and partner together
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This controls whether entries and validations should consider your partner alongside you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!skipDetails && (
        <SectionHint title="About this section">
          We'll calculate your tax liability for your first year in the destination country, which should give you an indication of what it would cost for you to live there long term. This information is also crucial for visa applications and ensuring you meet minimum income requirements.
        </SectionHint>
      )}

      {/* Financial Information Guide - Collapsible */}
      {!skipDetails && (
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            How Governments Assess Your Finances
          </CardTitle>
          <p className="text-sm text-muted-foreground">Understanding wealth taxes vs capital gains taxation</p>
        </CardHeader>
        <CardContent className="pt-2">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="financial-guide" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
                📚 Show detailed explanation of tax approaches
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Wealth Tax Approach */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300">Wealth Tax Countries</h4>
                    </div>
                    <div className="pl-5 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Examples:</strong> Spain, Norway, Switzerland (some cantons)
                      </p>
                      <p className="text-sm">
                        These countries tax your <strong>total net worth</strong> annually, typically starting at €1-3 million. 
                        They look at everything you own worldwide: real estate, investments, cash, business interests, 
                        minus your debts.
                      </p>
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          <strong>💡 Key Point:</strong> Your total wealth matters more than individual transactions. 
                          Even if you don't sell anything, you pay tax on what you own.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Capital Gains Approach */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">Capital Gains Tax Countries</h4>
                    </div>
                    <div className="pl-5 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        <strong>Examples:</strong> Portugal, Germany, UK, most countries
                      </p>
                      <p className="text-sm">
                        These countries only tax you when you <strong>sell assets for a profit</strong>. 
                        You can own millions in assets, but pay no tax until you realize gains by selling. 
                        Holding periods often affect rates.
                      </p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg">
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                          <strong>💡 Key Point:</strong> Timing of sales matters greatly. You control when 
                          you trigger tax liability through your selling decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visa Requirements Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300">Visa & Immigration Considerations</h4>
                  </div>
                  <div className="pl-5 space-y-3">
                    <p className="text-sm">
                      <strong>Financial Proof Requirements:</strong> Most countries require proof of financial stability 
                      for visa applications. This typically includes:
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                      <li><strong>Income Sources:</strong> Regular income to support yourself (employment, business, investments)</li>
                      <li><strong>Bank Statements:</strong> 3-6 months showing sufficient funds (often €5,000-15,000+)</li>
                      <li><strong>Asset Documentation:</strong> Property ownership, investment portfolios, business ownership</li>
                      <li><strong>Debt Information:</strong> Outstanding loans and payment schedules</li>
                    </ul>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>⚖️ Legal Requirement:</strong> Most visa applications require full financial disclosure. 
                        Incomplete or inaccurate information can lead to rejection or future legal issues.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tax Planning Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-300">Why This Information Matters</h4>
                  </div>
                  <div className="pl-5 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Tax Planning:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Estimate your first-year tax liability</li>
                          <li>• Plan asset sales timing strategically</li>
                          <li>• Understand wealth tax thresholds</li>
                          <li>• Consider tax-advantaged structures</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Relocation Planning:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Meet visa financial requirements</li>
                          <li>• Optimize pre-move asset sales</li>
                          <li>• Plan international transfers</li>
                          <li>• Structure investments tax-efficiently</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      )}

      {/* Skip Mode Indicator */}
      {skipDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="w-6 h-6 text-green-600" />
              Finance Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Focus on financial requirements only</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                ✅ Detailed finance inputs skipped. We'll focus only on whether any financial thresholds apply to your relocation.
              </p>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Toggle this setting in the sidebar to enable detailed finance inputs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show detailed finance sections if not skipped */}
      {!skipDetails && (
        <>
          {/* Income Situation Checker - Exact Streamlit Match */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Income Situation Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground">What's your income situation after moving?</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Income Situation Ownership Selection */}
                {partnerEnabled && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Income Situation Applies To</Label>
                    <div className="grid grid-cols-3 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                      <button
                        type="button"
                        onClick={() => setIncomeSituationOwnership("you")}
                        className={`${
                          incomeSituationOwnership === "you"
                            ? "bg-white text-primary shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        } transition-all duration-300 rounded-md h-10 text-sm`}
                      >
                        You
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeSituationOwnership("partner")}
                        className={`${
                          incomeSituationOwnership === "partner"
                            ? "bg-white text-primary shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        } transition-all duration-300 rounded-md h-10 text-sm`}
                      >
                        Partner
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeSituationOwnership("joint")}
                        className={`${
                          incomeSituationOwnership === "joint"
                            ? "bg-white text-primary shadow-sm font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        } transition-all duration-300 rounded-md h-10 text-sm`}
                      >
                        Both
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    {
                      key: "continuing_income",
                      label: "🔄 Continue Current Income",
                      description: "Keep all existing income sources (remote work, investments, rental, etc.)"
                    },
                    {
                      key: "current_and_new_income",
                      label: "🔄➕ Current + New Income Mix", 
                      description: "Keep some current sources, add new ones in destination"
                    },
                    {
                      key: "seeking_income",
                      label: "🔍 Need New Income Sources",
                      description: "Will find new work, start business, or other new sources"
                    },
                    {
                      key: "gainfully_unemployed",
                      label: "💰 Self-Funded (No Income)",
                      description: "Living off savings, gifts, or investments"
                    },
                    {
                      key: "dependent/supported",
                      label: "🤝 Financially Supported",
                      description: "Family, partner, scholarship, or institutional support"
                    }
                  ].map((option) => (
                    <div key={option.key} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={option.key}
                          name="currentIncomeSituation"
                          value={option.key}
                          checked={currentIncomeSituation === option.key}
                          onChange={(e) => setCurrentIncomeSituation(e.target.value)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label htmlFor={option.key} className="font-medium text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">{option.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Save Button */}
                {currentIncomeSituation && (
                  <div className="mt-4">
                    <Button
                      onClick={saveIncomeSituation}
                      className="w-full"
                      disabled={!currentIncomeSituation}
                    >
                      {partnerEnabled ? (
                        `Save Income Situation for ${
                          incomeSituationOwnership === "you" ? "You" :
                          incomeSituationOwnership === "partner" ? "Partner" :
                          "Both"
                        }`
                      ) : (
                        "Save Income Situation"
                      )}
                    </Button>
                  </div>
                )}

                {/* Display saved situations */}
                <div className="space-y-3">
                  {/* Your saved situation */}
                {incomeSituation && (
                    <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Your Income Situation</p>
                          <p className="text-sm text-muted-foreground">
                            {
                              incomeSituation === "continuing_income" ? "🔄 Continue Current Income" :
                              incomeSituation === "current_and_new_income" ? "🔄➕ Current + New Income Mix" :
                              incomeSituation === "seeking_income" ? "🔍 Need New Income Sources" :
                              incomeSituation === "gainfully_unemployed" ? "💰 Self-Funded (No Income)" :
                              "🤝 Financially Supported"
                      }
                    </p>
                          
                          {/* "Supported by partner" toggle for financially supported */}
                          {partnerEnabled && incomeSituation === "dependent/supported" && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="supportedByPartner"
                                checked={supportedByPartner}
                                onChange={toggleSupportedByPartner}
                                className="h-4 w-4 text-primary"
                              />
                              <label htmlFor="supportedByPartner" className="text-xs text-muted-foreground cursor-pointer">
                                Supported by partner
                              </label>
                  </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateFormData("finance.incomeSituation", "")
                            updateFormData("finance.supportedByPartner", false)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Partner's saved situation */}
                  {partnerEnabled && partnerIncomeSituation && (
                    <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">Partner's Income Situation</p>
                          <p className="text-sm text-muted-foreground">
                            {
                              partnerIncomeSituation === "continuing_income" ? "🔄 Continue Current Income" :
                              partnerIncomeSituation === "current_and_new_income" ? "🔄➕ Current + New Income Mix" :
                              partnerIncomeSituation === "seeking_income" ? "🔍 Need New Income Sources" :
                              partnerIncomeSituation === "gainfully_unemployed" ? "💰 Self-Funded (No Income)" :
                              "🤝 Financially Supported"
                            }
                          </p>
                          
                          {/* "By me" toggle for financially supported */}
                          {partnerIncomeSituation === "dependent/supported" && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="supportedByMe"
                                checked={partnerSupportedByMe}
                                onChange={toggleSupportedByMe}
                                className="h-4 w-4 text-primary"
                              />
                              <label htmlFor="supportedByMe" className="text-xs text-muted-foreground cursor-pointer">
                                Supported by me
                              </label>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateFormData("finance.partner.incomeSituation", "")
                            updateFormData("finance.partner.supportedByMe", false)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Income Situation Validation Alert */}
                {!incomeValidation.isValid && (
                  <Alert className="border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/50">
                    <Info className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                    <AlertDescription className="text-stone-700 dark:text-stone-300">
                      {incomeValidation.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Sources Section - Smart conditional logic based on situations and support */}
          {shouldShowIncomeSources && (
            <>
              {/* Explanation for why Income Sources section is showing */}
              <div className="mb-4">
                <Alert className="border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/50">
                  <Info className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                  <AlertDescription className="text-stone-700 dark:text-stone-300">
                    <strong>Income details required:</strong> {
                      (() => {
                        const userNeedsIncome = incomeSituation && ["continuing_income", "current_and_new_income", "seeking_income"].includes(incomeSituation) && !(incomeSituation === "dependent/supported" && supportedByPartner)
                        const partnerNeedsIncome = partnerIncomeSituation && ["continuing_income", "current_and_new_income", "seeking_income"].includes(partnerIncomeSituation) && !(partnerIncomeSituation === "dependent/supported" && partnerSupportedByMe)
                        const bothSelfFunded = incomeSituation === "gainfully_unemployed" && partnerIncomeSituation === "gainfully_unemployed"
                        
                        if (bothSelfFunded) {
                          return "Both partners are self-funded, so at least one must show source of funds."
                        } else if (userNeedsIncome && partnerNeedsIncome) {
                          return "Both partners have income situations that require details."
                        } else if (userNeedsIncome) {
                          return "Your income situation requires details."
                        } else if (partnerNeedsIncome) {
                          return "Your partner's income situation requires details."
                        }
                        return "Income details are needed based on your situations."
                      })()
                    }
                  </AlertDescription>
                </Alert>
              </div>
              
            <IncomeSourcesSection 
              incomeSources={incomeSources} 
              partnerIncomeSources={partnerIncomeSources}
              newIncomeSource={newIncomeSource}
              setNewIncomeSource={setNewIncomeSource}
              newPartnerIncomeSource={newPartnerIncomeSource}
              setNewPartnerIncomeSource={setNewPartnerIncomeSource}
              updateFormData={updateFormData}
              currencies={currencies}
              getCountryOptions={getCountryOptions}
              incomeSituation={incomeSituation}
              partnerIncomeSituation={partnerIncomeSituation}
              supportedByPartner={supportedByPartner}
              partnerSupportedByMe={partnerSupportedByMe}
              hasPartnerSelected={partnerEnabled}
              incomeTab={incomeTab}
              setIncomeTab={setIncomeTab}
            />
            </>
          )}

          {/* Special Stipend Section for Financially Supported */}
          {(() => {
            // Show Financial Support Details section if either user or partner needs external support
            const userIsDependent = incomeSituation === "dependent/supported"
            const partnerIsDependent = partnerIncomeSituation === "dependent/supported"
            const userSupportedByPartner = supportedByPartner
            const partnerSupportedByUser = partnerSupportedByMe
            
            // Show if user needs external support (not supported by partner)
            const userNeedsExternalSupport = userIsDependent && !userSupportedByPartner
            
            // Show if partner needs external support (not supported by user)
            const partnerNeedsExternalSupport = partnerIsDependent && !partnerSupportedByUser
            
            return userNeedsExternalSupport || partnerNeedsExternalSupport
          })() && (
            <FinanciallySupportedSection 
              incomeSources={incomeSources}
              partnerIncomeSources={partnerIncomeSources}
              updateFormData={updateFormData}
              currencies={currencies}
              hasPartnerSelected={partnerEnabled}
            />
          )}



          {/* Total Wealth Section - Streamlit Simple Structure */}
          <TotalWealthSection 
            totalWealth={totalWealth}
            updateFormData={updateFormData}
            currencies={currencies}
            incomeSituation={incomeSituation}
            hasPartnerSelected={partnerEnabled}
          />

          {/* Capital Gains Section - Streamlit Structure */}
          <CapitalGainsSection 
            capitalGains={capitalGains}
            partnerCapitalGains={partnerCapitalGains}
            newCapitalGain={newCapitalGain}
            setNewCapitalGain={setNewCapitalGain}
            updateFormData={updateFormData}
            currencies={currencies}
            getCountryOptions={getCountryOptions}
            hasPartnerSelected={partnerEnabled}
            capitalGainsTab={capitalGainsTab}
            setCapitalGainsTab={setCapitalGainsTab}
          />

          {/* Liabilities Section - Streamlit Structure */}
          <LiabilitiesSection 
            liabilities={liabilities}
            partnerLiabilities={partnerLiabilities}
            newLiability={newLiability}
            setNewLiability={setNewLiability}
            updateFormData={updateFormData}
            currencies={currencies}
            getCountryOptions={getCountryOptions}
            hasPartnerSelected={partnerEnabled}
            liabilitiesTab={liabilitiesTab}
            setLiabilitiesTab={setLiabilitiesTab}
          />

        </>
      )}

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {/* Enhanced Validation Summary */}
            <ValidationSummary validation={validation} />
            
            {/* Auto-save Status */}
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("finance")}
              isCheckingInfo={isCheckingInfo}
              sectionId="finance"
              onContinue={handleComplete}
              canContinue={canContinue}
              nextSectionName={skipDetails ? "Additional Information" : "Social Security & Pensions"}
            />


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
      />
    </div>
  )
}

// Individual Section Components matching Streamlit structure exactly

// Component functions - Beautiful implementation matching Streamlit exactly

function IncomeSourcesSection({ incomeSources, partnerIncomeSources, newIncomeSource, setNewIncomeSource, newPartnerIncomeSource, setNewPartnerIncomeSource, updateFormData, currencies, getCountryOptions, incomeSituation, partnerIncomeSituation, supportedByPartner, partnerSupportedByMe, hasPartnerSelected, incomeTab, setIncomeTab }: any) {
  
  // Determine which tabs should be available
  let showUserTab = false
  let showPartnerTab = false
  
  if (!hasPartnerSelected) {
    // For single person (no partner), always show user tab only
    showUserTab = true
    showPartnerTab = false
    
    // Set default tab to user if no partner
    if (incomeTab !== "you") {
      setIncomeTab("you")
    }
  } else {
    // Determine which tabs should be available based on income situations (couples)
    const userCanAddIncome = incomeSituation && [
      "continuing_income", 
      "current_and_new_income", 
      "seeking_income"
    ].includes(incomeSituation) && !(incomeSituation === "dependent/supported" && supportedByPartner)
    
    const partnerCanAddIncome = partnerIncomeSituation && [
      "continuing_income", 
      "current_and_new_income", 
      "seeking_income"
    ].includes(partnerIncomeSituation) && !(partnerIncomeSituation === "dependent/supported" && partnerSupportedByMe)
    
    // Both self-funded case - at least one needs to show source
    const bothSelfFunded = incomeSituation === "gainfully_unemployed" && partnerIncomeSituation === "gainfully_unemployed"
    
    // Final determination of who can add income
    showUserTab = userCanAddIncome || (bothSelfFunded)
    showPartnerTab = partnerCanAddIncome || (bothSelfFunded)
  }
  
  // Unified function for adding income sources
  const addIncomeSource = (isPartner: boolean = false) => {
    const sourceData = isPartner ? newPartnerIncomeSource : newIncomeSource
    const setSourceData = isPartner ? setNewPartnerIncomeSource : setNewIncomeSource
    
    if (!sourceData.category || sourceData.amount <= 0 || !sourceData.country) return

    const newSource = { ...sourceData }

    if (isPartner) {
      const updatedSources = [...partnerIncomeSources, newSource]
      updateFormData("finance.partner.incomeSources", updatedSources)
    } else {
      const updatedSources = [...incomeSources, newSource]
      updateFormData("finance.incomeSources", updatedSources)
    }

    // Reset appropriate form state
    const resetState = {
      category: "Employment",
      fields: {},
      country: "",
      amount: 0,
      currency: "USD",
      continueInDestination: true,
      timeline: "Within 3 months",
      confidence: "High",
      notes: ""
    }
    
    setSourceData(resetState)
  }

  // Unified function for removing income sources
  const removeIncomeSource = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      const updatedSources = partnerIncomeSources.filter((_: any, i: number) => i !== index)
      updateFormData("finance.partner.incomeSources", updatedSources)
    } else {
      const updatedSources = incomeSources.filter((_: any, i: number) => i !== index)
      updateFormData("finance.incomeSources", updatedSources)
    }
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-green-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-green-600" />
          Income Sources
        </CardTitle>
        <p className="text-sm text-muted-foreground">Report INCOME ONLY, not asset values</p>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🎯 Important:</strong> This section is for reporting income you actually receive from all sources.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Always show both Your and Partner income sources */}
          <div className="space-y-6">
            {/* Your Income Sources */}
            {incomeSources.length > 0 && (
              <IncomeSourcesList 
                incomeSources={incomeSources} 
                updateFormData={updateFormData}
                isPartner={false}
                removeIncomeSource={removeIncomeSource}
                title="Your income sources"
              />
            )}

            {/* Partner Income Sources */}
            {hasPartnerSelected && partnerIncomeSources.length > 0 && (
              <IncomeSourcesList 
                incomeSources={partnerIncomeSources} 
                updateFormData={updateFormData}
                isPartner={true}
                removeIncomeSource={removeIncomeSource}
                title="Partner's income sources"
              />
            )}
          </div>

          {/* Tab-based form inputs for couples, direct form for singles */}
          {hasPartnerSelected ? (
            /* Couple mode - show tabs */
            <Tabs value={incomeTab} onValueChange={setIncomeTab} className="w-full">
              <TabsList className={`grid w-full ${showUserTab && showPartnerTab ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
                {showUserTab && (
                  <TabsTrigger 
                    value="you" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    You
                  </TabsTrigger>
                )}
                {showPartnerTab && (
                  <TabsTrigger 
                    value="partner" 
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Partner
                  </TabsTrigger>
                )}
              </TabsList>
              
              {showUserTab && (
                <TabsContent value="you" className="mt-6 space-y-6">
                  {/* Add income source form for You */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-medium mb-4">➕ Add Income Source</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Income Category</Label>
                <Select
                  value={newIncomeSource.category}
                  onValueChange={(value) => setNewIncomeSource({...newIncomeSource, category: value, fields: {}})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INCOME_CATEGORIES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newIncomeSource.category && INCOME_CATEGORIES[newIncomeSource.category as keyof typeof INCOME_CATEGORIES] && (
                  <p className="text-sm text-muted-foreground italic">
                    {INCOME_CATEGORIES[newIncomeSource.category as keyof typeof INCOME_CATEGORIES].help}
                  </p>
                )}
              </div>
              
              {/* Dynamic fields based on category - Streamlit structure */}
              <DynamicIncomeFields newIncomeSource={newIncomeSource} setNewIncomeSource={setNewIncomeSource} />
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country (source of funds)</Label>
                  <Select
                    value={newIncomeSource.country}
                    onValueChange={(value) => setNewIncomeSource({...newIncomeSource, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCountryOptions().map((country: string) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Annual Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newIncomeSource.amount}
                    onChange={(e) => setNewIncomeSource({...newIncomeSource, amount: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={newIncomeSource.currency}
                    onValueChange={(value) => setNewIncomeSource({...newIncomeSource, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency: string) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>When does / will this income arise?</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="current_income"
                      name="timing"
                      checked={newIncomeSource.continueInDestination}
                      onChange={() => setNewIncomeSource({...newIncomeSource, continueInDestination: true})}
                      disabled={incomeSituation === "seeking_income"}
                      className={`h-4 w-4 ${incomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "text-green-600"}`}
                    />
                    <label htmlFor="current_income" className={`text-sm ${incomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}>
                      This is a current source of income that I will continue
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="hypothetical_income"
                      name="timing"
                      checked={!newIncomeSource.continueInDestination}
                      onChange={() => setNewIncomeSource({...newIncomeSource, continueInDestination: false})}
                      className="h-4 w-4 text-green-600"
                    />
                    <label htmlFor="hypothetical_income" className="text-sm cursor-pointer">
                      This is an expected income source after moving (for tax planning)
                    </label>
                  </div>
                </div>
                {incomeSituation === "seeking_income" && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                    <strong>Note:</strong> Since you're seeking new income sources, all entries will be treated as expected income after moving.
                  </div>
                )}
              </div>
              
              {/* Enhanced fields for expected/future income */}
              {!newIncomeSource.continueInDestination && (
                <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border">
                  <h5 className="font-medium text-orange-800 dark:text-orange-200">Expected Income Details</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expected Timeline</Label>
                      <Select
                        value={newIncomeSource.timeline}
                        onValueChange={(value) => setNewIncomeSource({...newIncomeSource, timeline: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Within 1 month",
                            "Within 3 months", 
                            "Within 6 months",
                            "Within 1 year",
                            "1-2 years",
                            "Uncertain timing"
                          ].map((timeline) => (
                            <SelectItem key={timeline} value={timeline}>
                              {timeline}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Confidence Level</Label>
                      <Select
                        value={newIncomeSource.confidence}
                        onValueChange={(value) => setNewIncomeSource({...newIncomeSource, confidence: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select confidence" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Very High (Job offer/contract)",
                            "High (Strong prospects)",
                            "Medium (Good chances)",
                            "Low (Uncertain)",
                            "Speculative"
                          ].map((confidence) => (
                            <SelectItem key={confidence} value={confidence}>
                              {confidence}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea
                      value={newIncomeSource.notes}
                      onChange={(e) => setNewIncomeSource({...newIncomeSource, notes: e.target.value})}
                      placeholder="Any additional details about this expected income source (e.g., industry, application status, networking contacts, etc.)"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => addIncomeSource(false)}
                disabled={!newIncomeSource.category || newIncomeSource.amount <= 0 || !newIncomeSource.country}
                className="w-full"
              >
                💾 Save Your Income Source
              </Button>
            </div>
          </div>
                </TabsContent>
              )}
              
              {showPartnerTab && (
                <TabsContent value="partner" className="mt-6 space-y-6">
                  {/* Add income source form for Partner */}
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-medium mb-4">➕ Add Partner's Income Source</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Income Category</Label>
                        <Select
                          value={newPartnerIncomeSource.category}
                          onValueChange={(value) => setNewPartnerIncomeSource({...newPartnerIncomeSource, category: value, fields: {}})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(INCOME_CATEGORIES).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newPartnerIncomeSource.category && INCOME_CATEGORIES[newPartnerIncomeSource.category as keyof typeof INCOME_CATEGORIES] && (
                          <p className="text-sm text-muted-foreground italic">
                            {INCOME_CATEGORIES[newPartnerIncomeSource.category as keyof typeof INCOME_CATEGORIES].help}
                          </p>
                        )}
                      </div>
                      
                      {/* Dynamic fields based on category - Streamlit structure */}
                      <DynamicIncomeFields newIncomeSource={newPartnerIncomeSource} setNewIncomeSource={setNewPartnerIncomeSource} />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Country (source of funds)</Label>
                          <Select
                            value={newPartnerIncomeSource.country}
                            onValueChange={(value) => setNewPartnerIncomeSource({...newPartnerIncomeSource, country: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCountryOptions().map((country: string) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Annual Amount</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newPartnerIncomeSource.amount}
                            onChange={(e) => setNewPartnerIncomeSource({...newPartnerIncomeSource, amount: parseFloat(e.target.value) || 0})}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select
                            value={newPartnerIncomeSource.currency}
                            onValueChange={(value) => setNewPartnerIncomeSource({...newPartnerIncomeSource, currency: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency: string) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>When does / will this income arise?</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="partner_current_income"
                              name="partner_timing"
                              checked={newPartnerIncomeSource.continueInDestination}
                              onChange={() => setNewPartnerIncomeSource({...newPartnerIncomeSource, continueInDestination: true})}
                              disabled={partnerIncomeSituation === "seeking_income"}
                              className={`h-4 w-4 ${partnerIncomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "text-green-600"}`}
                            />
                            <label htmlFor="partner_current_income" className={`text-sm ${partnerIncomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}>
                              This is a current source of income that partner will continue
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="partner_hypothetical_income"
                              name="partner_timing"
                              checked={!newPartnerIncomeSource.continueInDestination}
                              onChange={() => setNewPartnerIncomeSource({...newPartnerIncomeSource, continueInDestination: false})}
                              className="h-4 w-4 text-green-600"
                            />
                            <label htmlFor="partner_hypothetical_income" className="text-sm cursor-pointer">
                              This is an expected income source after moving (for tax planning)
                            </label>
                          </div>
                        </div>
                        {partnerIncomeSituation === "seeking_income" && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                            <strong>Note:</strong> Since partner is seeking new income sources, all entries will be treated as expected income after moving.
                          </div>
                        )}

                      </div>
                      
                      {/* Enhanced fields for expected/future income */}
                      {!newPartnerIncomeSource.continueInDestination && (
                        <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border">
                          <h5 className="font-medium text-orange-800 dark:text-orange-200">Expected Income Details</h5>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expected Timeline</Label>
                              <Select
                                value={newPartnerIncomeSource.timeline}
                                onValueChange={(value) => setNewPartnerIncomeSource({...newPartnerIncomeSource, timeline: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timeline" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Within 1 month",
                                    "Within 3 months", 
                                    "Within 6 months",
                                    "Within 1 year",
                                    "1-2 years",
                                    "Uncertain timing"
                                  ].map((timeline) => (
                                    <SelectItem key={timeline} value={timeline}>
                                      {timeline}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Confidence Level</Label>
                              <Select
                                value={newPartnerIncomeSource.confidence}
                                onValueChange={(value) => setNewPartnerIncomeSource({...newPartnerIncomeSource, confidence: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select confidence" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Very High (Job offer/contract)",
                                    "High (Strong prospects)",
                                    "Medium (Good chances)",
                                    "Low (Uncertain)",
                                    "Speculative"
                                  ].map((confidence) => (
                                    <SelectItem key={confidence} value={confidence}>
                                      {confidence}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Additional Notes (Optional)</Label>
                            <Textarea
                              value={newPartnerIncomeSource.notes}
                              onChange={(e) => setNewPartnerIncomeSource({...newPartnerIncomeSource, notes: e.target.value})}
                              placeholder="Any additional details about this expected income source (e.g., industry, application status, networking contacts, etc.)"
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => addIncomeSource(true)}
                        disabled={!newPartnerIncomeSource.category || newPartnerIncomeSource.amount <= 0 || !newPartnerIncomeSource.country}
                        className="w-full"
                      >
                        💾 Save Partner's Income Source
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            /* Single user mode - show full form for user */
            showUserTab && (
              <div className="p-4 border rounded-lg bg-card">
                <h4 className="font-medium mb-4">➕ Add Income Source</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Income Category</Label>
                    <Select
                      value={newIncomeSource.category}
                      onValueChange={(value) => setNewIncomeSource({...newIncomeSource, category: value, fields: {}})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INCOME_CATEGORIES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newIncomeSource.category && INCOME_CATEGORIES[newIncomeSource.category as keyof typeof INCOME_CATEGORIES] && (
                      <p className="text-sm text-muted-foreground italic">
                        {INCOME_CATEGORIES[newIncomeSource.category as keyof typeof INCOME_CATEGORIES].help}
                      </p>
                    )}
                  </div>
                  
                  {/* Dynamic fields based on category */}
                  <DynamicIncomeFields newIncomeSource={newIncomeSource} setNewIncomeSource={setNewIncomeSource} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Annual Amount</Label>
                      <Input
                        type="number"
                        value={newIncomeSource.amount || ""}
                        onChange={(e) => setNewIncomeSource({...newIncomeSource, amount: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={newIncomeSource.currency}
                        onValueChange={(value) => setNewIncomeSource({...newIncomeSource, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={newIncomeSource.country}
                      onValueChange={(value) => setNewIncomeSource({...newIncomeSource, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCountryOptions().map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Timing selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Income Timing</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="current_income_single"
                        name="timing_single"
                        checked={newIncomeSource.continueInDestination}
                        onChange={() => setNewIncomeSource({...newIncomeSource, continueInDestination: true})}
                        disabled={incomeSituation === "seeking_income"}
                        className={`h-4 w-4 ${incomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "text-green-600"}`}
                      />
                      <label htmlFor="current_income_single" className={`text-sm ${incomeSituation === "seeking_income" ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}>
                        This is a current source of income that I will continue
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="hypothetical_income_single"
                        name="timing_single"
                        checked={!newIncomeSource.continueInDestination}
                        onChange={() => setNewIncomeSource({...newIncomeSource, continueInDestination: false})}
                        className="h-4 w-4 text-green-600"
                      />
                      <label htmlFor="hypothetical_income_single" className="text-sm cursor-pointer">
                        This is expected/future income I plan to earn
                      </label>
                    </div>
                  </div>
                  
                  {/* Additional fields for expected income */}
                  {!newIncomeSource.continueInDestination && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expected Timeline</Label>
                        <Select
                          value={newIncomeSource.timeline}
                          onValueChange={(value) => setNewIncomeSource({...newIncomeSource, timeline: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Within 1 month",
                              "Within 3 months", 
                              "Within 6 months",
                              "Within 1 year",
                              "1-2 years",
                              "Uncertain timing"
                            ].map((timeline) => (
                              <SelectItem key={timeline} value={timeline}>
                                {timeline}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Confidence Level</Label>
                        <Select
                          value={newIncomeSource.confidence}
                          onValueChange={(value) => setNewIncomeSource({...newIncomeSource, confidence: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select confidence" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "Very High (Job offer/contract)",
                              "High (Strong prospects)",
                              "Medium (Good chances)",
                              "Low (Uncertain)",
                              "Speculative"
                            ].map((confidence) => (
                              <SelectItem key={confidence} value={confidence}>
                                {confidence}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {!newIncomeSource.continueInDestination && (
                    <div className="space-y-2">
                      <Label>Additional Notes (Optional)</Label>
                      <Textarea
                        value={newIncomeSource.notes}
                        onChange={(e) => setNewIncomeSource({...newIncomeSource, notes: e.target.value})}
                        placeholder="Any additional details about this expected income source"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => addIncomeSource(false)}
                    disabled={!newIncomeSource.category || newIncomeSource.amount <= 0 || !newIncomeSource.country}
                    className="w-full"
                  >
                    💾 Save Income Source
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DynamicIncomeFields({ newIncomeSource, setNewIncomeSource }: any) {
  const category = newIncomeSource.category
  const fields = INCOME_CATEGORIES[category as keyof typeof INCOME_CATEGORIES]?.fields || []
  
  if (fields.length === 0) return null
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <Label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          {field === "investment_type" ? (
            <Select
              value={newIncomeSource.fields[field] || ""}
              onValueChange={(value) => setNewIncomeSource({
                ...newIncomeSource, 
                fields: {...newIncomeSource.fields, [field]: value}
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select investment type" />
              </SelectTrigger>
              <SelectContent>
                {["Stocks/Dividends", "Bonds/Interest", "REITs", "ETFs", "Crypto", "Other"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field === "property_type" ? (
            <Select
              value={newIncomeSource.fields[field] || ""}
              onValueChange={(value) => setNewIncomeSource({
                ...newIncomeSource, 
                fields: {...newIncomeSource.fields, [field]: value}
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {["Residential", "Commercial", "Mixed"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={newIncomeSource.fields[field] || ""}
              onChange={(e) => setNewIncomeSource({
                ...newIncomeSource, 
                fields: {...newIncomeSource.fields, [field]: e.target.value}
              })}
              placeholder={`Enter ${field.replace(/_/g, ' ')}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function IncomeSourcesList({ incomeSources, updateFormData, isPartner = false, removeIncomeSource, title }: any) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-base">{title}</h4>
      <div className="grid gap-2">
        {incomeSources.map((source: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              <div className="md:col-span-2">
                <p className="font-medium text-green-700">{source.category}</p>
                {source.fields && Object.entries(source.fields).map(([key, value]: [string, any]) => 
                  value ? (
                    <p key={key} className="text-sm text-muted-foreground">
                      • {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                    </p>
                  ) : null
                )}
              </div>
              <div>
                <p className="font-medium">Country</p>
                <p className="text-sm">{source.country || "—"}</p>
              </div>
              <div>
                <p className="font-medium">Annual Amount</p>
                <p className="text-lg font-bold text-green-600">{source.currency} {source.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm">{source.continueInDestination ? "Current" : "Expected"}</p>
                {!source.continueInDestination && (
                  <>
                    <p className="font-medium mt-2">Timeline</p>
                    <p className="text-xs text-muted-foreground">{source.timeline || "—"}</p>
                    <p className="font-medium mt-2">Confidence</p>
                    <p className="text-xs text-muted-foreground">{source.confidence || "—"}</p>
                  </>
                )}
                {source.notes && (
                  <>
                    <p className="font-medium mt-2">Notes</p>
                    <p className="text-xs text-muted-foreground">{source.notes.length > 50 ? `${source.notes.substring(0, 50)}...` : source.notes}</p>
                  </>
                )}
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIncomeSource(idx, isPartner)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



function TotalWealthSection({ totalWealth, updateFormData, currencies, incomeSituation, hasPartnerSelected }: any) {
  const [editMode, setEditMode] = useState(false)
  const [wealthOwnership, setWealthOwnership] = useState<"individual" | "partner" | "both">("individual")
  const [tempWealth, setTempWealth] = useState({
    currency: totalWealth?.currency ?? 'USD',
    total: Number(totalWealth?.total) || 0,
    primaryResidence: Number(totalWealth?.primaryResidence) || 0
  })

  // Sync tempWealth when totalWealth prop changes (but not during edit mode)
  useEffect(() => {
    if (!editMode) {
      setTempWealth({
        currency: totalWealth?.currency ?? 'USD',
        total: Number(totalWealth?.total) || 0,
        primaryResidence: Number(totalWealth?.primaryResidence) || 0
      })
    }
  }, [totalWealth, editMode])

  return (
    <Card className="shadow-sm border-l-4 border-l-emerald-500">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <Wallet className="w-6 h-6 text-emerald-600" />
          Total Wealth
        </CardTitle>
        <p className="text-sm text-muted-foreground">Enter everything you own, then indicate how much is tied up in your primary residence</p>
        <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🏛️ Government Perspective:</strong> Some countries (Spain, Norway, Switzerland) impose annual wealth taxes 
            on your total net worth, typically starting at €1-3 million. Even if you don't sell anything, you may owe tax 
            just for owning assets above these thresholds.
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>📋 What to Include:</strong> Real estate, investment accounts, cash, business ownership, vehicles, 
            valuable collections, cryptocurrency - minus mortgages, loans, and other debts.
          </p>
        </div>
        {incomeSituation === "gainfully_unemployed" && (
          <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-l-4 border-l-orange-400">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>💰 Self-Funded Requirement:</strong> Since you're living off savings, this information is 
              <span className="font-semibold"> required</span> to show visa officers you have sufficient funds 
              to support yourself without working. Many visa categories require proof of substantial savings 
              (often €10,000-€50,000+ depending on duration and country).
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Ownership Selection */}
          {hasPartnerSelected && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Wealth Ownership</Label>
              <div className="grid grid-cols-3 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setWealthOwnership("individual")}
                  className={`${
                    wealthOwnership === "individual"
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all duration-300 rounded-md h-10 text-sm`}
                >
                  You
                </button>
                <button
                  type="button"
                  onClick={() => setWealthOwnership("partner")}
                  className={`${
                    wealthOwnership === "partner"
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all duration-300 rounded-md h-10 text-sm`}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => setWealthOwnership("both")}
                  className={`${
                    wealthOwnership === "both"
                      ? "bg-white text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all duration-300 rounded-md h-10 text-sm`}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {!editMode ? (
            <div className="space-y-4">
              {(totalWealth?.total ?? 0) > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalWealth?.currency ?? 'USD'} {(Number(totalWealth?.total) || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Net Worth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalWealth?.currency ?? 'USD'} {(Number(totalWealth?.primaryResidence) || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Primary Residence</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-muted-foreground">No wealth information entered yet</p>
                </div>
              )}
              <Button 
                onClick={() => setEditMode(true)}
                className="w-full"
                variant="outline"
              >
                {totalWealth.total > 0 ? "Edit Wealth Information" : "Add Wealth Information"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium">Total Wealth Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={tempWealth.currency}
                    onValueChange={(value) => setTempWealth({...tempWealth, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency: string) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Total net worth</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempWealth.total}
                    onChange={(e) => setTempWealth({...tempWealth, total: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>…of which is your primary residence</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempWealth.primaryResidence}
                    onChange={(e) => setTempWealth({...tempWealth, primaryResidence: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      updateFormData("finance.totalWealth", tempWealth)
                      setEditMode(false)
                    }}
                    className="flex-1"
                  >
                    💾 Save
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setTempWealth({
                        currency: totalWealth?.currency ?? 'USD',
                        total: Number(totalWealth?.total) || 0,
                        primaryResidence: Number(totalWealth?.primaryResidence) || 0
                      })
                      setEditMode(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CapitalGainsSection({ capitalGains, partnerCapitalGains, newCapitalGain, setNewCapitalGain, updateFormData, currencies, getCountryOptions, hasPartnerSelected, capitalGainsTab, setCapitalGainsTab }: any) {
  const futureSales = capitalGains.futureSales || []
  const partnerFutureSales = partnerCapitalGains.futureSales || []

  // Unified function for adding capital gains
  const addCapitalGain = (isPartner: boolean = false, isBoth: boolean = false) => {
    if (!newCapitalGain.asset || newCapitalGain.surplusValue <= 0) return

    const newGain = { ...newCapitalGain }

    if (isBoth) {
      // Add to both individual and partner
      const updatedGains = { ...capitalGains, futureSales: [...futureSales, { ...newGain, ownership: "both" }] }
      const updatedPartnerGains = { ...partnerCapitalGains, futureSales: [...partnerFutureSales, { ...newGain, ownership: "both" }] }
      updateFormData("finance.capitalGains", updatedGains)
      updateFormData("finance.partner.capitalGains", updatedPartnerGains)
    } else if (isPartner) {
      const updatedGains = { ...partnerCapitalGains, futureSales: [...partnerFutureSales, { ...newGain, ownership: "partner" }] }
      updateFormData("finance.partner.capitalGains", updatedGains)
    } else {
      const updatedGains = { ...capitalGains, futureSales: [...futureSales, { ...newGain, ownership: "individual" }] }
      updateFormData("finance.capitalGains", updatedGains)
    }

    // Reset form
    setNewCapitalGain({
      asset: "",
      type: "Real Estate",
      holdingTime: "< 12 months (short-term)",
      surplusValue: 0,
      currency: "USD",
      reason: ""
    })
  }

  // Unified function for removing capital gains
  const removeCapitalGain = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      const updatedSales = partnerFutureSales.filter((_: any, i: number) => i !== index)
      const updatedGains = { ...partnerCapitalGains, futureSales: updatedSales }
      updateFormData("finance.partner.capitalGains", updatedGains)
    } else {
      const updatedSales = futureSales.filter((_: any, i: number) => i !== index)
      const updatedGains = { ...capitalGains, futureSales: updatedSales }
      updateFormData("finance.capitalGains", updatedGains)
    }
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-purple-500">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Planned Asset Sales in Your First Year (Capital Gains)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Capital gains planning for your first year after moving</p>
        <div className="mt-2 space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>ℹ️ What are capital gains?</strong> Generally: Sale price – (Purchase price + improvements + fees). 
              If that number is positive you have a gain; if negative it's a loss.
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>⏰ Timing Strategy:</strong> Most countries tax capital gains only when you sell. This means you can 
              optimize by selling before moving (under current country rules) or after establishing tax residency 
              (under new country rules). Some countries have different rates for short vs. long-term holdings.
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>🌍 Why Report This:</strong> First-year sales help estimate your initial tax burden in the new country. 
              Some visa programs require proof you can support yourself, and planned sales might factor into that calculation.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Always show both Your and Partner capital gains */}
          <div className="space-y-6">
            {/* Your Capital Gains */}
            {futureSales.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your planned asset sales</h4>
                <div className="grid gap-2">
                  {futureSales.map((sale: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{sale.asset}</span>
                        <div className="flex gap-1">
                          {sale.ownership === "both" && (
                            <Badge variant="outline" className="text-xs">Shared Asset</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{sale.currentValue?.toLocaleString()} {sale.currency}</div>
                          <div className="text-xs text-muted-foreground">Sale: {sale.saleDate}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCapitalGain(idx, false)}
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

            {/* Partner Capital Gains */}
            {hasPartnerSelected && partnerFutureSales.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Partner's planned asset sales</h4>
                <div className="grid gap-2">
                  {partnerFutureSales.map((sale: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{sale.asset}</span>
                        <div className="flex gap-1">
                          {sale.ownership === "both" && (
                            <Badge variant="outline" className="text-xs">Shared Asset</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{sale.currentValue?.toLocaleString()} {sale.currency}</div>
                          <div className="text-xs text-muted-foreground">Sale: {sale.saleDate}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCapitalGain(idx, true)}
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

          {/* Tab-based form inputs with "Both of us" option */}
          {hasPartnerSelected ? (
            <Tabs value={capitalGainsTab} onValueChange={setCapitalGainsTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="you" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  You
                </TabsTrigger>
                <TabsTrigger 
                  value="partner" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Partner
                </TabsTrigger>
              </TabsList>
              
              {/* Asset ownership options - only show for couples */}
              {hasPartnerSelected && (
                <div key="ownership-buttons" className="mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      key="you-button"
                      type="button"
                      onClick={() => addCapitalGain(false, false)}
                      disabled={!newCapitalGain.asset || newCapitalGain.surplusValue <= 0}
                      size="sm"
                      className="h-10"
                    >
                      You
                    </Button>
                    <Button
                      key="partner-button"
                      type="button"
                      onClick={() => addCapitalGain(true, false)}
                      disabled={!newCapitalGain.asset || newCapitalGain.surplusValue <= 0}
                      variant="secondary"
                      size="sm"
                      className="h-10"
                    >
                      Partner
                    </Button>
                    <Button
                      key="both-button"
                      type="button"
                      onClick={() => addCapitalGain(false, true)}
                      disabled={!newCapitalGain.asset || newCapitalGain.surplusValue <= 0}
                      variant="outline"
                      size="sm"
                      className="h-10"
                    >
                      Both
                    </Button>
                  </div>
                </div>
              )}
              
              <TabsContent key="you-tab" value="you" className="mt-6 space-y-6">
                {/* Add capital gain form for You */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-medium mb-4">➕ Add Planned Sale</h4>
            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>1️⃣ Asset name / description</Label>
                  <Input
                    value={newCapitalGain.asset}
                    onChange={(e) => setNewCapitalGain({...newCapitalGain, asset: e.target.value})}
                    placeholder="Enter asset name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>2️⃣ Asset type</Label>
                  <Select
                    value={newCapitalGain.type}
                    onValueChange={(value) => setNewCapitalGain({...newCapitalGain, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Real Estate", "Stocks/ETFs", "Crypto", "Business", "Collectibles", "Other"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>3️⃣ Holding period</Label>
                  <Select
                    value={newCapitalGain.holdingTime}
                    onValueChange={(value) => setNewCapitalGain({...newCapitalGain, holdingTime: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select holding period" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "< 12 months (short-term)",
                        "12 – 24 months", 
                        "2 – 3 years",
                        "3 – 5 years", 
                        "5 – 10 years",
                        "> 10 years"
                      ].map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>4️⃣ Estimated surplus value (profit)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCapitalGain.surplusValue}
                    onChange={(e) => setNewCapitalGain({...newCapitalGain, surplusValue: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={newCapitalGain.currency}
                    onValueChange={(value) => setNewCapitalGain({...newCapitalGain, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency: string) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>5️⃣ Reason for sale (optional)</Label>
                  <Textarea
                    value={newCapitalGain.reason}
                    onChange={(e) => setNewCapitalGain({...newCapitalGain, reason: e.target.value})}
                    placeholder="Reason for selling this asset"
                    rows={2}
                  />
                </div>
              </div>
              
              {/* Form fields only - no add button (use ownership buttons above) */}
            </div>
          </div>
              </TabsContent>
              
              <TabsContent key="partner-tab" value="partner" className="mt-6 space-y-6">
                {/* Partner form fields only - no add button (use ownership buttons above) */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">➕ Add Partner's Planned Sale</h4>
                  {/* Form fields will be added here - use ownership buttons above to save */}
                      </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Single user mode - show full form */
            <div key="single-user-form" className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-4">➕ Add Planned Sale</h4>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>1️⃣ Asset name / description</Label>
                    <Input
                      value={newCapitalGain.asset}
                      onChange={(e) => setNewCapitalGain({...newCapitalGain, asset: e.target.value})}
                      placeholder="Enter asset name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>2️⃣ Country of sale</Label>
                    <Select
                      value={newCapitalGain.country}
                      onValueChange={(value) => setNewCapitalGain({...newCapitalGain, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCountryOptions().map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>3️⃣ Expected sale timeframe</Label>
                    <Select
                      value={newCapitalGain.timeframe}
                      onValueChange={(value) => setNewCapitalGain({...newCapitalGain, timeframe: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Within 1 year",
                          "1 – 2 years",
                          "2 – 5 years",
                          "5 – 10 years",
                          "> 10 years"
                        ].map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>4️⃣ Estimated surplus value (profit)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCapitalGain.surplusValue}
                      onChange={(e) => setNewCapitalGain({...newCapitalGain, surplusValue: parseFloat(e.target.value) || 0})}
                      onFocus={(e) => e.target.select()}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={newCapitalGain.currency}
                      onValueChange={(value) => setNewCapitalGain({...newCapitalGain, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional notes (optional)</Label>
                    <Textarea
                      value={newCapitalGain.notes}
                      onChange={(e) => setNewCapitalGain({...newCapitalGain, notes: e.target.value})}
                      placeholder="Any additional details"
                      rows={2}
                    />
                  </div>
                </div>
                
                <Button
                  onClick={() => addCapitalGain(false)}
                  disabled={!newCapitalGain.asset || newCapitalGain.surplusValue <= 0}
                  className="w-full"
                >
                  💾 Save Planned Sale
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LiabilitiesSection({ liabilities, partnerLiabilities, newLiability, setNewLiability, updateFormData, currencies, getCountryOptions, hasPartnerSelected, liabilitiesTab, setLiabilitiesTab }: any) {
  
  // Unified function for adding liabilities
  const addLiability = (isPartner: boolean = false) => {
    if (!newLiability.category || newLiability.amount <= 0) return

    const newLiab = { ...newLiability }

    if (isPartner) {
      updateFormData("finance.partner.liabilities", [...partnerLiabilities, newLiab])
    } else {
      updateFormData("finance.liabilities", [...liabilities, newLiab])
    }

    // Reset form
    setNewLiability({
      category: "",
      amount: 0,
      currency: "USD",
      country: "",
      fields: {}
    })
  }

  // Unified function for removing liabilities
  const removeLiability = (index: number, isPartner: boolean = false) => {
    if (isPartner) {
      updateFormData("finance.partner.liabilities", partnerLiabilities.filter((_: any, i: number) => i !== index))
    } else {
      updateFormData("finance.liabilities", liabilities.filter((_: any, i: number) => i !== index))
    }
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-red-500">
      <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
        <CardTitle className="text-xl flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-red-600" />
          Liabilities & Debts
        </CardTitle>
        <p className="text-sm text-muted-foreground">Report DEBTS ONLY, not asset values</p>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🎯 Important:</strong> This section is for reporting debts you actually owe from all sources.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Always show both Your and Partner liabilities */}
          <div className="space-y-6">
            {/* Your Liabilities */}
            {liabilities.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your liabilities & debts</h4>
                <div className="grid gap-2">
                  {liabilities.map((liability: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{liability.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{liability.amount?.toLocaleString()} {liability.currency}</div>
                          <div className="text-xs text-muted-foreground">{liability.country}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLiability(idx, false)}
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

            {/* Partner Liabilities */}
            {hasPartnerSelected && partnerLiabilities.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Partner's liabilities & debts</h4>
                <div className="grid gap-2">
                  {partnerLiabilities.map((liability: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{liability.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{liability.amount?.toLocaleString()} {liability.currency}</div>
                          <div className="text-xs text-muted-foreground">{liability.country}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLiability(idx, true)}
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
          {hasPartnerSelected ? (
            <Tabs value={liabilitiesTab} onValueChange={setLiabilitiesTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="you" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  You
                </TabsTrigger>
                <TabsTrigger 
                  value="partner" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Partner
                </TabsTrigger>
              </TabsList>
              
              {/* Joint liability option for shared debts like mortgages */}
              <div className="mb-4">
                <div className="grid grid-cols-1 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => {
                      // Add to both individual and partner for joint liability
                      addLiability(false) // Add to individual
                      addLiability(true)  // Add to partner
                    }}
                    disabled={!newLiability.category || newLiability.amount <= 0}
                    className="transition-all duration-300 rounded-md h-10 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Both (Joint Liability)
                  </button>
                </div>
              </div>
              
              <TabsContent value="you" className="mt-6 space-y-6">
                {/* Add liability form for You */}
          <div className="p-4 border rounded-lg bg-card">
            <h4 className="font-medium mb-4">➕ Add Liability</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Liability Category</Label>
                <Select
                  value={newLiability.category}
                  onValueChange={(value) => setNewLiability({...newLiability, category: value, fields: {}})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LIABILITY_CATEGORIES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newLiability.category && LIABILITY_CATEGORIES[newLiability.category as keyof typeof LIABILITY_CATEGORIES] && (
                  <p className="text-sm text-muted-foreground italic">
                    {LIABILITY_CATEGORIES[newLiability.category as keyof typeof LIABILITY_CATEGORIES].help}
                  </p>
                )}
              </div>
              
              {/* Dynamic fields based on category */}
              <DynamicLiabilityFields newLiability={newLiability} setNewLiability={setNewLiability} />
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={newLiability.country}
                    onValueChange={(value) => setNewLiability({...newLiability, country: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCountryOptions().map((country: string) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newLiability.amount}
                    onChange={(e) => setNewLiability({...newLiability, amount: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={newLiability.currency}
                    onValueChange={(value) => setNewLiability({...newLiability, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency: string) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payback timeline (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newLiability.paybackYears}
                    onChange={(e) => setNewLiability({...newLiability, paybackYears: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.0"
                  />
                  <p className="text-xs text-muted-foreground">How many years until this debt is fully paid off</p>
                </div>
                <div className="space-y-2">
                  <Label>Interest rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newLiability.interestRate}
                    onChange={(e) => setNewLiability({...newLiability, interestRate: parseFloat(e.target.value) || 0})}
                    onFocus={(e) => e.target.select()}
                    placeholder="0.0"
                  />
                  <p className="text-xs text-muted-foreground">Annual interest rate on this debt</p>
                </div>
              </div>
              
              <Button 
                onClick={() => addLiability(false)}
                disabled={!newLiability.category || newLiability.amount <= 0}
                className="w-full"
              >
                💾 Save Your Liability
              </Button>
            </div>
          </div>
              </TabsContent>
              
              <TabsContent value="partner" className="mt-6 space-y-6">
                {/* Partner form - placeholder for now */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">➕ Add Partner's Liability</h4>
                  <Button 
                    onClick={() => addLiability(true)}
                    disabled={!newLiability.category || newLiability.amount <= 0}
                    className="w-full"
                  >
                    💾 Save Partner's Liability
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            /* Single user mode - preserve existing form */
            <div className="p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-4">➕ Add Liability</h4>
              <Button 
                onClick={() => addLiability(false)}
                disabled={!newLiability.category || newLiability.amount <= 0}
                className="w-full"
              >
                💾 Save Liability
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DynamicLiabilityFields({ newLiability, setNewLiability }: any) {
  const category = newLiability.category
  const fields = LIABILITY_CATEGORIES[category as keyof typeof LIABILITY_CATEGORIES]?.fields || []
  
  if (fields.length === 0) return null
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <Label>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          {field === "property_type" ? (
            <Select
              value={newLiability.fields[field] || ""}
              onValueChange={(value) => setNewLiability({
                ...newLiability, 
                fields: {...newLiability.fields, [field]: value}
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {["Residential", "Commercial", "Mixed"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={newLiability.fields[field] || ""}
              onChange={(e) => setNewLiability({
                ...newLiability, 
                fields: {...newLiability.fields, [field]: e.target.value}
              })}
              placeholder={`Enter ${field.replace(/_/g, ' ')}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function LiabilitiesList({ liabilities, updateFormData, isPartner = false, removeLiability, title }: any) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-base">{title}</h4>
      <div className="grid gap-2">
        {liabilities.map((liability: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
              <div className="md:col-span-2">
                <p className="font-medium text-red-700">{liability.category}</p>
                {liability.fields && Object.entries(liability.fields).map(([key, value]: [string, any]) => 
                  value ? (
                    <p key={key} className="text-sm text-muted-foreground">
                      • {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                    </p>
                  ) : null
                )}
              </div>
              <div>
                <p className="font-medium">Country</p>
                <p className="text-sm">{liability.country || "—"}</p>
              </div>
              <div>
                <p className="font-medium">Amount</p>
                <p className="text-lg font-bold text-red-600">{liability.currency} {liability.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium">Terms</p>
                <p className="text-sm">{liability.paybackYears > 0 ? `${liability.paybackYears} years` : "—"}</p>
                <p className="text-sm">{liability.interestRate > 0 ? `${liability.interestRate}%` : "—"}</p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLiability(idx, isPartner)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


