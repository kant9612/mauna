-- usersテーブルにengineer_idを追加
-- ユーザーとエンジニアを紐付けることで、ログインユーザーの所属グループを特定可能にする

ALTER TABLE users
ADD COLUMN engineer_id BIGINT NULL AFTER role,
ADD CONSTRAINT fk_users_engineer_id FOREIGN KEY (engineer_id) REFERENCES engineers(id) ON DELETE SET NULL;

CREATE INDEX idx_users_engineer_id ON users(engineer_id);
