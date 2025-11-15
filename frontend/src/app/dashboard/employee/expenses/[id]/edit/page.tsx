'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './edit-expense.module.css'

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

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expense, setExpense] = useState<Expense | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    expenseDate: '',
    receiptUrl: ''
  })

  const categories = [
    '交通費',
    '宿泊費',
    '食事代',
    '備品購入',
    '通信費',
    '会議費',
    'その他'
  ]

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

      const data: Expense = await response.json()

      // Check if expense can be edited
      if (data.status !== 'draft' && data.status !== 'pending') {
        throw new Error('この経費申請は編集できません')
      }

      if (data.userId !== user?.id) {
        throw new Error('この経費申請を編集する権限がありません')
      }

      setExpense(data)

      // Set form data from expense
      if (data.items && data.items.length > 0) {
        const item = data.items[0]
        setFormData({
          title: data.title,
          description: data.description || '',
          amount: item.amount.toString(),
          category: item.category,
          expenseDate: item.date,
          receiptUrl: item.receiptUrl || ''
        })
      } else {
        setFormData({
          title: data.title,
          description: data.description || '',
          amount: '',
          category: '',
          expenseDate: '',
          receiptUrl: ''
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (status: 'draft' | 'pending') => {
    setError('')
    setIsSubmitting(true)

    // Validation
    if (!formData.title || !formData.amount || !formData.category || !formData.expenseDate) {
      setError('必須項目を入力してください')
      setIsSubmitting(false)
      return
    }

    try {
      if (!user) {
        throw new Error('ユーザー情報が見つかりません')
      }

      const response = await fetch(`http://localhost:8080/api/expenses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString()
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: status,
          item: {
            date: formData.expenseDate,
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            receiptUrl: formData.receiptUrl
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '申請の更新に失敗しました')
      }

      router.push(`/dashboard/employee/expenses/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '申請の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className={styles.loading}>読み込み中...</div>
      </DashboardLayout>
    )
  }

  if (error && !expense) {
    return (
      <DashboardLayout requiredRole="employee">
        <div className={styles.error}>{error}</div>
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
          <h2 className={styles.pageTitle}>経費申請の編集</h2>
          <div className={styles.headerButtons}>
            <button
              className={styles.backButton}
              onClick={() => router.push('/dashboard/employee')}
            >
              ← Dashboardに戻る
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.formCard}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                タイトル <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={styles.input}
                placeholder="例: 東京出張費用"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                カテゴリ <span className={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">カテゴリを選択</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  金額 <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputAddon}>¥</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={styles.inputWithAddon}
                    placeholder="35000"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  利用日 <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>説明</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="経費の詳細を入力してください"
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>領収書URL</label>
              <input
                type="url"
                name="receiptUrl"
                value={formData.receiptUrl}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://example.com/receipt.pdf"
              />
              <p className={styles.helpText}>
                領収書をアップロードしている場合はURLを入力してください
              </p>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.draftButton}
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '下書き保存'}
              </button>
              <button
                type="button"
                className={styles.submitButton}
                onClick={() => handleSubmit('pending')}
                disabled={isSubmitting}
              >
                {isSubmitting ? '更新中...' : '申請する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
