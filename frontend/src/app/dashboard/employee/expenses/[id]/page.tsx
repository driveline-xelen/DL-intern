'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './expense-detail.module.css'

interface ExpenseItem {
  id: number
  date: string
  category: string
  description: string
  amount: number
  receiptUrl?: string
  createdAt: string
  updatedAt: string
}

interface Expense {
  id: number
  userId: number
  userName: string
  userDepartment: string
  title: string
  description: string
  totalAmount: number
  status: string
  submissionDate?: string
  approvalDate?: string
  approverId?: number
  approverName?: string
  createdAt: string
  updatedAt: string
  items: ExpenseItem[]
}

export default function ExpenseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && params.id) {
      fetchExpenseDetail()
    }
  }, [user, params.id])

  const fetchExpenseDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/expenses/${params.id}`, {
        headers: {
          'X-User-Id': user?.id.toString() || ''
        }
      })

      if (!response.ok) {
        throw new Error('経費申請の取得に失敗しました')
      }

      const data = await response.json()
      setExpense(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '下書き'
      case 'pending': return '申請中'
      case 'approved': return '承認済み'
      case 'rejected': return '却下'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return styles.statusDraft
      case 'pending': return styles.statusPending
      case 'approved': return styles.statusApproved
      case 'rejected': return styles.statusRejected
      default: return ''
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className={styles.loading}>読み込み中...</div>
      </DashboardLayout>
    )
  }

  if (error || !expense) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className={styles.error}>{error || '経費申請が見つかりません'}</div>
        <button className={styles.backButton} onClick={() => router.back()}>
          戻る
        </button>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ← 戻る
          </button>
          <h2 className={styles.pageTitle}>経費申請詳細</h2>
        </div>

        <div className={styles.expenseCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.expenseTitle}>{expense.title}</h3>
              <span className={`${styles.statusBadge} ${getStatusClass(expense.status)}`}>
                {getStatusLabel(expense.status)}
              </span>
            </div>
            <div className={styles.totalAmount}>
              <span className={styles.amountLabel}>合計金額</span>
              <span className={styles.amountValue}>¥{expense.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>申請者</span>
                <span className={styles.infoValue}>{expense.userName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>部署</span>
                <span className={styles.infoValue}>{expense.userDepartment || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>作成日</span>
                <span className={styles.infoValue}>
                  {new Date(expense.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              {expense.submissionDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>申請日</span>
                  <span className={styles.infoValue}>
                    {new Date(expense.submissionDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
              {expense.approvalDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>承認日</span>
                  <span className={styles.infoValue}>
                    {new Date(expense.approvalDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
              {expense.approverName && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>承認者</span>
                  <span className={styles.infoValue}>{expense.approverName}</span>
                </div>
              )}
            </div>

            {expense.description && (
              <div className={styles.descriptionSection}>
                <h4 className={styles.sectionTitle}>説明</h4>
                <p className={styles.description}>{expense.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>経費明細</h3>
          {expense.items && expense.items.length > 0 ? (
            <div className={styles.itemsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colDate}>日付</span>
                <span className={styles.colCategory}>カテゴリ</span>
                <span className={styles.colDescription}>説明</span>
                <span className={styles.colAmount}>金額</span>
                <span className={styles.colReceipt}>領収書</span>
              </div>
              {expense.items.map((item) => (
                <div key={item.id} className={styles.tableRow}>
                  <span className={styles.colDate}>
                    {new Date(item.date).toLocaleDateString('ja-JP')}
                  </span>
                  <span className={styles.colCategory}>{item.category}</span>
                  <span className={styles.colDescription}>{item.description || '-'}</span>
                  <span className={styles.colAmount}>¥{item.amount.toLocaleString()}</span>
                  <span className={styles.colReceipt}>
                    {item.receiptUrl ? (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.receiptLink}
                      >
                        表示
                      </a>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noItems}>経費明細がありません</div>
          )}
        </div>

        <div className={styles.actions}>
          {expense.status === 'draft' && (
            <>
              <button
                className={styles.editButton}
                onClick={() => router.push(`/dashboard/employee/expenses/${expense.id}/edit`)}
              >
                編集
              </button>
              <button className={styles.deleteButton}>
                削除
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
