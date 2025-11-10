'use client'

import DashboardLayout from '@/components/DashboardLayout'
import styles from './admin.module.css'

export default function AdminDashboard() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className={styles.dashboard}>
        <h2 className={styles.pageTitle}>管理者ダッシュボード</h2>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <h3 className={styles.cardTitle}>ユーザー管理</h3>
            <p className={styles.cardDescription}>
              システムユーザーの追加、編集、削除を行います
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>25</span>
              <span className={styles.statsLabel}>登録ユーザー</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📊</div>
            <h3 className={styles.cardTitle}>全体統計</h3>
            <p className={styles.cardDescription}>
              経費申請の統計情報を確認できます
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>48</span>
              <span className={styles.statsLabel}>今月の申請</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3 className={styles.cardTitle}>システム設定</h3>
            <p className={styles.cardDescription}>
              アプリケーション全体の設定を管理します
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>12</span>
              <span className={styles.statsLabel}>設定項目</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>📝</div>
            <h3 className={styles.cardTitle}>申請管理</h3>
            <p className={styles.cardDescription}>
              全ての経費申請を閲覧・管理できます
            </p>
            <div className={styles.cardStats}>
              <span className={styles.statsNumber}>156</span>
              <span className={styles.statsLabel}>総申請数</span>
            </div>
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h3 className={styles.sectionTitle}>最近のアクティビティ</h3>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>2分前</span>
              <span className={styles.activityText}>山田 次郎さんが経費申請を提出しました</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>15分前</span>
              <span className={styles.activityText}>経理 花子さんが申請を承認しました</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityTime}>1時間前</span>
              <span className={styles.activityText}>新しいユーザーが登録されました</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
