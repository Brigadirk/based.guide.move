/* --------------------------------------------------------------------- *
 *  Future Financial Plans – quick-win subset                            *
 *  Captures planned investments list OR lets user skip.                *
 * --------------------------------------------------------------------- */

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
import { useFormData } from "@/lib/hooks/use-form-data"
import { SectionHint } from "@/components/ui/section-hint"

type Investment = { type: string; country: string; estimatedValue: string }
type RetirementPlan = { country: string; estimatedAmount: string; timeline: string }

const TYPES = ["Real-estate", "Stocks / ETFs", "Business", "Crypto", "Other"] as const

export function FutureFinancialPlans({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormData()

  const skip: boolean =
    getFormData("futureFinancialPlans.skip") ?? false

  const plans: Investment[] =
    getFormData("futureFinancialPlans.plannedInvestments") ?? []
  const setPlans = (next: Investment[]) =>
    updateFormData("futureFinancialPlans.plannedInvestments", next)

  const retirePlans: RetirementPlan[] =
    getFormData("futureFinancialPlans.retirementPlans") ?? []
  const setRetire = (n: RetirementPlan[]) =>
    updateFormData("futureFinancialPlans.retirementPlans", n)

  const [draft, setDraft] = useState<Investment>({
    type: "",
    country: "",
    estimatedValue: "",
  })

  const [retDraft, setRetDraft] = useState<RetirementPlan>({
    country: "",
    estimatedAmount: "",
    timeline: "",
  })

  const resetDraft = () =>
    setDraft({ type: "", country: "", estimatedValue: "" })

  const canAdd = draft.type && draft.country && draft.estimatedValue
  const canAddRet = retDraft.country && retDraft.estimatedAmount && retDraft.timeline
  const canContinue = skip || plans.length > 0 || retirePlans.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Future Financial Plans</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          {/* Skip */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip_future"
              checked={skip}
              onCheckedChange={(v) =>
                updateFormData("futureFinancialPlans.skip", !!v)
              }
            />
            <Label htmlFor="skip_future">No planned investments or business</Label>
          </div>
        </SectionHint>

        {!skip && (
          <>
            {/* Existing list */}
            {plans.length > 0 && (
              <div className="space-y-2">
                {plans.map((p, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3"
                  >
                    <span className="font-medium">{p.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {p.country} – {Number(p.estimatedValue).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPlans(plans.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add form */}
            <div className="space-y-3 border rounded-md p-4">
              <h3 className="font-semibold">Add planned investment</h3>

              <div className="space-y-1">
                <Label>Type *</Label>
                <Select
                  value={draft.type}
                  onValueChange={(v) => setDraft({ ...draft, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Country *"
                value={draft.country}
                onChange={(e) =>
                  setDraft({ ...draft, country: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Estimated value *"
                min={0}
                value={draft.estimatedValue}
                onChange={(e) =>
                  setDraft({ ...draft, estimatedValue: e.target.value })
                }
              />

              <Button
                disabled={!canAdd}
                onClick={() => {
                  setPlans([...plans, draft])
                  resetDraft()
                }}
              >
                Add
              </Button>
            </div>

            {/* Retirement Plans */}
            <h3 className="font-semibold text-lg">Retirement Plans</h3>

            {retirePlans.length > 0 && (
              <div className="space-y-2">
                {retirePlans.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3"
                  >
                    <span className="font-medium">{r.country}</span>
                    <span className="text-sm text-muted-foreground">
                      {Number(r.estimatedAmount).toLocaleString()} • {r.timeline}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setRetire(retirePlans.filter((_,i)=>i!==idx))}>✕</Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border rounded-md p-4">
              <h4 className="font-medium">Add retirement plan</h4>
              <Input placeholder="Country *" value={retDraft.country} onChange={(e)=>setRetDraft({...retDraft,country:e.target.value})} />
              <Input type="number" min={0} placeholder="Estimated amount *" value={retDraft.estimatedAmount} onChange={(e)=>setRetDraft({...retDraft,estimatedAmount:e.target.value})} />
              <Input placeholder="Timeline (e.g. 2045) *" value={retDraft.timeline} onChange={(e)=>setRetDraft({...retDraft,timeline:e.target.value})} />
              <Button disabled={!canAddRet} onClick={()=>{ setRetire([...retirePlans, retDraft]); setRetDraft({...retDraft,country:"",estimatedAmount:"",timeline:""})}}>Add</Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!canContinue} onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 