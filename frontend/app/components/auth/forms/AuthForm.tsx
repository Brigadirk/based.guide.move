import { HTMLAttributes } from "react"
import { UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"

interface AuthFormProps extends HTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void>
  children: React.ReactNode
}

export function AuthForm({
  form,
  onSubmit,
  children,
  className,
  ...props
}: AuthFormProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-6", className)}
      {...props}
    >
      {children}
    </form>
  )
} 