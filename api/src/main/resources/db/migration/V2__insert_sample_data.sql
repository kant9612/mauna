-- サンプルユーザー（パスワードは "password" のBCryptハッシュ）
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin@mauna.com', 'ROLE_ADMIN'),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'user1@mauna.com', 'ROLE_USER');

-- サンプル顧客
INSERT INTO customers (name, code, address, phone, email, contact_person) VALUES
('株式会社テストクライアント', 'CUS001', '東京都渋谷区〇〇1-2-3', '03-1234-5678', 'contact@testclient.co.jp', '山田太郎'),
('サンプルコーポレーション', 'CUS002', '東京都新宿区△△2-3-4', '03-9876-5432', 'info@sample.co.jp', '佐藤花子');

-- サンプルエンジニア
INSERT INTO engineers (employee_number, name, email, phone, skill_set, experience_years, employment_status) VALUES
('ENG001', '鈴木一郎', 'suzuki@mauna.com', '090-1111-2222', 'Java, Spring, MySQL', 5, 'ACTIVE'),
('ENG002', '田中次郎', 'tanaka@mauna.com', '090-3333-4444', 'React, TypeScript, AWS', 3, 'ACTIVE'),
('ENG003', '高橋三郎', 'takahashi@mauna.com', '090-5555-6666', 'Python, Django, PostgreSQL', 7, 'ACTIVE');

-- サンプル案件
INSERT INTO projects (customer_id, project_code, name, description, start_date, end_date, status, billing_type, unit_price) VALUES
(1, 'PRJ001', '基幹システム刷新プロジェクト', 'レガシーシステムのモダナイゼーション', '2024-04-01', '2025-03-31', 'ACTIVE', 'MONTHLY', 800000.00),
(1, 'PRJ002', 'ECサイト構築', '新規ECサイトの開発', '2024-06-01', '2024-12-31', 'ACTIVE', 'MONTHLY', 700000.00),
(2, 'PRJ003', '社内ツール開発', '業務効率化ツールの開発', '2024-07-01', '2024-10-31', 'COMPLETED', 'MONTHLY', 600000.00);

-- サンプルアサイン
INSERT INTO assignments (project_id, engineer_id, start_date, end_date, role, billing_rate, cost_rate, working_hours_per_month, status) VALUES
(1, 1, '2024-04-01', NULL, 'バックエンドエンジニア', 800000.00, 500000.00, 160.00, 'ACTIVE'),
(2, 2, '2024-06-01', NULL, 'フロントエンドエンジニア', 700000.00, 450000.00, 160.00, 'ACTIVE'),
(3, 3, '2024-07-01', '2024-10-31', 'フルスタックエンジニア', 600000.00, 400000.00, 160.00, 'COMPLETED');

-- サンプル売上データ
INSERT INTO revenues (`year_month`, assignment_id, revenue, cost, profit) VALUES
('2024-04', 1, 800000.00, 500000.00, 300000.00),
('2024-05', 1, 800000.00, 500000.00, 300000.00),
('2024-06', 1, 800000.00, 500000.00, 300000.00),
('2024-06', 2, 700000.00, 450000.00, 250000.00),
('2024-07', 1, 800000.00, 500000.00, 300000.00),
('2024-07', 2, 700000.00, 450000.00, 250000.00),
('2024-07', 3, 600000.00, 400000.00, 200000.00);
