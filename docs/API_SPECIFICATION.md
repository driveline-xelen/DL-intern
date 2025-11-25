# 経費申請システム API仕様書

## 目次

1. [概要](#概要)
2. [既存のAPI](#既存のapi)
3. [課題：実装が必要なAPI](#課題実装が必要なapi)
4. [データモデル](#データモデル)
5. [実装のヒント](#実装のヒント)

---

## 概要

この経費申請システムでは、従業員が経費を申請し、経理担当者が承認・却下を行うワークフローを実装します。

### 認証について

現在のシステムでは、リクエストヘッダー `X-User-Id` でユーザーを識別しています。

```
X-User-Id: 1
```

### エラーレスポンスの形式

すべてのエラーレスポンスは以下の形式で返します：

```json
{
  "message": "エラーメッセージ"
}
```

---

## 既存のAPI

以下のAPIは既に実装されています。参考にしてください。

### 1. ヘルスチェック

```
GET /api/health
```

**レスポンス例:**
```json
{
  "message": "Expense API is running",
  "status": "OK"
}
```

### 2. ログイン

```
POST /api/auth/login
```

**リクエストボディ:**
```json
{
  "username": "employee1",
  "password": "password123"
}
```

**レスポンス例:**
```json
{
  "id": 3,
  "username": "employee1",
  "email": "employee1@example.com",
  "fullName": "山田 次郎",
  "department": "営業部",
  "role": "employee"
}
```

### 3. 経費申請作成

```
POST /api/expenses
```

**リクエストヘッダー:**
```
X-User-Id: 3
```

**リクエストボディ:**
```json
{
  "title": "東京出張費用",
  "description": "新規顧客訪問のための出張費用",
  "status": "pending",
  "item": {
    "date": "2025-01-15",
    "category": "交通費",
    "description": "新幹線往復チケット",
    "amount": 28000.00
  }
}
```

### 4. 経費申請更新

```
PUT /api/expenses/{expenseId}
```

### 5. 経費申請取得

```
GET /api/expenses/{expenseId}
```

**リクエストヘッダー:**
```
X-User-Id: 3
```

**レスポンス例:**
```json
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
      "receiptUrl": null,
      "createdAt": "2025-01-15T10:00:00",
      "updatedAt": "2025-01-15T10:00:00"
    }
  ]
}
```

### 6. ユーザーの経費申請一覧取得

```
GET /api/expenses
GET /api/expenses?status=pending
```

**リクエストヘッダー:**
```
X-User-Id: 3
```

### 7. 経費申請削除

```
DELETE /api/expenses/{expenseId}
```

---

## 課題：実装が必要なAPI

以下の3つのAPIエンドポイントを実装してください。

### 1. 承認待ち経費申請一覧取得

**エンドポイント:**
```
GET /api/expenses/pending
```

**説明:**
システム全体の承認待ち（status = "pending"）の経費申請を全て取得します。
経理担当者が承認作業を行うために使用します。

**リクエストヘッダー:**
- なし（または認証情報）

**クエリパラメータ:**
- なし

**レスポンス (200 OK):**
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
        "receiptUrl": null,
        "createdAt": "2025-01-15T10:00:00",
        "updatedAt": "2025-01-15T10:00:00"
      },
      {
        "id": 2,
        "date": "2025-01-15",
        "category": "宿泊費",
        "description": "ホテル宿泊費",
        "amount": 7000.00,
        "receiptUrl": null,
        "createdAt": "2025-01-15T10:00:00",
        "updatedAt": "2025-01-15T10:00:00"
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
        "receiptUrl": null,
        "createdAt": "2025-01-20T09:00:00",
        "updatedAt": "2025-01-20T09:00:00"
      }
    ]
  }
]
```

**エラーレスポンス (400 Bad Request):**
```json
{
  "message": "承認待ち申請の取得に失敗しました"
}
```

**実装要件:**
1. `status` が `"pending"` の経費申請を全て取得
2. 作成日時の降順でソート（新しいものが先）
3. 各申請に紐づく経費明細（items）も含める
4. ユーザー情報（userName, userDepartment）を含める

**参考:**
- 既存の `getUserExpenses()` メソッドを参考にしてください
- `ExpenseRepository` に新しいメソッドを追加する必要があります

---

### 2. 経費申請承認

**エンドポイント:**
```
PUT /api/expenses/{expenseId}/approve
```

**説明:**
指定された経費申請を承認します。承認すると、申請のステータスが "approved" に変更され、承認日と承認者が記録されます。

**パスパラメータ:**
- `expenseId` (Integer, 必須): 承認する経費申請のID

**リクエストヘッダー:**
```
X-User-Id: 2
```
- `X-User-Id`: 承認者のユーザーID

**リクエストボディ:**
- なし

**レスポンス (200 OK):**
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
  "updatedAt": "2025-01-20T15:30:00",
  "items": [...]
}
```

**エラーレスポンス (400 Bad Request):**
```json
{
  "message": "この申請は既に処理済みです"
}
```

**エラーレスポンス (404 Not Found):**
```json
{
  "message": "Expense not found"
}
```

**実装要件:**
1. 経費申請のIDで検索
2. 申請が存在しない場合は404エラー
3. ステータスが `"pending"` 以外の場合は400エラー
4. 以下のフィールドを更新:
   - `status` → `"approved"`
   - `approvalDate` → 現在日付 (`LocalDate.now()`)
   - `approverId` → リクエストヘッダーの `X-User-Id`
   - `updatedAt` → 現在日時（自動更新）
5. 更新後の経費申請情報を返す（経費明細を含む）

**セキュリティ考慮事項（オプション）:**
- 承認者が経理担当者（role = "accountant"）であることを確認
- 自分自身の申請は承認できないようにする

---

### 3. 経費申請却下

**エンドポイント:**
```
PUT /api/expenses/{expenseId}/reject
```

**説明:**
指定された経費申請を却下します。却下すると、申請のステータスが "rejected" に変更され、承認日と承認者、却下理由（任意）が記録されます。

**パスパラメータ:**
- `expenseId` (Integer, 必須): 却下する経費申請のID

**リクエストヘッダー:**
```
X-User-Id: 2
```
- `X-User-Id`: 承認者のユーザーID

**リクエストボディ (Optional):**
```json
{
  "reason": "領収書が不足しています"
}
```
- `reason` (String, 任意): 却下理由

**レスポンス (200 OK):**
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
  "updatedAt": "2025-01-20T15:30:00",
  "items": [...]
}
```

**エラーレスポンス (400 Bad Request):**
```json
{
  "message": "この申請は既に処理済みです"
}
```

**エラーレスポンス (404 Not Found):**
```json
{
  "message": "Expense not found"
}
```

**実装要件:**
1. 経費申請のIDで検索
2. 申請が存在しない場合は404エラー
3. ステータスが `"pending"` 以外の場合は400エラー
4. 以下のフィールドを更新:
   - `status` → `"rejected"`
   - `approvalDate` → 現在日付 (`LocalDate.now()`)
   - `approverId` → リクエストヘッダーの `X-User-Id`
   - `rejectionReason` → リクエストボディの `reason`（提供された場合）
   - `updatedAt` → 現在日時（自動更新）
5. 更新後の経費申請情報を返す（経費明細を含む）

**注意:**
- `rejectionReason` フィールドを保存するには、データベースの `expenses` テーブルに新しいカラムを追加する必要があります（後述）

---

## データモデル

### Expense (経費申請)

| フィールド名 | 型 | 説明 | 備考 |
|------------|-----|------|------|
| id | Integer | 経費申請ID | 主キー、自動採番 |
| userId | Long | 申請者ユーザーID | 外部キー (users.id) |
| title | String | タイトル | 必須、最大255文字 |
| description | String | 説明 | テキスト |
| totalAmount | BigDecimal | 合計金額 | 必須、10桁2小数 |
| status | String | ステータス | draft/pending/approved/rejected |
| submissionDate | LocalDate | 申請日 | pending時に設定 |
| approvalDate | LocalDate | 承認日 | approved/rejected時に設定 |
| approverId | Long | 承認者ID | 外部キー (users.id) |
| **rejectionReason** | **String** | **却下理由** | **【追加が必要】テキスト** |
| createdAt | LocalDateTime | 作成日時 | 自動設定 |
| updatedAt | LocalDateTime | 更新日時 | 自動更新 |

### ExpenseItem (経費明細)

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| id | Integer | 明細ID |
| expenseId | Integer | 経費申請ID |
| date | LocalDate | 経費発生日 |
| category | String | カテゴリ |
| description | String | 説明 |
| amount | BigDecimal | 金額 |
| receiptUrl | String | 領収書URL |
| createdAt | LocalDateTime | 作成日時 |
| updatedAt | LocalDateTime | 更新日時 |

### User (ユーザー)

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| id | Long | ユーザーID |
| username | String | ユーザー名 |
| password | String | パスワード |
| email | String | メールアドレス |
| fullName | String | 氏名 |
| department | String | 部署 |
| role | String | 権限 (admin/accountant/employee) |

---

## 実装のヒント

### 1. データベースの変更

却下理由を保存するため、`expenses` テーブルに新しいカラムを追加します。

**SQLファイルの編集:**
`postgres/init.sql` に以下を追加してください：

```sql
ALTER TABLE expenses ADD COLUMN rejection_reason TEXT;
```

または、テーブル作成文を直接編集：

```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'draft',
    submission_date DATE,
    approval_date DATE,
    approver_id INTEGER REFERENCES users(id),
    rejection_reason TEXT,  -- ← この行を追加
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Javaモデルの編集:**
`backend/src/main/java/com/expense/app/model/Expense.java` に以下を追加：

