export const passwordResetEmailTemplate = (data: {
  name: string;
  resetLink: string;
  expiresIn: string;
}) => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>パスワードリセット</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .message {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s;
    }
    .reset-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4);
    }
    .alternative-link {
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
      color: #666;
    }
    .alternative-link p {
      margin: 5px 0;
    }
    .alternative-link a {
      color: #667eea;
      word-break: break-all;
    }
    .warning {
      margin-top: 30px;
      padding: 15px;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      font-size: 14px;
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 パスワードリセット</h1>
    </div>
    
    <div class="content">
      <p class="greeting">こんにちは、${data.name} 様</p>
      
      <p class="message">
        パスワードリセットのリクエストを受け付けました。<br>
        下のボタンをクリックして、新しいパスワードを設定してください。
      </p>
      
      <div class="button-container">
        <a href="${data.resetLink}" class="reset-button">
          パスワードをリセット
        </a>
      </div>
      
      <div class="alternative-link">
        <p><strong>ボタンが機能しない場合</strong></p>
        <p>以下のリンクをコピーしてブラウザに貼り付けてください：</p>
        <p><a href="${data.resetLink}">${data.resetLink}</a></p>
      </div>
      
      <div class="warning">
        <strong>⚠️ セキュリティに関する重要な情報</strong><br>
        • このリンクの有効期限は<strong>${data.expiresIn}</strong>です。<br>
        • パスワードリセットを依頼していない場合は、このメールを無視してください。<br>
        • このメールを他の人と共有しないでください。
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666;">
        パスワードリセットを依頼していない場合、アカウントのセキュリティが侵害されている可能性があります。<br>
        すぐに<a href="https://bizresearch.biz" style="color: #667eea;">サポートチーム</a>までお問い合わせください。
      </p>
    </div>
    
    <div class="footer">
      <p><strong>BizResearch</strong></p>
      <p>あなたのビジネスリサーチパートナー</p>
      <p>
        <a href="https://bizresearch.biz">ウェブサイト</a> | 
        <a href="https://bizresearch.biz/help">ヘルプ</a> | 
        <a href="https://bizresearch.biz/contact">お問い合わせ</a>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        このメールは自動送信されています。返信しないでください。<br>
        © 2025 BizResearch. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Plain text version for email clients that don't support HTML
export const passwordResetEmailText = (data: {
  name: string;
  resetLink: string;
  expiresIn: string;
}) => {
  return `
こんにちは、${data.name} 様

パスワードリセットのリクエストを受け付けました。
下記のリンクをクリックして、新しいパスワードを設定してください。

パスワードリセットリンク:
${data.resetLink}

セキュリティに関する重要な情報:
• このリンクの有効期限は${data.expiresIn}です。
• パスワードリセットを依頼していない場合は、このメールを無視してください。
• このメールを他の人と共有しないでください。

パスワードリセットを依頼していない場合、アカウントのセキュリティが侵害されている可能性があります。
すぐにサポートチーム (https://bizresearch.biz/contact) までお問い合わせください。

---
BizResearch
https://bizresearch.biz

このメールは自動送信されています。返信しないでください。
© 2025 BizResearch. All rights reserved.
  `.trim();
};

