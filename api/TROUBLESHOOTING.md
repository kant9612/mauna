# トラブルシューティング

## 問題の解決

### 1. Java 21 → Java 17への変更

**問題**: システムにJava 17がインストールされているが、pom.xmlでJava 21を指定していた

**解決**: pom.xmlの`<java.version>`を17に変更

```xml
<properties>
    <java.version>17</java.version>
</properties>
```

### 2. MySQL接続エラー「Public Key Retrieval is not allowed」

**問題**: MySQL 8の認証方式でPublic Key Retrievalが必要

**解決**: application.ymlのデータソースURLに`allowPublicKeyRetrieval=true`を追加

```yaml
url: jdbc:mysql://localhost:3306/mauna?useSSL=false&serverTimezone=Asia/Tokyo&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
```

### 3. Flyway マイグレーションエラー（現在調査中）

**問題**: V1__create_initial_tables.sql実行時にエラー

**現在の状況**: 調査中

## 起動手順

### 1. データベース起動
```bash
cd db/docker
docker-compose up -d
```

### 2. バックエンド起動
```bash
cd api
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

### 3. フロントエンド起動
```bash
cd web
npm install
npm run dev
```

## 設定ファイルの確認事項

- Java 17が必要
- MySQL 8.0が起動している必要がある
- ポート8080（API）と5173（フロントエンド）が空いている必要がある
