-- 等級履歴テーブル作成
CREATE TABLE engineer_grade_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    engineer_id BIGINT NOT NULL,
    grade INT NOT NULL,
    sub_grade VARCHAR(20) NOT NULL,
    effective_from DATE NOT NULL,        -- この等級の適用開始日
    effective_to DATE DEFAULT NULL,      -- この等級の適用終了日（NULLは現在有効）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (engineer_id) REFERENCES engineers(id),
    INDEX idx_engineer_effective (engineer_id, effective_from, effective_to)
);

-- 既存エンジニアの現在等級を履歴に初期投入
INSERT INTO engineer_grade_history (engineer_id, grade, sub_grade, effective_from)
SELECT id, grade, sub_grade, '2024-04-01'
FROM engineers
WHERE grade IS NOT NULL;
