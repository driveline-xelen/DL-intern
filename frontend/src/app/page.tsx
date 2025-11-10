'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // ログイン済みの場合は権限に応じたダッシュボードへリダイレクト
        switch (user.role) {
          case 'admin':
            router.push('/dashboard/admin')
            break
          case 'accountant':
            router.push('/dashboard/accountant')
            break
          case 'employee':
            router.push('/dashboard/employee')
            break
          default:
            router.push('/login')
        }
      } else {
        // 未ログインの場合はログインページへリダイレクト
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: '#666'
    }}>
      読み込み中...
    </main>
  )
}
