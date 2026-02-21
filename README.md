# Mauna - SES案件管理システム

SES（System Engineering Service）案件の管理を目的とした業務系Webアプリケーションです。

## プロジェクト構成

```
mauna/
├── web/        # フロントエンド (React + TypeScript + Vite + Tailwind CSS)
├── api/        # バックエンド (Spring Boot 3 + Java 21 + MyBatis)
├── db/         # データベース (MySQL 8 + Docker Compose)
└── .claude/    # Claude Code 設定
```

## 機能概要

### 実装済み機能
- **認証機能**: JWT を使用したログイン・ログアウト
- **案件管理**: 案件の一覧表示（CRUD 準備済み）
- **ダッシュボード**: 進行中の案件、エンジニア数、取引先企業数の概要表示

### 管理対象
- **顧客 (Customer)**: 取引先企業情報
- **案件 (Project)**: プロジェクト情報
- **エンジニア (Engineer)**: 技術者情報
- **アサイン (Assignment)**: 案件とエンジニアの紐付け
- **売上 (Revenue)**: 月次売上集計

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### バックエンド
- Java 21
- Spring Boot 3.2.1
- Spring Security (JWT認証)
- MyBatis 3
- MySQL Connector

### データベース
- MySQL 8.0
- Flyway (マイグレーション管理)

### インフラ
- Docker / Docker Compose

## セットアップ手順

### 1. データベースの起動

```bash
cd db/docker
docker-compose up -d
```

データベースが起動すると、以下の接続情報で利用可能になります：
- Host: localhost
- Port: 3306
- Database: mauna
- User: mauna_user
- Password: mauna_pass

### 2. バックエンドの起動

```bash
cd api
./mvnw clean install
./mvnw spring-boot:run
```

APIサーバーは http://localhost:8080/api で起動します。

Flywayが自動的にマイグレーションを実行し、サンプルデータが投入されます。

### 3. フロントエンドの起動

```bash
cd web
npm install
npm run dev
```

開発サーバーは http://localhost:5173 で起動します。

## ログイン情報

### 管理者ユーザー
- ユーザー名: `admin`
- パスワード: `password`
- ロール: ROLE_ADMIN

### 一般ユーザー
- ユーザー名: `user1`
- パスワード: `password`
- ロール: ROLE_USER

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/verify` - トークン検証

### 案件管理
- `GET /api/projects` - 案件一覧取得
- `GET /api/projects/{id}` - 案件詳細取得
- `POST /api/projects` - 案件作成
- `PUT /api/projects/{id}` - 案件更新
- `DELETE /api/projects/{id}` - 案件削除

## データベーススキーマ

### users
ログインユーザー情報

### customers
顧客（取引先企業）情報

### engineers
エンジニア情報

### projects
案件情報

### assignments
アサイン情報（案件 × エンジニア）

### revenues
月次売上情報

詳細は [db/migrations/V1__create_initial_tables.sql](db/migrations/V1__create_initial_tables.sql) を参照してください。

## 開発方針

- **責務分離**: Web / API / DB を明確に分離
- **型安全性**: TypeScript と Java の型システムを活用
- **セキュリティ**: JWT 認証、CORS 対応、SQL インジェクション対策
- **拡張性**: CRUD をベースに段階的に機能を追加

## 今後の拡張予定

- [ ] 顧客管理機能の実装
- [ ] エンジニア管理機能の実装
- [ ] アサイン管理機能の実装
- [ ] 売上レポート機能の実装
- [ ] 検索・フィルタ機能の強化
- [ ] テストコードの追加
- [ ] デプロイ設定の追加

## ライセンス

このプロジェクトは個人開発用です。

## 参考資料

プロジェクトの詳細な設計方針については [.claude/contexts.md](.claude/contexts.md) を参照してください。
