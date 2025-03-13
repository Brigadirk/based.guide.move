import './globals.css'
import { Inter } from 'next/font/google'
import { Nav } from '@/components/ui/nav'
import { BottomNav } from '@/components/layout/bottom-nav'
import { chomskyFont } from '@/lib/fonts'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { getServerSession } from '@/lib/auth/session-provider'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Based Guide - Find Your Tax Haven',
  description: 'Explore and compare tax-friendly destinations around the world',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const session = await getServerSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${chomskyFont.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider initialSession={session}>
            <Nav />
            <main className="pb-24">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
