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
import { Plus, Info, AlertTriangle, HelpCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

export function TaxDeductionsAndCredits({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Check if finance details are being skipped
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  // Potential deductions array (from Streamlit design)
  const deductions = getFormData("taxDeductionsAndCredits.potentialDeductions") ?? []

  // Alimony form state
  const [newAlimony, setNewAlimony] = useState({
    alimonyType: "Paid",
    country: "",
    agreementDate: "",
    amount: 0,
    currency: "USD"
  })

  // General deduction form state
  const [newDeduction, setNewDeduction] = useState({
    type: "Charitable Donations",
    customType: "",
    amount: 0,
    currency: "USD",
    country: ""
  })

  const handleComplete = () => {
    markSectionComplete("taxDeductionsAndCredits")
    onComplete()
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          📉 Tax Deductions & Credits
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your potential tax deductions and credits for international tax compliance
        </p>
      </div>

      <SectionHint title="Why is this section important?">
        <div className="space-y-2 text-sm">
          <p><strong>Understanding tax deductions and credits helps:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Identify potential tax savings in your destination country</li>
            <li>Ensure compliance with international tax treaties</li>
            <li>Plan for cross-border tax efficiency</li>
            <li>Avoid double taxation on certain expenses</li>
            <li>Maximize available benefits in your new tax jurisdiction</li>
            <li>Document important financial obligations with tax implications</li>
          </ul>
        </div>
      </SectionHint>

      {/* Skip Mode Indicator */}
      {skipFinanceDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-green-600" />
              Tax Deductions & Credits Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Per your earlier choice in finance section</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                🚀 Detailed deduction / credit inputs skipped per your earlier choice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show detailed sections if not skipped */}
      {!skipFinanceDetails && (
        <>
          {/* Information Expander */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-600" />
                Understanding Tax Deductions & Credits
              </CardTitle>
              <p className="text-sm text-muted-foreground">Common deductible items vary by country</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm">
                <p><strong>Tax treatments vary by country. Common deductible items include:</strong></p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>• Alimony/Spousal Support:</strong> <em>Paid</em> (may reduce taxable income) / <em>Received</em> (may be taxable)</p>
                    <p><strong>• Charitable Donations:</strong> To registered organizations</p>
                    <p><strong>• Medical Expenses:</strong> Above specific income thresholds</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>• Education Costs:</strong> Tuition fees, student loan interest</p>
                    <p><strong>• Work-Related Expenses:</strong> Uniforms, tools, home office</p>
                    <p><strong>• Retirement Contributions:</strong> To approved pension plans</p>
                  </div>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <em>Always verify local tax rules - this is not legal advice.</em>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Alimony/Spousal Support Section (Streamlit specialized form) */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-purple-600" />
                Alimony/Spousal Support
              </CardTitle>
              <p className="text-sm text-muted-foreground">Legal agreements with special tax treatment</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add alimony form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Alimony/Spousal Support</h4>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Alimony Type</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="paid"
                              name="alimonyType"
                              value="Paid"
                              checked={newAlimony.alimonyType === "Paid"}
                              onChange={(e) => setNewAlimony({...newAlimony, alimonyType: e.target.value})}
                            />
                            <label htmlFor="paid" className="text-sm cursor-pointer">Paid</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="received"
                              name="alimonyType"
                              value="Received"
                              checked={newAlimony.alimonyType === "Received"}
                              onChange={(e) => setNewAlimony({...newAlimony, alimonyType: e.target.value})}
                            />
                            <label htmlFor="received" className="text-sm cursor-pointer">Received</label>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Select whether you paid or received spousal support</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Governing Country</Label>
                        <Select
                          value={newAlimony.country}
                          onValueChange={(value) => setNewAlimony({...newAlimony, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>

                            {["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Netherlands", "Sweden", "Other"].map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Country where divorce agreement was finalized</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Agreement Date</Label>
                      <Input
                        type="date"
                        value={newAlimony.agreementDate}
                        onChange={(e) => setNewAlimony({...newAlimony, agreementDate: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">Date of court order/legal agreement</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Annual Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="500.0"
                          value={newAlimony.amount}
                          onChange={(e) => setNewAlimony({...newAlimony, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">Yearly spousal support amount</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newAlimony.currency}
                          onValueChange={(value) => setNewAlimony({...newAlimony, currency: value})}
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

                    <Button 
                      onClick={() => {
                        if (newAlimony.amount > 0 && newAlimony.country && newAlimony.agreementDate) {
                          const entry = {
                            type: `Alimony ${newAlimony.alimonyType}`,
                            amount: newAlimony.amount,
                            currency: newAlimony.currency,
                            country: newAlimony.country,
                            date: newAlimony.agreementDate,
                            notes: `Governed by ${newAlimony.country} law`
                          }
                          const updatedDeductions = [...deductions, entry]
                          updateFormData("taxDeductionsAndCredits.potentialDeductions", updatedDeductions)
                          setNewAlimony({
                            alimonyType: "Paid",
                            country: "",
                            agreementDate: "",
                            amount: 0,
                            currency: "USD"
                          })
                        }
                      }}
                      disabled={!newAlimony.amount || !newAlimony.country || !newAlimony.agreementDate}
                      className="w-full"
                    >
                      💾 Add Alimony Entry
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Deductions Section */}
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Plus className="w-6 h-6 text-orange-600" />
                Other Deductions/Credits
              </CardTitle>
              <p className="text-sm text-muted-foreground">Universal deduction form with common international categories</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Add general deduction form */}
                <div className="p-4 border rounded-lg bg-card">
                  <h4 className="font-medium mb-4">Add Other Deduction/Credit</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Deduction Category</Label>
                      <Select
                        value={newDeduction.type}
                        onValueChange={(value) => setNewDeduction({...newDeduction, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Charitable Donations",
                            "Medical Expenses",
                            "Education Costs",
                            "Work-Related Expenses",
                            "Retirement Contributions",
                            "Other"
                          ].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {newDeduction.type === "Other" && (
                      <div className="space-y-2">
                        <Label>Specify Type</Label>
                        <Input
                          value={newDeduction.customType}
                          onChange={(e) => setNewDeduction({...newDeduction, customType: e.target.value})}
                          placeholder="Enter deduction type"
                        />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={newDeduction.amount}
                          onChange={(e) => setNewDeduction({...newDeduction, amount: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={newDeduction.currency}
                          onValueChange={(value) => setNewDeduction({...newDeduction, currency: value})}
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

                    <div className="space-y-2">
                      <Label>Applicable Country</Label>
                      <Select
                        value={newDeduction.country}
                        onValueChange={(value) => setNewDeduction({...newDeduction, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>

                          {["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Netherlands", "Sweden", "Other"].map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Country where deduction is claimed</p>
                    </div>

                    <Button 
                      onClick={() => {
                        if (newDeduction.amount > 0 && newDeduction.country) {
                          const entry = {
                            type: newDeduction.type !== "Other" ? newDeduction.type : newDeduction.customType,
                            amount: newDeduction.amount,
                            currency: newDeduction.currency,
                            country: newDeduction.country
                          }
                          const updatedDeductions = [...deductions, entry]
                          updateFormData("taxDeductionsAndCredits.potentialDeductions", updatedDeductions)
                          setNewDeduction({
                            type: "Charitable Donations",
                            customType: "",
                            amount: 0,
                            currency: "USD",
                            country: ""
                          })
                        }
                      }}
                      disabled={!newDeduction.amount || !newDeduction.country || 
                               (newDeduction.type === "Other" && !newDeduction.customType)}
                      className="w-full"
                    >
                      💾 Add Deduction
                    </Button>
                  </div>
                </div>

                {/* Display existing deductions */}
                {deductions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">📊 Registered Deductions & Credits</h4>
                    <div className="space-y-3">
                      {deductions.map((deduction: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium">Item {idx + 1}: {deduction.type}</h5>
                              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                <div>
                                  <p><strong>Amount:</strong> {deduction.currency} {deduction.amount?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p><strong>Country:</strong> {deduction.country}</p>
                                </div>
                                {deduction.date && (
                                  <div>
                                    <p><strong>Date:</strong> {deduction.date}</p>
                                  </div>
                                )}
                                {deduction.notes && (
                                  <div>
                                    <p><strong>Notes:</strong> {deduction.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedDeductions = deductions.filter((_: any, i: number) => i !== idx)
                                updateFormData("taxDeductionsAndCredits.potentialDeductions", updatedDeductions)
                              }}
                            >
                              ❌
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        ⚠️ Whether this is a deductible in your desired destination remains to be seen.
                      </AlertDescription>
                    </Alert>
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
              This section is optional. You can continue even if you don't have deductions or credits to report.
            </div>

            {/* Check My Information Button */}
            <div className="flex justify-center">
              <CheckInfoButton
                onClick={() => showSectionInfo("tax-deductions")}
                isLoading={isCheckingInfo}
              />
            </div>

            <Button
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Continue to Future Financial Plans
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
      />
    </div>
  )
}