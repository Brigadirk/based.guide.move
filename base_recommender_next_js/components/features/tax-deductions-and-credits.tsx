/* --------------------------------------------------------------------- *
 *  Tax Deductions & Credits – quick-win subset                          *
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormData } from "@/lib/hooks/use-form-data"
import { SectionHint } from "@/components/ui/section-hint"

type Deduction = {
  type: string
  category: string
  country: string
  amount: string
  description: string
}

const TYPE_OPTIONS = [
  "Charitable Donation",
  "Mortgage Interest",
  "Education Expenses",
  "Medical Expenses",
  "Business Expense",
  "Other",
] as const

export function TaxDeductionsAndCredits({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { getFormData, updateFormData } = useFormData()

  const skip: boolean =
    getFormData("taxDeductionsAndCredits.skip") ?? false

  const deductions: Deduction[] =
    getFormData("taxDeductionsAndCredits.potentialDeductions") ?? []
  const setDeductions = (next: Deduction[]) =>
    updateFormData("taxDeductionsAndCredits.potentialDeductions", next)

  /* draft item */
  const [draft, setDraft] = useState<Deduction>({
    type: "",
    category: "",
    country: "",
    amount: "",
    description: "",
  })

  const resetDraft = () =>
    setDraft({
      type: "",
      category: "",
      country: "",
      amount: "",
      description: "",
    })

  const canAdd =
    draft.type && draft.category && draft.country && draft.amount

  const canContinue = skip || deductions.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Deductions & Credits</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          Declaring potential deductions and credits upfront helps evaluate realistic tax liabilities and ensure recommendations include all savings opportunities available in your destination country.
        </SectionHint>

        <SectionHint>
          {/* Skip */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip_deductions"
              checked={skip}
              onCheckedChange={(v) =>
                updateFormData("taxDeductionsAndCredits.skip", !!v)
              }
            />
            <Label htmlFor="skip_deductions">
              I'm not expecting any deductions / credits
            </Label>
          </div>
        </SectionHint>

        {!skip && (
          <>
            {/* Existing list */}
            {deductions.length > 0 && (
              <div className="space-y-2">
                {deductions.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3"
                  >
                    <span className="font-medium">
                      {d.type} – {d.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {d.country}: {Number(d.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeductions(deductions.filter((_, i) => i !== idx))
                      }
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {deductions.length === 0 && (
              <p className="text-sm text-destructive">
                Add at least one deduction or tick "skip" to continue.
              </p>
            )}

            {/* Add form */}
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="font-semibold">Add possible deduction / credit</h3>

              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={draft.type}
                  onValueChange={(v) => setDraft({ ...draft, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Category * (e.g. Housing, Education…) "
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
              />
              <Input
                placeholder="Country *"
                value={draft.country}
                onChange={(e) =>
                  setDraft({ ...draft, country: e.target.value })
                }
              />
              <Input
                type="number"
                min={0}
                placeholder="Amount *"
                value={draft.amount}
                onChange={(e) =>
                  setDraft({ ...draft, amount: e.target.value })
                }
              />
              <Textarea
                placeholder="Description / notes (optional)"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />

              <Button
                disabled={!canAdd}
                onClick={() => {
                  setDeductions([...deductions, draft])
                  resetDraft()
                }}
              >
                Add
              </Button>
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