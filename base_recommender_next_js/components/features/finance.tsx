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
import { Plus, Trash2, DollarSign, TrendingUp, AlertTriangle, Info, Briefcase, PiggyBank, CreditCard, Home, Building, Target, Zap } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

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
  const currencies = useCurrencies()

  // Get skip status (now controlled from sidebar)
  const skipDetails = getFormData("finance.skipDetails") ?? false

  // Income Sources
  const incomeSources = getFormData("finance.incomeSources") ?? []
  const [newIncomeSource, setNewIncomeSource] = useState({
    category: "Employment",
    fields: {},
    country: "",
    amount: 0,
    currency: "USD",
    continueInDestination: true
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

  const totalIncome = incomeSources.reduce((sum, source) => sum + (source.amount || 0), 0)
  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0)
  const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0)
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
          <DollarSign className="w-7 h-7 text-primary" />
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
              <Zap className="w-6 h-6 text-green-600" />
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
          {/* Total Wealth Card */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-emerald-600" />
            Total Wealth
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your overall net worth for visa applications</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select
                  value={getFormData("finance.totalWealth.currency") ?? "USD"}
                  onValueChange={(v) => updateFormData("finance.totalWealth.currency", v)}
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
              <div className="space-y-2">
                <Label>Total net worth *</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="500000"
                  value={getFormData("finance.totalWealth.total") ?? ""}
                  onChange={(e) => updateFormData("finance.totalWealth.total", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary residence value</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="300000"
                  value={getFormData("finance.totalWealth.primaryResidence") ?? ""}
                  onChange={(e) => updateFormData("finance.totalWealth.primaryResidence", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter everything you own, then indicate how much is tied up in your primary residence (often taxed differently).
            </p>
          </div>
        </CardContent>
      </Card>

          {/* Financial Overview Card */}
      {(incomeSources.length > 0 || assets.length > 0 || debts.length > 0) && (
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Financial Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">Summary of your financial position</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Annual Income</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${totalAssets.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Assets</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">${totalDebts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Debts</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netWorth.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Net Worth</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Sources Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Income Sources
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your current sources of income</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Existing income sources */}
            {incomeSources.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your Income Sources</h4>
                <div className="grid gap-4">
                  {incomeSources.map((source, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">{source.category}</Badge>
                            {source.continueInDestination && <Badge variant="outline">Continuing</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Amount:</strong> ${source.amount?.toLocaleString()} {source.currency} / year</p>
                            <p><strong>Country:</strong> {source.country}</p>
                            {Object.entries(source.fields || {}).map(([key, value]) => (
                              <p key={key}><strong>{key.replace('_', ' ')}:</strong> {value}</p>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFormData("finance.incomeSources", 
                            incomeSources.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add income source form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Income Source</h4>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Income category *</Label>
                    <Select
                      value={newIncomeSource.category}
                      onValueChange={(v) => setNewIncomeSource({...newIncomeSource, category: v, fields: {}})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INCOME_CATEGORIES).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {INCOME_CATEGORIES[newIncomeSource.category]?.help}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Country of income *</Label>
                    <Input
                      placeholder="e.g., United States"
                      value={newIncomeSource.country}
                      onChange={(e) => setNewIncomeSource({...newIncomeSource, country: e.target.value})}
                    />
                  </div>
                </div>

                {/* Dynamic fields based on category */}
                {INCOME_CATEGORIES[newIncomeSource.category]?.fields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} *</Label>
                    <Input
                      placeholder={`Enter ${field.replace('_', ' ')}`}
                      value={newIncomeSource.fields[field] || ""}
                      onChange={(e) => setNewIncomeSource({
                        ...newIncomeSource,
                        fields: {...newIncomeSource.fields, [field]: e.target.value}
                      })}
                    />
                  </div>
                ))}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual amount *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="50000"
                      value={newIncomeSource.amount || ""}
                      onChange={(e) => setNewIncomeSource({...newIncomeSource, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={newIncomeSource.currency}
                      onValueChange={(v) => setNewIncomeSource({...newIncomeSource, currency: v})}
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

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="continue_income"
                    checked={newIncomeSource.continueInDestination}
                    onCheckedChange={(v) => setNewIncomeSource({...newIncomeSource, continueInDestination: !!v})}
                  />
                  <Label htmlFor="continue_income">I plan to continue this income in my destination country</Label>
                </div>

                <Button
                  disabled={!canAddIncomeSource}
                  onClick={() => {
                    updateFormData("finance.incomeSources", [...incomeSources, newIncomeSource])
                    setNewIncomeSource({
                      category: "Employment",
                      fields: {},
                      country: "",
                      amount: 0,
                      currency: "USD",
                      continueInDestination: true
                    })
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income Source
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <PiggyBank className="w-6 h-6 text-blue-600" />
            Assets & Savings
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your current assets, savings, and investments</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Existing assets */}
            {assets.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your Assets</h4>
                <div className="grid gap-4">
                  {assets.map((asset, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">{asset.type}</Badge>
                            {asset.liquid && <Badge variant="outline">Liquid</Badge>}
                          </div>
                          <p className="font-medium mb-1">{asset.description}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Value:</strong> ${asset.value?.toLocaleString()} {asset.currency}</p>
                            {asset.location && <p><strong>Location:</strong> {asset.location}</p>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFormData("finance.assets", 
                            assets.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add asset form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Asset</h4>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asset type *</Label>
                    <Select
                      value={newAsset.type}
                      onValueChange={(v) => setNewAsset({...newAsset, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank Account">Bank Account</SelectItem>
                        <SelectItem value="Investment Account">Investment Account</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      placeholder="e.g., Savings account, Tesla Model 3, etc."
                      value={newAsset.description}
                      onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current value *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="25000"
                      value={newAsset.value || ""}
                      onChange={(e) => setNewAsset({...newAsset, value: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={newAsset.currency}
                      onValueChange={(v) => setNewAsset({...newAsset, currency: v})}
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
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g., Chase Bank USA"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="liquid_asset"
                    checked={newAsset.liquid}
                    onCheckedChange={(v) => setNewAsset({...newAsset, liquid: !!v})}
                  />
                  <Label htmlFor="liquid_asset">This is a liquid asset (easily convertible to cash)</Label>
                </div>

                <Button
                  disabled={!canAddAsset}
                  onClick={() => {
                    updateFormData("finance.assets", [...assets, newAsset])
                    setNewAsset({
                      type: "Bank Account",
                      description: "",
                      value: 0,
                      currency: "USD",
                      liquid: true,
                      location: ""
                    })
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts & Liabilities Card */}
      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-red-600" />
            Debts & Liabilities
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your current debts and financial obligations</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Existing debts */}
            {debts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your Debts</h4>
                <div className="grid gap-4">
                  {debts.map((debt, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">{debt.type}</Badge>
                          <p className="font-medium mb-1">{debt.description}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Amount:</strong> ${debt.amount?.toLocaleString()} {debt.currency}</p>
                            <p><strong>Monthly payment:</strong> ${debt.monthlyPayment?.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateFormData("finance.debts", 
                            debts.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add debt form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Debt</h4>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Debt type *</Label>
                    <Select
                      value={newDebt.type}
                      onValueChange={(v) => setNewDebt({...newDebt, type: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Student Loan">Student Loan</SelectItem>
                        <SelectItem value="Mortgage">Mortgage</SelectItem>
                        <SelectItem value="Car Loan">Car Loan</SelectItem>
                        <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                        <SelectItem value="Business Loan">Business Loan</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      placeholder="e.g., Chase Freedom card, Home mortgage, etc."
                      value={newDebt.description}
                      onChange={(e) => setNewDebt({...newDebt, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Total amount *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={newDebt.amount || ""}
                      onChange={(e) => setNewDebt({...newDebt, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency *</Label>
                    <Select
                      value={newDebt.currency}
                      onValueChange={(v) => setNewDebt({...newDebt, currency: v})}
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
                  <div className="space-y-2">
                    <Label>Monthly payment *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="200"
                      value={newDebt.monthlyPayment || ""}
                      onChange={(e) => setNewDebt({...newDebt, monthlyPayment: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <Button
                  disabled={!canAddDebt}
                  onClick={() => {
                    updateFormData("finance.debts", [...debts, newDebt])
                    setNewDebt({
                      type: "Credit Card",
                      description: "",
                      amount: 0,
                      currency: "USD",
                      monthlyPayment: 0
                    })
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Debt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Goals Card */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-600" />
            Financial Goals & Planning
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your investment preferences and financial objectives</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Investment goals and preferences</Label>
              <Textarea
                placeholder="Describe your investment objectives, risk tolerance, time horizon..."
                value={investmentGoals}
                onChange={(e) => updateFormData("finance.investmentGoals", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Risk tolerance</Label>
              <Select
                value={riskTolerance}
                onValueChange={(v) => updateFormData("finance.riskTolerance", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your risk tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conservative">Conservative - Prefer stable, low-risk investments</SelectItem>
                  <SelectItem value="Moderate">Moderate - Balanced approach to risk and return</SelectItem>
                  <SelectItem value="Aggressive">Aggressive - Willing to take high risks for high returns</SelectItem>
                  <SelectItem value="Very Aggressive">Very Aggressive - Maximum risk for maximum returns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Retirement planning thoughts</Label>
              <Textarea
                placeholder="Your retirement goals, timeline, and any specific considerations..."
                value={retirementPlanning}
                onChange={(e) => updateFormData("finance.retirementPlanning", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

        </>
      )}

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {!canContinue && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Complete required fields:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {incomeSources.length === 0 && <li>At least one income source</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              disabled={!canContinue}
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Continue to Social Security & Pensions
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 