# 経費申請アプリ

Next.js、Spring Boot、PostgreSQLを使用した経費申請管理システムです。

## 技術スタック

- **フロントエンド**: Next.js 14 (React 18, TypeScript)
- **バックエンド**: Spring Boot 3.2 (Java 17)
- **データベース**: PostgreSQL 15
- **データベース管理**: pgAdmin 4

## 前提条件

- Docker Desktop がインストールされていること
- Docker Compose が利用可能であること

## 環境構築手順

### 重要: CPUアーキテクチャの確認

このアプリケーションは、お使いのCPUアーキテクチャに応じて異なるDocker Composeファイルを使用します。

**CPUアーキテクチャの確認方法:**
```bash
uname -m
```

- `x86_64` の場合: **Intelチップ** → [docker-compose.intel.yml](docker-compose.intel.yml) を使用
- `arm64` の場合: **Appleシリコン（M1/M2/M3）** → [docker-compose.arm.yml](docker-compose.arm.yml) を使用

---

### パターン1: ZIPファイルから構築する場合

#### 1-1. ZIPファイルの展開
```bash
# ZIPファイルを任意のディレクトリに展開
unzip expense-app.zip
cd expense-app
```

#### 1-2. CPUアーキテクチャの確認
```bash
uname -m
```

#### 1-3. Dockerコンテナの起動

**Intelチップ（x86_64）の場合:**
```bash
docker compose -f docker-compose.intel.yml up -d
```

**Appleシリコン（arm64）の場合:**
```bash
docker compose -f docker-compose.arm.yml up -d
```

#### 1-4. 起動確認
```bash
# コンテナの起動状態を確認（Intelの場合）
docker compose -f docker-compose.intel.yml ps

# コンテナの起動状態を確認（Appleシリコンの場合）
docker compose -f docker-compose.arm.yml ps

# バックエンドのヘルスチェック
curl http://localhost:8080/api/health
```

#### 1-5. アプリケーションにアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080

---

### パターン2: Gitリポジトリから構築する場合

#### 2-1. リポジトリのクローン
```bash
# HTTPSでクローン
git clone https://github.com/your-organization/expense-app.git
cd expense-app

# または SSHでクローン
git clone git@github.com:your-organization/expense-app.git
cd expense-app
```

#### 2-2. CPUアーキテクチャの確認
```bash
uname -m
```

#### 2-3. Dockerコンテナの起動

**Intelチップ（x86_64）の場合:**
```bash
docker compose -f docker-compose.intel.yml up -d
```

**Appleシリコン（arm64）の場合:**
```bash
docker compose -f docker-compose.arm.yml up -d
```

#### 2-4. 起動確認
```bash
# コンテナの起動状態を確認（Intelの場合）
docker compose -f docker-compose.intel.yml ps

# コンテナの起動状態を確認（Appleシリコンの場合）
docker compose -f docker-compose.arm.yml ps

# バックエンドのヘルスチェック
curl http://localhost:8080/api/health
```

#### 2-5. アプリケーションにアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080

---

### トラブルシューティング

**コンテナが起動しない場合**

Intelチップの場合:
```bash
# ログを確認
docker compose -f docker-compose.intel.yml logs -f

# コンテナを停止して再起動
docker compose -f docker-compose.intel.yml down
docker compose -f docker-compose.intel.yml up -d
```

Appleシリコンの場合:
```bash
# ログを確認
docker compose -f docker-compose.arm.yml logs -f

# コンテナを停止して再起動
docker compose -f docker-compose.arm.yml down
docker compose -f docker-compose.arm.yml up -d
```

**ポートが既に使用されている場合**
- 3000番ポート（フロントエンド）、8080番ポート（バックエンド）、5432番ポート（PostgreSQL）が他のアプリケーションで使用されていないか確認してください
- 使用中の場合は、該当するアプリケーションを停止するか、使用している compose ファイル（[docker-compose.intel.yml](docker-compose.intel.yml) または [docker-compose.arm.yml](docker-compose.arm.yml)）のポート設定を変更してください

**データベース接続エラーの場合**

Intelチップの場合:
```bash
# PostgreSQLコンテナのログを確認
docker compose -f docker-compose.intel.yml logs postgres

# データベースコンテナを再起動
docker compose -f docker-compose.intel.yml restart postgres
```

