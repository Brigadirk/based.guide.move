'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Profile } from "@/types/profile"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

interface PartnerInfoFormProps {
  data: { partner?: Profile['partner'] }
  onUpdate: (data: { partner?: Profile['partner'] }) => void
}

const COUNTRIES = ["United States", "Switzerland", "Portugal", "Spain", "Netherlands", "El Salvador"]
const RESIDENCY_STATUSES = ["Citizen", "Permanent resident", "Temporary resident"]
const MARITAL_STATUSES = ["Single", "Married", "Divorced"]
const INCOME_TYPES = ["Salary", "Business Income", "Investment Income", "Rental Income", "Pension", "Other"]
const CURRENCIES = ["USD", "EUR", "CHF", "GBP"]

export function PartnerInfoForm({ data, onUpdate }: PartnerInfoFormProps) {
  const [hasPartner, setHasPartner] = useState(Boolean(data.partner))
  const [info, setInfo] = useState(data.partner || {
    personalInformation: {
      dateOfBirth: "",
      nationalities: [{ country: "" }],
      maritalStatus: "Single",
      currentResidency: {
        country: "",
        status: "Citizen"
      }
    },
    financialInformation: {
      incomeSources: [],
      assets: [],
      liabilities: []
    },
    residencyIntentions: {
      moveType: "Digital Nomad",
      intendedCountry: "",
      durationOfStay: "1 year",
      preferredMaximumStayRequirement: "3 months",
      notes: ""
    }
  })

  const handleUpdate = (updatedInfo: typeof info) => {
    setInfo(updatedInfo)
    onUpdate({ partner: updatedInfo })
  }

  const togglePartner = (enabled: boolean) => {
    setHasPartner(enabled)
    if (!enabled) {
      onUpdate({ partner: undefined })
      toast.success("Partner information removed")
    }
  }

  if (!hasPartner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
          <CardDescription>Add information about your partner if relevant to your move</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={hasPartner}
              onCheckedChange={togglePartner}
            />
            <Label>I have a partner to include</Label>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Partner Information</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                checked={hasPartner}
                onCheckedChange={togglePartner}
              />
              <Label>Include partner</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="residency">Residency</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={info.personalInformation.dateOfBirth}
                    onChange={(e) => {
                      handleUpdate({
                        ...info,
                        personalInformation: {
                          ...info.personalInformation,
                          dateOfBirth: e.target.value
                        }
                      })
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select
                    value={info.personalInformation.nationalities[0].country}
                    onValueChange={(value) => {
                      handleUpdate({
                        ...info,
                        personalInformation: {
                          ...info.personalInformation,
                          nationalities: [{ country: value }]
                        }
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Country</Label>
                  <Select
                    value={info.personalInformation.currentResidency.country}
                    onValueChange={(value) => {
                      handleUpdate({
                        ...info,
                        personalInformation: {
                          ...info.personalInformation,
                          currentResidency: {
                            ...info.personalInformation.currentResidency,
                            country: value
                          }
                        }
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Residency Status</Label>
                  <Select
                    value={info.personalInformation.currentResidency.status}
                    onValueChange={(value: any) => {
                      handleUpdate({
                        ...info,
                        personalInformation: {
                          ...info.personalInformation,
                          currentResidency: {
                            ...info.personalInformation.currentResidency,
                            status: value
                          }
                        }
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESIDENCY_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              {/* Income Sources */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Income Sources</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = {
                        ...info,
                        financialInformation: {
                          ...info.financialInformation,
                          incomeSources: [
                            ...info.financialInformation.incomeSources,
                            { type: "", details: {}, amount: 0, currency: "USD" }
                          ]
                        }
                      }
                      handleUpdate(updated)
                    }}
                  >
                    Add Income Source
                  </Button>
                </div>

                {info.financialInformation.incomeSources.map((source, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4">
                    <div className="col-span-4">
                      <Select
                        value={source.type}
                        onValueChange={(value) => {
                          const updated = [...info.financialInformation.incomeSources]
                          updated[index] = { ...source, type: value }
                          handleUpdate({
                            ...info,
                            financialInformation: {
                              ...info.financialInformation,
                              incomeSources: updated
                            }
                          })
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
                          const updated = [...info.financialInformation.incomeSources]
                          updated[index] = { ...source, amount: Number(e.target.value) }
                          handleUpdate({
                            ...info,
                            financialInformation: {
                              ...info.financialInformation,
                              incomeSources: updated
                            }
                          })
                        }}
                        placeholder="Amount"
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={source.currency}
                        onValueChange={(value) => {
                          const updated = [...info.financialInformation.incomeSources]
                          updated[index] = { ...source, currency: value }
                          handleUpdate({
                            ...info,
                            financialInformation: {
                              ...info.financialInformation,
                              incomeSources: updated
                            }
                          })
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
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="residency" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Move Type</Label>
                  <Select
                    value={info.residencyIntentions.moveType}
                    onValueChange={(value: "Permanent" | "Digital Nomad") => {
                      handleUpdate({
                        ...info,
                        residencyIntentions: {
                          ...info.residencyIntentions,
                          moveType: value
                        }
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Digital Nomad">Digital Nomad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Intended Country</Label>
                  <Select
                    value={info.residencyIntentions.intendedCountry}
                    onValueChange={(value) => {
                      handleUpdate({
                        ...info,
                        residencyIntentions: {
                          ...info.residencyIntentions,
                          intendedCountry: value
                        }
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 