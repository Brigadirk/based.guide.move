import { Badge } from "@/components/ui/badge"
import { Star, Wallet, Plane, Users, Home, Building2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export type ScoreVariant = 
  | "global"
  | "personal"
  | "tax"
  | "visa"
  | "profile"
  | "lifestyle"
  | "business"
  | "housing"

interface ScoreBadgeProps {
  variant: ScoreVariant
  score: number
  showIcon?: boolean
  showLabel?: boolean
  showScore?: boolean
  className?: string
}

const variantConfig = {
  global: {
    label: "Global Score",
    description: "Overall country rating",
    icon: Globe,
    labels: {
      1: "Poor",
      2: "Below Average",
      3: "Average",
      4: "Good",
      5: "Excellent"
    }
  },
  personal: {
    label: "Personal Score",
    description: "Personalized rating for your situation",
    icon: Users,
    labels: {
      1: "Not Suitable",
      2: "Challenging",
      3: "Manageable",
      4: "Well Suited",
      5: "Perfect Match"
    }
  },
  tax: {
    label: "Tax Environment",
    description: "Tax rates and policies",
    icon: Wallet,
    labels: {
      1: "Very High",
      2: "High",
      3: "Moderate",
      4: "Low",
      5: "Very Low"
    }
  },
  visa: {
    label: "Visa Requirements",
    description: "Immigration policies and requirements",
    icon: Plane,
    labels: {
      1: "Very Difficult",
      2: "Difficult",
      3: "Moderate",
      4: "Easy",
      5: "Very Easy"
    }
  },
  profile: {
    label: "Profile Completion",
    description: "Profile completion status",
    icon: Users,
    labels: {
      1: "Just Started",
      2: "Basic Info",
      3: "Half Complete",
      4: "Almost Done",
      5: "Complete"
    }
  },
  lifestyle: {
    label: "Lifestyle",
    description: "Quality of life and amenities",
    icon: Star,
    labels: {
      1: "Poor",
      2: "Basic",
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    }
  },
  business: {
    label: "Business Environment",
    description: "Business regulations and opportunities",
    icon: Building2,
    labels: {
      1: "Very Challenging",
      2: "Challenging",
      3: "Moderate",
      4: "Favorable",
      5: "Very Favorable"
    }
  },
  housing: {
    label: "Housing",
    description: "Housing availability and costs",
    icon: Home,
    labels: {
      1: "Very Expensive",
      2: "Expensive",
      3: "Moderate",
      4: "Affordable",
      5: "Very Affordable"
    }
  }
} as const

// Normalize any score to 1-5 scale
function normalizeScore(score: number, fromScale: number = 100): number {
  if (typeof score !== 'number' || isNaN(score)) return 0
  const clampedScore = Math.max(0, Math.min(fromScale, score))
  return Math.max(1, Math.min(5, Math.round((clampedScore / fromScale) * 5)))
}

// Get color based on score
function getScoreColor(score: number): "success" | "warning" | "destructive" {
  const normalizedScore = normalizeScore(score)
  if (normalizedScore >= 4) return "success"
  if (normalizedScore >= 3) return "warning"
  return "destructive"
}

export function ScoreBadge({ 
  variant, 
  score, 
  showIcon = true,
  showLabel = true,
  showScore = true,
  className 
}: ScoreBadgeProps) {
  const config = variantConfig[variant]
  const color = getScoreColor(score)
  const normalizedScore = normalizeScore(score)
  const Icon = config.icon

  return (
    <Badge 
      variant={color} 
      className={cn(
        "text-xs font-medium items-center",
        (showLabel || showIcon) && showScore && "gap-2",
        (!showLabel && !showIcon) && "gap-1",
        className
      )}
    >
      {(showLabel || showIcon) && (
        <div className="flex items-center gap-1.5">
          {showIcon && <Icon className="h-3.5 w-3.5" />}
          {showLabel && <span>{config.labels[normalizedScore as keyof typeof config.labels]}</span>}
        </div>
      )}
      {showScore && (
        <div className={cn(
          "flex items-center gap-1",
          (showLabel || showIcon) && "border-l pl-2 border-white/20"
        )}>
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>{normalizedScore}/5</span>
        </div>
      )}
    </Badge>
  )
} 