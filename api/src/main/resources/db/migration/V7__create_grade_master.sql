-- 等級マスタテーブル作成
CREATE TABLE grade_masters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grade INT NOT NULL,                    -- 1〜8
    sub_grade VARCHAR(20) NOT NULL,        -- ENTRY, MIDDLE, HIGH
    name VARCHAR(50) NOT NULL,             -- 呼称（マエストロ等）
    cost_rate DECIMAL(12, 2) NOT NULL,     -- 原価
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_grade_subgrade (grade, sub_grade)
);

-- 初期データ投入
INSERT INTO grade_masters (grade, sub_grade, name, cost_rate) VALUES
    (8, 'ENTRY', 'マエストロ', 1000000.00),
    (7, 'ENTRY', 'ソプラニスタ', 800000.00),
    (7, 'MIDDLE', 'ソプラニスタ', 950000.00),
    (7, 'HIGH', 'ソプラニスタ', 1100000.00),
    (6, 'ENTRY', 'コンダクター', 600000.00),
    (6, 'MIDDLE', 'コンダクター', 690000.00),
    (6, 'HIGH', 'コンダクター', 780000.00),
    (5, 'ENTRY', 'ピアニスト', 430000.00),
    (5, 'MIDDLE', 'ピアニスト', 500000.00),
    (5, 'HIGH', 'ピアニスト', 570000.00),
    (4, 'ENTRY', 'バイオリニスト', 340000.00),
    (4, 'MIDDLE', 'バイオリニスト', 390000.00),
    (4, 'HIGH', 'バイオリニスト', 440000.00),
    (3, 'ENTRY', 'フルーティスト', 290000.00),
    (3, 'MIDDLE', 'フルーティスト', 320000.00),
    (3, 'HIGH', 'フルーティスト', 350000.00),
    (2, 'ENTRY', 'トランペッター', 260000.00),
    (1, 'ENTRY', 'ドラマー', 240000.00);
