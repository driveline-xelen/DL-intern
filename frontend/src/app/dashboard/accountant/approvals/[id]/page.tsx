'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './approval-detail.module.css'

/**
 * 【課題】以下のAPIエンドポイントを実装してください
 *
 * 1. 経費申請詳細取得（経理担当者用）
 *    GET /api/expenses/{expenseId}
 *    Headers: X-User-Id (経理担当者のユーザーID)
 *    ※ 経理担当者は全ての申請を閲覧可能にする
 *
 * 2. 経費申請承認
 *    PUT /api/expenses/{expenseId}/approve
 *    Headers: X-User-Id (承認者のユーザーID)
 *
 * 3. 経費申請却下
 *    PUT /api/expenses/{expenseId}/reject
 *    Headers: X-User-Id (承認者のユーザーID)
 *    Body (Optional): { "reason": "却下理由" }
 */

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

export default function ApprovalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleApprove = async () => {
    if (!expense || !user) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/expenses/${expense.id}/approve`,
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
      router.push('/dashboard/accountant/approvals')
    } catch (err) {
      alert(err instanceof Error ? err.message : '承認処理に失敗しました')
    } finally {
      setIsProcessing(false)
      setShowApprovalModal(false)
    }
  }

  const handleReject = async () => {
    if (!expense || !user) return

    setIsProcessing(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/expenses/${expense.id}/reject`,
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
      router.push('/dashboard/accountant/approvals')
    } catch (err) {
      alert(err instanceof Error ? err.message : '却下処理に失敗しました')
    } finally {
      setIsProcessing(false)
      setShowRejectionModal(false)
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
      <DashboardLayout requiredRole="accountant">
        <div className={styles.loading}>読み込み中...</div>
      </DashboardLayout>
    )
  }

  if (error || !expense) {
    return (
      <DashboardLayout requiredRole="accountant">
        <div className={styles.error}>{error || '経費申請が見つかりません'}</div>
        <button className={styles.backButton} onClick={() => router.back()}>
          戻る
        </button>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requiredRole="accountant">
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ← 戻る
          </button>
          <h2 className={styles.pageTitle}>経費申請詳細（承認用）</h2>
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

        {expense.status === 'pending' && (
          <div className={styles.approvalActions}>
            <button
              className={styles.rejectButton}
              onClick={() => setShowRejectionModal(true)}
            >
              却下する
            </button>
            <button
              className={styles.approveButton}
              onClick={() => setShowApprovalModal(true)}
            >
              承認する
            </button>
          </div>
        )}
      </div>

      {/* 承認確認モーダル */}
      {showApprovalModal && (
        <div className={styles.modal} onClick={() => !isProcessing && setShowApprovalModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>承認確認</h3>
            <p className={styles.modalMessage}>
              この経費申請を承認してもよろしいですか？
            </p>
            <div className={styles.modalExpenseInfo}>
              <div className={styles.modalInfoRow}>
                <span className={styles.modalLabel}>金額:</span>
                <span className={styles.modalAmount}>
                  ¥{expense.totalAmount.toLocaleString()}
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
      {showRejectionModal && (
        <div className={styles.modal} onClick={() => !isProcessing && setShowRejectionModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>却下確認</h3>
            <p className={styles.modalMessage}>
              この経費申請を却下してもよろしいですか？
            </p>
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