```java
@Column(name = "rejection_reason", columnDefinition = "TEXT")
private String rejectionReason;
```

**DTOの編集:**
`backend/src/main/java/com/expense/app/dto/ExpenseResponse.java` と
レスポンス生成ロジックにも `rejectionReason` を追加してください。

### 2. Repositoryの実装

`ExpenseRepository.java` に新しいメソッドを追加します：

```java
package com.expense.app.repository;

import com.expense.app.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Expense> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    // 【追加】承認待ち申請を取得
    List<Expense> findByStatusOrderByCreatedAtDesc(String status);
}
```

Spring Data JPAのメソッド命名規則により、メソッド名から自動的にクエリが生成されます。

### 3. Serviceの実装例

`ExpenseService.java` に以下のメソッドを追加します：

```java
// 承認待ち申請一覧取得
public List<ExpenseResponse> getPendingExpenses() {
    List<Expense> expenses = expenseRepository.findByStatusOrderByCreatedAtDesc("pending");
    return expenses.stream()
            .map(expense -> {
                ExpenseResponse response = ExpenseResponse.fromExpense(expense);
                // 経費明細を含める
                List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expense.getId());
                response.setItems(items.stream()
                        .map(ExpenseItemResponse::fromExpenseItem)
                        .collect(Collectors.toList()));
                return response;
            })
            .collect(Collectors.toList());
}

// 承認処理
@Transactional
public ExpenseResponse approveExpense(Integer expenseId, Long approverId) {
    // 1. 経費申請を取得
    Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

    // 2. ステータスチェック
    if (!expense.getStatus().equals("pending")) {
        throw new RuntimeException("この申請は既に処理済みです");
    }

    // 3. 承認者を取得
    User approver = userRepository.findById(approverId)
            .orElseThrow(() -> new RuntimeException("Approver not found"));

    // 4. フィールドを更新
    expense.setStatus("approved");
    expense.setApprovalDate(LocalDate.now());
    expense.setApprover(approver);

    // 5. 保存
    Expense savedExpense = expenseRepository.save(expense);

    // 6. レスポンスを生成（経費明細を含む）
    ExpenseResponse response = ExpenseResponse.fromExpense(savedExpense);
    List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expenseId);
    response.setItems(items.stream()
            .map(ExpenseItemResponse::fromExpenseItem)
            .collect(Collectors.toList()));

    return response;
}

// 却下処理
@Transactional
public ExpenseResponse rejectExpense(Integer expenseId, Long approverId, String reason) {
    // 承認処理と同様の実装
    // statusを"rejected"にする
    // rejectionReasonを設定する

    // TODO: ここを実装してください
}
```

