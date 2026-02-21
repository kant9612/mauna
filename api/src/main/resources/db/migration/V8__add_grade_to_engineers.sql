-- engineersテーブルに等級カラム追加
ALTER TABLE engineers
    ADD COLUMN grade INT DEFAULT NULL,
    ADD COLUMN sub_grade VARCHAR(20) DEFAULT NULL;
