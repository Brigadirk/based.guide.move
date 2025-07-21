/* --------------------------------------------------------------------- *
 *  Social Security & Pensions – step 1                                 *
 *  Adds current contribution info (yes/no, country, years).            *
 * --------------------------------------------------------------------- */

"use client"

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
import { useFormData } from "@/lib/hooks/use-form-data"
import { useState } from "react"
import { SectionHint } from "@/components/ui/section-hint"

export function SocialSecurityPensions({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { getFormData, updateFormData } = useFormData()

  /* current contributions */
  const contributing: boolean =
    getFormData("socialSecurityAndPensions.currentCountryContributions.isContributing") ?? false

  const country =
    getFormData("socialSecurityAndPensions.currentCountryContributions.country") ?? ""

  const years =
    getFormData("socialSecurityAndPensions.currentCountryContributions.yearsOfContribution") ?? ""

  const canContinue = contributing ? country && years : true

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Security &amp; Pensions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          {/* current contributions */}
          <div className="space-y-3 border rounded-md p-4">
            <h4 className="font-medium">Current Country Contributions</h4>
            <div className="flex items-center gap-2">
              <Checkbox
                id="ssc_contrib"
                checked={contributing}
                onCheckedChange={(v) =>
                  updateFormData(
                    "socialSecurityAndPensions.currentCountryContributions.isContributing",
                    !!v
                  )
                }
              />
              <Label htmlFor="ssc_contrib">I am currently contributing</Label>
            </div>

            {contributing && (
              <div className="space-y-2 mt-2">
                <Input
                  placeholder="Country *"
                  value={country}
                  onChange={(e) =>
                    updateFormData(
                      "socialSecurityAndPensions.currentCountryContributions.country",
                      e.target.value
                    )
                  }
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Years of contribution *"
                  value={years}
                  onChange={(e) =>
                    updateFormData(
                      "socialSecurityAndPensions.currentCountryContributions.yearsOfContribution",
                      e.target.value
                    )
                  }
                />
              </div>
            )}
          </div>
        </SectionHint>

        {/* Future pension contributions */}
        <div className="space-y-3 border rounded-md p-4">
          {(() => {
            const planning: boolean = getFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning") ?? false
            const updPlan = (v:boolean)=>updateFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning",v)

            type FP = { pensionType:string; country:string; expectedAmount:string; startDate:string }
            const fps:FP[] = getFormData("socialSecurityAndPensions.futurePensionContributions.details") ?? []
            const setFps = (n:FP[])=>updateFormData("socialSecurityAndPensions.futurePensionContributions.details",n)

            const [fpDraft,setFpDraft]=useState<FP>({pensionType:"Private",country:"",expectedAmount:"",startDate:""})

            const canAddFp = fpDraft.country && fpDraft.expectedAmount && fpDraft.startDate

            return (
              <>
                <h4 className="font-medium">Future Pension Contributions</h4>
                <div className="flex items-center gap-2">
                  <Checkbox id="plan_pension" checked={planning} onCheckedChange={(v)=>updPlan(!!v)} />
                  <Label htmlFor="plan_pension">I plan to contribute in destination/future</Label>
                </div>

                {planning && (
                  <>
                    {fps.length>0 && (
                      <div className="space-y-2 mt-2">
                        {fps.map((d,idx)=>(
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-2">
                            <span className="font-medium">{d.pensionType} ({d.country})</span>
                            <span className="text-sm text-muted-foreground">{Number(d.expectedAmount).toLocaleString()} starting {d.startDate}</span>
                            <Button variant="ghost" size="icon" onClick={()=>setFps(fps.filter((_,i)=>i!==idx))}>✕</Button>
                          </div>))}
                      </div>)}

                    <div className="space-y-2 mt-2">
                      <Input placeholder="Pension type (e.g. Private, Government) *" value={fpDraft.pensionType} onChange={(e)=>setFpDraft({...fpDraft,pensionType:e.target.value})} />
                      <Input placeholder="Country *" value={fpDraft.country} onChange={(e)=>setFpDraft({...fpDraft,country:e.target.value})} />
                      <Input type="number" min={0} placeholder="Expected annual amount *" value={fpDraft.expectedAmount} onChange={(e)=>setFpDraft({...fpDraft,expectedAmount:e.target.value})} />
                      <Input type="date" placeholder="Start date *" value={fpDraft.startDate} onChange={(e)=>setFpDraft({...fpDraft,startDate:e.target.value})} />
                      <Button disabled={!canAddFp} onClick={()=>{setFps([...fps,fpDraft]);setFpDraft({...fpDraft,country:"",expectedAmount:"",startDate:""})}}>Add</Button>
                    </div>

                    {fps.length===0 && (
                      <p className="text-sm text-destructive mt-1">Add at least one planned contribution.</p>
                    )}
                  </>
                )}
              </>
            )
          })()}
        </div>

        {/* validation update note: handled below */}

        {/* End future pension contributions */}
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!canContinue} onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 