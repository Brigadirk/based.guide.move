import { HTMLAttributes } from "react"
import { FieldValues, UseFormReturn } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Form } from "@/components/ui/form"

interface AuthFormProps<TFormData extends FieldValues> extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFormData>
  onSubmit: (data: TFormData) => Promise<void>
  children: React.ReactNode
}

export function AuthForm<TFormData extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: AuthFormProps<TFormData>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
        {...props}
      >
        {children}
      </form>
    </Form>
  )
} 