-- サンプル部データ
INSERT INTO departments (code, name, description, display_order, is_active) VALUES
('DEPT001', 'システム開発部', 'システム開発を担当する部門', 1, TRUE),
('DEPT002', 'インフラ部', 'インフラ構築・運用を担当する部門', 2, TRUE),
('DEPT003', '営業部', '営業活動を担当する部門', 3, TRUE);

-- サンプルグループデータ
INSERT INTO `groups` (department_id, code, name, description, leader_id, display_order, is_active) VALUES
(1, 'GRP001', '第1開発グループ', 'Webアプリケーション開発担当', 1, 1, TRUE),
(1, 'GRP002', '第2開発グループ', 'モバイルアプリ開発担当', NULL, 2, TRUE),
(2, 'GRP003', 'クラウドグループ', 'AWS/Azure等クラウド基盤担当', NULL, 1, TRUE),
(2, 'GRP004', 'ネットワークグループ', 'ネットワーク設計・運用担当', NULL, 2, TRUE);

-- 既存エンジニアにグループを割り当て
UPDATE engineers SET group_id = 1 WHERE employee_number = 'ENG001';
UPDATE engineers SET group_id = 1 WHERE employee_number = 'ENG002';
UPDATE engineers SET group_id = 3 WHERE employee_number = 'ENG003';
