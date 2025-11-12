# 承認・却下機能 API仕様書

## 概要

経理担当者が経費申請を承認または却下するためのAPIエンドポイントの仕様です。

## 実装が必要なエンドポイント

### 1. 承認待ち経費申請一覧取得

承認待ち（status = "pending"）の経費申請を全て取得します。

```
GET /api/expenses/pending
```

#### リクエスト

- Headers: なし（または認証情報）
- Body: なし

#### レスポンス例

**成功時 (200 OK)**

```json
[
  {
    "id": 1,
    "userId": 3,
    "userName": "山田 次郎",
    "userDepartment": "営業部",
    "title": "東京出張費用",
    "description": "新規顧客訪問のための出張費用",
    "totalAmount": 35000.00,
    "status": "pending",
    "submissionDate": "2025-01-15",
    "createdAt": "2025-01-15T10:00:00",
    "updatedAt": "2025-01-15T14:30:00",
    "items": [
      {
        "id": 1,
        "date": "2025-01-15",
        "category": "交通費",
        "description": "新幹線往復チケット",
        "amount": 28000.00,
        "receiptUrl": null
      },
      {
        "id": 2,
        "date": "2025-01-15",
        "category": "宿泊費",
        "description": "ホテル宿泊費",
        "amount": 7000.00,
        "receiptUrl": null
      }
    ]
  },
  {
    "id": 2,
    "userId": 4,
    "userName": "佐藤 三郎",
    "userDepartment": "開発部",
    "title": "備品購入",
    "description": "オフィス用品の購入",
    "totalAmount": 8500.00,
    "status": "pending",
    "submissionDate": "2025-01-20",
    "createdAt": "2025-01-20T09:00:00",
    "updatedAt": "2025-01-20T09:00:00",
    "items": [
      {
        "id": 3,
        "date": "2025-01-20",
        "category": "備品",
        "description": "ボールペン・ノート等",
        "amount": 8500.00,
        "receiptUrl": null
      }
    ]
  }
]
```

**エラー時 (400 Bad Request)**

```json
{
  "message": "承認待ち申請の取得に失敗しました"
}
```

---

### 2. 経費申請承認

指定された経費申請を承認します。

```
PUT /api/expenses/{expenseId}/approve
```

#### リクエスト

- Path Parameters:
  - `expenseId` (Integer, 必須): 承認する経費申請のID

- Headers:
  - `X-User-Id` (String, 必須): 承認者のユーザーID

- Body: なし

#### レスポンス例

**成功時 (200 OK)**

```json
{
  "id": 1,
  "userId": 3,
  "userName": "山田 次郎",
  "userDepartment": "営業部",
  "title": "東京出張費用",
  "description": "新規顧客訪問のための出張費用",
  "totalAmount": 35000.00,
  "status": "approved",
  "submissionDate": "2025-01-15",
  "approvalDate": "2025-01-20",
  "approverId": 2,
  "approverName": "経理 花子",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-01-20T15:30:00"
}
```

**エラー時 (400 Bad Request)**

```json
{
  "message": "この申請は既に処理済みです"
}
```

**エラー時 (404 Not Found)**

```json
{
  "message": "Expense not found"
}
```

#### 実装要件

1. 経費申請のstatusを "approved" に更新
2. approvalDateに現在日付を設定
3. approverIdに承認者のユーザーIDを設定
4. updatedAtを現在日時に更新
5. statusが "pending" 以外の場合はエラーを返す

---

### 3. 経費申請却下

指定された経費申請を却下します。

```
PUT /api/expenses/{expenseId}/reject
```

#### リクエスト

- Path Parameters:
  - `expenseId` (Integer, 必須): 却下する経費申請のID

- Headers:
  - `X-User-Id` (String, 必須): 承認者のユーザーID

- Body (Optional):
```json
{
  "reason": "領収書が不足しています"
}
```

#### レスポンス例

**成功時 (200 OK)**

