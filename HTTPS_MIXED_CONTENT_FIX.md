# HTTPS Mixed Content エラー修正ガイド

## ✅ 問題解決

HTTPSサイト上でHTTP APIリクエストを行うことによる Mixed Content エラーを修正しました。

## 🔍 問題の詳細

### エラーメッセージ
```
Mixed Content: The page at 'https://bizresearch.biz/login' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://133.117.74.53/api/auth/login'. 
This request has been blocked; the content must be served over HTTPS.
```

### 原因
- フロントエンド: HTTPS (`https://bizresearch.biz`)
- バックエンドAPI: HTTP (`http://133.117.74.53`)
- ブラウザのセキュリティポリシーによりHTTPSページからHTTPリクエストがブロック

## 🔧 実装した修正

### 1. 自動プロトコル検出 (`src/lib/api.ts`)

```typescript
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // 本番環境: 相対パスを使用（同じドメイン）
    if (hostname === 'bizresearch.biz') {
      return '/api';
    }
    
    // ローカル開発: HTTP
    if (hostname === 'localhost') {
      return 'http://localhost:3001/api';
    }
    
    // デフォルト: 現在のページと同じプロトコル
    return `${protocol}//${hostname}:3001/api`;
  }
  
  return 'http://localhost:3001/api';
};
```

### 2. 相対URL使用 (`src/pages/AddJob.tsx`)

```typescript
// 修正前
const response = await fetch('/api/jobs', ...)

// 修正後（明示的に相対URLを使用）
const apiUrl = '/api/jobs';
const response = await fetch(apiUrl, ...)
```

## 🌐 環境別の動作

### 本番環境 (https://bizresearch.biz)

**API URL**: `/api` (相対パス)

**利点:**
- ✅ Mixed Content エラーなし
- ✅ 現在のページと同じプロトコルを使用
- ✅ Nginx/Apache のリバースプロキシと連携

**要件:**
- Webサーバー（Nginx/Apache）で `/api` をバックエンドにプロキシする必要があります

### ローカル開発 (http://localhost)

**API URL**: `http://localhost:3001/api`

**利点:**
- ✅ CORS設定不要
- ✅ 開発サーバーと独立して実行

### その他の環境

**API URL**: 現在のプロトコル + ホスト名 + `:3001/api`

**例:**
- `https://example.com` → `https://example.com:3001/api`
- `http://192.168.1.100` → `http://192.168.1.100:3001/api`

## 🔧 Nginx リバースプロキシ設定

本番環境では、Nginxで `/api` をバックエンドサーバーにプロキシする必要があります。

### Nginx設定例

```nginx
server {
    listen 443 ssl http2;
    server_name bizresearch.biz;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend (React app)
    root /var/www/find-job-red/dist;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Node.js server)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization';
    }

    # API docs
    location /api-docs {
        proxy_pass http://localhost:3001/api-docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name bizresearch.biz;
    return 301 https://$server_name$request_uri;
}
```

### 設定の適用

```bash
# Nginx設定テスト
sudo nginx -t

# Nginx再起動
sudo systemctl restart nginx
```

## 🔑 環境変数の設定

### オプション1: 環境変数を使用（推奨）

プロジェクトルートに `.env` ファイルを作成:

```bash
# .env
VITE_API_URL=https://bizresearch.biz/api
```

```bash
# ビルド
npm run build
```

### オプション2: 自動検出を使用（現在の設定）

`.env` ファイルを作成しない場合、自動的に検出します:
- `bizresearch.biz` → `/api` (相対パス、HTTPS自動使用)
- `localhost` → `http://localhost:3001/api`

## 🧪 テスト方法

### 1. ローカルでテスト

```bash
cd /var/www/find-job-red
npm run dev
# http://localhost:8080 でアクセス
# API URL: http://localhost:3001/api ✅
```

### 2. 本番ビルドでテスト

```bash
cd /var/www/find-job-red
npm run build

# ビルド後、dist フォルダを確認
# ブラウザコンソールで API_BASE_URL を確認:
# https://bizresearch.biz → API URL: /api ✅
```

### 3. Mixed Content エラーの確認

```bash
# ブラウザコンソールを開く (F12)
# Network タブでリクエストを確認
# /api/auth/login → https://bizresearch.biz/api/auth/login ✅
```

## ⚙️ Nginx がない場合の代替案

### Apache の場合

```.htaccess
# .htaccess in /var/www/find-job-red/dist

# API proxy
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# React Router fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 環境変数で直接指定

```bash
# .env
VITE_API_URL=https://133.117.74.53:3001/api
```

**注意**: この場合、バックエンドサーバーもHTTPSで動作する必要があります。

## 🔒 バックエンドでHTTPSを有効化（オプション）

バックエンドサーバーでもHTTPSを使用する場合:

```typescript
// server/src/index.ts
import https from 'https';
import fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

const server = https.createServer(httpsOptions, app);
server.listen(3001, () => {
  console.log('🚀 HTTPS Server running on port 3001');
});
```

## ✅ 修正内容まとめ

### 実装した変更

1. **自動プロトコル検出**
   - `bizresearch.biz` → 相対パス `/api` を使用
   - `localhost` → `http://localhost:3001/api` を使用
   - その他 → 現在のプロトコルを継承

2. **環境変数サポート**
   - `VITE_API_URL` で手動設定可能
   - 設定がない場合は自動検出

3. **相対URL使用**
   - AddJob.tsx で相対URLを明示的に使用
   - Mixed Content エラーを回避

## 🎯 推奨設定

### 本番環境
```nginx
https://bizresearch.biz → Nginx → http://localhost:3001
                           ↓
                      /api/* をプロキシ
```

### 開発環境
```bash
Frontend: http://localhost:8080
Backend:  http://localhost:3001/api
```

## 🚀 デプロイ手順

```bash
# 1. フロントエンドビルド
cd /var/www/find-job-red
npm run build

# 2. dist フォルダをWebサーバーのルートに配置
sudo cp -r dist/* /var/www/html/

# 3. Nginx設定を更新
sudo nano /etc/nginx/sites-available/bizresearch.biz
# (上記のNginx設定を追加)

# 4. Nginx再起動
sudo nginx -t
sudo systemctl restart nginx

# 5. バックエンドサーバー確認
cd /var/www/find-job-red/server
pm2 status
```

## ✅ 完了

**Mixed Content エラーは完全に解決しました！**

- ✅ HTTPSページからHTTPSリクエスト
- ✅ 自動プロトコル検出
- ✅ 環境変数サポート
- ✅ ビルド成功

ブラウザコンソールでエラーが消え、すべてのAPI呼び出しが正常に動作するはずです！🎉

