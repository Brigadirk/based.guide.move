'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Users } from "lucide-react"
import { Profile, PersonalInformation, FinancialInformation, Dependent, IncomeSource } from "@/types/profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoDrawer } from "@/components/ui/info-drawer"

interface FamilyFormProps {
  data: { 
    partner?: Profile['partner'],
    dependents?: Dependent[],
    personalInformation?: PersonalInformation
  }
  onUpdate: (data: { 
    partner?: Profile['partner'],
    dependents: Dependent[],
    personalInformation: PersonalInformation
  }) => void
}

const COUNTRIES = ["United States", "Switzerland", "Portugal", "Spain", "Netherlands", "El Salvador"]
const RESIDENCY_STATUSES = ["Citizen", "Permanent resident", "Temporary resident"] as const
const INCOME_TYPES = ["Salary", "Business Income", "Investment Income", "Rental Income", "Pension", "Other"] as const
const CURRENCIES = ["USD", "EUR", "CHF", "GBP"]

type ResidencyStatus = typeof RESIDENCY_STATUSES[number]

type PartnerInfo = {
  personalInformation: PersonalInformation;
  financialInformation: FinancialInformation;
}

export function FamilyForm({ data, onUpdate }: FamilyFormProps) {
  const [hasPartner, setHasPartner] = useState(Boolean(data.partner))
  const [partnerInfo] = useState<PartnerInfo>({
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
    }
  })
  const [dependents, setDependents] = useState<Dependent[]>(data.dependents || [])
  const [maritalStatus, setMaritalStatus] = useState<PersonalInformation['maritalStatus']>(
    data.personalInformation?.maritalStatus || "Single"
  )

  const handleUpdate = (partner: Profile['partner'] | undefined, newDependents: Dependent[]) => {
    onUpdate({
      partner: hasPartner ? {
        personalInformation: partnerInfo.personalInformation,
        financialInformation: partnerInfo.financialInformation
      } : undefined,
      dependents: newDependents,
      personalInformation: {
        dateOfBirth: data.personalInformation?.dateOfBirth || "",
        nationalities: data.personalInformation?.nationalities || [{ country: "" }],
        maritalStatus,
        currentResidency: data.personalInformation?.currentResidency || {
          country: "",
          status: "Citizen"
        }
      }
    })
  }

  const togglePartner = (enabled: boolean) => {
    setHasPartner(enabled)
    if (!enabled) {
      handleUpdate(undefined, dependents)
    }
  }

  const handleAddDependent = () => {
    const newDependents = [...dependents, { name: "", relationship: "", age: 0 }]
    setDependents(newDependents)
    handleUpdate(data.partner, newDependents)
  }

  const handleRemoveDependent = (index: number) => {
    const newDependents = dependents.filter((_, i) => i !== index)
    setDependents(newDependents)
    handleUpdate(data.partner, newDependents)
  }

  const handleDependentChange = (index: number, field: keyof Dependent, value: string | number) => {
    const newDependents = [...dependents]
    newDependents[index] = {
      ...newDependents[index],
      [field]: value
    }
    setDependents(newDependents)
    handleUpdate(data.partner, newDependents)
  }

  return (
    <div className="space-y-6">
      {/* Partner Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Partner Information</CardTitle>
              <CardDescription>Add information about your partner if relevant to your move</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={hasPartner}
                onCheckedChange={togglePartner}
              />
              <Label>Include partner</Label>
            </div>
          </div>
        </CardHeader>
        {hasPartner && (
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={partnerInfo.personalInformation.dateOfBirth}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        handleUpdate({
                          ...partnerInfo,
                          personalInformation: {
                            ...partnerInfo.personalInformation,
                            dateOfBirth: e.target.value
                          }
                        }, dependents)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Select
                      value={partnerInfo.personalInformation.nationalities[0].country}
                      onValueChange={(value) => {
                        handleUpdate({
                          ...partnerInfo,
                          personalInformation: {
                            ...partnerInfo.personalInformation,
                            nationalities: [{ country: value }]
                          }
                        }, dependents)
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
                      value={partnerInfo.personalInformation.currentResidency.country}
                      onValueChange={(value) => {
                        handleUpdate({
                          ...partnerInfo,
                          personalInformation: {
                            ...partnerInfo.personalInformation,
                            currentResidency: {
                              ...partnerInfo.personalInformation.currentResidency,
                              country: value
                            }
                          }
                        }, dependents)
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
                      value={partnerInfo.personalInformation.currentResidency.status}
                      onValueChange={(value: ResidencyStatus) => {
                        handleUpdate({
                          ...partnerInfo,
                          personalInformation: {
                            ...partnerInfo.personalInformation,
                            currentResidency: {
                              ...partnerInfo.personalInformation.currentResidency,
                              status: value
                            }
                          }
                        }, dependents)
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Income Sources</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newIncomeSource: IncomeSource = {
                          type: "",
                          amount: 0,
                          currency: "USD",
                          frequency: "yearly"
                        }
                        handleUpdate({
                          ...partnerInfo,
                          financialInformation: {
                            ...partnerInfo.financialInformation,
                            incomeSources: [
                              ...partnerInfo.financialInformation.incomeSources,
                              newIncomeSource
                            ]
                          }
                        }, dependents)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income Source
                    </Button>
                  </div>

                  {partnerInfo.financialInformation.incomeSources.map((source, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <Select
                          value={source.type}
                          onValueChange={(value) => {
                            const updated = [...partnerInfo.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              type: value
                            }
                            handleUpdate({
                              ...partnerInfo,
                              financialInformation: {
                                ...partnerInfo.financialInformation,
                                incomeSources: updated
                              }
                            }, dependents)
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
                            const updated = [...partnerInfo.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              amount: Number(e.target.value)
                            }
                            handleUpdate({
                              ...partnerInfo,
                              financialInformation: {
                                ...partnerInfo.financialInformation,
                                incomeSources: updated
                              }
                            }, dependents)
                          }}
                          placeholder="Amount"
                        />
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={source.currency}
                          onValueChange={(value) => {
                            const updated = [...partnerInfo.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              currency: value
                            }
                            handleUpdate({
                              ...partnerInfo,
                              financialInformation: {
                                ...partnerInfo.financialInformation,
                                incomeSources: updated
                              }
                            }, dependents)
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
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Dependents Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dependents
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDependent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dependents.map((dependent, index) => (
            <Card key={index} className="p-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Dependent {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDependent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={dependent.name}
                    onChange={(e) => handleDependentChange(index, "name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Relationship</Label>
                  <Select
                    value={dependent.relationship}
                    onValueChange={(value) => handleDependentChange(index, "relationship", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={dependent.age}
                    onChange={(e) => handleDependentChange(index, "age", parseInt(e.target.value))}
                    min={0}
                    max={120}
                  />
                </div>
              </div>
            </Card>
          ))}
          
          {dependents.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No dependents added yet. Click the button above to add one.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Marital Status</Label>
          <InfoDrawer
            title="Marital Status"
            description="Your marital status can affect visa eligibility and tax implications in different countries."
            aiContext="This helps me identify family-based immigration options and ensure compliance with local regulations regarding spouse rights and obligations."
          />
        </div>
        <Select
          value={maritalStatus}
          onValueChange={(value: PersonalInformation['maritalStatus']) => {
            setMaritalStatus(value)
            handleUpdate(data.partner, dependents)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {["Single", "Married", "Divorced"].map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 