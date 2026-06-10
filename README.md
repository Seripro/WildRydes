# WildRydes — サーバーレスアーキテクチャ設計と構築手順

このリポジトリは、React（Vite）をフロントエンドに、AWS（Cognito / API Gateway / Lambda / DynamoDB）をバックエンドに使ったサーバーレスなフルスタック構成のサンプルです。

目的: ドキュメントを見なくても同じ構成を再現できるよう、設計図と手順（レシピ）を段階的にまとめます。

## アーキテクチャの全体像（5つの役割）

このシステムは以下の5つの独立したコンポーネントで構成されます。

- フロントエンド（React / Vite）: UI を描画し、API を呼び出します。
- 認証基盤（Amazon Cognito）: ユーザー管理と JWT 発行を行います。
- データベース（Amazon DynamoDB）: 永続データを保存します。
- コンピューティング（AWS Lambda）: ビジネスロジックを実行します。
- API ルーター（Amazon API Gateway）: 認可を行い、フロントとバックエンドを繋ぎます。

---

## フェーズ 1 — フロントエンドと認証基盤

1. Cognito ユーザープールを作成
   - サインインオプション: E メール
   - MFA: なし（テスト用）
   - アプリケーションタイプ: SPA
   - クライアントシークレット: 生成しない（フロントから直接呼ぶため）
   - 取得する情報: ユーザープール ID / クライアント ID

2. React プロジェクトの初期化と Amplify の導入

   ```bash
   npm create vite@latest . -- --template react
   npm install
   npm install aws-amplify
   ```

3. フロントエンドへの認証ロジック実装
   - `src/main.jsx` で Amplify を初期化し、Cognito の ID を設定します。
   - `src/App.jsx` に `signUp`, `confirmSignUp`, `signIn` などの認証 UI を実装します。

---

## フェーズ 2 — データベースとアクセス権限

1. DynamoDB テーブルの作成
   - テーブル名: `Rides`
   - パーティションキー: `RideId` (文字列)
   - 取得する情報: テーブルの ARN

2. IAM ロールの作成（Lambda 用）
   - 信頼されたエンティティ: `lambda.amazonaws.com`
   - 基本権限: `AWSLambdaBasicExecutionRole`
   - 追加ポリシー: 対象の `Rides` テーブルに対する `PutItem` のみ許可
   - ロール名の例: `WildRydesLambda`

---

## フェーズ 3 — バックエンド（Lambda）

1. Lambda 関数の作成
   - ランタイム: Node.js 20.x
   - 実行ロール: `WildRydesLambda`

2. 実装のポイント
   - フロントから送られた現在地情報を `event.body` で受け取る
   - API Gateway の Cognito 認可を通過したユーザー名を `event.requestContext.authorizer.claims['cognito:username']` から取得
   - 配車ロジック（ランダムな割当など）を実行
   - 結果を DynamoDB の `Rides` テーブルへ `PutCommand` で保存
   - CORS ヘッダーを含めてレスポンスを返す

---

## フェーズ 4 — API Gateway（ルーティング）

1. REST API の作成
   - リソース: `/ride` （CORS 有効化）
   - メソッド: `POST`
   - 統合タイプ: Lambda プロキシ統合（作成した Lambda を紐付け）

2. Cognito オーソライザーの設定
   - タイプ: `Cognito`
   - ユーザープールを指定、トークンのソースは `Authorization`
   - `/ride` の POST メソッドにオーソライザーを割り当てる

3. デプロイ
   - ステージ例: `prod`
   - デプロイ後に取得するもの: Invoke URL（例: `https://.../prod`）

---

## フェーズ 5 — 結合と呼び出し

1. フロントエンドからの API 呼び出し
   - Cognito から現在のセッションの JWT トークンを取得（`fetchAuthSession`）
   - `fetch` 等で `POST https://.../prod/ride` へ送信
   - リクエストヘッダーに `Authorization: <JWT>` を設定して呼び出す

---

## 今後の展開

この構成は再利用性が高く、画像認識やチャットボット等の機能追加にもそのまま適用できます。

必要なら、次の作業として以下を行えます。

- `src` の認証実装例を追加
- Lambda のサンプル実装を `lambda/` に追加
- デプロイ手順（CloudFormation / CDK / SAM 等）を追加

---

作成・更新: このファイルを見やすく整理しました。追加の書き方や細かい文言修正をご希望であれば教えてください。
参考
https://qiita.com/onishi_820/items/4b8ac525e6866f3e7eb2
