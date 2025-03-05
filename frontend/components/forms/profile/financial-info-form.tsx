'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Profile, FinancialInformation } from "@/types/profile"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoDrawer } from "@/components/ui/info-drawer"
import { validateFinancialInfo, ValidationError } from "@/lib/profile-validation"
import { cn } from "@/lib/utils"

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
      incomeSources: [],
      assets: [],
      liabilities: []
    }
  )

  const [validation, setValidation] = useState(() => validateFinancialInfo(info))
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setValidation(validateFinancialInfo(info))
  }, [info])

  const getFieldError = (field: string): ValidationError | undefined => {
    return touched[field] ? validation.errors.find(e => e.field === field) : undefined
  }

  const getFieldWarning = (field: string): ValidationError | undefined => {
    return touched[field] ? validation.warnings.find(e => e.field === field) : undefined
  }

  const handleUpdate = (updatedInfo: typeof info) => {
    setInfo(updatedInfo)
    onUpdate({ financialInformation: updatedInfo })
  }

  const addIncomeSource = () => {
    handleUpdate({
      ...info,
      incomeSources: [
        ...info.incomeSources,
        { type: "", amount: 0, currency: "USD", frequency: "yearly" }
      ]
    })
  }

  const removeIncomeSource = (index: number) => {
    const updated = info.incomeSources.filter((_, i) => i !== index)
    handleUpdate({ ...info, incomeSources: updated })
  }

  const addAsset = () => {
    handleUpdate({
      ...info,
      assets: [
        ...info.assets,
        { type: "", value: 0, currency: "USD" }
      ]
    })
  }

  const removeAsset = (index: number) => {
    const updated = info.assets.filter((_, i) => i !== index)
    handleUpdate({ ...info, assets: updated })
  }

  const addLiability = () => {
    handleUpdate({
      ...info,
      liabilities: [
        ...info.liabilities,
        { type: "", amount: 0, currency: "USD" }
      ]
    })
  }

  const removeLiability = (index: number) => {
    const updated = info.liabilities.filter((_, i) => i !== index)
    handleUpdate({ ...info, liabilities: updated })
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
                    setTouched(prev => ({ ...prev, [`incomeSources.${index}.type`]: true }))
                  }}
                >
                  <SelectTrigger className={cn(
                    getFieldError(`incomeSources.${index}.type`) && "border-destructive"
                  )}>
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
                {getFieldError(`incomeSources.${index}.type`) && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(`incomeSources.${index}.type`)?.message}
                  </p>
                )}
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
                    setTouched(prev => ({ ...prev, [`incomeSources.${index}.amount`]: true }))
                  }}
                  className={cn(
                    getFieldError(`incomeSources.${index}.amount`) && "border-destructive"
                  )}
                />
                {getFieldError(`incomeSources.${index}.amount`) && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError(`incomeSources.${index}.amount`)?.message}
                  </p>
                )}
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
          {getFieldError("incomeSources") && (
            <p className="text-sm text-destructive">
              {getFieldError("incomeSources")?.message}
            </p>
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
          {getFieldWarning("assets") && (
            <p className="text-sm text-yellow-600">
              {getFieldWarning("assets")?.message}
            </p>
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