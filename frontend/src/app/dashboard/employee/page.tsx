'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './employee.module.css'

interface Expense {
  id: number
  title: string
  description: string
  totalAmount: number
  status: string
  submissionDate: string | null
  createdAt: string
}

export default function EmployeeDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    monthlyTotal: 0
  })

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  const fetchExpenses = async () => {
    try {
      if (!user) return

      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        }
      })

      if (response.ok) {
        const data: Expense[] = await response.json()
        setExpenses(data)

        // Calculate stats
        const pending = data.filter(e => e.status === 'pending').length
        const approved = data.filter(e => e.status === 'approved').length

        // Calculate monthly total (current month)
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const monthlyTotal = data
          .filter(e => {
            const expenseDate = new Date(e.createdAt)
            return expenseDate.getMonth() === currentMonth &&
                   expenseDate.getFullYear() === currentYear
          })
          .reduce((sum, e) => sum + e.totalAmount, 0)

        setStats({ pending, approved, monthlyTotal })
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    }
  }

  const handleCreateExpense = () => {
    router.push('/dashboard/employee/create-expense')
  }

  const handleViewAllExpenses = () => {
    router.push('/dashboard/employee/expenses')
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

  // Get latest 3 expenses
  const latestExpenses = expenses.slice(0, 3)

  return (
    <DashboardLayout requiredRole="employee">
      <div className={styles.dashboard}>
        <h2 className={styles.pageTitle}>一般従業員ダッシュボード</h2>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📝</div>
            <h3 className={styles.cardTitle}>新規申請</h3>
            <p className={styles.cardDescription}>
              新しい経費申請を作成します
            </p>
            <button className={styles.primaryButton} onClick={handleCreateExpense}>
              申請を作成
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📋</div>
            <h3 className={styles.cardTitle}>申請中</h3>
            <p className={styles.cardDescription}>
              承認待ちの申請
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>{stats.pending}</span>
              <span className={styles.statsLabel}>件</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>✅</div>
            <h3 className={styles.cardTitle}>承認済み</h3>
            <p className={styles.cardDescription}>
              承認済みの申請
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>{stats.approved}</span>
              <span className={styles.statsLabel}>件</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>💰</div>
            <h3 className={styles.cardTitle}>今月の合計</h3>
            <p className={styles.cardDescription}>
              今月の経費申請額
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>{formatAmount(stats.monthlyTotal)}</span>
              <span className={styles.statsLabel}>合計</span>
            </div>
          </div>
        </div>

        <div className={styles.myExpenses}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>マイ経費申請</h3>
            <button className={styles.viewAllButton} onClick={handleViewAllExpenses}>すべて表示</button>
          </div>

          <div className={styles.expenseList}>
            {latestExpenses.length === 0 ? (
              <div className={styles.emptyState}>
                <p>まだ経費申請がありません</p>
                <button className={styles.primaryButton} onClick={handleCreateExpense}>
                  最初の申請を作成
                </button>
              </div>
            ) : (
              latestExpenses.map((expense) => (
                <div key={expense.id} className={styles.expenseCard}>
                  <div className={styles.expenseHeader}>
                    <h4 className={styles.expenseTitle}>{expense.title}</h4>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(expense.status)}`}>
                      {getStatusText(expense.status)}
                    </span>
                  </div>
                  {expense.description && (
                    <p className={styles.expenseDescription}>
                      {expense.description}
                    </p>
                  )}
                  <div className={styles.expenseFooter}>
                    <span className={styles.expenseDate}>
                      {formatDate(expense.submissionDate || expense.createdAt)}
                    </span>
                    <span className={styles.expenseAmount}>
                      {formatAmount(expense.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
