import { ProfileProgress } from "@/types/profile"
import { SimpleProgress, Step } from "./progress-steps"
import { User, Wallet, MapPin } from "lucide-react"

const PROFILE_STEPS: Step[] = [
  {
    id: "basic",
    icon: <User className="h-2.5 w-2.5" />,
  },
  {
    id: "tax",
    icon: <Wallet className="h-2.5 w-2.5" />,
  },
  {
    id: "lifestyle",
    icon: <MapPin className="h-2.5 w-2.5" />,
  }
]

export function ProfileProgressBar({ progress }: { progress: ProfileProgress }) {
  const steps = PROFILE_STEPS.map(step => ({
    ...step,
    completed: progress.sections[step.id as keyof typeof progress.sections]
  }))

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Profile Completion</span>
        <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
      </div>
      <SimpleProgress steps={steps} />
    </div>
  )
} 