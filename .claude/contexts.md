# Project Contexts

このファイルは、本プロジェクトにおける前提条件・技術構成・設計方針を定義する。
Claude は本ファイルを最優先の文脈として参照すること。

---

## 1. プロジェクト概要

- 種別: 個人開発用 Web アプリケーション
- 構成: SPA + REST API + RDB
- 目的: SES/案件管理を想定した業務系アプリケーション

---

## 2. 全体構成

project-root/
├── web/ # Frontend (SPA)
├── api/ # Backend (REST API)
├── db/ # DB / Migration / Docker
└── .claude/ # Claude Code 用プロジェクト設定

- web / api / db は明確に責務分離する
- フロントエンドから DB を直接触ることはない

---

## 3. Frontend（web）

- Framework: React
- Language: TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- 状態管理: 必要最小限（Context / useState / useReducer）
- API 通信: fetch or axios（型付きクライアントを使用）

### 方針

- コンポーネントは責務単位で分割する
- UI と API 通信ロジックは分離する
- ビジネスロジックは極力 Backend に寄せる

---

## 4. Backend（api）

- Language: Java 21
- Framework: Spring Boot 3
- Security: Spring Security + JWT 認証
- ORM: MyBatis（XML Mapper）
- Test: JUnit5 + Mockito

### パッケージ構成方針（例）

api/
└── src/main/java/...
├── controller
├── service
├── repository
├── mapper # MyBatis XML 対応
├── domain
├── dto
└── config

### 方針

- Controller は HTTP のみを扱う
- Service に業務ロジックを集約する
- Repository / Mapper は DB アクセスに専念する
- トランザクション境界は Service 層で管理する

---

## 5. 認証・認可

- 認証方式: JWT（Bearer Token）
- ログイン成功時に JWT を発行する
- 権限制御はロールベース（ROLE_USER / ROLE_ADMIN 等）を想定
- セキュリティ関連の設定は config 配下に集約する

---

## 6. DB / Infra（db）

- DB: MySQL 8
- Engine: InnoDB
- Charset: utf8mb4
- Local 開発: Docker Compose

### 方針

- テーブル設計は正規化を基本とする
- 外部キー制約を原則使用する
- インデックスは検索条件を見て追加する
- マイグレーション管理を前提とする（Flyway 等）

---

## 7. ドメイン定義

本プロジェクトでは以下のドメインを扱う。

- Customer: 顧客
- Project: 案件
- Engineer: エンジニア
- Assignment: アサイン（案件 × エンジニア）
- User: ログインユーザ
- Revenue: 月次売上（集計結果）

### 方針

- ドメインは CRUD ベースで段階的に実装する
- 集計系（Revenue）は参照専用を基本とする

---

## 8. 開発・実装ルール

- いきなり実装せず、必要に応じて `/plan` を使用する
- コードレビューは `/review` を使用する
- 実装は最小構成から始めて段階的に拡張する
- 不明点は推測せず、設計レベルで確認する

---

## 9. Git ブランチ戦略

### ブランチ構成

| ブランチ | 用途 |
|----------|------|
| `main` | 本番稼働用 |
| `dev` | テスト環境用 |
| `feature/*` | 実装用（dev から作成） |

### 運用フロー

```
dev → feature/xxx（実装）→ dev（マージ）→ main（リリース）
```

### 新機能の実装手順

```bash
git checkout dev
git checkout -b feature/機能名
# 実装作業
git push -u origin feature/機能名
# PR で dev にマージ
```

---

## 10. このコンテキストについて

- 本ファイルはプロジェクトの成長に合わせて更新する
- 違和感やズレが出た場合は、修正提案を行う