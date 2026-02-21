#!/bin/bash

echo "=========================================="
echo "Mauna アプリケーション動作確認スクリプト"
echo "=========================================="
echo ""

# カラー出力用
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. サービス起動確認
echo "1. サービス起動状態の確認"
echo "------------------------------------------"

# MySQL
if docker ps | grep -q mauna-mysql; then
    echo -e "${GREEN}✓${NC} MySQL: 起動中 (Port 3306)"
else
    echo -e "${RED}✗${NC} MySQL: 停止中"
fi

# Backend
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend: 起動中 (Port 8080)"
else
    echo -e "${RED}✗${NC} Backend: 停止中"
fi

# Frontend
if lsof -ti:5174 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend: 起動中 (Port 5174)"
else
    echo -e "${RED}✗${NC} Frontend: 停止中"
fi

echo ""

# 2. データベース接続確認
echo "2. データベース接続確認"
echo "------------------------------------------"
DB_CHECK=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass -e "SELECT 1" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} データベース接続: 成功"
else
    echo -e "${RED}✗${NC} データベース接続: 失敗"
fi

# テーブル数確認
TABLE_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SHOW TABLES;" 2>/dev/null | grep -v "Tables_in_mauna" | wc -l | tr -d ' ')
echo -e "${GREEN}✓${NC} テーブル数: ${TABLE_COUNT}個"

# Flywayマイグレーション確認
MIGRATION_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM flyway_schema_history WHERE success=1;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} Flywayマイグレーション: ${MIGRATION_COUNT}件成功"

echo ""

# 3. バックエンドAPI確認
echo "3. バックエンドAPI確認"
echo "------------------------------------------"

# ログインAPIテスト（CSRFトークンなし）
echo "ログインAPIテスト..."
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}' \
  -s -w '\n%{http_code}' 2>&1)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} ログインAPI: 成功 (HTTP 200)"
    TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓${NC} JWTトークン取得: 成功"

        # トークンを使ってプロジェクト一覧取得
        echo ""
        echo "プロジェクト一覧APIテスト..."
        PROJECT_RESPONSE=$(curl -X GET http://localhost:8080/api/projects \
          -H "Authorization: Bearer $TOKEN" \
          -s -w '\n%{http_code}' 2>&1)

        PROJECT_HTTP_CODE=$(echo "$PROJECT_RESPONSE" | tail -n 1)
        if [ "$PROJECT_HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✓${NC} プロジェクト一覧API: 成功 (HTTP 200)"
            PROJECT_COUNT=$(echo "$PROJECT_RESPONSE" | head -n -1 | grep -o '\[' | wc -l | tr -d ' ')
            echo -e "${GREEN}✓${NC} プロジェクトデータ: 取得成功"
        else
            echo -e "${YELLOW}⚠${NC} プロジェクト一覧API: HTTP ${PROJECT_HTTP_CODE}"
        fi
    fi
elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${YELLOW}⚠${NC} ログインAPI: HTTP 403 (CSRF保護が有効の可能性)"
    echo "   → SecurityConfigの確認が必要"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${RED}✗${NC} ログインAPI: HTTP 401 (認証失敗)"
else
    echo -e "${YELLOW}⚠${NC} ログインAPI: HTTP ${HTTP_CODE}"
fi

echo ""

# 4. フロントエンド確認
echo "4. フロントエンド確認"
echo "------------------------------------------"

FRONTEND_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5174 2>&1)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} フロントエンド: アクセス可能 (HTTP 200)"
    echo -e "${GREEN}✓${NC} URL: http://localhost:5174"
else
    echo -e "${YELLOW}⚠${NC} フロントエンド: HTTP ${FRONTEND_RESPONSE}"
fi

echo ""

# 5. サンプルデータ確認
echo "5. サンプルデータ確認"
echo "------------------------------------------"

USER_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} ユーザー数: ${USER_COUNT}件"

CUSTOMER_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM customers;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} 顧客数: ${CUSTOMER_COUNT}件"

ENGINEER_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM engineers;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} エンジニア数: ${ENGINEER_COUNT}件"

PROJECT_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM projects;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} プロジェクト数: ${PROJECT_COUNT}件"

ASSIGNMENT_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM assignments;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} アサイン数: ${ASSIGNMENT_COUNT}件"

REVENUE_COUNT=$(docker exec mauna-mysql mysql -umauna_user -pmauna_pass mauna -e "SELECT COUNT(*) FROM revenues;" 2>/dev/null | grep -v "COUNT" | tr -d ' ')
echo -e "${GREEN}✓${NC} 売上データ数: ${REVENUE_COUNT}件"

echo ""

# 6. まとめ
echo "=========================================="
echo "動作確認まとめ"
echo "=========================================="
echo ""
echo "【ログイン情報】"
echo "  管理者: username=admin, password=password"
echo "  一般ユーザー: username=user1, password=password"
echo ""
echo "【アクセスURL】"
echo "  フロントエンド: http://localhost:5174"
echo "  バックエンドAPI: http://localhost:8080/api"
echo "  MySQL: localhost:3306 (DB名: mauna)"
echo ""
echo "【次のステップ】"
echo "  1. ブラウザで http://localhost:5174 を開く"
echo "  2. admin / password でログイン"
echo "  3. ダッシュボードとプロジェクト一覧を確認"
echo ""
