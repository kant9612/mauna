-- エンジニアに経験月数カラムを追加
ALTER TABLE engineers ADD COLUMN experience_months INT DEFAULT 0;

-- 部に担当部長カラムを追加
ALTER TABLE departments ADD COLUMN director_id BIGINT;
ALTER TABLE departments ADD CONSTRAINT fk_departments_director FOREIGN KEY (director_id) REFERENCES engineers(id);
