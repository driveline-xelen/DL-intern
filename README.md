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

## セットアップと起動

### 1. Docker コンテナの起動

プロジェクトルートディレクトリで以下のコマンドを実行します：

```bash
docker-compose up -d
```

初回起動時は、各コンテナのイメージビルドと依存関係のダウンロードに時間がかかります。

### 2. アプリケーションへのアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080
- **ヘルスチェック**: http://localhost:8080/api/health
- **pgAdmin**: http://localhost:5050

### 3. コンテナの停止

```bash
docker-compose down
```

データベースのデータを削除する場合：

```bash
docker-compose down -v
```

## 開発

### ログの確認

```bash
# すべてのコンテナのログを表示
docker-compose logs -f

# 特定のコンテナのログを表示
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### コンテナの再起動

```bash
docker-compose restart [service_name]
```

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
├── docker-compose.yml       # Docker Compose設定
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
