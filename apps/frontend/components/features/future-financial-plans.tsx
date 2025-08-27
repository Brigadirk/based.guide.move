"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, TrendingUp, Building, PiggyBank, Briefcase, HelpCircle } from "lucide-react"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { getCountries } from "@/lib/utils/country-utils"

export function FutureFinancialPlans({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()
  const countries = getCountries()

  // Check if finance details are being skipped
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  // Get existing data (arrays)
  const plannedInvestments = getFormData("futureFinancialPlans.plannedInvestments") ?? []
  const plannedPropertyTransactions = getFormData("futureFinancialPlans.plannedPropertyTransactions") ?? []
  const plannedRetirementContributions = getFormData("futureFinancialPlans.plannedRetirementContributions") ?? []
  const plannedBusinessChanges = getFormData("futureFinancialPlans.plannedBusinessChanges") ?? []

  // Form states for each section
  const [newInvestment, setNewInvestment] = useState({
    type: "Stocks",
    otherType: "",
    country: "",
    estimatedValue: 0,
    currency: "USD"
  })

  const [newPropertyTransaction, setNewPropertyTransaction] = useState({
    transactionType: "Buy",
    country: "",
    estimatedValue: 0,
    currency: "USD"
  })

  const [newRetirementContribution, setNewRetirementContribution] = useState({
    accountType: "401(k)",
    otherAccountType: "",
    country: "",
    contributionAmount: 0,
    currency: "USD"
  })

  const [newBusinessChange, setNewBusinessChange] = useState({
    changeType: "Start New Business",
    country: "",
    estimatedValueImpact: 0,
    currency: "USD"
  })

  const handleComplete = () => {
    markSectionComplete("futureFinancialPlans")
    onComplete()
  }

  // Helper functions to add items
  const addInvestment = () => {
    if (newInvestment.estimatedValue > 0 && newInvestment.country) {
      const investment = {
        type: newInvestment.type !== "Other" ? newInvestment.type : newInvestment.otherType,
        country: newInvestment.country,
        estimatedValue: newInvestment.estimatedValue,
        currency: newInvestment.currency
      }
      const updated = [...plannedInvestments, investment]
      updateFormData("futureFinancialPlans.plannedInvestments", updated)
      setNewInvestment({
        type: "Stocks",
        otherType: "",
        country: "",
        estimatedValue: 0,
        currency: "USD"
      })
    }
  }

  const addPropertyTransaction = () => {
    if (newPropertyTransaction.estimatedValue > 0 && newPropertyTransaction.country) {
      const transaction = {
        transactionType: newPropertyTransaction.transactionType,
        country: newPropertyTransaction.country,
        estimatedValue: newPropertyTransaction.estimatedValue,
        currency: newPropertyTransaction.currency
      }
      const updated = [...plannedPropertyTransactions, transaction]
      updateFormData("futureFinancialPlans.plannedPropertyTransactions", updated)
      setNewPropertyTransaction({
        transactionType: "Buy",
        country: "",
        estimatedValue: 0,
        currency: "USD"
      })
    }
  }

  const addRetirementContribution = () => {
    if (newRetirementContribution.contributionAmount > 0 && newRetirementContribution.country) {
      const contribution = {
        accountType: newRetirementContribution.accountType !== "Other" ? newRetirementContribution.accountType : newRetirementContribution.otherAccountType,
        country: newRetirementContribution.country,
        contributionAmount: newRetirementContribution.contributionAmount,
        currency: newRetirementContribution.currency
      }
      const updated = [...plannedRetirementContributions, contribution]
      updateFormData("futureFinancialPlans.plannedRetirementContributions", updated)
      setNewRetirementContribution({
        accountType: "401(k)",
        otherAccountType: "",
        country: "",
        contributionAmount: 0,
        currency: "USD"
      })
    }
  }

  const addBusinessChange = () => {
    if (newBusinessChange.estimatedValueImpact > 0 && newBusinessChange.country) {
      const businessChange = {
        changeType: newBusinessChange.changeType,
        country: newBusinessChange.country,
        estimatedValueImpact: newBusinessChange.estimatedValueImpact,
        currency: newBusinessChange.currency
      }
      const updated = [...plannedBusinessChanges, businessChange]
      updateFormData("futureFinancialPlans.plannedBusinessChanges", updated)
      setNewBusinessChange({
        changeType: "Start New Business",
        country: "",
        estimatedValueImpact: 0,
        currency: "USD"
      })
    }
  }

  // Helper functions to remove items
  const removeInvestment = (index: number) => {
    const updated = plannedInvestments.filter((_: any, i: number) => i !== index)
    updateFormData("futureFinancialPlans.plannedInvestments", updated)
  }

  const removePropertyTransaction = (index: number) => {
    const updated = plannedPropertyTransactions.filter((_: any, i: number) => i !== index)
    updateFormData("futureFinancialPlans.plannedPropertyTransactions", updated)
  }

  const removeRetirementContribution = (index: number) => {
    const updated = plannedRetirementContributions.filter((_: any, i: number) => i !== index)
    updateFormData("futureFinancialPlans.plannedRetirementContributions", updated)
  }

  const removeBusinessChange = (index: number) => {
    const updated = plannedBusinessChanges.filter((_: any, i: number) => i !== index)
    updateFormData("futureFinancialPlans.plannedBusinessChanges", updated)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          🏡 Future Financial Plans
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your planned financial activities and future investments
        </p>
      </div>

      <SectionHint title="About this section">
        Future financial planning information helps tax advisors understand your long-term intentions, 
        potential tax implications of upcoming transactions, and ensures compliance with international 
        reporting requirements for planned activities.
      </SectionHint>

      {/* Skip Mode Indicator */}
      {skipFinanceDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-green-600" />
              Future Financial Plans Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Per your earlier choice in finance section</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                🚀 Future-financial-plans inputs skipped per your earlier choice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show detailed sections if not skipped */}
      {!skipFinanceDetails && (
        <>
          {/* 1. Investment Plans Section */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Investment Plans
              </CardTitle>
              <p className="text-sm text-muted-foreground">Planned investments and financial assets</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add Investment Form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Planned Investment</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Investment Type</Label>
                        <Select
                          value={newInvestment.type}
                          onValueChange={(value) => setNewInvestment({...newInvestment, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Stocks", "Bonds", "Real Estate", "Cryptocurrency", "Mutual Funds", "Other"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {newInvestment.type === "Other" && (
                        <div className="space-y-2">
                          <Label>Specify Investment Type</Label>
                          <Input
                            value={newInvestment.otherType}
                            onChange={(e) => setNewInvestment({...newInvestment, otherType: e.target.value})}
                            placeholder="Enter investment type"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Country of Investment</Label>
                        <Select
                          value={newInvestment.country}
                          onValueChange={(value) => setNewInvestment({...newInvestment, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
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
                        <Label>Estimated Value</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={newInvestment.estimatedValue}
                          onChange={(e) => setNewInvestment({...newInvestment, estimatedValue: parseFloat(e.target.value) || 0})}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newInvestment.currency}
                          onValueChange={(value) => setNewInvestment({...newInvestment, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <Button 
                      onClick={addInvestment}
                      disabled={!newInvestment.estimatedValue || !newInvestment.country || 
                               (newInvestment.type === "Other" && !newInvestment.otherType)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Investment
                    </Button>
                  </div>
                </div>

                {/* Display existing investments */}
                {plannedInvestments.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Your Planned Investments</h5>
                    {plannedInvestments.map((investment: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card flex justify-between items-center">
                        <div>
                          <p className="font-medium">{investment.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {investment.currency} {investment.estimatedValue?.toLocaleString()} in {investment.country}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeInvestment(idx)}
                        >
                          ❌
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Real Estate Plans Section */}
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Building className="w-6 h-6 text-green-600" />
                Real Estate Plans
              </CardTitle>
              <p className="text-sm text-muted-foreground">Planned property transactions</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add Property Transaction Form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Property Transaction</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <Select
                          value={newPropertyTransaction.transactionType}
                          onValueChange={(value) => setNewPropertyTransaction({...newPropertyTransaction, transactionType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Buy", "Sell", "Rent Out"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Country of Property</Label>
                        <Select
                          value={newPropertyTransaction.country}
                          onValueChange={(value) => setNewPropertyTransaction({...newPropertyTransaction, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
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
                        <Label>
                          Estimated {newPropertyTransaction.transactionType === "Buy" ? "Purchase Price" : "Sale Value"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="10000"
                          value={newPropertyTransaction.estimatedValue}
                          onChange={(e) => setNewPropertyTransaction({...newPropertyTransaction, estimatedValue: parseFloat(e.target.value) || 0})}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newPropertyTransaction.currency}
                          onValueChange={(value) => setNewPropertyTransaction({...newPropertyTransaction, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <Button 
                      onClick={addPropertyTransaction}
                      disabled={!newPropertyTransaction.estimatedValue || !newPropertyTransaction.country}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property Transaction
                    </Button>
                  </div>
                </div>

                {/* Display existing property transactions */}
                {plannedPropertyTransactions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Your Property Transactions</h5>
                    {plannedPropertyTransactions.map((transaction: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card flex justify-between items-center">
                        <div>
                          <p className="font-medium">{transaction.transactionType} Property</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.currency} {transaction.estimatedValue?.toLocaleString()} in {transaction.country}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePropertyTransaction(idx)}
                        >
                          ❌
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Retirement Plans Section */}
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <PiggyBank className="w-6 h-6 text-orange-600" />
                Retirement Plans
              </CardTitle>
              <p className="text-sm text-muted-foreground">Planned retirement contributions</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add Retirement Contribution Form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Retirement Contribution</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Retirement Account Type</Label>
                        <Select
                          value={newRetirementContribution.accountType}
                          onValueChange={(value) => setNewRetirementContribution({...newRetirementContribution, accountType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["401(k)", "IRA/Roth IRA", "Pension Plan", "Other"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {newRetirementContribution.accountType === "Other" && (
                        <div className="space-y-2">
                          <Label>Specify Account Type</Label>
                          <Input
                            value={newRetirementContribution.otherAccountType}
                            onChange={(e) => setNewRetirementContribution({...newRetirementContribution, otherAccountType: e.target.value})}
                            placeholder="Enter account type"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Country of Account</Label>
                        <Select
                          value={newRetirementContribution.country}
                          onValueChange={(value) => setNewRetirementContribution({...newRetirementContribution, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
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
                        <Label>Planned Contribution Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="500"
                          value={newRetirementContribution.contributionAmount}
                          onChange={(e) => setNewRetirementContribution({...newRetirementContribution, contributionAmount: parseFloat(e.target.value) || 0})}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newRetirementContribution.currency}
                          onValueChange={(value) => setNewRetirementContribution({...newRetirementContribution, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <Button 
                      onClick={addRetirementContribution}
                      disabled={!newRetirementContribution.contributionAmount || !newRetirementContribution.country || 
                               (newRetirementContribution.accountType === "Other" && !newRetirementContribution.otherAccountType)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contribution
                    </Button>
                  </div>
                </div>

                {/* Display existing retirement contributions */}
                {plannedRetirementContributions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Your Retirement Contributions</h5>
                    {plannedRetirementContributions.map((contribution: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card flex justify-between items-center">
                        <div>
                          <p className="font-medium">{contribution.accountType}</p>
                          <p className="text-sm text-muted-foreground">
                            {contribution.currency} {contribution.contributionAmount?.toLocaleString()} in {contribution.country}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRetirementContribution(idx)}
                        >
                          ❌
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. Business Plans Section */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-purple-600" />
                Business Plans
              </CardTitle>
              <p className="text-sm text-muted-foreground">Planned business changes and activities</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add Business Change Form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Business Change</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Change Type</Label>
                        <Select
                          value={newBusinessChange.changeType}
                          onValueChange={(value) => setNewBusinessChange({...newBusinessChange, changeType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Start New Business", "Sell Existing Business", "Expand Business to Another Country"].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Country of Business Activity</Label>
                        <Select
                          value={newBusinessChange.country}
                          onValueChange={(value) => setNewBusinessChange({...newBusinessChange, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
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
                        <Label>
                          Estimated {newBusinessChange.changeType === "Start New Business" ? "Startup Cost" : "Value Impact"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="5000"
                          value={newBusinessChange.estimatedValueImpact}
                          onChange={(e) => setNewBusinessChange({...newBusinessChange, estimatedValueImpact: parseFloat(e.target.value) || 0})}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newBusinessChange.currency}
                          onValueChange={(value) => setNewBusinessChange({...newBusinessChange, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                    <Button 
                      onClick={addBusinessChange}
                      disabled={!newBusinessChange.estimatedValueImpact || !newBusinessChange.country}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Business Change
                    </Button>
                  </div>
                </div>

                {/* Display existing business changes */}
                {plannedBusinessChanges.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Your Business Changes</h5>
                    {plannedBusinessChanges.map((businessChange: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card flex justify-between items-center">
                        <div>
                          <p className="font-medium">{businessChange.changeType}</p>
                          <p className="text-sm text-muted-foreground">
                            {businessChange.currency} {businessChange.estimatedValueImpact?.toLocaleString()} in {businessChange.country}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBusinessChange(idx)}
                        >
                          ❌
                        </Button>
                      </div>
                    ))}
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
            <div className="text-center text-sm text-muted-foreground">
              This section is optional. You can continue even if you don't have future financial plans to report.
            </div>

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("future-plans")}
              isCheckingInfo={isCheckingInfo}
              sectionId="future-plans"
              onContinue={handleComplete}
              canContinue={true}
              nextSectionName="Additional Information"
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