/* --------------------------------------------------------------------- *
 *  Summary & Export                                                     *
 * --------------------------------------------------------------------- */

"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useFormData } from "@/lib/hooks/use-form-data"

export function Summary() {
  const { formData } = useFormData()

  const json = JSON.stringify(formData, null, 2)

  const downloadJSON = () => {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "questionnaire_data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const printPDF = () => {
    window.print()
  }

  const resetAll = () => {
    localStorage.removeItem("base-recommender-form-data")
    window.location.reload()
  }

  // Inline style for print
  const printStyle = `<style>@media print{ .no-print{display:none!important;} body{ background:#fff !important; } }</style>`

  return (
    <div className="space-y-6" dangerouslySetInnerHTML={{__html: printStyle}}>
      <Card>
        <CardHeader>
          <CardTitle>Your Questionnaire Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {json}
          </div>
          <div className="flex gap-2 mt-4 no-print">
            <Button onClick={downloadJSON}>Download JSON</Button>
            <Button variant="outline" onClick={printPDF}>
              Print / Save to PDF
            </Button>
            <Button variant="destructive" onClick={resetAll}>
              Reset Questionnaire
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 