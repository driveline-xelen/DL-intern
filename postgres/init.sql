-- 経費申請アプリ用データベース初期化スクリプト

-- テーブルが存在する場合は削除（開発環境用）
DROP TABLE IF EXISTS expense_items CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'accountant', 'employee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 経費申請テーブル
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
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 経費明細テーブル
CREATE TABLE expense_items (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expense_items_expense_id ON expense_items(expense_id);

-- サンプルデータの挿入
-- パスワードはすべて 'password123' (実際の環境ではハッシュ化が必要)
INSERT INTO users (username, password, email, full_name, department, role) VALUES
('admin', 'password123', 'admin@example.com', '管理者 太郎', '総務部', 'admin'),
('accountant', 'password123', 'accountant@example.com', '経理 花子', '経理部', 'accountant'),
('employee1', 'password123', 'employee1@example.com', '山田 次郎', '営業部', 'employee'),
('employee2', 'password123', 'employee2@example.com', '佐藤 三郎', '開発部', 'employee');

INSERT INTO expenses (user_id, title, description, total_amount, status, submission_date) VALUES
(3, '東京出張費用', '新規顧客訪問のための出張費用', 35000.00, 'pending', '2025-01-15'),
(4, '備品購入', 'オフィス用品の購入', 8500.00, 'pending', '2025-01-20'),
(3, '会議費用', 'クライアントとの会食', 12000.00, 'draft', NULL);

INSERT INTO expense_items (expense_id, date, category, description, amount) VALUES
(1, '2025-01-15', '交通費', '新幹線往復チケット', 28000.00),
(1, '2025-01-15', '宿泊費', 'ホテル宿泊費', 7000.00),
(2, '2025-01-20', '備品', 'ボールペン・ノート等', 8500.00),
(3, '2025-01-22', '会議費', 'クライアント会食費', 12000.00);

-- ビューの作成（経費申請一覧用）
CREATE OR REPLACE VIEW expense_summary AS
SELECT
    e.id,
    e.title,
    e.description,
    e.total_amount,
    e.status,
    e.submission_date,
    u.full_name as user_name,
    u.department,
    COUNT(ei.id) as item_count
FROM expenses e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN expense_items ei ON e.id = ei.expense_id
GROUP BY e.id, e.title, e.description, e.total_amount, e.status,
         e.submission_date, u.full_name, u.department;

COMMENT ON TABLE users IS 'ユーザー情報テーブル';
COMMENT ON TABLE expenses IS '経費申請テーブル';
COMMENT ON TABLE expense_items IS '経費明細テーブル';
