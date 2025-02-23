import { Progress } from "@/components/ui/progress"
import { ProfileProgress } from "@/types/profile"

export function ProfileProgressBar({ progress }: { progress: ProfileProgress }) {
  const percentage = (progress.completed / progress.total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Profile Completion</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} />
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className={progress.sections.basic ? "text-primary" : ""}>
          Basic Info
        </div>
        <div className={progress.sections.tax ? "text-primary" : ""}>
          Tax Preferences
        </div>
        <div className={progress.sections.lifestyle ? "text-primary" : ""}>
          Lifestyle
        </div>
      </div>
    </div>
  )
} 