# Maunaアプリケーション 動作確認ガイド

## 概要
このドキュメントでは、Maunaアプリケーションが正しく動作していることを確認する方法を説明します。

## 前提条件
以下のサービスが起動している必要があります：

1. **MySQL** (Port 3306)
2. **Backend API** (Port 8080)
3. **Frontend** (Port 5174)

## 自動確認スクリプト

最も簡単な方法は、用意された自動確認スクリプトを実行することです：

```bash
bash /Users/kantakayama/Documents/80.成果物/mauna/test-app.sh
```

このスクリプトは以下をチェックします：
- 各サービスの起動状態
- データベース接続
- Flywayマイグレーション
- サンプルデータ
- バックエンドAPI（試行）
- フロントエンドアクセス

## 手動確認手順

### 1. サービス起動確認

#### MySQL
```bash
docker ps | grep mauna-mysql
```

期待される出力：
```
CONTAINER ID   IMAGE       STATUS         PORTS
xxxxxxxxxx     mysql:8.0   Up XX minutes  0.0.0.0:3306->3306/tcp
```

#### Backend
```bash
lsof -ti:8080
```

PID番号が表示されればOKです。

#### Frontend
```bash
lsof -ti:5174
```

PID番号が表示されればOKです。

### 2. データベース確認

#### データベースに接続
```bash
docker exec -it mauna-mysql mysql -umauna_user -pmauna_pass mauna
```

#### テーブル一覧確認
```sql
SHOW TABLES;
```

期待される出力（7テーブル）：
```
+-------------------+
| Tables_in_mauna   |
+-------------------+
| assignments       |
| customers         |
| engineers         |
| flyway_schema_history |
| projects          |
| revenues          |
| users             |
+-------------------+
```

#### サンプルユーザー確認
```sql
SELECT id, username, email, role FROM users;
```

期待される出力：
```
+----+----------+------------------+------------+
| id | username | email            | role       |
+----+----------+------------------+------------+
|  1 | admin    | admin@mauna.com  | ROLE_ADMIN |
|  2 | user1    | user1@mauna.com  | ROLE_USER  |
+----+----------+------------------+------------+
```

#### Flywayマイグレーション履歴確認
```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history;
```

期待される出力：
```
+----------------+---------+----------------------+---------+
| installed_rank | version | description          | success |
+----------------+---------+----------------------+---------+
|              1 | 1       | create initial tables|       1 |
|              2 | 2       | insert sample data   |       1 |
+----------------+---------+----------------------+---------+
```

### 3. フロントエンドアクセス確認

#### ブラウザでアクセス
```
http://localhost:5174
```

期待される動作：
1. ログイン画面が表示される
2. 以下の認証情報でログインできる：
   - **管理者**: `username: admin`, `password: password`
   - **一般ユーザー**: `username: user1`, `password: password`
3. ログイン後、ダッシュボードが表示される
4. 左メニューから「プロジェクト」をクリックすると、プロジェクト一覧が表示される

### 4. バックエンドAPI確認（高度）

#### ログインエンドポイント

フロントエンドを通じてログインすることで、バックエンドAPIが正しく動作していることを確認できます。

直接curlでテストする場合（CSRF保護により403が返る可能性があります）：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'
```

**注意**:
- コンテキストパスは `/api` です
- すべてのエンドポイントは `/api/` で始まります
- 例: `/api/auth/login`, `/api/projects`, `/api/customers`

#### プロジェクト一覧取得（JWTトークン必要）

フロントエンドを使用してログインし、その後ブラウザの開発者ツールでNetwork > Headers > Authorization headerを確認すると、JWTトークンが確認できます。

## データ確認

### サンプルデータ数

以下のコマンドで各テーブルのレコード数を確認できます：

```bash
docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'engineers', COUNT(*) FROM engineers
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL SELECT 'revenues', COUNT(*) FROM revenues;"
```

期待される出力：
```
+-------------+-------+
| table_name  | count |
+-------------+-------+
| users       |     2 |
| customers   |     2 |
| engineers   |     3 |
| projects    |     3 |
| assignments |     3 |
| revenues    |     7 |
+-------------+-------+
```

## トラブルシューティング

### Backend API が403を返す場合

これは正常な動作の可能性があります：
1. フロントエンドを通じてログインを試してください
2. フロントエンドからのAPIコールは正しく認証されます
3. 直接curlでテストする場合、CORS設定により制限される可能性があります

### サービスが起動しない場合

#### MySQL
```bash
cd /Users/kantakayama/Documents/80.成果物/mauna/mauna/db
docker-compose up -d
```

#### Backend
```bash
cd /Users/kantakayama/Documents/80.成果物/mauna/mauna/api
./mvnw spring-boot:run
```

#### Frontend
```bash
cd /Users/kantakayama/Documents/80.成果物/mauna/mauna/web
npm run dev
```

## エンドツーエンド確認手順

最も確実な動作確認方法：

1. ブラウザで `http://localhost:5174` を開く
2. `admin` / `password` でログイン
3. ダッシュボードが表示されることを確認
4. 左メニュー「プロジェクト」をクリック
5. プロジェクト一覧が表示されること確認（3件のプロジェクトが表示されるはず）
6. 他のメニュー（顧客、エンジニア、アサイン、売上）も同様に確認

**この手順が成功すれば、以下すべてが正常動作していることが証明されます：**
- フロントエンドの起動とレンダリング
- バックエンドAPIの起動と応答
- JWT認証の動作
- データベース接続とクエリ
- Flywayマイグレーションの成功
- CORS設定の正確性
- サンプルデータの存在

## まとめ

最も重要な確認ポイント：
1. ✅ MySQL コンテナが起動している
2. ✅ Flywayマイグレーションが成功している（2件）
3. ✅ サンプルデータが投入されている
4. ✅ Backend API が起動している（Port 8080）
5. ✅ Frontend が起動している（Port 5174）
6. ✅ ブラウザからログインできる
7. ✅ データ一覧が表示される

これらすべてがOKであれば、アプリケーションは完全に動作しています！
