'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
  children?: ReactNode
  requiredRole?: 'admin' | 'accountant' | 'employee'
}

export default function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }

    if (requiredRole && user && user.role !== requiredRole) {
      // 権限が合わない場合は適切なダッシュボードにリダイレクト
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
      }
    }
  }, [user, isLoading, requiredRole, router])

  if (isLoading) {
    return (
      <div className={styles.loading}>
        読み込み中...
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者'
      case 'accountant':
        return '経理担当'
      case 'employee':
        return '一般従業員'
      default:
        return role
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>経費申請システム</h1>
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.fullName}</span>
              <span className={styles.userRole}>({getRoleLabel(user.role)})</span>
              <span className={styles.userDept}>{user.department}</span>
            </div>
            <button onClick={logout} className={styles.logoutButton}>
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
