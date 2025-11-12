'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './approvals.module.css'

/**
 * 【課題】以下のAPIエンドポイントを実装してください
 *
 * 1. 承認待ち経費申請一覧取得
 *    GET /api/expenses/pending
 *    レスポンス例:
 *    [
 *      {
 *        "id": 1,
 *        "userId": 3,
 *        "userName": "山田 次郎",
 *        "userDepartment": "営業部",
 *        "title": "東京出張費用",
 *        "description": "...",
 *        "totalAmount": 35000.00,
 *        "status": "pending",
 *        "submissionDate": "2025-01-15",
 *        "createdAt": "2025-01-15T10:00:00",
 *        "items": [...]
 *      }
 *    ]
 *
 * 2. 経費申請承認
 *    PUT /api/expenses/{expenseId}/approve
 *    Headers: X-User-Id (承認者のユーザーID)
 *    レスポンス例:
 *    {
 *      "id": 1,
 *      "status": "approved",
 *      "approvalDate": "2025-01-20",
 *      "approverId": 2,
 *      "approverName": "経理 花子"
 *    }
 *
 * 3. 経費申請却下
 *    PUT /api/expenses/{expenseId}/reject
 *    Headers: X-User-Id (承認者のユーザーID)
 *    Body (Optional):
 *    {
 *      "reason": "領収書が不足しています"
 *    }
 *    レスポンス例:
 *    {
 *      "id": 1,
 *      "status": "rejected",
 *      "approvalDate": "2025-01-20",
 *      "approverId": 2,
 *      "approverName": "経理 花子",
 *      "rejectionReason": "領収書が不足しています"
 *    }
 */

interface ExpenseItem {
  id: number
  date: string
  category: string
  description: string
  amount: number
  receiptUrl?: string
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
  submissionDate: string
  createdAt: string
  items?: ExpenseItem[]
}

export default function ApprovalsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPendingExpenses()
    }
  }, [user])

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
      setExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '承認待ち申請の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowApprovalModal(true)
  }

  const handleRejectClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setRejectionReason('')
    setShowRejectionModal(true)
  }

  const handleApprove = async () => {
    if (!selectedExpense || !user) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/expenses/${selectedExpense.id}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString()
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '承認処理に失敗しました')
      }

      alert('経費申請を承認しました')
      setShowApprovalModal(false)
      setSelectedExpense(null)
      fetchPendingExpenses()
    } catch (err) {
      alert(err instanceof Error ? err.message : '承認処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedExpense || !user) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/expenses/${selectedExpense.id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString()
          },
          body: JSON.stringify({
            reason: rejectionReason || undefined
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '却下処理に失敗しました')
      }

      alert('経費申請を却下しました')
      setShowRejectionModal(false)
      setSelectedExpense(null)
      setRejectionReason('')
      fetchPendingExpenses()
    } catch (err) {
      alert(err instanceof Error ? err.message : '却下処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.pageTitle}>承認待ち経費申請</h2>
          <button
            className={styles.backButton}
            onClick={() => router.push('/dashboard/accountant')}
          >
            ← ダッシュボードに戻る
          </button>
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
            <div className={styles.emptyIcon}>✅</div>
            <p className={styles.emptyText}>承認待ちの申請はありません</p>
          </div>
        ) : (
          <div className={styles.expenseList}>
            {expenses.map((expense) => (
              <div key={expense.id} className={styles.expenseCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <h3 className={styles.expenseTitle}>{expense.title}</h3>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{expense.userName}</span>
                      <span className={styles.separator}>|</span>
                      <span className={styles.department}>{expense.userDepartment}</span>
                    </div>
                  </div>
                  <div className={styles.headerRight}>
                    <div className={styles.amount}>{formatAmount(expense.totalAmount)}</div>
                    <div className={styles.date}>
                      申請日: {formatDate(expense.submissionDate)}
                    </div>
                  </div>
                </div>

                {expense.description && (
                  <div className={styles.cardBody}>
                    <p className={styles.description}>{expense.description}</p>
                  </div>
                )}

                {expense.items && expense.items.length > 0 && (
                  <div className={styles.itemsPreview}>
                    <div className={styles.itemsTitle}>明細 ({expense.items.length}件)</div>
                    <div className={styles.itemsList}>
                      {expense.items.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <span className={styles.itemCategory}>{item.category}</span>
                          <span className={styles.itemAmount}>
                            {formatAmount(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <button
                    className={styles.detailButton}
                    onClick={() => router.push(`/dashboard/accountant/approvals/${expense.id}`)}
                  >
                    詳細を表示
                  </button>
                  <div className={styles.actions}>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleRejectClick(expense)}
                    >
                      却下
                    </button>
                    <button
                      className={styles.approveButton}
                      onClick={() => handleApproveClick(expense)}
                    >
                      承認
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 承認確認モーダル */}
      {showApprovalModal && selectedExpense && (
        <div className={styles.modal} onClick={() => !isProcessing && setShowApprovalModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>承認確認</h3>
            <p className={styles.modalMessage}>
              以下の経費申請を承認してもよろしいですか？
            </p>
            <div className={styles.modalExpenseInfo}>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>申請者:</span>
                <span>{selectedExpense.userName}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>タイトル:</span>
                <span>{selectedExpense.title}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>金額:</span>
                <span className={styles.modalAmount}>
                  {formatAmount(selectedExpense.totalAmount)}
                </span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowApprovalModal(false)}
                disabled={isProcessing}
              >
                キャンセル
              </button>
              <button
                className={styles.modalApproveButton}
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? '処理中...' : '承認する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 却下確認モーダル */}
      {showRejectionModal && selectedExpense && (
        <div className={styles.modal} onClick={() => !isProcessing && setShowRejectionModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>却下確認</h3>
            <p className={styles.modalMessage}>
              以下の経費申請を却下してもよろしいですか？
            </p>
            <div className={styles.modalExpenseInfo}>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>申請者:</span>
                <span>{selectedExpense.userName}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>タイトル:</span>
                <span>{selectedExpense.title}</span>
              </div>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>金額:</span>
                <span className={styles.modalAmount}>
                  {formatAmount(selectedExpense.totalAmount)}
                </span>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>却下理由（任意）</label>
              <textarea
                className={styles.textarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="却下の理由を入力してください"
                rows={4}
                disabled={isProcessing}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowRejectionModal(false)}
                disabled={isProcessing}
              >
                キャンセル
              </button>
              <button
                className={styles.modalRejectButton}
                onClick={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? '処理中...' : '却下する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