```json
{
  "id": 1,
  "userId": 3,
  "userName": "山田 次郎",
  "userDepartment": "営業部",
  "title": "東京出張費用",
  "description": "新規顧客訪問のための出張費用",
  "totalAmount": 35000.00,
  "status": "rejected",
  "submissionDate": "2025-01-15",
  "approvalDate": "2025-01-20",
  "approverId": 2,
  "approverName": "経理 花子",
  "rejectionReason": "領収書が不足しています",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-01-20T15:30:00"
}
```

**エラー時 (400 Bad Request)**

```json
{
  "message": "この申請は既に処理済みです"
}
```

**エラー時 (404 Not Found)**

```json
{
  "message": "Expense not found"
}
```

#### 実装要件

1. 経費申請のstatusを "rejected" に更新
2. approvalDateに現在日付を設定
3. approverIdに承認者のユーザーIDを設定
4. rejectionReasonがある場合は保存（テーブルにカラム追加が必要）
5. updatedAtを現在日時に更新
6. statusが "pending" 以外の場合はエラーを返す

---

## データベース変更

却下理由を保存するため、`expenses`テーブルに以下のカラムを追加することを推奨します：

```sql
ALTER TABLE expenses ADD COLUMN rejection_reason TEXT;
```

---

## 実装のヒント

### バックエンド実装の流れ

1. **ExpenseController.java に新しいエンドポイントを追加**
   - `@GetMapping("/pending")` - 承認待ち一覧取得
   - `@PutMapping("/{expenseId}/approve")` - 承認
   - `@PutMapping("/{expenseId}/reject")` - 却下

2. **ExpenseService.java にビジネスロジックを実装**
   - `getPendingExpenses()` - status="pending"の申請を取得
   - `approveExpense(Integer expenseId, Long approverId)` - 承認処理
   - `rejectExpense(Integer expenseId, Long approverId, String reason)` - 却下処理

3. **ExpenseRepository.java にクエリメソッドを追加**
   - `findByStatusOrderByCreatedAtDesc(String status)` - ステータスで検索

4. **Expense.java モデルに却下理由フィールドを追加（任意）**
   ```java
   @Column(name = "rejection_reason", columnDefinition = "TEXT")
   private String rejectionReason;
   ```

5. **トランザクション処理**
   - `@Transactional` アノテーションを使用
   - 承認/却下時に複数のフィールドを一括更新

### テスト方法

1. **Postmanを使用したテスト**
   ```
   # 承認待ち一覧取得
   GET http://localhost:8080/api/expenses/pending

   # 承認
   PUT http://localhost:8080/api/expenses/1/approve
   Headers: X-User-Id: 2

   # 却下
   PUT http://localhost:8080/api/expenses/1/reject
   Headers: X-User-Id: 2
   Body: { "reason": "領収書が不足しています" }
   ```

2. **フロントエンドからのテスト**
   - 経理担当者アカウント（accountant）でログイン
   - 承認待ち一覧ページにアクセス
   - 承認/却下ボタンをクリック

---

## フロントエンド実装済みページ

以下のページは既に実装されているため、APIを実装すればすぐに動作します：

1. **承認待ち一覧ページ**
   - URL: `/dashboard/accountant/approvals`
   - ファイル: `frontend/src/app/dashboard/accountant/approvals/page.tsx`

2. **経費申請詳細ページ（承認用）**
   - URL: `/dashboard/accountant/approvals/[id]`
   - ファイル: `frontend/src/app/dashboard/accountant/approvals/[id]/page.tsx`

---

## 注意事項

1. **権限チェック**
   - 承認/却下APIは経理担当者（role="accountant"）のみが実行できるようにすることを推奨
   - X-User-Idヘッダーでユーザーを識別し、roleをチェック

2. **ステータス遷移の制御**
   - "pending" → "approved" または "rejected" のみ許可
   - それ以外の遷移はエラーを返す

3. **通知機能（オプション）**
   - 承認/却下時に申請者へメール通知を送る機能を追加することも可能

4. **監査ログ（オプション）**
   - 誰がいつ承認/却下したかのログを別テーブルに記録することを推奨
