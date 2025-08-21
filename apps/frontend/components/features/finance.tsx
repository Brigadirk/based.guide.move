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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2, Plus, DollarSign, TrendingUp, Wallet, CreditCard, Target, Info } from "lucide-react"
import { validateFinanceData } from "@/lib/utils/finance-validation"
import { ValidationSummary, ValidationBadge, RealTimeValidation } from "@/components/ui/enhanced-validation"
import { useAutoSave, useAutoSaveStatus } from "@/lib/hooks/use-auto-save"
import { SaveStatus } from "@/components/ui/loading-states"
import { FinanciallySupportedSection } from "./financially-supported-section"

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
  
  // Total Wealth (Streamlit structure - simple total + primary residence)
  const totalWealth = getFormData("finance.totalWealth") ?? { currency: "USD", total: 0, primaryResidence: 0 }
  
  // Income Sources (Streamlit structure)
  const incomeSources = getFormData("finance.incomeSources") ?? []
  
  // Capital Gains - Future Sales (Streamlit structure)
  const capitalGains = getFormData("finance.capitalGains") ?? { futureSales: [] }
  
  // Liabilities (Streamlit structure)
  const liabilities = getFormData("finance.liabilities") ?? []

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

  // Auto-adjust continueInDestination based on income situation
  useEffect(() => {
    if (incomeSituation === "seeking_income" && newIncomeSource.continueInDestination) {
      setNewIncomeSource(prev => ({
        ...prev,
        continueInDestination: false
      }))
    }
  }, [incomeSituation, newIncomeSource.continueInDestination])

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

  // Enhanced validation status
  const canContinue = useMemo(() => 
    skipDetails || validation.isValid,
    [skipDetails, validation.isValid]
  )

  // Helper functions for form management
  const getCountryOptions = () => [
    "United States", "United Kingdom", "Canada", "Germany", "France", "Spain", 
    "Italy", "Netherlands", "Australia", "New Zealand", "Japan", "Singapore", "Other"
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <DollarSign className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Income and Assets</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your financial profile for visa applications and tax planning
        </p>
      </div>

      <SectionHint title="About this section">
        We'll calculate your tax liability for your first year in the destination country, which should give you an indication of what it would cost for you to live there long term. This information is also crucial for visa applications and ensuring you meet minimum income requirements.
      </SectionHint>

      {/* Financial Information Guide - Collapsible */}
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
                          name="incomeSituation"
                          value={option.key}
                          checked={incomeSituation === option.key}
                          onChange={(e) => updateFormData("finance.incomeSituation", e.target.value)}
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
                
                {incomeSituation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Selected:</strong> {
                        incomeSituation === "continuing_income" ? "Keep all existing income sources (remote work, investments, rental, etc.)" :
                        incomeSituation === "current_and_new_income" ? "Keep some current sources, add new ones in destination" :
                        incomeSituation === "seeking_income" ? "Will find new work, start business, or other new sources" :
                        incomeSituation === "gainfully_unemployed" ? "Living off savings, gifts, or investments" :
                        "Family, partner, scholarship, or institutional support"
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Sources Section - Conditional based on situation (Streamlit logic) */}
          {(incomeSituation === "continuing_income" || incomeSituation === "current_and_new_income" || incomeSituation === "seeking_income") && (
            <IncomeSourcesSection 
              incomeSources={incomeSources} 
              newIncomeSource={newIncomeSource}
              setNewIncomeSource={setNewIncomeSource}
              updateFormData={updateFormData}
              currencies={currencies}
              getCountryOptions={getCountryOptions}
              incomeSituation={incomeSituation}
            />
          )}

          {/* Special Stipend Section for Financially Supported */}
          {incomeSituation === "dependent/supported" && (
            <FinanciallySupportedSection 
              incomeSources={incomeSources}
              updateFormData={updateFormData}
              currencies={currencies}
            />
          )}



          {/* Total Wealth Section - Streamlit Simple Structure */}
          <TotalWealthSection 
            totalWealth={totalWealth}
            updateFormData={updateFormData}
            currencies={currencies}
            incomeSituation={incomeSituation}
          />

          {/* Capital Gains Section - Streamlit Structure */}
          <CapitalGainsSection 
            capitalGains={capitalGains}
            newCapitalGain={newCapitalGain}
            setNewCapitalGain={setNewCapitalGain}
            updateFormData={updateFormData}
            currencies={currencies}
          />

          {/* Liabilities Section - Streamlit Structure */}
          <LiabilitiesSection 
            liabilities={liabilities}
            newLiability={newLiability}
            setNewLiability={setNewLiability}
            updateFormData={updateFormData}
            currencies={currencies}
            getCountryOptions={getCountryOptions}
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
              nextSectionName="Social Security & Pensions"
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

function IncomeSourcesSection({ incomeSources, newIncomeSource, setNewIncomeSource, updateFormData, currencies, getCountryOptions, incomeSituation }: any) {
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
          {/* Add income source form */}
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
                onClick={() => {
                  if (newIncomeSource.category && newIncomeSource.amount > 0 && newIncomeSource.country) {
                    const updatedSources = [...incomeSources, newIncomeSource]
                    updateFormData("finance.incomeSources", updatedSources)
                    setNewIncomeSource({
                      category: "Employment",
                      fields: {},
                      country: "",
                      amount: 0,
                      currency: "USD",
                      continueInDestination: true,
                      timeline: "Within 3 months",
                      confidence: "High",
                      notes: ""
                    })
                  }
                }}
                disabled={!newIncomeSource.category || newIncomeSource.amount <= 0 || !newIncomeSource.country}
                className="w-full"
              >
                💾 Save Income Source
              </Button>
            </div>
          </div>
          
          {/* Display existing income sources - Streamlit style */}
          {incomeSources.length > 0 && (
            <IncomeSourcesList incomeSources={incomeSources} updateFormData={updateFormData} />
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

function IncomeSourcesList({ incomeSources, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">📋 Your Income Sources</h4>
      <div className="space-y-3">
        {incomeSources.map((source: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg bg-card">
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
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const updatedSources = incomeSources.filter((_: any, i: number) => i !== idx)
                      updateFormData("finance.incomeSources", updatedSources)
                    }}
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



function TotalWealthSection({ totalWealth, updateFormData, currencies, incomeSituation }: any) {
  const [editMode, setEditMode] = useState(false)
  const [tempWealth, setTempWealth] = useState(totalWealth)

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
          {!editMode ? (
            <div className="space-y-4">
              {totalWealth.total > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalWealth.currency} {totalWealth.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Net Worth</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalWealth.currency} {totalWealth.primaryResidence.toLocaleString()}</p>
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
                      setTempWealth(totalWealth)
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

function CapitalGainsSection({ capitalGains, newCapitalGain, setNewCapitalGain, updateFormData, currencies }: any) {
  const futureSales = capitalGains.futureSales || []

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
          {/* Add capital gain form */}
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
              
              <Button 
                onClick={() => {
                  if (newCapitalGain.asset) {
                    const updatedGains = { ...capitalGains, futureSales: [...futureSales, newCapitalGain] }
                    updateFormData("finance.capitalGains", updatedGains)
                    setNewCapitalGain({
                      asset: "",
                      type: "Real Estate",
                      holdingTime: "< 12 months (short-term)",
                      surplusValue: 0,
                      currency: "USD",
                      reason: ""
                    })
                  }
                }}
                disabled={!newCapitalGain.asset}
                className="w-full"
              >
                ➕ Add Planned Sale
              </Button>
            </div>
          </div>
          
          {/* Display existing capital gains */}
          {futureSales.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">📋 Your Planned Asset Sales</h4>
              <div className="space-y-3">
                {futureSales.map((gain: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      <div className="md:col-span-2">
                        <p className="font-medium text-purple-700">{gain.asset}</p>
                        <p className="text-sm text-muted-foreground">Type: {gain.type}</p>
                      </div>
                      <div>
                        <p className="font-medium">Holding Period</p>
                        <p className="text-sm">{gain.holdingTime}</p>
                      </div>
                      <div>
                        <p className="font-medium">Expected Profit</p>
                        <p className="text-lg font-bold text-purple-600">{gain.currency} {gain.surplusValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Reason</p>
                        <p className="text-sm">{gain.reason || "—"}</p>
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const updatedSales = futureSales.filter((_: any, i: number) => i !== idx)
                              const updatedGains = { ...capitalGains, futureSales: updatedSales }
                              updateFormData("finance.capitalGains", updatedGains)
                            }}
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LiabilitiesSection({ liabilities, newLiability, setNewLiability, updateFormData, currencies, getCountryOptions }: any) {
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
          {/* Add liability form */}
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
                    placeholder="0.0"
                  />
                  <p className="text-xs text-muted-foreground">Annual interest rate on this debt</p>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  if (newLiability.category && newLiability.amount > 0) {
                    const updatedLiabilities = [...liabilities, newLiability]
                    updateFormData("finance.liabilities", updatedLiabilities)
                    setNewLiability({
                      category: "Mortgage",
                      fields: {},
                      country: "",
                      amount: 0,
                      currency: "USD",
                      paybackYears: 0,
                      interestRate: 0
                    })
                  }
                }}
                disabled={!newLiability.category || newLiability.amount <= 0}
                className="w-full"
              >
                💾 Save Liability
              </Button>
            </div>
          </div>
          
          {/* Display existing liabilities */}
          {liabilities.length > 0 && (
            <LiabilitiesList liabilities={liabilities} updateFormData={updateFormData} />
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

function LiabilitiesList({ liabilities, updateFormData }: any) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">📋 Your Liabilities</h4>
      <div className="space-y-3">
        {liabilities.map((liability: any, idx: number) => (
          <div key={idx} className="p-4 border rounded-lg bg-card">
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
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const updatedLiabilities = liabilities.filter((_: any, i: number) => i !== idx)
                    updateFormData("finance.liabilities", updatedLiabilities)
                  }}
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


