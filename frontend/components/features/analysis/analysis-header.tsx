'use client'

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, Share2, Copy } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ScoreBadge } from "@/components/ui/score-badge"
import { Analysis } from "@/app/analyses/[id]/mockData"
import { cn } from "@/lib/utils"

interface AnalysisHeaderProps {
  analysis: {
    id: string
    score: number
    createdAt: string
  }
  variant?: 'default' | 'compact'
  className?: string
}

export function AnalysisHeader({ 
  analysis, 
  variant = 'default',
  className 
}: AnalysisHeaderProps) {
  const formattedDate = formatDate(analysis.createdAt)
  const shortId = analysis.id ? `${analysis.id.slice(0, 4)}...` : ''
  const isCompact = variant === 'compact'

  if (isCompact) {
    return (
      <CardHeader className={cn("pt-3 pb-2", className)}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formattedDate}
          </p>
          <ScoreBadge 
            variant="global"
            score={analysis.score}
            showLabel={false}
            className="text-sm px-2 py-0.5"
          />
        </div>
      </CardHeader>
    )
  }

  return (
    <CardHeader className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">
            Analysis Results
          </CardTitle>
          <button className="p-2 rounded hover:bg-muted transition-colors">
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded hover:bg-muted transition-colors">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <ScoreBadge 
          variant="global"
          score={analysis.score}
          showLabel={false}
          className="text-sm px-2.5 py-0.5"
        />
      </div>
      <CardDescription>
        {formattedDate} | ID: {shortId}
        <button 
          className="ml-2 p-1 rounded hover:bg-muted transition-colors" 
          onClick={() => navigator.clipboard.writeText(analysis.id)}
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>
      </CardDescription>
    </CardHeader>
  )
}