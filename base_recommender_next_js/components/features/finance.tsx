"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormData } from "@/lib/hooks/use-form-data"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { formatNumber, parseNumber } from "@/lib/utils/number-format"
import { SectionHint } from "@/components/ui/section-hint"

export function Finance({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormData()
  const currencies = useCurrencies()

  /* ------------------------------------------------------------------ */
  /* Skip full finance section                                          */
  /* ------------------------------------------------------------------ */
  const skip: boolean = getFormData("finance.skipTaxSections") ?? false

  /* ------------------------------------------------------------------ */
  /* Total wealth                                                       */
  /* ------------------------------------------------------------------ */
  const totalWealth = getFormData("finance.totalWealth") ?? ""
  const currency = getFormData("finance.totalWealthCurrency") ?? currencies[0] ?? "USD"

  /* ------------------------------------------------------------------ */
  /* Capital gains – planned first-year asset sales                     */
  /* ------------------------------------------------------------------ */
  type Sale = {
    asset: string
    type: string
    holdingPeriod: string
    expectedGain: string
    currency: string
    reason: string
  }

  const sales: Sale[] =
    getFormData("finance.capitalGains.futureSales") ?? []

  const setSales = (next: Sale[]) => {
    updateFormData("finance.capitalGains.futureSales", next)
    updateFormData("finance.capitalGains.hasGains", next.length > 0)
  }

  /* draft sale */
  const [draft, setDraft] = useState<Sale>({
    asset: "",
    type: "Real Estate",
    holdingPeriod: "< 12 months (short-term)",
    expectedGain: "",
    currency: currency,
    reason: "",
  })

  const SALE_TYPES = [
    "Real Estate",
    "Stocks/ETFs",
    "Crypto",
    "Business",
    "Collectibles",
    "Other",
  ] as const

  const HOLDING_PERIODS = [
    "< 12 months (short-term)",
    "12 – 24 months",
    "2 – 3 years",
    "3 – 5 years",
    "5 – 10 years",
    "> 10 years",
  ] as const

  const canAddSale =
    draft.asset && draft.expectedGain && Number(draft.expectedGain) > 0

  /* ------------------------------------------------------------------ */
  /* Income situation & sources                                         */
  /* ------------------------------------------------------------------ */
  const incomeStatus = getFormData("finance.incomeStatus") ?? ""

  const setIncomeStatus = (v: string) =>
    updateFormData("finance.incomeStatus", v)

  type Income = {
    source: string
    country: string
    amount: string
    currency: string
  }

  const incomes: Income[] = getFormData("finance.incomeSources") ?? []
  const setIncomes = (next: Income[]) =>
    updateFormData("finance.incomeSources", next)

  const [incomeDraft, setIncomeDraft] = useState<Income>({
    source: "",
    country: "",
    amount: "",
    currency: currency,
  })

  const canAddIncome =
    incomeDraft.source && incomeDraft.country && incomeDraft.amount

  /* ------------------------------------------------------------------ */
  /* Liabilities                                                        */
  /* ------------------------------------------------------------------ */
  type Liability = {
    category: string
    country: string
    amount: string
    currency: string
    interestRate: string
    paybackTimeline: string
  }

  const liabilities: Liability[] = getFormData("finance.liabilities") ?? []
  const setLiabilities = (next: Liability[]) =>
    updateFormData("finance.liabilities", next)

  const [liabDraft, setLiabDraft] = useState<Liability>({
    category: "Mortgage",
    country: "",
    amount: "",
    currency: currency,
    interestRate: "",
    paybackTimeline: "",
  })

  const LIABILITY_CATS = [
    "Mortgage",
    "Student Loan",
    "Credit Card",
    "Personal Loan",
    "Business Loan",
    "Other",
  ] as const

  const canAddLiab =
    liabDraft.country && liabDraft.amount && liabDraft.category

  /* ------------------------------------------------------------------ */
  /* Expected employment (future income)                                */
  /* ------------------------------------------------------------------ */
  type ExpJob = {
    position: string
    country: string
    expectedIncome: string
    currency: string
  }

  const expJobs: ExpJob[] = getFormData("finance.expectedEmployment") ?? []
  const setExpJobs = (n: ExpJob[]) =>
    updateFormData("finance.expectedEmployment", n)

  const [expDraft, setExpDraft] = useState<ExpJob>({
    position: "",
    country: "",
    expectedIncome: "",
    currency: currency,
  })

  const canAddExp = expDraft.position && expDraft.country && expDraft.expectedIncome

  /* ------------------------------------------------------------------ */
  /* Validation helpers                                                 */
  /* ------------------------------------------------------------------ */
  const incomeRequired = [
    "continuing_income",
    "current_and_new_income",
  ].includes(incomeStatus)

  const incomeValid = !incomeRequired || incomes.length > 0

  const expRequired = ["seeking_income", "current_and_new_income"].includes(
    incomeStatus
  )

  const expValid = !expRequired || expJobs.length > 0

  /* ------------------------------------------------------------------ */
  /* Derived                                                             */
  /* ------------------------------------------------------------------ */
  const baseOk = skip || (!!totalWealth && Number(totalWealth) > 0)
  const canContinue = baseOk && incomeValid && expValid

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          {/* Skip toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="skip_finance"
              checked={skip}
              onCheckedChange={(v) =>
                updateFormData("finance.skipTaxSections", !!v)
              }
            />
            <Label htmlFor="skip_finance">
              Skip detailed tax &amp; finance questions
            </Label>
          </div>
        </SectionHint>

        {/* Total wealth block – hidden if skip */}
        {!skip && (
          <div className="space-y-3">
            <h3 className="font-semibold">Total Net Worth *</h3>
            <p className="text-xs text-muted-foreground">
              Include all assets minus liabilities. Helps determine wealth-based visa thresholds.
            </p>
            <div className="flex gap-2 items-start">
              {/* Currency selector */}
              <div>
                <Select
                  value={currency}
                  onValueChange={(v) =>
                    updateFormData("finance.totalWealthCurrency", v)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Currency
                </p>
              </div>

              {/* Amount input */}
              <div className="flex-1">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(totalWealth)}
                  onChange={(e) => {
                    const parsed = parseNumber(e.target.value)
                    updateFormData("finance.totalWealth", parsed ?? "")
                  }}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated net-worth
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Income status & sources */}
        {!skip && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Income Situation</h3>
            <Select value={incomeStatus} onValueChange={setIncomeStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="continuing_income">Continue Current Income</SelectItem>
                <SelectItem value="current_and_new_income">Current + New Income Mix</SelectItem>
                <SelectItem value="seeking_income">Need New Income Sources</SelectItem>
                <SelectItem value="gainfully_unemployed">Self-Funded (No Income)</SelectItem>
                <SelectItem value="dependent_supported">Financially Supported</SelectItem>
              </SelectContent>
            </Select>

            {/* Income sources – show if status implies existing income */}
            {[
              "continuing_income",
              "current_and_new_income",
            ].includes(incomeStatus) && (
              <div className="space-y-3 border rounded-md p-4">
                <h4 className="font-medium">Current Income Sources</h4>

                {/* existing list */}
                {incomes.length > 0 && (
                  <div className="space-y-2">
                    {incomes.map((inc, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-2"
                      >
                        <span className="font-medium">
                          {inc.source} ({inc.country})
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {inc.currency} {formatNumber(inc.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setIncomes(incomes.filter((_, i) => i !== idx))
                          }
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* add income form */}
                <Input
                  placeholder="Source (e.g. Salary, Rental…) *"
                  value={incomeDraft.source}
                  onChange={(e) =>
                    setIncomeDraft({ ...incomeDraft, source: e.target.value })
                  }
                />
                <Input
                  placeholder="Country *"
                  value={incomeDraft.country}
                  onChange={(e) =>
                    setIncomeDraft({ ...incomeDraft, country: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Amount *"
                    value={formatNumber(incomeDraft.amount)}
                    onChange={(e) => {
                      const parsed = parseNumber(e.target.value)
                      setIncomeDraft({ ...incomeDraft, amount: parsed ? String(parsed) : "" })
                    }}
                  />
                  <Select
                    value={incomeDraft.currency}
                    onValueChange={(v) =>
                      setIncomeDraft({ ...incomeDraft, currency: v })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={!canAddIncome}
                  onClick={() => {
                    setIncomes([...incomes, incomeDraft])
                    setIncomeDraft({ ...incomeDraft, source: "", country: "", amount: "" })
                  }}
                >
                  Add income source
                </Button>

                {!incomeValid && (
                  <p className="text-sm text-destructive">
                    At least one income source required for the selected option.
                  </p>
                )}
              </div>
            )}

            {/* Expected employment – show for seeking income or mix */}
            {[
              "seeking_income",
              "current_and_new_income",
            ].includes(incomeStatus) && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Expected employment / new income</h4>

                {expJobs.length > 0 && (
                  <div className="space-y-2">
                    {expJobs.map((ej, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-2"
                      >
                        <span className="font-medium">
                          {ej.position} ({ej.country})
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ej.currency} {formatNumber(ej.expectedIncome)}
                        </span>
                        <Button variant="ghost" size="icon" onClick={()=>setExpJobs(expJobs.filter((_,i)=>i!==idx))}>✕</Button>
                      </div>
                    ))}
                  </div>
                )}

                <Input placeholder="Position / business type *" value={expDraft.position} onChange={(e)=>setExpDraft({...expDraft,position:e.target.value})} />
                <Input placeholder="Country *" value={expDraft.country} onChange={(e)=>setExpDraft({...expDraft,country:e.target.value})} />
                <div className="flex gap-2">
                  <Input type="text" inputMode="numeric" placeholder="Expected income *" value={formatNumber(expDraft.expectedIncome)} onChange={(e)=>{
                    const parsed = parseNumber(e.target.value)
                    setExpDraft({ ...expDraft, expectedIncome: parsed ? String(parsed) : "" })
                  }} />
                  <Select value={expDraft.currency} onValueChange={(v)=>setExpDraft({...expDraft,currency:v})}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currencies.map((c)=>(<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button disabled={!canAddExp} onClick={()=>{ setExpJobs([...expJobs, expDraft]); setExpDraft({...expDraft,position:"",country:"",expectedIncome:""})}}>Add expected income</Button>

                {!expValid && (
                  <p className="text-sm text-destructive">Add at least one expected employment.</p>
                )}
              </div>
            )}

            {/* Liabilities subsection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Liabilities / Debts</h3>
              <p className="text-xs text-muted-foreground mb-1">
                Outstanding balances such as mortgages, student loans, or credit cards.
              </p>

              {liabilities.length > 0 && (
                <div className="space-y-2">
                  {liabilities.map((l, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-2"
                    >
                      <span className="font-medium">
                        {l.category} ({l.country})
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {l.currency} {formatNumber(l.amount)} • {l.interestRate}% • {l.paybackTimeline}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setLiabilities(liabilities.filter((_, i) => i !== idx))
                        }
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* add liability form */}
              <div className="space-y-2 border rounded-md p-4">
                <h4 className="font-medium">Add liability</h4>
                <Select
                  value={liabDraft.category}
                  onValueChange={(v) => setLiabDraft({ ...liabDraft, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIABILITY_CATS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Country *"
                  value={liabDraft.country}
                  onChange={(e) => setLiabDraft({ ...liabDraft, country: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Amount *"
                    value={formatNumber(liabDraft.amount)}
                    onChange={(e) => {
                      const parsed = parseNumber(e.target.value)
                      setLiabDraft({ ...liabDraft, amount: parsed ? String(parsed) : "" })
                    }}
                  />
                  <Select
                    value={liabDraft.currency}
                    onValueChange={(v) => setLiabDraft({ ...liabDraft, currency: v })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Outstanding balance in chosen currency</p>
                <Input
                  type="number"
                  placeholder="Interest rate %"
                  min={0}
                  value={liabDraft.interestRate}
                  onChange={(e) => setLiabDraft({ ...liabDraft, interestRate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mb-1">Annual percentage rate (APR)</p>
                <Input
                  placeholder="Payback timeline (e.g. 5 years)"
                  value={liabDraft.paybackTimeline}
                  onChange={(e) => setLiabDraft({ ...liabDraft, paybackTimeline: e.target.value })}
                />
                <Button
                  disabled={!canAddLiab}
                  onClick={() => {
                    setLiabilities([...liabilities, liabDraft])
                    setLiabDraft({ ...liabDraft, country: "", amount: "", interestRate: "", paybackTimeline: "" })
                  }}
                >
                  Add liability
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Capital gains subsection – always visible if not skip */}
        {!skip && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Planned Asset Sales in First Year (Capital Gains)
            </h3>
            <p className="text-xs text-muted-foreground">
              Capital gain = sale price minus purchase cost & fees. Positive numbers are taxable gains.
            </p>

            {/* existing list */}
            {sales.length > 0 && (
              <div className="space-y-2">
                {sales.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3"
                  >
                    <span className="font-medium">
                      {s.asset} – {s.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {s.currency} {formatNumber(s.expectedGain)} •{' '}
                      {s.holdingPeriod}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSales(sales.filter((_, i) => i !== idx))
                      }
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* add sale form */}
            <div className="space-y-3 border rounded-md p-4">
              <h4 className="font-medium">Add planned sale</h4>
              <Input
                placeholder="Asset / description *"
                value={draft.asset}
                onChange={(e) => setDraft({ ...draft, asset: e.target.value })}
              />

              {/* type select */}
              <div className="flex gap-2">
                <Select
                  value={draft.type}
                  onValueChange={(v) => setDraft({ ...draft, type: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={draft.holdingPeriod}
                  onValueChange={(v) =>
                    setDraft({ ...draft, holdingPeriod: v })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLDING_PERIODS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Expected gain *"
                  value={formatNumber(draft.expectedGain)}
                  onChange={(e) => {
                    const parsed = parseNumber(e.target.value)
                    setDraft({ ...draft, expectedGain: parsed ? String(parsed) : "" })
                  }}
                />
                <Select
                  value={draft.currency}
                  onValueChange={(v) => setDraft({ ...draft, currency: v })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Reason for sale (optional)"
                value={draft.reason}
                onChange={(e) =>
                  setDraft({ ...draft, reason: e.target.value })
                }
              />

              <Button
                disabled={!canAddSale}
                onClick={() => {
                  setSales([...sales, draft])
                  setDraft({ ...draft, asset: "", expectedGain: "", reason: "" })
                }}
              >
                Add sale
              </Button>
            </div>
          </div>
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