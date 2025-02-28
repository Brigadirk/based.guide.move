'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Profile } from "@/types/profile"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

interface FinancialInfoFormProps {
  data: { financialInformation?: Profile['financialInformation'] }
  onUpdate: (data: { financialInformation: Profile['financialInformation'] }) => void
}

const INCOME_TYPES = ["Salary", "Business Income", "Investment Income", "Rental Income", "Pension", "Other"]
const ASSET_TYPES = ["Cash", "Real Estate", "Stocks", "Bonds", "Crypto", "Business", "Other"]
const LIABILITY_TYPES = ["Mortgage", "Personal Loan", "Business Loan", "Credit Card", "Other"]
const CURRENCIES = ["USD", "EUR", "CHF", "GBP"]

export function FinancialInfoForm({ data, onUpdate }: FinancialInfoFormProps) {
  const [info, setInfo] = useState(data.financialInformation || {
    incomeSources: [],
    assets: [],
    liabilities: []
  })

  const handleUpdate = (updatedInfo: typeof info) => {
    setInfo(updatedInfo)
    onUpdate({ financialInformation: updatedInfo })
  }

  const addIncomeSource = () => {
    handleUpdate({
      ...info,
      incomeSources: [
        ...info.incomeSources,
        { type: "", amount: 0, currency: "USD", details: {} }
      ]
    })
    toast.success("Added new income source")
  }

  const removeIncomeSource = (index: number) => {
    const updated = {
      ...info,
      incomeSources: info.incomeSources.filter((_, i) => i !== index)
    }
    handleUpdate(updated)
    toast.success("Removed income source")
  }

  const addAsset = () => {
    handleUpdate({
      ...info,
      assets: [
        ...info.assets,
        { type: "", value: 0, currency: "USD" }
      ]
    })
    toast.success("Added new asset")
  }

  const removeAsset = (index: number) => {
    const updated = {
      ...info,
      assets: info.assets.filter((_, i) => i !== index)
    }
    handleUpdate(updated)
    toast.success("Removed asset")
  }

  const addLiability = () => {
    handleUpdate({
      ...info,
      liabilities: [
        ...info.liabilities,
        { type: "", amount: 0, currency: "USD" }
      ]
    })
    toast.success("Added new liability")
  }

  const removeLiability = (index: number) => {
    const updated = {
      ...info,
      liabilities: info.liabilities.filter((_, i) => i !== index)
    }
    handleUpdate(updated)
    toast.success("Removed liability")
  }

  return (
    <div className="space-y-6">
      {/* Income Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Income Sources</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addIncomeSource}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income Source
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {info.incomeSources.map((source, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <Select
                  value={source.type}
                  onValueChange={(value) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...source, type: value }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
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
              <div className="col-span-4">
                <Input
                  type="number"
                  value={source.amount}
                  onChange={(e) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...source, amount: Number(e.target.value) }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                  placeholder="Amount"
                />
              </div>
              <div className="col-span-3">
                <Select
                  value={source.currency}
                  onValueChange={(value) => {
                    const updated = [...info.incomeSources]
                    updated[index] = { ...source, currency: value }
                    handleUpdate({ ...info, incomeSources: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
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

      {/* Assets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assets</CardTitle>
            <Button
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
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <Select
                  value={asset.type}
                  onValueChange={(value) => {
                    const updated = [...info.assets]
                    updated[index] = { ...asset, type: value }
                    handleUpdate({ ...info, assets: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
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
                <Input
                  type="number"
                  value={asset.value}
                  onChange={(e) => {
                    const updated = [...info.assets]
                    updated[index] = { ...asset, value: Number(e.target.value) }
                    handleUpdate({ ...info, assets: updated })
                  }}
                  placeholder="Value"
                />
              </div>
              <div className="col-span-3">
                <Select
                  value={asset.currency}
                  onValueChange={(value) => {
                    const updated = [...info.assets]
                    updated[index] = { ...asset, currency: value }
                    handleUpdate({ ...info, assets: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
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

      {/* Liabilities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liabilities</CardTitle>
            <Button
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
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <Select
                  value={liability.type}
                  onValueChange={(value) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...liability, type: value }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
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
                <Input
                  type="number"
                  value={liability.amount}
                  onChange={(e) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...liability, amount: Number(e.target.value) }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                  placeholder="Amount"
                />
              </div>
              <div className="col-span-3">
                <Select
                  value={liability.currency}
                  onValueChange={(value) => {
                    const updated = [...info.liabilities]
                    updated[index] = { ...liability, currency: value }
                    handleUpdate({ ...info, liabilities: updated })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
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