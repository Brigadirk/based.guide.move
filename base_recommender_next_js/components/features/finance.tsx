"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useCurrencies } from "@/lib/hooks/use-currencies"

// Income Categories
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

export function Finance({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Get skip status (now controlled from sidebar)
  const skipDetails = getFormData("finance.skipDetails") ?? false

  // Income situation state (from Streamlit design)
  const incomeSituation = getFormData("finance.incomeSituation") ?? ""
  
  // Income Sources
  const incomeSources = getFormData("finance.incomeSources") ?? []
  const [newIncomeSource, setNewIncomeSource] = useState({
    category: "Employment",
    fields: {} as Record<string, string>,
    country: "",
    amount: 0,
    currency: "USD",
    continueInDestination: true
  })

  // Total Wealth (from Streamlit design)
  const totalWealth = getFormData("finance.totalWealth") ?? {
    total: 0,
    primaryResidence: 0,
    currency: "USD"
  }

  // Capital Gains (from Streamlit design)
  const capitalGains = getFormData("finance.capitalGains") ?? []
  const [newCapitalGain, setNewCapitalGain] = useState({
    asset: "",
    type: "Real Estate",
    holdingTime: "< 12 months (short-term)",
    surplusValue: 0,
    currency: "USD",
    reason: ""
  })

  // Liabilities (enhanced from Streamlit design)
  const liabilities = getFormData("finance.liabilities") ?? []
  const [newLiability, setNewLiability] = useState({
    category: "Mortgage",
    fields: {} as Record<string, string>,
    country: "",
    amount: 0,
    currency: "USD",
    paybackYears: 0,
    interestRate: 0
  })

  // Assets
  const assets = getFormData("finance.assets") ?? []
  const [newAsset, setNewAsset] = useState({
    type: "Bank Account",
    description: "",
    value: 0,
    currency: "USD",
    liquid: true,
    location: ""
  })

  // Debts
  const debts = getFormData("finance.debts") ?? []
  const [newDebt, setNewDebt] = useState({
    type: "Credit Card",
    description: "",
    amount: 0,
    currency: "USD",
    monthlyPayment: 0
  })

  // Financial Goals
  const investmentGoals = getFormData("finance.investmentGoals") ?? ""
  const riskTolerance = getFormData("finance.riskTolerance") ?? ""
  const retirementPlanning = getFormData("finance.retirementPlanning") ?? ""

  const handleComplete = () => {
    markSectionComplete("finance")
    onComplete()
  }

  const totalIncome = incomeSources.reduce((sum: number, source: any) => sum + (source.amount || 0), 0)
  const totalAssets = assets.reduce((sum: number, asset: any) => sum + (asset.value || 0), 0)
  const totalDebts = debts.reduce((sum: number, debt: any) => sum + (debt.amount || 0), 0)
  const netWorth = totalAssets - totalDebts

  const canContinue = incomeSources.length > 0 // At least one income source required

  const canAddIncomeSource = newIncomeSource.category && newIncomeSource.amount > 0 && newIncomeSource.country
  const canAddAsset = newAsset.type && newAsset.value > 0 && newAsset.description
  const canAddDebt = newDebt.type && newDebt.amount > 0 && newDebt.description

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Icons.money className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Financial Information</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your financial profile for visa applications, tax planning, and relocation budgeting
        </p>
      </div>

      <SectionHint title="About this section">
        Financial information is crucial for visa applications, tax planning, and ensuring you meet minimum income requirements for your destination country.
      </SectionHint>

      {/* Skip Mode Indicator */}
      {skipDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Icons.important className="w-6 h-6 text-green-600" />
              Finance Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Focus on financial requirements only</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                ✅ Detailed finance inputs skipped. We'll focus only on whether any financial thresholds apply to your relocation.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                📋 The following sections have been automatically marked as complete:
                <br />• Income and Assets • Social Security and Pensions • Tax Deductions and Credits • Future Financial Plans
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
          {/* Income Situation Checker (Streamlit style) */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Icons.investment className="w-6 h-6 text-blue-600" />
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
                      key: "dependent_supported",
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

          {/* Total Wealth Card */}
          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Icons.target className="w-6 h-6 text-emerald-600" />
                Total Wealth
              </CardTitle>
              <p className="text-sm text-muted-foreground">Enter everything you own, then indicate primary residence share</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={totalWealth.currency}
                      onValueChange={(value) => updateFormData("finance.totalWealth", { ...totalWealth, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Net Worth *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalWealth.total}
                      onChange={(e) => updateFormData("finance.totalWealth", { ...totalWealth, total: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>…of which is primary residence</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={totalWealth.primaryResidence}
                      onChange={(e) => updateFormData("finance.totalWealth", { ...totalWealth, primaryResidence: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                {totalWealth.total > 0 && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{totalWealth.currency} {totalWealth.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Wealth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{totalWealth.currency} {totalWealth.primaryResidence.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Primary Residence</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capital Gains Section (Streamlit style) */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Icons.investment className="w-6 h-6 text-purple-600" />
                Planned Asset Sales in Your First Year
              </CardTitle>
              <p className="text-sm text-muted-foreground">Capital gains planning for your first year after moving</p>
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ What are capital gains?</strong> Generally: Sale price – (Purchase price + improvements + fees). 
                  If that number is positive you have a gain; if negative it's a loss.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add capital gain form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Planned Sale</h4>
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
                            {currencies.map((currency) => (
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
                          const updatedGains = [...capitalGains, newCapitalGain]
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
                {capitalGains.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">📋 Your Planned Asset Sales</h4>
                    <div className="space-y-3">
                      {capitalGains.map((gain: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <div className="grid md:grid-cols-5 gap-4 items-start">
                            <div>
                              <p className="font-medium">{gain.asset}</p>
                              <p className="text-sm text-muted-foreground">Type: {gain.type}</p>
                            </div>
                            <div>
                              <p className="font-medium">Holding Period</p>
                              <p className="text-sm">{gain.holdingTime}</p>
                            </div>
                            <div>
                              <p className="font-medium">Expected Profit</p>
                              <p className="text-lg font-bold text-green-600">{gain.currency} {gain.surplusValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="font-medium">Reason</p>
                              <p className="text-sm">{gain.reason || "—"}</p>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const updatedGains = capitalGains.filter((_: any, i: number) => i !== idx)
                                  updateFormData("finance.capitalGains", updatedGains)
                                }}
                              >
                                🗑️
                              </Button>
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

          {/* Income Sources Section - Conditional based on situation */}
          {(incomeSituation === "continuing_income" || incomeSituation === "current_and_new_income") && (
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Icons.work className="w-6 h-6 text-green-600" />
                  Current Income Sources
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
                    <h4 className="font-medium mb-4">Add Income Source</h4>
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
                            {[
                              { key: "Employment", help: "Traditional employment with regular salary or wages" },
                              { key: "Self-Employment", help: "Freelance, consulting, or business income" },
                              { key: "Investments", help: "Dividends, interest, capital gains distributions" },
                              { key: "Rental Income", help: "Income from residential or commercial property rentals" },
                              { key: "Other", help: "Alimony, grants, prizes, royalties, etc." }
                            ].map((cat) => (
                              <SelectItem key={cat.key} value={cat.key}>
                                {cat.key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {newIncomeSource.category && (
                          <p className="text-sm text-muted-foreground">
                            {newIncomeSource.category === "Employment" ? "Traditional employment with regular salary or wages" :
                             newIncomeSource.category === "Self-Employment" ? "Freelance, consulting, or business income" :
                             newIncomeSource.category === "Investments" ? "Dividends, interest, capital gains distributions" :
                             newIncomeSource.category === "Rental Income" ? "Income from residential or commercial property rentals" :
                             "Alimony, grants, prizes, royalties, etc."}
                          </p>
                        )}
                      </div>
                      
                      {/* Dynamic fields based on category */}
                      {newIncomeSource.category === "Employment" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Employer Name</Label>
                            <Input
                              value={newIncomeSource.fields.employer || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, employer: e.target.value}
                              })}
                              placeholder="Enter employer name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role/Position</Label>
                            <Input
                              value={newIncomeSource.fields.role || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, role: e.target.value}
                              })}
                              placeholder="Enter your role"
                            />
                          </div>
                        </div>
                      )}
                      
                      {newIncomeSource.category === "Self-Employment" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                              value={newIncomeSource.fields.businessName || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, businessName: e.target.value}
                              })}
                              placeholder="Enter business name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Business Type</Label>
                            <Input
                              value={newIncomeSource.fields.businessType || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, businessType: e.target.value}
                              })}
                              placeholder="Enter business type"
                            />
                          </div>
                        </div>
                      )}
                      
                      {newIncomeSource.category === "Investments" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Investment Type</Label>
                            <Select
                              value={newIncomeSource.fields.investmentType || ""}
                              onValueChange={(value) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, investmentType: value}
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
                          </div>
                          <div className="space-y-2">
                            <Label>Issuer/Fund Name</Label>
                            <Input
                              value={newIncomeSource.fields.issuer || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, issuer: e.target.value}
                              })}
                              placeholder="Enter issuer or fund name"
                            />
                          </div>
                        </div>
                      )}
                      
                      {newIncomeSource.category === "Rental Income" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Property Description</Label>
                            <Input
                              value={newIncomeSource.fields.propertyDescription || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, propertyDescription: e.target.value}
                              })}
                              placeholder="Describe the property"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Property Type</Label>
                            <Select
                              value={newIncomeSource.fields.propertyType || ""}
                              onValueChange={(value) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, propertyType: value}
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
                          </div>
                        </div>
                      )}
                      
                      {newIncomeSource.category === "Other" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Source Name/Description</Label>
                            <Input
                              value={newIncomeSource.fields.sourceName || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, sourceName: e.target.value}
                              })}
                              placeholder="Enter source name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Source Type</Label>
                            <Input
                              value={newIncomeSource.fields.sourceType || ""}
                              onChange={(e) => setNewIncomeSource({
                                ...newIncomeSource, 
                                fields: {...newIncomeSource.fields, sourceType: e.target.value}
                              })}
                              placeholder="Enter source type"
                            />
                          </div>
                        </div>
                      )}
                      
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

                              {/* Add country list here - could use a proper country list */}
                              {["United States", "United Kingdom", "Canada", "Germany", "France", "Other"].map((country) => (
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
                              {currencies.map((currency) => (
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
                            />
                            <label htmlFor="current_income" className="text-sm cursor-pointer">
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
                            />
                            <label htmlFor="hypothetical_income" className="text-sm cursor-pointer">
                              This is a hypothetical income source that I expect to have after moving
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          if (newIncomeSource.category && newIncomeSource.amount > 0) {
                            const updatedSources = [...incomeSources, newIncomeSource]
                            updateFormData("finance.incomeSources", updatedSources)
                            setNewIncomeSource({
                              category: "Employment",
                              fields: {},
                              country: "",
                              amount: 0,
                              currency: "USD",
                              continueInDestination: true
                            })
                          }
                        }}
                        disabled={!newIncomeSource.category || newIncomeSource.amount <= 0}
                        className="w-full"
                      >
                        💾 Save Income Source
                      </Button>
                    </div>
                  </div>
                  
                  {/* Display existing income sources */}
                  {incomeSources.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">📋 Your Income Sources</h4>
                      <div className="space-y-3">
                        {incomeSources.map((source: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-lg bg-card">
                            <div className="grid md:grid-cols-5 gap-4 items-start">
                              <div>
                                <p className="font-medium">{source.category}</p>
                                {source.fields && Object.entries(source.fields).map(([key, value]: [string, any]) => 
                                  value ? (
                                    <p key={key} className="text-sm text-muted-foreground">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
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
                                <p className="text-sm">{source.continueInDestination ? "Current" : "Future"}</p>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const updatedSources = incomeSources.filter((_: any, i: number) => i !== idx)
                                    updateFormData("finance.incomeSources", updatedSources)
                                  }}
                                >
                                  🗑️
                                </Button>
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
          )}

          {/* Expected Employment Section - for users seeking income */}
          {(incomeSituation === "seeking_income" || incomeSituation === "current_and_new_income") && (
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Icons.search className="w-6 h-6 text-orange-600" />
                  Expected Employment
                </CardTitle>
                <p className="text-sm text-muted-foreground">Future income sources you plan to establish</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    💼 This section helps estimate your future tax obligations and visa requirements based on expected income in your destination country.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Liabilities Section (Streamlit style) */}
          <Card className="shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Icons.credit className="w-6 h-6 text-red-600" />
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
                  <h4 className="font-medium mb-4">Add Liability</h4>
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
                          {[
                            { key: "Mortgage", help: "Debt secured by a property" },
                            { key: "Loan", help: "Unsecured loan or personal loan" },
                            { key: "Credit Card", help: "Credit card debt" },
                            { key: "Other", help: "Alimony, child support, student loans, etc." }
                          ].map((cat) => (
                            <SelectItem key={cat.key} value={cat.key}>
                              {cat.key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newLiability.category && (
                        <p className="text-sm text-muted-foreground">
                          {newLiability.category === "Mortgage" ? "Debt secured by a property" :
                           newLiability.category === "Loan" ? "Unsecured loan or personal loan" :
                           newLiability.category === "Credit Card" ? "Credit card debt" :
                           "Alimony, child support, student loans, etc."}
                        </p>
                      )}
                    </div>
                    
                    {/* Dynamic fields based on category */}
                    {newLiability.category === "Mortgage" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Property Description</Label>
                          <Input
                            value={newLiability.fields.propertyDescription || ""}
                            onChange={(e) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, propertyDescription: e.target.value}
                            })}
                            placeholder="Describe the property"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Property Type</Label>
                          <Select
                            value={newLiability.fields.propertyType || ""}
                            onValueChange={(value) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, propertyType: value}
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
                        </div>
                      </div>
                    )}
                    
                    {newLiability.category === "Loan" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Lender Name</Label>
                          <Input
                            value={newLiability.fields.lender || ""}
                            onChange={(e) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, lender: e.target.value}
                            })}
                            placeholder="Enter lender name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Purpose of Loan</Label>
                          <Input
                            value={newLiability.fields.purpose || ""}
                            onChange={(e) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, purpose: e.target.value}
                            })}
                            placeholder="Enter loan purpose"
                          />
                        </div>
                      </div>
                    )}
                    
                    {newLiability.category === "Credit Card" && (
                      <div className="space-y-2">
                        <Label>Card Issuer</Label>
                        <Input
                          value={newLiability.fields.cardIssuer || ""}
                          onChange={(e) => setNewLiability({
                            ...newLiability, 
                            fields: {...newLiability.fields, cardIssuer: e.target.value}
                          })}
                          placeholder="Enter card issuer"
                        />
                      </div>
                    )}
                    
                    {newLiability.category === "Other" && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={newLiability.fields.description || ""}
                            onChange={(e) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, description: e.target.value}
                            })}
                            placeholder="Enter description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Input
                            value={newLiability.fields.type || ""}
                            onChange={(e) => setNewLiability({
                              ...newLiability, 
                              fields: {...newLiability.fields, type: e.target.value}
                            })}
                            placeholder="Enter type"
                          />
                        </div>
                      </div>
                    )}
                    
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

                            {["United States", "United Kingdom", "Canada", "Germany", "France", "Other"].map((country) => (
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
                            {currencies.map((currency) => (
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
                  <div className="space-y-4">
                    <h4 className="font-medium">📋 Your Liabilities</h4>
                    <div className="space-y-3">
                      {liabilities.map((liability: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <div className="grid md:grid-cols-6 gap-4 items-start">
                            <div>
                              <p className="font-medium">{liability.category}</p>
                              {liability.fields && Object.entries(liability.fields).map(([key, value]: [string, any]) => 
                                value ? (
                                  <p key={key} className="text-sm text-muted-foreground">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
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
                              <p className="font-medium">Payback</p>
                              <p className="text-sm">{liability.paybackYears > 0 ? `${liability.paybackYears} years` : "—"}</p>
                            </div>
                            <div>
                              <p className="font-medium">Interest</p>
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
                                🗑️
                              </Button>
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
        </>
      )}

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {/* Update continue logic for new income situation approach */}
            {!skipDetails && !incomeSituation && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Please select your income situation to continue.</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("finance")}
              isCheckingInfo={isCheckingInfo}
              sectionId="finance"
              onContinue={handleComplete}
              canContinue={skipDetails || !!incomeSituation}
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
