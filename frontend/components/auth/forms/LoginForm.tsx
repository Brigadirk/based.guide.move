import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { AuthForm } from "./AuthForm"
import { loginSchema, type LoginFormData } from "@/lib/auth/validation"

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  error?: React.ReactNode
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  })

  const handleFormSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <AuthForm form={form} onSubmit={handleFormSubmit}>
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
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Sending magic link..." : "Send magic link"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            We'll send you a magic link to your email
          </p>
        </div>
      </div>
    </AuthForm>
  )
} 