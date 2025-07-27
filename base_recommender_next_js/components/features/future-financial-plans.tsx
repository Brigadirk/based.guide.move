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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, Info, AlertTriangle, TrendingUp, Building, PiggyBank, Briefcase } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

type Investment = {
  type: string
  country: string
  estimatedValue: number
  currency: string
}

type PropertyTransaction = {
  transactionType: string
  country: string
  estimatedValue: number
  currency: string
}

type RetirementContribution = {
  accountType: string
  country: string
  contributionAmount: number
  currency: string
}

type BusinessChange = {
  changeType: string
  country: string
  estimatedValueImpact: number
  currency: string
}

// Investment Plans Component
function InvestmentPlansSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const investments = getFormData("individual.futureFinancialPlans.plannedInvestments") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInvestment, setNewInvestment] = useState({
    type: "Stocks",
    otherType: "",
    country: "",
    estimatedValue: 0,
    currency: "USD"
  })

  const INVESTMENT_TYPES = [
    "Stocks",
    "Bonds", 
    "Real Estate",
    "Cryptocurrency",
    "Mutual Funds",
    "Other"
  ]

  const addInvestment = () => {
    const investmentToAdd: Investment = {
      type: newInvestment.type === "Other" ? newInvestment.otherType : newInvestment.type,
      country: newInvestment.country,
      estimatedValue: newInvestment.estimatedValue,
      currency: newInvestment.currency
    }
    const updated = [...investments, investmentToAdd]
    updateFormData("individual.futureFinancialPlans.plannedInvestments", updated)
    setNewInvestment({
      type: "Stocks",
      otherType: "",
      country: "",
      estimatedValue: 0,
      currency: "USD"
    })
    setShowAddForm(false)
  }

  const removeInvestment = (index: number) => {
    const updated = investments.filter((_: any, i: number) => i !== index)
    updateFormData("individual.futureFinancialPlans.plannedInvestments", updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        <h3 className="font-semibold">📈 Investment Plans</h3>
      </div>

      {/* Existing investments */}
      {investments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Registered Investment Plans</h4>
          {investments.map((investment: Investment, index: number) => (
            <div key={index} className="border rounded p-3 bg-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{investment.type}</p>
                  <p className="text-sm text-muted-foreground">Country: {investment.country}</p>
                  <p className="text-sm font-medium mt-1">
                    Estimated Value: {investment.currency} {investment.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInvestment(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add investment */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Planned Investment
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Investment"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Investment Type</Label>
              <Select
                value={newInvestment.type}
                onValueChange={(value) => setNewInvestment({...newInvestment, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newInvestment.type === "Other" && (
              <div>
                <Label>Specify Investment Type *</Label>
                <Input
                  value={newInvestment.otherType}
                  onChange={(e) => setNewInvestment({...newInvestment, otherType: e.target.value})}
                  placeholder="Enter specific investment type"
                />
              </div>
            )}

            <div>
              <Label>Country of Investment</Label>
              <Input
                value={newInvestment.country}
                onChange={(e) => setNewInvestment({...newInvestment, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Estimated Value</Label>
                <Input
                  type="number"
                  min={0}
                  value={newInvestment.estimatedValue}
                  onChange={(e) => setNewInvestment({...newInvestment, estimatedValue: Number(e.target.value)})}
                  placeholder="In local currency"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newInvestment.currency}
                  onValueChange={(value) => setNewInvestment({...newInvestment, currency: value})}
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
              onClick={addInvestment} 
              className="w-full"
              disabled={!newInvestment.country || !newInvestment.estimatedValue || (newInvestment.type === "Other" && !newInvestment.otherType)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Investment
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Property Transactions Component
function PropertyTransactionsSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const transactions = getFormData("individual.futureFinancialPlans.plannedPropertyTransactions") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    transactionType: "Buy",
    country: "",
    estimatedValue: 0,
    currency: "USD"
  })

  const TRANSACTION_TYPES = ["Buy", "Sell", "Rent Out"]

  const addTransaction = () => {
    const transactionToAdd: PropertyTransaction = {
      transactionType: newTransaction.transactionType,
      country: newTransaction.country,
      estimatedValue: newTransaction.estimatedValue,
      currency: newTransaction.currency
    }
    const updated = [...transactions, transactionToAdd]
    updateFormData("individual.futureFinancialPlans.plannedPropertyTransactions", updated)
    setNewTransaction({
      transactionType: "Buy",
      country: "",
      estimatedValue: 0,
      currency: "USD"
    })
    setShowAddForm(false)
  }

  const removeTransaction = (index: number) => {
    const updated = transactions.filter((_: any, i: number) => i !== index)
    updateFormData("individual.futureFinancialPlans.plannedPropertyTransactions", updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building className="w-5 h-5" />
        <h3 className="font-semibold">🏠 Real Estate Plans</h3>
      </div>

      {/* Existing transactions */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Registered Property Transactions</h4>
          {transactions.map((transaction: PropertyTransaction, index: number) => (
            <div key={index} className="border rounded p-3 bg-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{transaction.transactionType} Property</p>
                  <p className="text-sm text-muted-foreground">Country: {transaction.country}</p>
                  <p className="text-sm font-medium mt-1">
                    Estimated {transaction.transactionType === "Buy" ? "Purchase Price" : "Value"}: {transaction.currency} {transaction.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTransaction(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add transaction */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Property Transaction
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Transaction"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Transaction Type</Label>
              <Select
                value={newTransaction.transactionType}
                onValueChange={(value) => setNewTransaction({...newTransaction, transactionType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country of Property</Label>
              <Input
                value={newTransaction.country}
                onChange={(e) => setNewTransaction({...newTransaction, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Estimated {newTransaction.transactionType === "Buy" ? "Purchase Price" : "Sale Value"}</Label>
                <Input
                  type="number"
                  min={0}
                  value={newTransaction.estimatedValue}
                  onChange={(e) => setNewTransaction({...newTransaction, estimatedValue: Number(e.target.value)})}
                  placeholder="In local currency"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newTransaction.currency}
                  onValueChange={(value) => setNewTransaction({...newTransaction, currency: value})}
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
              onClick={addTransaction} 
              className="w-full"
              disabled={!newTransaction.country || !newTransaction.estimatedValue}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Retirement Contributions Component
function RetirementContributionsSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const contributions = getFormData("individual.futureFinancialPlans.plannedRetirementContributions") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContribution, setNewContribution] = useState({
    accountType: "401(k)",
    otherAccountType: "",
    country: "",
    contributionAmount: 0,
    currency: "USD"
  })

  const ACCOUNT_TYPES = ["401(k)", "IRA/Roth IRA", "Pension Plan", "Other"]

  const addContribution = () => {
    const contributionToAdd: RetirementContribution = {
      accountType: newContribution.accountType === "Other" ? newContribution.otherAccountType : newContribution.accountType,
      country: newContribution.country,
      contributionAmount: newContribution.contributionAmount,
      currency: newContribution.currency
    }
    const updated = [...contributions, contributionToAdd]
    updateFormData("individual.futureFinancialPlans.plannedRetirementContributions", updated)
    setNewContribution({
      accountType: "401(k)",
      otherAccountType: "",
      country: "",
      contributionAmount: 0,
      currency: "USD"
    })
    setShowAddForm(false)
  }

  const removeContribution = (index: number) => {
    const updated = contributions.filter((_: any, i: number) => i !== index)
    updateFormData("individual.futureFinancialPlans.plannedRetirementContributions", updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PiggyBank className="w-5 h-5" />
        <h3 className="font-semibold">🏦 Retirement Plans</h3>
      </div>

      {/* Existing contributions */}
      {contributions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Registered Retirement Contributions</h4>
          {contributions.map((contribution: RetirementContribution, index: number) => (
            <div key={index} className="border rounded p-3 bg-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{contribution.accountType}</p>
                  <p className="text-sm text-muted-foreground">Country: {contribution.country}</p>
                  <p className="text-sm font-medium mt-1">
                    Planned Contribution: {contribution.currency} {contribution.contributionAmount.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContribution(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add contribution */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Retirement Contribution
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Contribution"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Retirement Account Type</Label>
              <Select
                value={newContribution.accountType}
                onValueChange={(value) => setNewContribution({...newContribution, accountType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newContribution.accountType === "Other" && (
              <div>
                <Label>Specify Account Type *</Label>
                <Input
                  value={newContribution.otherAccountType}
                  onChange={(e) => setNewContribution({...newContribution, otherAccountType: e.target.value})}
                  placeholder="Enter specific account type"
                />
              </div>
            )}

            <div>
              <Label>Country of Account</Label>
              <Input
                value={newContribution.country}
                onChange={(e) => setNewContribution({...newContribution, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Planned Contribution Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={newContribution.contributionAmount}
                  onChange={(e) => setNewContribution({...newContribution, contributionAmount: Number(e.target.value)})}
                  placeholder="In local currency"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newContribution.currency}
                  onValueChange={(value) => setNewContribution({...newContribution, currency: value})}
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
              onClick={addContribution} 
              className="w-full"
              disabled={!newContribution.country || !newContribution.contributionAmount || (newContribution.accountType === "Other" && !newContribution.otherAccountType)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contribution
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Business Changes Component
function BusinessChangesSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const businessChanges = getFormData("individual.futureFinancialPlans.plannedBusinessChanges") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newChange, setNewChange] = useState({
    changeType: "Start New Business",
    country: "",
    estimatedValueImpact: 0,
    currency: "USD"
  })

  const CHANGE_TYPES = [
    "Start New Business",
    "Sell Existing Business", 
    "Expand Business to Another Country"
  ]

  const addBusinessChange = () => {
    const changeToAdd: BusinessChange = {
      changeType: newChange.changeType,
      country: newChange.country,
      estimatedValueImpact: newChange.estimatedValueImpact,
      currency: newChange.currency
    }
    const updated = [...businessChanges, changeToAdd]
    updateFormData("individual.futureFinancialPlans.plannedBusinessChanges", updated)
    setNewChange({
      changeType: "Start New Business",
      country: "",
      estimatedValueImpact: 0,
      currency: "USD"
    })
    setShowAddForm(false)
  }

  const removeBusinessChange = (index: number) => {
    const updated = businessChanges.filter((_: any, i: number) => i !== index)
    updateFormData("individual.futureFinancialPlans.plannedBusinessChanges", updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        <h3 className="font-semibold">💼 Business Plans</h3>
      </div>

      {/* Existing business changes */}
      {businessChanges.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Registered Business Changes</h4>
          {businessChanges.map((change: BusinessChange, index: number) => (
            <div key={index} className="border rounded p-3 bg-card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{change.changeType}</p>
                  <p className="text-sm text-muted-foreground">Country: {change.country}</p>
                  <p className="text-sm font-medium mt-1">
                    Estimated {change.changeType === "Start New Business" ? "Startup Cost" : "Value Impact"}: {change.currency} {change.estimatedValueImpact.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBusinessChange(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add business change */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Business Change
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Business Change"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Change Type</Label>
              <Select
                value={newChange.changeType}
                onValueChange={(value) => setNewChange({...newChange, changeType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country of Business Activity</Label>
              <Input
                value={newChange.country}
                onChange={(e) => setNewChange({...newChange, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Estimated {newChange.changeType === "Start New Business" ? "Startup Cost" : "Value Impact"}</Label>
                <Input
                  type="number"
                  min={0}
                  value={newChange.estimatedValueImpact}
                  onChange={(e) => setNewChange({...newChange, estimatedValueImpact: Number(e.target.value)})}
                  placeholder="In local currency"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={newChange.currency}
                  onValueChange={(value) => setNewChange({...newChange, currency: value})}
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
              onClick={addBusinessChange} 
              className="w-full"
              disabled={!newChange.country || !newChange.estimatedValueImpact}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Business Change
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FutureFinancialPlans({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const currencies = useCurrencies()

  // Check if finance details are being skipped
  const skip = getFormData("finance.skipDetails") ?? false

  // Get all plan data
  const investments = getFormData("individual.futureFinancialPlans.plannedInvestments") ?? []
  const propertyTransactions = getFormData("individual.futureFinancialPlans.plannedPropertyTransactions") ?? []
  const retirementContributions = getFormData("individual.futureFinancialPlans.plannedRetirementContributions") ?? []
  const businessChanges = getFormData("individual.futureFinancialPlans.plannedBusinessChanges") ?? []

  // Validation - at least one plan or skip
  const hasAnyPlans = investments.length > 0 || propertyTransactions.length > 0 || 
                     retirementContributions.length > 0 || businessChanges.length > 0
  const canContinue = skip || hasAnyPlans
  
  const handleContinue = () => {
    markSectionComplete("future-plans")
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏡 Future Financial Plans</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          Planning your future financial activities helps ensure tax compliance and optimize your financial strategy across jurisdictions.
        </SectionHint>

        {skip ? (
          /* Skip mode - simplified summary */
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">🚀 Future-financial-plans inputs skipped</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Per your earlier choice to skip detailed finance sections
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => updateFormData("finance.skipDetails", false)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Enable Details
              </Button>
            </div>
          </div>
        ) : (
          /* Full detailed mode */
          <>
            {/* Investment Plans */}
            <InvestmentPlansSection 
              updateFormData={updateFormData}
              getFormData={getFormData}
              currencies={currencies}
            />

            <Separator />

            {/* Property Transactions */}
            <PropertyTransactionsSection 
              updateFormData={updateFormData}
              getFormData={getFormData}
              currencies={currencies}
            />

            <Separator />

            {/* Retirement Contributions */}
            <RetirementContributionsSection 
              updateFormData={updateFormData}
              getFormData={getFormData}
              currencies={currencies}
            />

            <Separator />

            {/* Business Changes */}
            <BusinessChangesSection 
              updateFormData={updateFormData}
              getFormData={getFormData}
              currencies={currencies}
            />
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleContinue} 
          className="w-full"
          disabled={!canContinue}
        >
          {hasAnyPlans ? "Continue" : "Continue (skip section)"}
        </Button>
      </CardFooter>
    </Card>
  )
} 