# Database Setup

## 起動方法

```bash
cd db/docker
docker-compose up -d
```

## 停止方法

```bash
docker-compose down
```

## データベース接続情報

- Host: localhost
- Port: 3306
- Database: mauna
- User: mauna_user
- Password: mauna_pass
- Root Password: root

## マイグレーション

マイグレーションファイルは `db/migrations/` に配置されています。
Spring Bootアプリケーション起動時にFlywayが自動的にマイグレーションを実行します。

## テーブル構成

- `users`: ログインユーザー
- `customers`: 顧客
- `engineers`: エンジニア
- `projects`: 案件
- `assignments`: アサイン（案件 × エンジニア）
- `revenues`: 月次売上（集計結果）
