# 求人承認ワークフロー実装ガイド

## 概要

このドキュメントでは、求人公開プロセスにおける承認ワークフローの実装について説明します。

## 求人公開プロセス

1. **求人投稿**: 採用担当者（employer）が求人配信ボタンをクリックすると、求人が「承認待ち（pending）」ステータスで作成されます
2. **管理者レビュー**: 管理者は承認待ちの求人一覧を確認し、承認または却下を行います
3. **承認**: 管理者が承認すると、求人が公開され、採用担当者に通知が送信されます
4. **却下**: 管理者が却下すると、却下理由とともに採用担当者に通知が送信されます

## データベース変更

### 1. マイグレーションSQL を実行

```bash
mysql -u root -p find_job_red < server/database/add_approval_workflow.sql
```

このSQLファイルは以下を実行します：
- `jobs`テーブルに承認関連のカラムを追加
  - `approval_status`: 'pending', 'approved', 'rejected'
  - `approved_by`: 承認/却下した管理者のID
  - `approved_at`: 承認/却下日時
  - `rejection_reason`: 却下理由
- `notifications`テーブルを作成（通知機能用）

### 2. テーブル構造

```sql
-- jobs テーブルに追加されたカラム
ALTER TABLE jobs 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN approved_by INT NULL,
ADD COLUMN approved_at TIMESTAMP NULL,
ADD COLUMN rejection_reason TEXT NULL;

-- notifications テーブル
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('job_approved', 'job_rejected', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_job_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API エンドポイント

### 求人管理

#### 1. 求人投稿（採用担当者/管理者）
```
POST /api/jobs
Authorization: Bearer {token}

レスポンス:
{
  "success": true,
  "message": "Job submitted for approval. An administrator will review it shortly.",
  "data": { "job": {...} }
}
```

#### 2. 承認待ち求人一覧取得（管理者のみ）
```
GET /api/jobs/pending/list
Authorization: Bearer {token}

レスポンス:
{
  "success": true,
  "data": {
    "jobs": [...],
    "count": 5
  }
}
```

#### 3. 求人承認（管理者のみ）
```
POST /api/jobs/:id/approve
Authorization: Bearer {token}

レスポンス:
{
  "success": true,
  "message": "Job approved successfully",
  "data": { "job": {...} }
}
```

#### 4. 求人却下（管理者のみ）
```
POST /api/jobs/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "rejection_reason": "却下理由（10文字以上必須）"
}

レスポンス:
{
  "success": true,
  "message": "Job rejected successfully",
  "data": { "job": {...} }
}
```

### 通知管理

#### 1. 通知一覧取得
```
GET /api/notifications
Authorization: Bearer {token}

レスポンス:
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 3
  }
}
```

#### 2. 通知を既読にする
```
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

#### 3. すべての通知を既読にする
```
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

#### 4. 通知削除
```
DELETE /api/notifications/:id
Authorization: Bearer {token}
```

## フロントエンド実装

### 1. 管理者ダッシュボード

**場所**: `src/pages/AdminJobApproval.tsx`

**機能**:
- 承認待ち求人の一覧表示
- 求人の詳細情報表示
- 承認/却下アクション
- 却下理由の入力

**アクセス**: 管理者（admin）ロールのみ

### 2. 求人投稿フォーム更新

**場所**: `src/pages/AddJob.tsx`

**変更点**:
- 投稿成功時のメッセージを「承認待ち」に変更
- 採用担当者に承認プロセスについて通知

### 3. ルート設定

`src/App.tsx` または routing ファイルに以下を追加:

```typescript
import AdminJobApproval from '@/pages/AdminJobApproval';

// Routes
<Route path="/admin/jobs/approval" element={<AdminJobApproval />} />
```

## 使用方法

### 採用担当者（Employer）の操作

1. `/add-job` ページから求人を投稿
2. 投稿後、「承認待ち」メッセージが表示される
3. 管理者の承認を待つ
4. 承認/却下の通知を受け取る

### 管理者（Admin）の操作

1. `/admin/jobs/approval` ページにアクセス
2. 承認待ちの求人一覧を確認
3. 各求人の詳細を確認：
   - 求人情報
   - 投稿者情報
   - 投稿日時
4. アクションを選択：
   - **承認**: 求人が公開され、採用担当者に通知
   - **却下**: 却下理由を入力して却下、採用担当者に通知

## デフォルト管理者アカウント

```
メール: admin@bizresearch.com
パスワード: admin123
```

**⚠️ 本番環境では必ずパスワードを変更してください！**

## 通知システム

### 通知の種類

1. **job_approved**: 求人が承認された
2. **job_rejected**: 求人が却下された
3. **general**: 一般的な通知

### 通知の確認方法

フロントエンドで通知コンポーネントを実装し、以下のAPIを使用:

```typescript
// 通知一覧取得
const response = await fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data.data.notifications); // 通知一覧
console.log(data.data.unreadCount); // 未読数
```

## テスト手順

1. **データベースマイグレーション実行**
   ```bash
   mysql -u root -p find_job_red < server/database/add_approval_workflow.sql
   ```

2. **サーバー再起動**
   ```bash
   cd server
   npm run dev
   ```

3. **採用担当者アカウントで求人投稿**
   - 新規登録時に「企業・採用担当者」を選択
   - 求人フォームから投稿

4. **管理者アカウントで承認/却下**
   - admin@bizresearch.com でログイン
   - `/admin/jobs/approval` にアクセス
   - 承認または却下を実行

5. **通知確認**
   - 採用担当者アカウントで通知APIを確認

## トラブルシューティング

### 問題: マイグレーションエラー

**解決策**: 
- データベース接続情報を確認
- 既存のカラムがある場合は、SQLファイルの`ALTER TABLE`文を調整

### 問題: 承認ページが表示されない

**解決策**:
- ユーザーが管理者（admin）ロールか確認
- ルート設定が正しいか確認

### 問題: 通知が送信されない

**解決策**:
- notifications テーブルが作成されているか確認
- エラーログを確認

## まとめ

この実装により、求人投稿から公開までの承認ワークフローが完全に機能します：

✅ 求人は承認待ちステータスで作成
✅ 管理者が承認/却下を管理
✅ 自動通知システム
✅ 完全な監査トレイル（誰がいつ承認/却下したか記録）

ご不明な点がございましたら、お気軽にお問い合わせください。

