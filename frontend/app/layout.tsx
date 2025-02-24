import './globals.css'
import { Inter } from 'next/font/google'
import { Nav } from '@/components/ui/nav'
import { BottomNav } from '@/components/bottom-nav'

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
      <body className={inter.className}>
        <Nav />
        <main className="container mx-auto px-4 py-8 pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
