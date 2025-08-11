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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, Info, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

type Deduction = {
  type: string
  amount: number
  currency: string
  country: string
  date?: string
  notes?: string
}

// Alimony Section Component
function AlimonySection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const deductions = getFormData("taxDeductionsAndCredits.potentialDeductions") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    alimonyType: "Paid",
    country: "",
    agreementDate: "",
    amount: 0,
    currency: "USD"
  })

  const addAlimonyEntry = () => {
    const entryToAdd: Deduction = {
      type: `Alimony ${newEntry.alimonyType}`,
      amount: newEntry.amount,
      currency: newEntry.currency,
      country: newEntry.country,
      date: newEntry.agreementDate,
      notes: `Governed by ${newEntry.country} law`
    }
    const updated = [...deductions, entryToAdd]
    updateFormData("taxDeductionsAndCredits.potentialDeductions", updated)
    setNewEntry({
      alimonyType: "Paid",
      country: "",
      agreementDate: "",
      amount: 0,
      currency: "USD"
    })
    setShowAddForm(false)
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          ➕ Add Alimony/Spousal Support
        </h4>
        <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Alimony"}
        </Button>
      </div>

      {showAddForm && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Alimony Type</Label>
              <Select
                value={newEntry.alimonyType}
                onValueChange={(value) => setNewEntry({...newEntry, alimonyType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select whether you paid or received spousal support
              </p>
            </div>
            <div>
              <Label>Governing Country</Label>
              <Input
                value={newEntry.country}
                onChange={(e) => setNewEntry({...newEntry, country: e.target.value})}
                placeholder="Country where divorce agreement was finalized"
              />
            </div>
          </div>

          <div>
            <Label>Agreement Date</Label>
            <Input
              type="date"
              value={newEntry.agreementDate}
              onChange={(e) => setNewEntry({...newEntry, agreementDate: e.target.value})}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Date of court order/legal agreement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Annual Amount</Label>
              <Input
                type="number"
                min={0}
                step={500}
                value={newEntry.amount}
                onChange={(e) => setNewEntry({...newEntry, amount: Number(e.target.value)})}
                placeholder="Yearly spousal support amount"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={newEntry.currency}
                onValueChange={(value) => setNewEntry({...newEntry, currency: value})}
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
            onClick={addAlimonyEntry} 
            className="w-full"
            disabled={!newEntry.country || !newEntry.agreementDate || !newEntry.amount}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Alimony Entry
          </Button>
        </div>
      )}
    </div>
  )
}

// General Deductions Section Component
function GeneralDeductionsSection({ updateFormData, getFormData, currencies }: {
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  currencies: string[]
}) {
  const deductions = getFormData("taxDeductionsAndCredits.potentialDeductions") ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    type: "Charitable Donations",
    customType: "",
    amount: 0,
    currency: "USD",
    country: ""
  })

  const DEDUCTION_CATEGORIES = {
    "Charitable Donations": "To registered organizations",
    "Medical Expenses": "Above specific income thresholds",
    "Education Costs": "Tuition fees, student loan interest",
    "Work-Related Expenses": "Uniforms, tools, home office",
    "Retirement Contributions": "To approved pension plans",
    "Other": "Custom deduction type"
  }

  const addGeneralDeduction = () => {
    const deductionToAdd: Deduction = {
      type: newDeduction.type === "Other" ? newDeduction.customType : newDeduction.type,
      amount: newDeduction.amount,
      currency: newDeduction.currency,
      country: newDeduction.country
    }
    const updated = [...deductions, deductionToAdd]
    updateFormData("taxDeductionsAndCredits.potentialDeductions", updated)
    setNewDeduction({
      type: "Charitable Donations",
      customType: "",
      amount: 0,
      currency: "USD",
      country: ""
    })
    setShowAddForm(false)
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          ➕ Add Other Deduction/Credit
        </h4>
        <Button variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Deduction"}
        </Button>
      </div>

      {showAddForm && (
        <div className="space-y-4">
          <div>
            <Label>Deduction Category</Label>
            <Select
              value={newDeduction.type}
              onValueChange={(value) => setNewDeduction({...newDeduction, type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DEDUCTION_CATEGORIES).map(([key, description]) => (
                  <SelectItem key={key} value={key}>{key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {DEDUCTION_CATEGORIES[newDeduction.type as keyof typeof DEDUCTION_CATEGORIES]}
            </p>
          </div>

          {newDeduction.type === "Other" && (
            <div>
              <Label>Specify Type *</Label>
              <Input
                value={newDeduction.customType}
                onChange={(e) => setNewDeduction({...newDeduction, customType: e.target.value})}
                placeholder="Enter specific deduction type"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={newDeduction.amount}
                onChange={(e) => setNewDeduction({...newDeduction, amount: Number(e.target.value)})}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={newDeduction.currency}
                onValueChange={(value) => setNewDeduction({...newDeduction, currency: value})}
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
              <Label>Applicable Country</Label>
              <Input
                value={newDeduction.country}
                onChange={(e) => setNewDeduction({...newDeduction, country: e.target.value})}
                placeholder="Country where deduction is claimed"
              />
            </div>
          </div>

          <Button 
            onClick={addGeneralDeduction} 
            className="w-full"
            disabled={!newDeduction.country || !newDeduction.amount || (newDeduction.type === "Other" && !newDeduction.customType)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Deduction
          </Button>
        </div>
      )}
    </div>
  )
}

export function TaxDeductionsAndCredits({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Check if finance details are being skipped
  const skip = getFormData("finance.skipDetails") ?? false

  const deductions: Deduction[] = getFormData("taxDeductionsAndCredits.potentialDeductions") ?? []
  const setDeductions = (next: Deduction[]) =>
    updateFormData("taxDeductionsAndCredits.potentialDeductions", next)

  const removeDeduction = (index: number) => {
    const updated = deductions.filter((_, i) => i !== index)
    setDeductions(updated)
  }

  // Check if section has any content
  const hasContent = deductions.length > 0

  // Validation - all deductions must have country
  const canContinue = skip || deductions.every(d => d.country)
  
  const handleContinue = () => {
    markSectionComplete("tax-deductions")
    onComplete()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📉 Tax Deductions & Credits</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          Understanding tax deductions and credits helps identify potential tax savings, ensure compliance with international treaties, plan for cross-border efficiency, and maximize available benefits in your new tax jurisdiction.
        </SectionHint>

        {skip ? (
          /* Skip mode - simplified summary */
                      <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">🚀 Detailed deduction / credit inputs skipped</h3>
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
            <div className="space-y-4">
              <h3 className="font-semibold">💲 Potential Tax Deductions & Credits</h3>
              
              {/* Understanding Tax Deductions Info */}
              {(() => {
                const [showInfo, setShowInfo] = useState(false)
                return (
                  <div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        📚 Understanding Tax Deductions & Credits
                      </span>
                      {showInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {showInfo && (
                      <div className="space-y-2 mt-2 p-4 border rounded-lg bg-card">
                        <p className="text-sm">
                          <strong>Tax treatments vary by country. Common deductible items include:</strong>
                        </p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>Alimony/Spousal Support:</strong> Paid (may reduce taxable income) / Received (may be taxable)</li>
                          <li><strong>Charitable Donations:</strong> To registered organizations</li>
                          <li><strong>Medical Expenses:</strong> Above specific income thresholds</li>
                          <li><strong>Education Costs:</strong> Tuition fees, student loan interest</li>
                          <li><strong>Work-Related Expenses:</strong> Uniforms, tools, home office</li>
                          <li><strong>Retirement Contributions:</strong> To approved pension plans</li>
                        </ul>
                        <p className="text-xs text-muted-foreground italic mt-2">
                          Always verify local tax rules - this is not legal advice.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Alimony Section */}
              <AlimonySection 
                updateFormData={updateFormData}
                getFormData={getFormData}
                currencies={currencies}
              />

              {/* General Deductions Section */}
              <GeneralDeductionsSection 
                updateFormData={updateFormData}
                getFormData={getFormData}
                currencies={currencies}
              />
            </div>

            {/* Display existing deductions */}
            {deductions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">📊 Registered Deductions & Credits</h4>
                  
                  {/* Individual deduction cards */}
                  <div className="space-y-3">
                    {deductions.map((deduction, index) => {
                      const [isExpanded, setIsExpanded] = useState(false)
                      return (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-card cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Item {index + 1}: {deduction.type}</span>
                              <Badge variant="secondary">{deduction.country}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {deduction.currency} {deduction.amount.toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeDeduction(index)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-3 pb-3">
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p><strong>Type:</strong> {deduction.type}</p>
                                <p><strong>Amount:</strong> {deduction.currency} {deduction.amount.toLocaleString()}</p>
                                <p><strong>Country:</strong> {deduction.country}</p>
                                {deduction.date && <p><strong>Date:</strong> {deduction.date}</p>}
                                {deduction.notes && <p><strong>Notes:</strong> {deduction.notes}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary Table */}
                  <div className="space-y-3">
                    <h4 className="font-medium">📈 Summary of Deductions</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-card">
                          <tr>
                            <th className="text-left p-3 font-medium">Type</th>
                            <th className="text-left p-3 font-medium">Amount</th>
                            <th className="text-left p-3 font-medium">Country</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deductions.map((deduction, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{deduction.type}</td>
                              <td className="p-3">{deduction.currency} {deduction.amount.toLocaleString()}</td>
                              <td className="p-3">{deduction.country}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Whether these are deductible in your desired destination remains to be seen.
                    </AlertDescription>
                  </Alert>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-3">
          {/* Check My Information Button */}
          <div className="flex justify-center">
            <CheckInfoButton
              onClick={() => showSectionInfo("tax-deductions")}
              isLoading={isCheckingInfo}
              disabled={!canContinue}
            />
          </div>
          
          <Button 
            onClick={handleContinue} 
            className="w-full"
            disabled={!canContinue}
          >
            {hasContent ? "Continue" : "Continue (skip section)"}
          </Button>
        </div>
      </CardFooter>

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
    </Card>
  )
} 