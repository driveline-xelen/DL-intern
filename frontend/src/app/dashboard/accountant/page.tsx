'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import styles from './accountant.module.css'

interface Expense {
  id: number
  title: string
  description: string
  totalAmount: number
  status: string
  submissionDate: string | null
  approvalDate: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: number
    username: string
    fullName: string
    email: string
    role: string
  }
}

export default function AccountantDashboard() {
  const router = useRouter()
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingExpenses()
  }, [])

  const fetchPendingExpenses = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/expenses/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('承認待ち申請の取得に失敗しました')
      }

      const data = await response.json()
      setPendingExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '承認待ち申請の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  return (
    <DashboardLayout requiredRole="accountant">
      <div className={styles.dashboard}>
        <h2 className={styles.pageTitle}>経理担当ダッシュボード</h2>

        <div className={styles.grid}>
          <div
            className={styles.card}
            onClick={() => router.push('/dashboard/accountant/approvals')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardIcon}>📋</div>
            <h3 className={styles.cardTitle}>承認待ち申請</h3>
            <p className={styles.cardDescription}>
              承認が必要な経費申請を確認します
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>{isLoading ? '-' : pendingExpenses.length}</span>
              <span className={styles.statsLabel}>件の申請</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>✅</div>
            <h3 className={styles.cardTitle}>承認済み申請</h3>
            <p className={styles.cardDescription}>
              承認済みの申請一覧を表示します
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>-</span>
              <span className={styles.statsLabel}>今月承認</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <h3 className={styles.cardTitle}>今月の総額</h3>
            <p className={styles.cardDescription}>
              今月の経費申請合計金額
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>-</span>
              <span className={styles.statsLabel}>承認済み</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <h3 className={styles.cardTitle}>レポート</h3>
            <p className={styles.cardDescription}>
              経費レポートを作成・エクスポート
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>-</span>
              <span className={styles.statsLabel}>カテゴリ</span>
            </div>
          </div>
        </div>

        <div className={styles.pendingApprovals}>
          <h3 className={styles.sectionTitle}>承認待ちリスト</h3>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {isLoading ? (
            <div className={styles.loading}>読み込み中...</div>
          ) : pendingExpenses.length === 0 ? (
            <div className={styles.emptyState}>
              承認待ちの申請はありません
            </div>
          ) : (
            <div className={styles.approvalTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colDate}>申請日</span>
                <span className={styles.colUser}>申請者</span>
                <span className={styles.colTitle}>タイトル</span>
                <span className={styles.colAmount}>金額</span>
              </div>
              {pendingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={styles.tableRow}
                  onClick={() => router.push(`/dashboard/accountant/approvals/${expense.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={styles.colDate}>{formatDate(expense.submissionDate)}</span>
                  <span className={styles.colUser}>{expense.user.fullName}</span>
                  <span className={styles.colTitle}>{expense.title}</span>
                  <span className={styles.colAmount}>{formatAmount(expense.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
