import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface AuthFormProps {
  onSubmit: (email: string, password?: string) => Promise<void>
  isLoading: boolean
  error?: string | null
  submitText: string
  alternateLink: {
    text: string
    href: string
    linkText: string
  }
  emailOnly?: boolean
}

export function AuthForm({ 
  onSubmit, 
  isLoading, 
  error, 
  submitText,
  alternateLink,
  emailOnly = false
}: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, emailOnly ? undefined : password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {!emailOnly && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? `${submitText}...` : submitText}
      </Button>

      <p className="text-center mt-4 text-sm text-muted-foreground">
        {alternateLink.text}{" "}
        <Link href={alternateLink.href} className="text-primary hover:underline">
          {alternateLink.linkText}
        </Link>
      </p>
    </form>
  )
} 