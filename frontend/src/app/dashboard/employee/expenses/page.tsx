'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './expenses.module.css'

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
}

export default function ExpensesListPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user, filterStatus])

  const fetchExpenses = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!user) {
        throw new Error('ユーザー情報が見つかりません')
      }

      const url = filterStatus === 'all'
        ? 'http://localhost:8080/api/expenses'
        : `http://localhost:8080/api/expenses?status=${filterStatus}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        }
      })

      if (!response.ok) {
        throw new Error('経費申請の取得に失敗しました')
      }

      const data = await response.json()
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '経費申請の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return styles.statusDraft
      case 'pending':
        return styles.statusPending
      case 'approved':
        return styles.statusApproved
      case 'rejected':
        return styles.statusRejected
      default:
        return styles.statusDraft
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き'
      case 'pending':
        return '承認待ち'
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '却下'
      default:
        return status
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
    <DashboardLayout requiredRole="employee">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.pageTitle}>マイ経費申請</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.createButton}
              onClick={() => router.push('/dashboard/employee/create-expense')}
            >
              + 新規申請
            </button>
            <button
              className={styles.backButton}
              onClick={() => router.back()}
            >
              ← 戻る
            </button>
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filterStatus === 'all' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              すべて
            </button>
            <button
              className={`${styles.filterButton} ${filterStatus === 'draft' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterStatus('draft')}
            >
              下書き
            </button>
            <button
              className={`${styles.filterButton} ${filterStatus === 'pending' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              承認待ち
            </button>
            <button
              className={`${styles.filterButton} ${filterStatus === 'approved' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              承認済み
            </button>
            <button
              className={`${styles.filterButton} ${filterStatus === 'rejected' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              却下
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : expenses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>経費申請がありません</p>
            <button
              className={styles.createButton}
              onClick={() => router.push('/dashboard/employee/create-expense')}
            >
              最初の申請を作成
            </button>
          </div>
        ) : (
          <div className={styles.expenseList}>
            {expenses.map((expense) => (
              <div key={expense.id} className={styles.expenseCard}>
                <div className={styles.expenseHeader}>
                  <div className={styles.expenseHeaderLeft}>
                    <h3 className={styles.expenseTitle}>{expense.title}</h3>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(expense.status)}`}>
                      {getStatusText(expense.status)}
                    </span>
                  </div>
                  <div className={styles.expenseAmount}>
                    {formatAmount(expense.totalAmount)}
                  </div>
                </div>

                {expense.description && (
                  <p className={styles.expenseDescription}>{expense.description}</p>
                )}

                <div className={styles.expenseFooter}>
                  <div className={styles.expenseDates}>
                    <span className={styles.dateLabel}>作成日:</span>
                    <span className={styles.dateValue}>{formatDate(expense.createdAt)}</span>
                    {expense.submissionDate && (
                      <>
                        <span className={styles.dateSeparator}>|</span>
                        <span className={styles.dateLabel}>申請日:</span>
                        <span className={styles.dateValue}>{formatDate(expense.submissionDate)}</span>
                      </>
                    )}
                    {expense.approvalDate && (
                      <>
                        <span className={styles.dateSeparator}>|</span>
                        <span className={styles.dateLabel}>承認日:</span>
                        <span className={styles.dateValue}>{formatDate(expense.approvalDate)}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.expenseActions}>
                    {(expense.status === 'draft' || expense.status === 'pending') && (
                      <button
                        className={styles.editButton}
                        onClick={() => router.push(`/dashboard/employee/expenses/${expense.id}/edit`)}
                      >
                        編集
                      </button>
                    )}
                    <button
                      className={styles.viewButton}
                      onClick={() => router.push(`/dashboard/employee/expenses/${expense.id}`)}
                    >
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
