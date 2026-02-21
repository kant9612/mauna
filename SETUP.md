# Mauna - セットアップガイド

## 前提条件

- Java 17以上
- Node.js 18以上
- Docker & Docker Compose
- Maven（Wrapperが含まれています）

## クイックスタート

### 1. データベースの起動

```bash
cd db/docker
docker-compose up -d
```

データベース接続情報:
- Host: localhost:3306
- Database: mauna
- User: mauna_user
- Password: mauna_pass

### 2. バックエンドの起動

```bash
cd api
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

APIは http://localhost:8080/api で起動します。

### 3. フロントエンドの起動

```bash
cd web
npm install
npm run dev
```

フロントエンドは http://localhost:5173 で起動します。

## ログイン情報

管理者:
- ユーザー名: `admin`
- パスワード: `password`

一般ユーザー:
- ユーザー名: `user1`
- パスワード: `password`

## トラブルシューティング

### Java バージョンエラー

Java 17が必要です。確認方法:
```bash
java -version
```

### MySQL接続エラー

Docker Composeでデータベースが起動しているか確認:
```bash
docker ps | grep mauna-mysql
```

データベースのリセット:
```bash
docker exec mauna-mysql mysql -uroot -proot -e "DROP DATABASE IF EXISTS mauna; CREATE DATABASE mauna CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON mauna.* TO 'mauna_user'@'%';"
```

### ポートが使用中

- バックエンド: ポート8080
- フロントエンド: ポート5173 (使用中の場合は自動的に5174等に変更されます)

使用中のポートを確認:
```bash
lsof -i :8080
lsof -i :5173
```

## 開発中の既知の問題

現在、Flywayマイグレーションの実行で問題が発生しています。対応中です。

詳細は `api/TROUBLESHOOTING.md` をご確認ください。
