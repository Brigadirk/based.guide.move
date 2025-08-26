'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Profile, FinancialInformation } from "@/types/profile"
import { X, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoDrawer } from "@/components/ui/info-drawer"

interface FinancialInfoFormProps {
  data: { financialInformation?: Profile['financialInformation'] }
  onUpdate: (data: { financialInformation: Profile['financialInformation'] }) => void
}

const INCOME_TYPES = [
  "Employment",
  "Self-employment",
  "Investment",
  "Pension",
  "Rental",
  "Other"
]

const ASSET_TYPES = [
  "Real Estate",
  "Stocks",
  "Bonds",
  "Crypto",
  "Cash",
  "Other"
]

const LIABILITY_TYPES = [
  "Mortgage",
  "Personal Loan",
  "Credit Card",
  "Student Loan",
  "Other"
]

export function FinancialInfoForm({ data, onUpdate }: FinancialInfoFormProps) {
  const [info, setInfo] = useState<FinancialInformation>(
    data.financialInformation || {
      incomeSituation: "continuing_income",
      incomeSources: [],
      expectedEmployment: [],
      totalWealth: {
        currency: "USD",
        total: 0,
        primaryResidence: 0
      },
      capitalGains: {
        futureSales: []
      },
      assets: [],
      liabilities: []
    }
  )

  const handleUpdate = (updatedInfo: typeof info) => {
    setInfo(updatedInfo)
    onUpdate({ financialInformation: updatedInfo })
  }

  const addIncomeSource = () => {
    const updatedInfo = {
      ...info,
      incomeSources: [
        ...info.incomeSources,
        { 
          category: "Employment",
          fields: {},
          country: "",
          amount: 0,
          currency: "USD",
          continueInDestination: false,
          type: INCOME_TYPES[0], 
          frequency: "yearly" as const 
        }
      ]
    }
    handleUpdate(updatedInfo)
  }

  const removeIncomeSource = (index: number) => {
    const updatedInfo = {
      ...info,
      incomeSources: info.incomeSources.filter((_, i) => i !== index)
    }
    handleUpdate(updatedInfo)
  }

  const addAsset = () => {
    const updatedInfo = {
      ...info,
      assets: [
        ...info.assets,
        { type: ASSET_TYPES[0], value: 0, currency: "USD" }
      ]
    }
    handleUpdate(updatedInfo)
  }

  const removeAsset = (index: number) => {
    const updatedInfo = {
      ...info,
      assets: info.assets.filter((_, i) => i !== index)
    }
    handleUpdate(updatedInfo)
  }

  const addLiability = () => {
    const updatedInfo = {
      ...info,
      liabilities: [
        ...info.liabilities,
        { 
          category: "Debt",
          fields: {},
          country: "",
          amount: 0,
          currency: "USD",
          paybackYears: 0,
          interestRate: 0,
          type: LIABILITY_TYPES[0]
        }
      ]
    }
    handleUpdate(updatedInfo)
  }

  const removeLiability = (index: number) => {
    const updatedInfo = {
      ...info,
      liabilities: info.liabilities.filter((_, i) => i !== index)
    }
    handleUpdate(updatedInfo)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Income Sources</CardTitle>
              <InfoDrawer
                title="Income Sources"
                description="List all your regular sources of income. This helps us understand your financial flexibility and tax obligations."
                aiContext="Your income sources and their locations are crucial for determining tax implications and visa eligibility in different countries. Many residency programs have minimum income requirements."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIncomeSource}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {info.incomeSources.map((source, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-4">
                <Label>Type</Label>
                <Select
                  value={source.type}
                  onValueChange={(value) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...updated[index], type: value }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={source.amount}
                  onChange={(e) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...updated[index], amount: parseFloat(e.target.value) }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label>Currency</Label>
                <Input
                  value={source.currency}
                  onChange={(e) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...updated[index], currency: e.target.value }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label>Frequency</Label>
                <Select
                  value={source.frequency}
                  onValueChange={(value: "monthly" | "yearly") => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...updated[index], frequency: value }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIncomeSource(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {info.incomeSources.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No income sources added yet. Click the button above to add one.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Assets</CardTitle>
              <InfoDrawer
                title="Assets"
                description="List your major assets. This helps us understand your overall financial position and investment opportunities."
                aiContext="Your asset portfolio helps me recommend suitable investment and tax optimization strategies in your target country. Some countries offer special visas for investors with significant assets."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAsset}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {info.assets.map((asset, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-5">
                <Label>Type</Label>
                <Select
                  value={asset.type}
                  onValueChange={(value) => {
                    const updated = [...info.assets]
                    updated[index] = { ...updated[index], type: value }
                    handleUpdate({ ...info, assets: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={asset.value}
                  onChange={(e) => {
                    const updated = [...info.assets]
                    updated[index] = { ...updated[index], value: parseFloat(e.target.value) }
                    handleUpdate({ ...info, assets: updated })
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label>Currency</Label>
                <Input
                  value={asset.currency}
                  onChange={(e) => {
                    const updated = [...info.assets]
                    updated[index] = { ...updated[index], currency: e.target.value }
                    handleUpdate({ ...info, assets: updated })
                  }}
                />
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAsset(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {info.assets.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No assets added yet. Click the button above to add one.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Liabilities</CardTitle>
              <InfoDrawer
                title="Liabilities"
                description="List your major debts and financial obligations. This helps us assess your financial commitments."
                aiContext="Understanding your liabilities helps me recommend appropriate debt management strategies and ensure you meet financial requirements for visas and residency programs."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLiability}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Liability
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {info.liabilities.map((liability, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-5">
                <Label>Type</Label>
                <Select
                  value={liability.type}
                  onValueChange={(value) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...updated[index], type: value }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LIABILITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={liability.amount}
                  onChange={(e) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...updated[index], amount: parseFloat(e.target.value) }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label>Currency</Label>
                <Input
                  value={liability.currency}
                  onChange={(e) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...updated[index], currency: e.target.value }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                />
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLiability(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {info.liabilities.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No liabilities added yet. Click the button above to add one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 