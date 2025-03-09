'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Profile, PersonalInformation, FinancialInformation, Dependent, IncomeSource } from "@/types/profile"
import { toast } from "sonner"
import { X, Plus, Users, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
const MARITAL_STATUSES = ["Single", "Married", "Divorced"] as const
const INCOME_TYPES = ["Salary", "Business Income", "Investment Income", "Rental Income", "Pension", "Other"]
const CURRENCIES = ["USD", "EUR", "CHF", "GBP"]
const RELATIONSHIPS = ["Child", "Parent", "Sibling", "Other"]

type PartnerInfo = {
  personalInformation: PersonalInformation;
  financialInformation: FinancialInformation;
}

export function FamilyForm({ data, onUpdate }: FamilyFormProps) {
  const [hasPartner, setHasPartner] = useState(Boolean(data.partner))
  const [info, setInfo] = useState<PartnerInfo>({
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

  useEffect(() => {
    if (data.partner) {
      setInfo({
        personalInformation: data.partner.personalInformation,
        financialInformation: data.partner.financialInformation
      })
    }
  }, [data.partner])

  const handleUpdate = (partner: Profile['partner'] | undefined, newDependents: Dependent[]) => {
    onUpdate({
      partner: hasPartner ? {
        personalInformation: info.personalInformation,
        financialInformation: info.financialInformation
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
      toast.success("Partner information removed")
    }
  }

  const addDependent = () => {
    const updatedDependents = [
      ...dependents,
      { name: "", relationship: "", age: 0 }
    ]
    handleUpdate(data.partner, updatedDependents)
    toast.success("Added new dependent")
  }

  const removeDependent = (index: number) => {
    const updatedDependents = dependents.filter((_, i) => i !== index)
    handleUpdate(data.partner, updatedDependents)
    toast.success("Removed dependent")
  }

  const updateDependent = (index: number, field: keyof Dependent, value: any) => {
    const updatedDependents = [...dependents]
    updatedDependents[index] = { ...updatedDependents[index], [field]: value }
    handleUpdate(data.partner, updatedDependents)
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
                      value={info.personalInformation.dateOfBirth}
                      onChange={(e) => {
                        handleUpdate({
                          ...info,
                          personalInformation: {
                            ...info.personalInformation,
                            dateOfBirth: e.target.value
                          }
                        }, dependents)
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
                      value={info.personalInformation.currentResidency.status}
                      onValueChange={(value: any) => {
                        handleUpdate({
                          ...info,
                          personalInformation: {
                            ...info.personalInformation,
                            currentResidency: {
                              ...info.personalInformation.currentResidency,
                              status: value as PersonalInformation['currentResidency']['status']
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
                          ...info,
                          financialInformation: {
                            ...info.financialInformation,
                            incomeSources: [
                              ...info.financialInformation.incomeSources,
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

                  {info.financialInformation.incomeSources.map((source, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <Select
                          value={source.type}
                          onValueChange={(value) => {
                            const updated = [...info.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              type: value
                            }
                            handleUpdate({
                              ...info,
                              financialInformation: {
                                ...info.financialInformation,
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
                            const updated = [...info.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              amount: Number(e.target.value)
                            }
                            handleUpdate({
                              ...info,
                              financialInformation: {
                                ...info.financialInformation,
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
                            const updated = [...info.financialInformation.incomeSources]
                            updated[index] = { 
                              ...source, 
                              currency: value
                            }
                            handleUpdate({
                              ...info,
                              financialInformation: {
                                ...info.financialInformation,
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
              onClick={addDependent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dependents.map((dependent, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0">
              <div className="col-span-5">
                <Label>Name</Label>
                <Input
                  value={dependent.name}
                  onChange={(e) => updateDependent(index, "name", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="col-span-3">
                <Label>Relationship</Label>
                <Select
                  value={dependent.relationship}
                  onValueChange={(value) => updateDependent(index, "relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={dependent.age}
                  onChange={(e) => updateDependent(index, "age", parseInt(e.target.value))}
                  min={0}
                  max={120}
                />
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDependent(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
            {MARITAL_STATUSES.map((status) => (
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