### 4. Controllerの実装例

`ExpenseController.java` に以下のエンドポイントを追加します：

```java
// 承認待ち一覧取得
@GetMapping("/pending")
public ResponseEntity<?> getPendingExpenses() {
    try {
        List<ExpenseResponse> expenses = expenseService.getPendingExpenses();
        return ResponseEntity.ok(expenses);
    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

// 承認
@PutMapping("/{expenseId}/approve")
public ResponseEntity<?> approveExpense(
        @PathVariable Integer expenseId,
        @RequestHeader("X-User-Id") Long approverId) {
    try {
        ExpenseResponse response = expenseService.approveExpense(expenseId, approverId);
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());

        if (e.getMessage().equals("Expense not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

// 却下
@PutMapping("/{expenseId}/reject")
public ResponseEntity<?> rejectExpense(
        @PathVariable Integer expenseId,
        @RequestHeader("X-User-Id") Long approverId,
        @RequestBody(required = false) Map<String, String> body) {
    try {
        String reason = body != null ? body.get("reason") : null;
        ExpenseResponse response = expenseService.rejectExpense(expenseId, approverId, reason);
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());

        if (e.getMessage().equals("Expense not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

### 5. トランザクション管理

承認・却下処理では複数のフィールドを更新するため、`@Transactional` アノテーションを使用してトランザクション管理を行います。

```java
import org.springframework.transaction.annotation.Transactional;

