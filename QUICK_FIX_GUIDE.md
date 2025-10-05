# 🔧 Quick Fix Guide - Internal Server Error

## 問題

求人投稿ボタンをクリックすると「Internal server error」が発生します。

## 原因

データベースに承認ワークフロー用の新しいカラムがまだ追加されていません。

## 解決方法

### オプション 1: 自動マイグレーション（推奨）

```bash
cd /var/www/find-job-red/server
./migrate-approval-workflow.sh
```

スクリプトが：
- データベース認証情報を自動的に読み込み
- MySQLパスワードを安全に入力できるよう促す
- マイグレーションを実行

### オプション 2: 手動マイグレーション

```bash
cd /var/www/find-job-red/server
mysql -u root -p find_job_red < database/add_approval_workflow.sql
```

パスワードを入力すると、マイグレーションが実行されます。

### オプション 3: 承認ワークフローなしで使用（一時的）

現在のコードは互換性があるため、マイグレーションを実行しなくても動作します：
- 求人は直接公開されます（承認不要）
- 通知機能は利用できません
- 後で必要に応じてマイグレーションを実行できます

**この場合、サーバーを再起動するだけです：**

```bash
cd /var/www/find-job-red/server
npm run dev
```

## マイグレーション後

サーバーを再起動してください：

```bash
cd /var/www/find-job-red/server
npm run dev
```

## 追加される機能

マイグレーション実行後、以下の機能が利用可能になります：

✅ 求人の承認ワークフロー  
✅ 管理者による承認/却下  
✅ 自動通知システム  
✅ 承認ダッシュボード (`/admin/jobs/approval`)  

## トラブルシューティング

### エラー: "Access denied"

MySQLのパスワードが間違っています。正しいパスワードを使用してください。

### エラー: "Unknown column 'approval_status'"

これは正常です。マイグレーションがまだ実行されていません。上記のオプション1または2を実行してください。

### エラー: "Table 'notifications' already exists"

マイグレーションは既に実行されています。サーバーを再起動するだけで問題ありません。

## 確認方法

マイグレーションが成功したか確認：

```bash
mysql -u root -p find_job_red -e "DESCRIBE jobs;" | grep approval_status
```

`approval_status`カラムが表示されれば成功です！

## まとめ

1. ✅ コードは既に修正済み（互換性あり）
2. 🔄 マイグレーションを実行（承認ワークフロー使用する場合）
3. 🚀 サーバーを再起動
4. 🎉 求人投稿が動作します！

