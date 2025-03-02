import './globals.css'
import { Inter } from 'next/font/google'
import { Nav } from '@/components/ui/nav'
import { BottomNav } from '@/components/bottom-nav'
import { AuthProvider } from '@/lib/auth-context'
import { chomskyFont } from '@/lib/fonts'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Based Guide - Find Your Tax Haven',
  description: 'Explore and compare tax-friendly destinations around the world',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${chomskyFont.variable}`}>
        <AuthProvider>
          <Nav />
          <main className="pb-24">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
