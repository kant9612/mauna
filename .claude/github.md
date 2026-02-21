1. まず絶対に守る：秘密情報をコミットしない

.env / APIキー / DB接続文字列 / OAuth client secret / JWT secret / SMTPパスなどは Git 管理外へ

application.yml / application.properties / _.tfvars / config._ に直書きしてないか確認

うっかり入ったら

コミット取り消し + 履歴からの除去（単に消して再コミットはNG。履歴に残る）

対策

.env.example や application-example.yml を用意して、必要な変数一覧だけ共有

.gitignore を最初に固める（後からだと事故る）

2. リポジトリに含めないもの（重い・不要・漏れやすい）

node_modules/, dist/, .next/, build/（ビルド成果物は原則コミットしない）

target/（Maven/Gradleビルド生成物）

ログ \*.log、一時ファイル、OS依存ファイル（.DS_Store など）

ローカルDB（SQLiteファイル等）、アップロードされた実データ、テスト用の個人情報

3. “他人が動かせる” 状態にする（再現性）

README に最低限これを書く

目的 / 機能概要

必要な環境（Node/Java バージョン、DB、Docker有無）

起動手順（コピペで動くコマンド）

必要な環境変数（例と説明）

Docker を使うなら

docker-compose.yml で DB/Redis 等もまとめると再現性が上がる

依存関係を固定

Node: package-lock.json / pnpm-lock.yaml / yarn.lock を入れる

Java: gradle-wrapper / mvnw を入れる

4. ライセンスと権利関係（AI併用開発で抜けやすい）

使っているライブラリのライセンスに反しない（特に商用利用や再配布）

画像・アイコン・フォント・音源・地図タイル等の 利用規約チェック

README か LICENSE を置く（公開するならほぼ必須）

迷うなら MIT/Apache-2.0 が無難なことが多い（社内ルールがあればそれ優先）

5. Claude Code 由来で気をつけたいポイント

自動生成コードの混入チェック

使ってない巨大なコード、謎のユーティリティ、不要な依存が増えがち

著作権が怪しいコピペが紛れてないか

どこかのサイトの文章をそのまま貼ってないか（README、コメント含む）

トークン/URLがログに出てないか

デバッグログに Authorization ヘッダや Cookie を出してないか

6. セキュリティ最低限（公開リポなら特に）

.env を読み込む前提なら、起動時に未設定をエラーにする（黙ってデフォルトで動かさない）

CORS 設定がガバいまま（\*）で公開してないか

DEBUG=true や詳細ログを本番想定で残してないか

依存関係の脆弱性チェック（GitHub Dependabot 有効化が簡単）

7. コミット運用

いきなり巨大コミット1発にしない（後でレビューできない）

コミットメッセージを意味ある単位に（例：feat: add login, fix: null check）

公開前に git diff と git status で “見えちゃいけないもの” がないか最終確認
