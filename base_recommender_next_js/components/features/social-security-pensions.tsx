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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, Info, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

// Voluntary Pension Schemes Component
function VoluntaryPensionSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const pensionSchemes = getFormData("socialSecurityAndPensions.futurePensionContributions.details") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newScheme, setNewScheme] = useState({
    pensionType: "Employer-sponsored plan",
    otherPensionType: "",
    contributionAmount: 0,
    currency: "USD",
    country: ""
  })

  const PENSION_SCHEME_TYPES = [
    "Employer-sponsored plan",
    "Personal retirement account", 
    "National voluntary scheme",
    "Industry-wide plan",
    "Cross-border pension",
    "Other"
  ]

  const addPensionScheme = () => {
    const schemeToAdd = {
      ...newScheme,
      pensionType: newScheme.pensionType === "Other" ? newScheme.otherPensionType : newScheme.pensionType
    }
    const updated = [...pensionSchemes, schemeToAdd]
    updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updated)
    setNewScheme({
      pensionType: "Employer-sponsored plan",
      otherPensionType: "",
      contributionAmount: 0,
      currency: "USD",
      country: ""
    })
    setShowAddForm(false)
  }

  const removePensionScheme = (index: number) => {
    const updated = pensionSchemes.filter((_: any, i: number) => i !== index)
    updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">💰 Voluntary Pension Arrangements</h3>
      <p className="text-sm text-muted-foreground">
        Includes private pensions, occupational schemes, or personal retirement accounts
      </p>

      {/* Existing pension schemes */}
      {pensionSchemes.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">📊 Registered Pension Schemes</h4>
          {pensionSchemes.map((scheme: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{scheme.pensionType}</p>
                  <p className="text-sm text-muted-foreground">Country: {scheme.country || "—"}</p>
                  <p className="text-sm font-medium mt-1">
                    Annual Contribution: {scheme.currency} {scheme.contributionAmount?.toLocaleString() || 0}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePensionScheme(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add pension scheme */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            ➕ Add New Pension Scheme
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Scheme"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Pension Scheme Type</Label>
              <Select
                value={newScheme.pensionType}
                onValueChange={(value) => setNewScheme({...newScheme, pensionType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PENSION_SCHEME_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newScheme.pensionType === "Other" && (
              <div>
                <Label>Specify Scheme Name *</Label>
                <Input
                  value={newScheme.otherPensionType}
                  onChange={(e) => setNewScheme({...newScheme, otherPensionType: e.target.value})}
                  placeholder="Enter specific scheme name"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Contribution Currency</Label>
                <Select
                  value={newScheme.currency}
                  onValueChange={(value) => setNewScheme({...newScheme, currency: value})}
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
                <Label>Annual Contribution Amount</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={newScheme.contributionAmount}
                  onChange={(e) => setNewScheme({...newScheme, contributionAmount: Number(e.target.value)})}
                  placeholder="Include employer matches if applicable"
                />
              </div>
            </div>

            <div>
              <Label>Governing Jurisdiction</Label>
              <Input
                value={newScheme.country}
                onChange={(e) => setNewScheme({...newScheme, country: e.target.value})}
                placeholder="Country where the pension scheme is regulated"
              />
            </div>

            <Button 
              onClick={addPensionScheme} 
              className="w-full"
              disabled={!newScheme.country || (newScheme.pensionType === "Other" && !newScheme.otherPensionType)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Scheme
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Existing Retirement Assets Component
function ExistingRetirementAssetsSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const existingPlans = getFormData("socialSecurityAndPensions.existingPlans.details") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPlan, setNewPlan] = useState({
    planType: "Defined benefit plan",
    currency: "USD",
    currentValue: 0,
    country: ""
  })

  const PLAN_TYPES = [
    "Defined benefit plan",
    "Defined contribution plan",
    "National social security entitlement",
    "Portable retirement account",
    "Annuity contract",
    "Other"
  ]

  const addExistingPlan = () => {
    const updated = [...existingPlans, newPlan]
    updateFormData("socialSecurityAndPensions.existingPlans.details", updated)
    setNewPlan({
      planType: "Defined benefit plan",
      currency: "USD",
      currentValue: 0,
      country: ""
    })
    setShowAddForm(false)
  }

  const removeExistingPlan = (index: number) => {
    const updated = existingPlans.filter((_: any, i: number) => i !== index)
    updateFormData("socialSecurityAndPensions.existingPlans.details", updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">🏦 Existing Retirement Assets</h3>
      <p className="text-sm text-muted-foreground">
        Includes any vested pension rights, frozen plans, or portable retirement accounts
      </p>

      {/* Existing retirement plans */}
      {existingPlans.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">📊 Registered Retirement Assets</h4>
          {existingPlans.map((plan: any, index: number) => (
            <div key={index} className="border rounded p-3 bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{plan.planType}</p>
                  <p className="text-sm text-muted-foreground">Country: {plan.country || "—"}</p>
                  <p className="text-sm font-medium mt-1">
                    Current Value: {plan.currency} {plan.currentValue?.toLocaleString() || 0}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExistingPlan(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add existing plan */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            ➕ Add Pension Asset
          </h4>
          <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Asset"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4">
            <div>
              <Label>Plan Category</Label>
              <Select
                value={newPlan.planType}
                onValueChange={(value) => setNewPlan({...newPlan, planType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select closest regulatory classification
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Asset Currency</Label>
                <Select
                  value={newPlan.currency}
                  onValueChange={(value) => setNewPlan({...newPlan, currency: value})}
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
                <Label>Current Actuarial Value</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={newPlan.currentValue}
                  onChange={(e) => setNewPlan({...newPlan, currentValue: Number(e.target.value)})}
                  placeholder="For DB plans, estimate transfer value"
                />
              </div>
            </div>

            <div>
              <Label>Governing Jurisdiction</Label>
              <Input
                value={newPlan.country}
                onChange={(e) => setNewPlan({...newPlan, country: e.target.value})}
                placeholder="Country where plan is regulated"
              />
            </div>

            <Button 
              onClick={addExistingPlan} 
              className="w-full"
              disabled={!newPlan.country}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pension Asset
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function SocialSecurityPensions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormStore()
  const currencies = useCurrencies()

  // Check if tax sections are skipped
  const skip = getFormData("skipTaxSections") ?? false

  // Current contributions
  const contributing = getFormData("socialSecurityAndPensions.currentCountryContributions.isContributing") ?? false
  const country = getFormData("socialSecurityAndPensions.currentCountryContributions.country") ?? ""
  const years = getFormData("socialSecurityAndPensions.currentCountryContributions.yearsOfContribution") ?? ""

  // Voluntary pension contributions
  const planningPensions = getFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning") ?? false
  
  // Existing retirement assets
  const hasExistingPlans = getFormData("socialSecurityAndPensions.existingPlans.hasPlans") ?? false

  // Validation
  const canContinue = skip || (contributing ? (country && years) : true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚖️ Social Security &amp; Pensions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          Understanding your pension situation helps determine tax obligations, qualify for benefits, ensure compliance with international agreements, and plan for retirement tax efficiency.
        </SectionHint>

        {skip ? (
          /* Skip mode - simplified summary */
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">🚀 Detailed Social Security / Pension inputs skipped</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Per your earlier choice to skip detailed tax sections
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => updateFormData("skipTaxSections", false)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Enable Details
              </Button>
            </div>
          </div>
        ) : (
          /* Full detailed mode */
          <>
            {/* Current Social Security Contributions */}
            <div className="space-y-4">
              <h3 className="font-semibold">🔐 Social Security/National Insurance Contributions</h3>
              <p className="text-sm text-muted-foreground">
                Applies to any government-mandated retirement/social insurance system
              </p>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="currently-contributing"
                    checked={contributing}
                    onCheckedChange={(checked) => 
                      updateFormData("socialSecurityAndPensions.currentCountryContributions.isContributing", !!checked)
                    }
                  />
                  <Label htmlFor="currently-contributing">
                    Currently making mandatory social security contributions
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Includes national insurance, superannuation, provident funds, or any state pension system
                </p>

                {contributing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Country of Contribution</Label>
                      <Input
                        value={country}
                        onChange={(e) => 
                          updateFormData("socialSecurityAndPensions.currentCountryContributions.country", e.target.value)
                        }
                        placeholder="Select country where you're currently contributing"
                      />
                    </div>
                    <div>
                      <Label>Total Contribution Years</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={years}
                        onChange={(e) => 
                          updateFormData("socialSecurityAndPensions.currentCountryContributions.yearsOfContribution", e.target.value)
                        }
                        placeholder="Including partial years"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Counts contributions to any national system, even if not continuous
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Voluntary Pension Arrangements */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="planning-pensions"
                  checked={planningPensions}
                  onCheckedChange={(checked) => 
                    updateFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning", !!checked)
                  }
                />
                <Label htmlFor="planning-pensions">
                  Making voluntary retirement contributions
                </Label>
              </div>

              {planningPensions && (
                <VoluntaryPensionSection 
                  updateFormData={updateFormData}
                  getFormData={getFormData}
                  currencies={currencies}
                />
              )}
            </div>

            <Separator />

            {/* Existing Retirement Assets */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-existing-plans"
                  checked={hasExistingPlans}
                  onCheckedChange={(checked) => 
                    updateFormData("socialSecurityAndPensions.existingPlans.hasPlans", !!checked)
                  }
                />
                <Label htmlFor="has-existing-plans">
                  Hold existing retirement/pension assets
                </Label>
              </div>

              {hasExistingPlans && (
                <ExistingRetirementAssetsSection 
                  updateFormData={updateFormData}
                  getFormData={getFormData}
                  currencies={currencies}
                />
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onComplete} 
          className="w-full"
          disabled={!canContinue}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 