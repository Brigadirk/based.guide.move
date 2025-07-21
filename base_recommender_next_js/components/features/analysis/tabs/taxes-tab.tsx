'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreBadge } from "@/components/ui/score-badge"

interface TaxesTabProps {
  /** Score between 1 and 10 */
  score: number
  taxBurden: number
  taxSavings: number
  originCountry: string
}

export function TaxesTab({ score, taxBurden, taxSavings, originCountry }: TaxesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Taxes
          <ScoreBadge variant="tax" score={score} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/10 rounded-lg p-4">
          <div className="text-center mb-3">
            <p className={`text-3xl font-bold ${taxSavings >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {taxSavings >= 0 ? '+' : ''}{taxSavings.toLocaleString()} $/year
            </p>
            <p className="text-sm text-muted-foreground">
              {taxSavings >= 0 ? 'Estimated savings' : 'Additional cost'} in Portugal
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
            <div className="text-center">
              <p className="text-xl font-semibold">${(taxBurden + (taxSavings < 0 ? 0 : taxSavings)).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{originCountry} Tax</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">${taxBurden.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Portugal Tax</p>
            </div>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium mb-1">Recommendations:</p>
          <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
            <li>Consult with a tax advisor to optimize your tax strategy.</li>
            <li>Consider tax-efficient investment options available in Portugal.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 