'use client'

import DashboardLayout from '@/components/DashboardLayout'
import styles from './accountant.module.css'

export default function AccountantDashboard() {
  return (
    <DashboardLayout requiredRole="accountant">
      <div className={styles.dashboard}>
        <h2 className={styles.pageTitle}>経理担当ダッシュボード</h2>

        <div className={styles.grid}>
          <div
            className={styles.card}
            onClick={() => window.location.href = '/dashboard/accountant/approvals'}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardIcon}>📋</div>
            <h3 className={styles.cardTitle}>承認待ち申請</h3>
            <p className={styles.cardDescription}>
              承認が必要な経費申請を確認します
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>-</span>
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
              <span className={styles.statsNumber}>42</span>
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
              <span className={styles.statsNumber}>¥2.3M</span>
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
              <span className={styles.statsNumber}>12</span>
              <span className={styles.statsLabel}>カテゴリ</span>
            </div>
          </div>
        </div>

        <div className={styles.pendingApprovals}>
          <h3 className={styles.sectionTitle}>承認待ちリスト</h3>
          <div className={styles.approvalTable}>
            <div className={styles.tableHeader}>
              <span className={styles.colDate}>申請日</span>
              <span className={styles.colUser}>申請者</span>
              <span className={styles.colTitle}>タイトル</span>
              <span className={styles.colAmount}>金額</span>
              <span className={styles.colAction}>アクション</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.colDate}>2025-01-15</span>
              <span className={styles.colUser}>山田 次郎</span>
              <span className={styles.colTitle}>東京出張費用</span>
              <span className={styles.colAmount}>¥35,000</span>
              <span className={styles.colAction}>
                <button className={styles.approveBtn}>承認</button>
                <button className={styles.rejectBtn}>却下</button>
              </span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.colDate}>2025-01-20</span>
              <span className={styles.colUser}>佐藤 三郎</span>
              <span className={styles.colTitle}>備品購入</span>
              <span className={styles.colAmount}>¥8,500</span>
              <span className={styles.colAction}>
                <button className={styles.approveBtn}>承認</button>
                <button className={styles.rejectBtn}>却下</button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
