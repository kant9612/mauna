-- 案件テーブルに必要人数カラムを追加
ALTER TABLE projects ADD COLUMN required_headcount INT DEFAULT 1;

-- 既存データの更新（サンプル）
UPDATE projects SET required_headcount = 2 WHERE id IN (1, 2);
UPDATE projects SET required_headcount = 3 WHERE id = 3;
