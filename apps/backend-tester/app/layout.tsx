import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Backend Tester - BasedGuide',
  description: 'Test backend API endpoints',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '20px', backgroundColor: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}
