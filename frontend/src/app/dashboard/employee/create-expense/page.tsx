'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import styles from './create-expense.module.css'

export default function CreateExpensePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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

      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'POST',
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
        throw new Error(errorData.message || '申請の作成に失敗しました')
      }

      router.push('/dashboard/employee')
    } catch (err) {
      setError(err instanceof Error ? err.message : '申請の作成に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout requiredRole="employee">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.pageTitle}>経費申請の作成</h2>
          <button
            className={styles.backButton}
            onClick={() => router.back()}
          >
            ← 戻る
          </button>
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
                {isSubmitting ? '申請中...' : '申請する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