Appleシリコンの場合:
```bash
# PostgreSQLコンテナのログを確認
docker compose -f docker-compose.arm.yml logs postgres

# データベースコンテナを再起動
docker compose -f docker-compose.arm.yml restart postgres
```

**間違ったアーキテクチャで起動してしまった場合**
```bash
# 現在のコンテナを停止・削除
docker compose -f docker-compose.intel.yml down  # または docker-compose.arm.yml
docker compose -f docker-compose.arm.yml down    # または docker-compose.intel.yml

# 正しいアーキテクチャで再起動
# Intelチップの場合
docker compose -f docker-compose.intel.yml up -d

# Appleシリコンの場合
docker compose -f docker-compose.arm.yml up -d
```

---

## コンテナの操作

### コンテナの停止

**Intelチップの場合:**
```bash
docker compose -f docker-compose.intel.yml down
```

**Appleシリコンの場合:**
```bash
docker compose -f docker-compose.arm.yml down
```

**データベースのデータも削除する場合:**
```bash
# Intelチップ
docker compose -f docker-compose.intel.yml down -v

# Appleシリコン
docker compose -f docker-compose.arm.yml down -v
```

### ログの確認

**Intelチップの場合:**
```bash
# すべてのコンテナのログを表示
docker compose -f docker-compose.intel.yml logs -f

# 特定のコンテナのログを表示
docker compose -f docker-compose.intel.yml logs -f frontend
docker compose -f docker-compose.intel.yml logs -f backend
docker compose -f docker-compose.intel.yml logs -f postgres
```

**Appleシリコンの場合:**
```bash
# すべてのコンテナのログを表示
docker compose -f docker-compose.arm.yml logs -f

# 特定のコンテナのログを表示
docker compose -f docker-compose.arm.yml logs -f frontend
docker compose -f docker-compose.arm.yml logs -f backend
docker compose -f docker-compose.arm.yml logs -f postgres
```

### コンテナの再起動

**Intelチップの場合:**
```bash
docker compose -f docker-compose.intel.yml restart [service_name]
```

**Appleシリコンの場合:**
```bash
docker compose -f docker-compose.arm.yml restart [service_name]
```

### アプリケーションへのアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080
- **ヘルスチェック**: http://localhost:8080/api/health
- **pgAdmin**: http://localhost:5050

## データベース

### 接続情報

- **ホスト**: localhost
- **ポート**: 5432
- **データベース名**: expense_db
- **ユーザー名**: expense_user
- **パスワード**: expense_pass

### 初期データ

データベースには以下のサンプルユーザーが登録されています：

| ユーザー名 | パスワード | Email | 権限 |
|-----------|-----------|-------|------|
| admin | password123 | admin@example.com | 管理者 |
| accountant | password123 | accountant@example.com | 経理担当 |
| employee1 | password123 | employee1@example.com | 一般従業員 |
| employee2 | password123 | employee2@example.com | 一般従業員 |

### pgAdmin（データベース管理ツール）

pgAdminを使用してデータベースの管理やSQLクエリの実行ができます。

#### アクセス方法

1. ブラウザで http://localhost:5050 にアクセス
2. 以下の情報でログイン：
   - **Email**: admin@example.com
   - **Password**: admin

#### PostgreSQLサーバーの登録

初回ログイン時に以下の手順でデータベースサーバーを登録します：

1. 左側のメニューで「Servers」を右クリック → 「Register」→ 「Server...」を選択
2. **General タブ**:
   - Name: `Expense DB` (任意の名前)
3. **Connection タブ**:
   - Host name/address: `postgres`
   - Port: `5432`
   - Maintenance database: `expense_db`
   - Username: `expense_user`
   - Password: `expense_pass`
   - Save password: ✓ チェック
4. 「Save」をクリック

これで、テーブルの確認、データの編集、SQLクエリの実行などが可能になります。

## プロジェクト構成

```
.
├── docker-compose.intel.yml # Docker Compose設定（Intelチップ用）
├── docker-compose.arm.yml   # Docker Compose設定（Appleシリコン用）
├── docker-compose.yml       # Docker Compose設定（レガシー、非推奨）
├── frontend/                # Next.jsフロントエンド
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── backend/                 # Spring Bootバックエンド
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
└── postgres/                # PostgreSQL初期化スクリプト
    └── init.sql
```

**注意**: [docker-compose.yml](docker-compose.yml) は互換性のために残していますが、使用は推奨しません。必ずお使いのCPUアーキテクチャに合った compose ファイルを使用してください。