@Transactional
public ExpenseResponse approveExpense(Integer expenseId, Long approverId) {
    // 処理内容
}
```

これにより、処理中にエラーが発生した場合、すべての変更がロールバックされます。

### 6. テスト方法

#### Postmanを使用したテスト

1. **承認待ち一覧取得**
```
GET http://localhost:8080/api/expenses/pending
```

2. **承認**
```
PUT http://localhost:8080/api/expenses/1/approve
Headers:
  X-User-Id: 2
```

3. **却下**
```
PUT http://localhost:8080/api/expenses/2/reject
Headers:
  X-User-Id: 2
  Content-Type: application/json
Body (raw JSON):
{
  "reason": "領収書が不足しています"
}
```

#### curlを使用したテスト

```bash
# 承認待ち一覧取得
curl http://localhost:8080/api/expenses/pending

# 承認
curl -X PUT http://localhost:8080/api/expenses/1/approve \
  -H "X-User-Id: 2"

# 却下
curl -X PUT http://localhost:8080/api/expenses/2/reject \
  -H "X-User-Id: 2" \
  -H "Content-Type: application/json" \
  -d '{"reason":"領収書が不足しています"}'
```

#### フロントエンドでのテスト

1. ブラウザで `http://localhost:3000` にアクセス
2. 経理担当者でログイン:
   - ユーザー名: `accountant`
   - パスワード: `password123`
3. ダッシュボードの「承認待ち申請」をクリック
4. 承認/却下ボタンをクリックして動作確認

---

## チェックリスト

実装が完了したら、以下の項目を確認してください：

### データベース
- [ ] `expenses` テーブルに `rejection_reason` カラムを追加
- [ ] データベースを再起動して変更を反映

### Javaモデル
- [ ] `Expense.java` に `rejectionReason` フィールドを追加
- [ ] `ExpenseResponse.java` に `rejectionReason` フィールドを追加

### Repository
- [ ] `ExpenseRepository.java` に `findByStatusOrderByCreatedAtDesc` メソッドを追加

### Service
- [ ] `ExpenseService.java` に `getPendingExpenses()` メソッドを実装
- [ ] `ExpenseService.java` に `approveExpense()` メソッドを実装
- [ ] `ExpenseService.java` に `rejectExpense()` メソッドを実装
- [ ] 各メソッドに `@Transactional` アノテーションを付与

### Controller
- [ ] `ExpenseController.java` に `GET /api/expenses/pending` を実装
- [ ] `ExpenseController.java` に `PUT /api/expenses/{id}/approve` を実装
- [ ] `ExpenseController.java` に `PUT /api/expenses/{id}/reject` を実装

### テスト
- [ ] Postmanまたはcurlで各APIをテスト
- [ ] 正常系の動作確認
- [ ] エラー時の動作確認（存在しないID、既に処理済みの申請など）
- [ ] フロントエンドから承認・却下が正常に動作することを確認

---

## トラブルシューティング

### よくある問題

**Q: `rejection_reason` カラムが見つからないエラーが出る**
A: データベースのテーブルにカラムが追加されていません。`postgres/init.sql` を編集後、データベースコンテナを再起動してください。

```bash
docker-compose down -v
docker-compose up -d
```

**Q: 承認しても画面に反映されない**
A: ブラウザをリフレッシュしてください。また、APIが正しく200 OKを返しているか、ブラウザの開発者ツール（Network タブ）で確認してください。

**Q: `X-User-Id` ヘッダーが取得できない**
A: Controllerのメソッド引数に `@RequestHeader("X-User-Id") Long userId` が正しく記述されているか確認してください。

**Q: トランザクションがロールバックされない**
A: `@Transactional` アノテーションがメソッドに付与されているか確認してください。また、Serviceクラスに `@Service` アノテーションが付いているか確認してください。

---

## 参考リンク

- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Spring Boot REST API Tutorial](https://spring.io/guides/tutorials/rest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## お問い合わせ

実装中に不明点がある場合は、講師に質問してください。

**頑張ってください！**
