# 🚀 Quick Start: Email Setup (5 Minutes)

## ✅ Current Status

**Email functionality is FULLY IMPLEMENTED and ready to use!**

All you need to do is add your email credentials to start sending real emails.

---

## 📝 What You Need To Do NOW

### Step 1: Get Gmail App Password (2 minutes)

1. **Open:** https://myaccount.google.com/apppasswords
2. **Login** with your Gmail account
3. **Enable 2-Step Verification** (if not already enabled)
4. **Create App Password:**
   - App: Mail
   - Device: Other (Custom) → Type "BizResearch"
   - Click **Generate**
5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Update .env File (1 minute)

```bash
# Edit the configuration file
nano /var/www/find-job-red/server/.env
```

**Find these lines and update:**
```env
SMTP_USER=your-email@gmail.com          # ← Your Gmail address
SMTP_PASS=your-app-password-here        # ← Paste the 16-char password
```

**Example:**
```env
SMTP_USER=bizresearch2025@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Restart Server (30 seconds)

```bash
pm2 restart find-job-red-backend
```

### Step 4: Test It! (1 minute)

```bash
curl -X POST https://bizresearch.biz/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nakaya123san@gmail.com"}'
```

**Check your email!** You should receive a beautiful password reset email within 30 seconds.

---

## ✅ That's It!

Once you complete these 4 steps, the system will:
- ✅ Send beautiful HTML emails automatically
- ✅ Include working password reset links
- ✅ Handle all errors gracefully
- ✅ Log all email activity

---

## 🎨 Email Preview

When users request password reset, they'll receive:

```
From: BizResearch <bizresearch2025@gmail.com>
Subject: パスワードリセットのご案内 - BizResearch

┌──────────────────────────────────┐
│     🔐 パスワードリセット          │  Purple gradient
├──────────────────────────────────┤
│ こんにちは、User Name 様          │
│                                  │
│ パスワードリセットのリクエストを  │
│ 受け付けました。                  │
│                                  │
│  ┌────────────────────────┐      │
│  │ パスワードをリセット    │      │  Big button
│  └────────────────────────┘      │
│                                  │
│ ⚠️ 有効期限: 1時間                │
└──────────────────────────────────┘
```

---

## 🔍 Verification

### Check Logs After Test:
```bash
pm2 logs find-job-red-backend --lines 20
```

**Success looks like:**
```
✅ Email transporter created successfully
✅ Password reset email sent to: nakaya123san@gmail.com
```

**Not configured yet:**
```
⚠️  SMTP credentials not configured. Email sending will be simulated.
```

---

## 📧 Alternative: Use Your Own Email

Don't want to use Gmail? Update these instead:

```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your@outlook.com
SMTP_PASS=your-password

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your@yahoo.com
SMTP_PASS=your-app-password

# Custom SMTP
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

---

## 🎉 What Happens Next

Once configured:

1. **User forgets password** → Clicks "パスワードを忘れた場合"
2. **Enters email** → Clicks "リセットリンクを送信"
3. **System generates token** → Saves to database
4. **📧 Email sent automatically** → Beautiful HTML email
5. **User clicks link** → Sets new password
6. **✅ Success!** → Can login with new password

---

## 📞 Need Help?

**Current .env location:**
```
/var/www/find-job-red/server/.env
```

**Full documentation:**
```
/var/www/find-job-red/EMAIL_SETUP_GUIDE.md
```

**Test email manually:**
```bash
# Request password reset
curl -X POST https://bizresearch.biz/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

---

**Ready? Let's configure it now!** 🚀

Start with Step 1: https://myaccount.google.com/apppasswords

