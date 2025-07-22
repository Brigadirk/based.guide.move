"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, DollarSign, TrendingUp, AlertTriangle, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

// Income Sources Component
function IncomeSourcesSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const incomeSources = getFormData("finance.incomeSources") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSource, setNewSource] = useState({
    category: "Employment",
    fields: {},
    country: "",
    amount: 0,
    currency: "USD",
    continueInDestination: true
  })

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

  const addIncomeSource = () => {
    const updated = [...incomeSources, newSource]
    updateFormData("finance.incomeSources", updated)
    setNewSource({
      category: "Employment",
      fields: {},
      country: "",
      amount: 0,
      currency: "USD",
      continueInDestination: true
    })
    setShowAddForm(false)
  }

  const removeIncomeSource = (index: number) => {
    const updated = incomeSources.filter((_: any, i: number) => i !== index)
    updateFormData("finance.incomeSources", updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">💼 Current Income Sources</h3>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>🎯 Important: Report INCOME ONLY, not asset values</strong><br/>
          This section is for reporting <em>income you actually receive</em> from all sources.
        </AlertDescription>
      </Alert>

      {/* Existing income sources */}
      {incomeSources.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">📋 Your Income Sources</h4>
          {incomeSources.map((source: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{source.category}</span>
                    <Badge variant={source.continueInDestination ? "default" : "secondary"}>
                      {source.continueInDestination ? "Current" : "Future"}
                    </Badge>
                  </div>
                  {source.fields && Object.entries(source.fields).map(([key, value]: [string, any]) => 
                    value && (
                      <p key={key} className="text-sm text-muted-foreground">
                        {key.replace('_', ' ')}: {value}
                      </p>
                    )
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                    <span>Country: {source.country || "—"}</span>
                    <span className="font-medium">{source.currency} {source.amount.toLocaleString()}/year</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIncomeSource(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add income source */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            ➕ Add Income Source
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Source"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Income Category</Label>
              <Select
                value={newSource.category}
                onValueChange={(value) => setNewSource({...newSource, category: value, fields: {}})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCOME_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {INCOME_CATEGORIES[newSource.category as keyof typeof INCOME_CATEGORIES]?.help}
              </p>
            </div>

            {/* Category-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {INCOME_CATEGORIES[newSource.category as keyof typeof INCOME_CATEGORIES]?.fields.map((field) => (
                <div key={field}>
                  <Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                  {field === "investment_type" ? (
                    <Select
                      value={(newSource.fields as any)[field] || ""}
                      onValueChange={(value) => setNewSource({
                        ...newSource,
                        fields: {...newSource.fields, [field]: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stocks/Dividends">Stocks/Dividends</SelectItem>
                        <SelectItem value="Bonds/Interest">Bonds/Interest</SelectItem>
                        <SelectItem value="REITs">REITs</SelectItem>
                        <SelectItem value="ETFs">ETFs</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : field === "property_type" ? (
                    <Select
                      value={(newSource.fields as any)[field] || ""}
                      onValueChange={(value) => setNewSource({
                        ...newSource,
                        fields: {...newSource.fields, [field]: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={(newSource.fields as any)[field] || ""}
                      onChange={(e) => setNewSource({
                        ...newSource,
                        fields: {...newSource.fields, [field]: e.target.value}
                      })}
                      placeholder={`Enter ${field.replace('_', ' ')}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Country (source of funds)</Label>
                <Input
                  value={newSource.country}
                  onChange={(e) => setNewSource({...newSource, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label>Annual Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={newSource.amount}
                  onChange={(e) => setNewSource({...newSource, amount: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newSource.currency}
                  onValueChange={(value) => setNewSource({...newSource, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="continue-destination"
                checked={newSource.continueInDestination}
                onCheckedChange={(checked) => setNewSource({...newSource, continueInDestination: !!checked})}
              />
              <Label htmlFor="continue-destination">This is a current source that I will continue</Label>
            </div>

            <Button onClick={addIncomeSource} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Income Source
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Expected Employment Component
function ExpectedEmploymentSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const expectedJobs = getFormData("finance.expectedEmployment") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newJob, setNewJob] = useState({
    position: "",
    country: "",
    expectedIncome: 0,
    currency: "USD"
  })

  const addExpectedJob = () => {
    const updated = [...expectedJobs, newJob]
    updateFormData("finance.expectedEmployment", updated)
    setNewJob({ position: "", country: "", expectedIncome: 0, currency: "USD" })
    setShowAddForm(false)
  }

  const removeExpectedJob = (index: number) => {
    const updated = expectedJobs.filter((_: any, i: number) => i !== index)
    updateFormData("finance.expectedEmployment", updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">🔍 Expected Employment / New Income</h3>
      <p className="text-sm text-muted-foreground">
        Income sources you plan to establish in your destination country.
      </p>

      {/* Existing expected jobs */}
      {expectedJobs.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">📋 Your Expected Income Sources</h4>
          {expectedJobs.map((job: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{job.position}</p>
                  <p className="text-sm text-muted-foreground">{job.country}</p>
                  <p className="text-sm font-medium mt-1">{job.currency} {job.expectedIncome.toLocaleString()}/year</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExpectedJob(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add expected job */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Expected Employment
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Expected Job"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Position / Business Type *</Label>
                <Input
                  value={newJob.position}
                  onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                  placeholder="e.g., Software Engineer, Consultant"
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  value={newJob.country}
                  onChange={(e) => setNewJob({...newJob, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Expected Income *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newJob.expectedIncome}
                  onChange={(e) => setNewJob({...newJob, expectedIncome: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newJob.currency}
                  onValueChange={(value) => setNewJob({...newJob, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={addExpectedJob} 
              className="w-full"
              disabled={!newJob.position || !newJob.country || !newJob.expectedIncome}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expected Job
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Liabilities Component
function LiabilitiesSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const liabilities = getFormData("finance.liabilities") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLiability, setNewLiability] = useState({
    category: "Mortgage",
    fields: {},
    country: "",
    amount: 0,
    currency: "USD",
    paybackYears: 0,
    interestRate: 0
  })

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

  const addLiability = () => {
    const updated = [...liabilities, newLiability]
    updateFormData("finance.liabilities", updated)
    setNewLiability({
      category: "Mortgage",
      fields: {},
      country: "",
      amount: 0,
      currency: "USD",
      paybackYears: 0,
      interestRate: 0
    })
    setShowAddForm(false)
  }

  const removeLiability = (index: number) => {
    const updated = liabilities.filter((_: any, i: number) => i !== index)
    updateFormData("finance.liabilities", updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">📝 Liabilities & Debts</h3>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>🎯 Important: Report DEBTS ONLY, not asset values</strong><br/>
          This section is for reporting <em>debts you actually owe</em> from all sources.
        </AlertDescription>
      </Alert>

      {/* Existing liabilities */}
      {liabilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">📋 Your Liabilities</h4>
          {liabilities.map((liability: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-medium">{liability.category}</span>
                  {liability.fields && Object.entries(liability.fields).map(([key, value]: [string, any]) => 
                    value && (
                      <p key={key} className="text-sm text-muted-foreground">
                        {key.replace('_', ' ')}: {value}
                      </p>
                    )
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                    <span>Country: {liability.country || "—"}</span>
                    <span className="font-medium">{liability.currency} {liability.amount.toLocaleString()}</span>
                    {liability.paybackYears > 0 && <span>Payback: {liability.paybackYears} years</span>}
                    {liability.interestRate > 0 && <span>Interest: {liability.interestRate}%</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLiability(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add liability */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            ➕ Add Liability
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Liability"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Liability Category</Label>
              <Select
                value={newLiability.category}
                onValueChange={(value) => setNewLiability({...newLiability, category: value, fields: {}})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LIABILITY_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {LIABILITY_CATEGORIES[newLiability.category as keyof typeof LIABILITY_CATEGORIES]?.help}
              </p>
            </div>

            {/* Category-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LIABILITY_CATEGORIES[newLiability.category as keyof typeof LIABILITY_CATEGORIES]?.fields.map((field) => (
                <div key={field}>
                  <Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                  {field === "property_type" ? (
                    <Select
                      value={(newLiability.fields as any)[field] || ""}
                      onValueChange={(value) => setNewLiability({
                        ...newLiability,
                        fields: {...newLiability.fields, [field]: value}
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={(newLiability.fields as any)[field] || ""}
                      onChange={(e) => setNewLiability({
                        ...newLiability,
                        fields: {...newLiability.fields, [field]: e.target.value}
                      })}
                      placeholder={`Enter ${field.replace('_', ' ')}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Country</Label>
                <Input
                  value={newLiability.country}
                  onChange={(e) => setNewLiability({...newLiability, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={newLiability.amount}
                  onChange={(e) => setNewLiability({...newLiability, amount: Number(e.target.value)})}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newLiability.currency}
                  onValueChange={(value) => setNewLiability({...newLiability, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Payback timeline (years)</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={newLiability.paybackYears}
                  onChange={(e) => setNewLiability({...newLiability, paybackYears: Number(e.target.value)})}
                  placeholder="Years to pay off"
                />
              </div>
              <div>
                <Label>Interest rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={newLiability.interestRate}
                  onChange={(e) => setNewLiability({...newLiability, interestRate: Number(e.target.value)})}
                  placeholder="Annual interest rate"
                />
              </div>
            </div>

            <Button onClick={addLiability} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Liability
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function Finance({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormStore()
  const currencies = useCurrencies()

  /* ------------------------------------------------------------------ */
  /* Skip full finance section                                          */
  /* ------------------------------------------------------------------ */
  const skip: boolean = getFormData("finance.skipTaxSections") ?? false

  /* ------------------------------------------------------------------ */
  /* Income Status                                                      */
  /* ------------------------------------------------------------------ */
  const incomeStatus = getFormData("finance.incomeStatus") ?? ""

  /* ------------------------------------------------------------------ */
  /* Total wealth                                                       */
  /* ------------------------------------------------------------------ */
  const totalWealth = getFormData("finance.totalWealth") ?? 0
  const totalWealthCurrency = getFormData("finance.totalWealthCurrency") ?? "USD"

  /* ------------------------------------------------------------------ */
  /* Capital gains – planned first-year asset sales                     */
  /* ------------------------------------------------------------------ */
  type Sale = {
    asset: string
    type: string
    holdingPeriod: string
    expectedGain: string
    currency: string
    reason: string
  }

  const hasGains = getFormData("finance.capitalGains.hasGains") ?? false
  const futureSales: Sale[] = getFormData("finance.capitalGains.futureSales") ?? []

  /* ------------------------------------------------------------------ */
  /* Income Sources                                                     */
  /* ------------------------------------------------------------------ */
  const incomeSources = getFormData("finance.incomeSources") ?? []

  /* ------------------------------------------------------------------ */
  /* Liabilities                                                        */
  /* ------------------------------------------------------------------ */
  const liabilities = getFormData("finance.liabilities") ?? []

  if (skip) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Income and Assets (Summary Only)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              🚀 Detailed finance inputs skipped. We'll focus only on whether any financial thresholds apply to your relocation.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="undo-skip"
              checked={false}
              onCheckedChange={() => updateFormData("finance.skipTaxSections", false)}
            />
            <Label htmlFor="undo-skip">Show detailed finance sections</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onComplete} className="w-full">Continue</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Income and Assets
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint title="📋 About this section">
          This section helps us understand your financial situation to determine tax obligations and financial requirements for your move.
        </SectionHint>

        {/* Skip Option */}
        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="skip-finance"
              checked={skip}
              onCheckedChange={(checked) => updateFormData("finance.skipTaxSections", !!checked)}
            />
            <Label htmlFor="skip-finance" className="font-medium">
              🚀 I do not care about taxation or finance-related matters—just tell me whether there are any financial requirements for me to move.
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Check this to skip detailed finance inputs and focus only on financial thresholds for relocation.
          </p>
        </div>

        {/* Income Status */}
        <div className="space-y-3">
          <h3 className="font-semibold">What's your income situation after moving?</h3>
          <Select
            value={incomeStatus}
            onValueChange={(value) => updateFormData("finance.incomeStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your income situation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="continuing_income">🔄 Continue Current Income - Keep all existing income sources (remote work, investments, rental, etc.)</SelectItem>
              <SelectItem value="current_and_new_income">🔄➕ Current + New Income Mix - Keep some current sources, add new ones in destination</SelectItem>
              <SelectItem value="seeking_income">🔍 Need New Income Sources - Will find new work, start business, or other new sources</SelectItem>
              <SelectItem value="gainfully_unemployed">💰 Self-Funded (No Income) - Living off savings, gifts, or investments</SelectItem>
              <SelectItem value="dependent/supported">🤝 Financially Supported - Family, partner, scholarship, or institutional support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Total Wealth */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            💰 Total Wealth
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter <strong>everything you own</strong>, then indicate how much of that is tied up in your primary residence (often taxed differently or exempt).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Currency</Label>
              <Select
                value={totalWealthCurrency}
                onValueChange={(value) => updateFormData("finance.totalWealthCurrency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Total net worth *</Label>
              <Input
                type="number"
                min={0}
                value={totalWealth}
                onChange={(e) => updateFormData("finance.totalWealth", Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label>...of which is your primary residence</Label>
              <Input
                type="number"
                min={0}
                value={getFormData("finance.primaryResidenceValue") ?? 0}
                onChange={(e) => updateFormData("finance.primaryResidenceValue", Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Capital Gains */}
        <div className="space-y-4">
          <h3 className="font-semibold">📈 Planned Asset Sales in Your First Year (Capital Gains)</h3>
          <p className="text-sm text-muted-foreground">
            ℹ️ <strong>What are capital gains?</strong> Generally: <em>Sale price – (Purchase price + improvements + fees)</em>. 
            If that number is positive you have a gain; if negative it's a loss.
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-gains"
              checked={hasGains}
              onCheckedChange={(checked) => updateFormData("finance.capitalGains.hasGains", !!checked)}
            />
            <Label htmlFor="has-gains">I plan to sell assets in my first year</Label>
          </div>

          {hasGains && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Add Planned Asset Sale</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Asset name / description</Label>
                  <Input placeholder="e.g., Investment property in NYC" />
                </div>
                
                <div>
                  <Label>Asset type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="stocks">Stocks/ETFs</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="collectibles">Collectibles</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Holding period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">{"< 12 months (short-term)"}</SelectItem>
                      <SelectItem value="12-24">12 – 24 months</SelectItem>
                      <SelectItem value="2-3">2 – 3 years</SelectItem>
                      <SelectItem value="3-5">3 – 5 years</SelectItem>
                      <SelectItem value="5-10">5 – 10 years</SelectItem>
                      <SelectItem value="10+">{"> 10 years"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Estimated profit</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={0} placeholder="0.00" className="flex-1" />
                    <Select defaultValue="USD">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.slice(0, 5).map((curr) => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Reason for sale (optional)</Label>
                <Textarea placeholder="e.g., Need funds for relocation, downsizing..." />
              </div>
              
              <Button size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Planned Sale
              </Button>
            </div>
          )}

          {futureSales.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">📋 Your Planned Asset Sales</h4>
              {futureSales.map((sale, index) => (
                <div key={index} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sale.asset}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.type} • {sale.holdingPeriod} • Expected profit: {sale.currency} {sale.expectedGain}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = futureSales.filter((_, i) => i !== index)
                      updateFormData("finance.capitalGains.futureSales", updated)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Sources Section */}
        {(incomeStatus === "continuing_income" || incomeStatus === "current_and_new_income") && (
          <>
            <Separator />
            <IncomeSourcesSection 
              updateFormData={updateFormData} 
              getFormData={getFormData} 
              currencies={currencies}
            />
          </>
        )}

        {/* Expected Employment Section */}
        {(incomeStatus === "seeking_income" || incomeStatus === "current_and_new_income") && (
          <>
            <Separator />
            <ExpectedEmploymentSection 
              updateFormData={updateFormData} 
              getFormData={getFormData} 
              currencies={currencies}
            />
          </>
        )}

        {/* Liabilities Section */}
        <Separator />
        <LiabilitiesSection 
          updateFormData={updateFormData} 
          getFormData={getFormData} 
          currencies={currencies}
        />
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onComplete} 
          className="w-full"
          disabled={!skip && (!totalWealth || totalWealth <= 0)}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 