import { Metadata } from "next"
import { LoginForm } from "@/app/(auth)/login/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center py-12">
      <LoginForm />
    </div>
  )
} 