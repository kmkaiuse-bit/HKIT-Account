import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Expense Claim Approval Dashboard',
  description: 'Manage and approve staff expense claims',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
