import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { AuthForm } from "./AuthForm"
import { authSchema, type AuthFormData } from "@/lib/auth/validation"

interface UnifiedAuthFormProps {
  onSubmit: (data: AuthFormData) => Promise<void>
  isLoading?: boolean
  error?: React.ReactNode
}

export function UnifiedAuthForm({ onSubmit, isLoading, error }: UnifiedAuthFormProps) {
  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
    },
  })

  return (
    <AuthForm form={form} onSubmit={onSubmit}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending link..." : "Continue"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          A secure sign in link will be sent to your email
        </div>
      </div>
    </AuthForm>
  )
} 