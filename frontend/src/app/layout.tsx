import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata = {
  title: '経費申請アプリ',
  description: 'Expense Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
