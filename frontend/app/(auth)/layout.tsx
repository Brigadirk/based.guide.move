import { Metadata } from "next"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="mx-auto w-full max-w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
} 