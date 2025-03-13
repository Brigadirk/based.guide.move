import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { AuthForm } from "./AuthForm"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/auth/validation"

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>
  isLoading?: boolean
  error?: React.ReactNode
  submitLabel?: string
}

export function ResetPasswordForm({ onSubmit, isLoading, error, submitLabel = "Reset Password" }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  return (
    <AuthForm form={form} onSubmit={onSubmit}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Setting password..." : submitLabel}
        </Button>
      </div>
    </AuthForm>
  )
} 