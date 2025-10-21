# 📧 Email Setup Guide - Password Reset Emails

## ✅ Implementation Complete!

The email sending functionality has been successfully implemented using **Nodemailer**. The system is now ready to send beautiful password reset emails.

---

## 🎯 Current Status

### ✅ What's Been Done:

1. **Nodemailer Installed** - Email sending library
2. **Email Module Created** - `server/src/config/email.ts`
3. **Beautiful Email Template** - HTML and text versions
4. **Forgot Password Updated** - Now sends real emails
5. **Environment Variables Added** - SMTP configuration ready
6. **Server Restarted** - Changes deployed

### ⚠️ What You Need to Do:

**Configure SMTP Credentials** - Add your email account details to `.env` file

---

## 🔧 Step-by-Step SMTP Configuration

### Option 1: Gmail (Recommended for Testing) ⭐

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **BizResearch App**
5. Click **Generate**
6. **Copy the 16-character password** (you won't see it again!)

#### Step 3: Update .env File
```bash
# Edit the .env file
nano /var/www/find-job-red/server/.env
```

**Update these lines:**
```env
# Replace with your actual Gmail credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-character app password (spaces optional)
EMAIL_FROM_NAME=BizResearch
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=bizresearch2025@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM_NAME=BizResearch
```

#### Step 4: Restart Server
```bash
pm2 restart find-job-red-backend
```

---

### Option 2: Other Email Providers

#### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
EMAIL_FROM_NAME=BizResearch
```

#### **Yahoo Mail**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password  # Generate at Yahoo Account Security
EMAIL_FROM_NAME=BizResearch
```

#### **Custom SMTP Server**
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
EMAIL_FROM_NAME=BizResearch
```

---

### Option 3: Professional Email Services

#### **SendGrid** (Recommended for Production)
```bash
# Install SendGrid
npm install @sendgrid/mail

# Update .env
SENDGRID_API_KEY=SG.xxxxx...
```

#### **AWS SES** (Scalable & Cheap)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SES_EMAIL_FROM=noreply@bizresearch.biz
```

---

## 🧪 Testing Email Functionality

### Test 1: Request Password Reset

```bash
curl -X POST https://bizresearch.biz/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

**Expected Result:**
- ✅ Success response
- 📧 Email received within 30 seconds
- 🔗 Email contains clickable reset link

### Test 2: Check Server Logs

```bash
pm2 logs find-job-red-backend --lines 30
```

**Look for:**
```
✅ Email transporter created successfully
✅ Password reset email sent to: user@example.com
```

**Or (if not configured):**
```
⚠️  SMTP credentials not configured. Email sending will be simulated.
📧 Fallback - Password reset link for user@example.com: https://...
```

### Test 3: Verify Email Received

Check your inbox for an email with:
- **Subject:** パスワードリセットのご案内 - BizResearch
- **From:** BizResearch
- **Beautiful HTML design** with gradient header
- **Clickable button** to reset password
- **Alternative link** if button doesn't work
- **Security warnings** about expiration

---

## 📧 Email Features

### Beautiful HTML Template
```
┌─────────────────────────────────┐
│  🔐 パスワードリセット            │  ← Gradient header
├─────────────────────────────────┤
│  こんにちは、User Name 様        │
│                                 │
│  パスワードリセットの...         │
│                                 │
│  ┌─────────────────────┐        │
│  │ パスワードをリセット │        │  ← Big button
│  └─────────────────────┘        │
│                                 │
│  Alternative link:              │
│  https://bizresearch.biz/...    │
│                                 │
│  ⚠️ セキュリティ情報             │
│  • 有効期限: 1時間              │
│                                 │
└─────────────────────────────────┘
```

### Features:
✅ **Responsive Design** - Works on all devices  
✅ **Gradient Colors** - Professional purple gradient  
✅ **Security Warnings** - Expiration and safety info  
✅ **Fallback Link** - Plain text link if button fails  
✅ **Text Version** - For email clients without HTML  
✅ **Branded Footer** - BizResearch branding  

---

## 🔍 Troubleshooting

### Issue: "SMTP credentials not configured"

**Solution:** Update `.env` file with valid SMTP credentials

```bash
# Edit .env
nano /var/www/find-job-red/server/.env

# Restart server
pm2 restart find-job-red-backend
```

### Issue: "Authentication failed"

**Common Causes:**
1. Wrong email/password
2. App password not generated (Gmail)
3. 2FA not enabled (Gmail)
4. Less secure apps blocked

**Solution for Gmail:**
- Make sure you're using **App Password**, not regular password
- Enable 2-Step Verification first
- Generate new App Password

### Issue: Email not received

**Check:**
1. **Spam folder** - Gmail might filter it
2. **Server logs** - Look for errors
```bash
pm2 logs find-job-red-backend --err
```
3. **SMTP credentials** - Verify they're correct
4. **Firewall** - Port 587 must be open
5. **Email limits** - Gmail has daily send limits

### Issue: "Connection timeout"

**Possible Causes:**
- Firewall blocking port 587
- Wrong SMTP host
- Network issues

**Solution:**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# If it fails, check firewall
sudo firewall-cmd --list-all
```

---

## 📊 Monitoring & Logs

### Check Email Sending Status

```bash
# Real-time logs
pm2 logs find-job-red-backend

# Filter for email-related logs
pm2 logs find-job-red-backend | grep -E "Email|SMTP|✅|❌"
```

### Log Messages to Look For

**Success:**
```
✅ Email transporter created successfully
✅ Password reset email sent to: user@example.com
```

**Warnings:**
```
⚠️  SMTP credentials not configured. Email sending will be simulated.
📧 Fallback - Password reset link for user@example.com: https://...
```

**Errors:**
```
❌ Failed to create email transporter: Error: Invalid login
❌ Failed to send password reset email: Error: Connection timeout
```

---

## 🔒 Security Best Practices

### 1. Use App Passwords
❌ **Don't:** Use your actual email password  
✅ **Do:** Generate app-specific passwords

### 2. Environment Variables
❌ **Don't:** Hardcode credentials in code  
✅ **Do:** Use `.env` file (not committed to git)

### 3. Rate Limiting
✅ Already implemented via global rate limiter  
✅ Prevents email spam abuse

### 4. Email Validation
✅ Server-side email format validation  
✅ Prevents sending to invalid addresses

### 5. Token Security
✅ JWT tokens expire in 1 hour  
✅ Tokens deleted after use  
✅ Database validation required

---

## 📈 Production Recommendations

### For High Volume (1000+ emails/day)

**Use Professional Service:**
1. **SendGrid** - $15/month for 40K emails
2. **AWS SES** - $0.10 per 1,000 emails
3. **Mailgun** - Good deliverability
4. **Postmark** - Transactional email specialist

### Benefits:
- ✅ Better deliverability (won't go to spam)
- ✅ Higher send limits
- ✅ Email analytics
- ✅ Dedicated IP address
- ✅ Bounce/complaint handling
- ✅ Email templates management

---

## 🎨 Customizing Email Template

### Edit Template File
```bash
nano /var/www/find-job-red/server/src/templates/passwordResetEmail.ts
```

### Customizable Elements:
- Colors and gradients
- Logo and branding
- Text content
- Button styling
- Footer links
- Company information

### After Changes:
```bash
# Rebuild
cd /var/www/find-job-red/server
npm run build

# Restart
pm2 restart find-job-red-backend
```

---

## ✅ Quick Start Checklist

- [ ] Get Gmail account or SMTP credentials
- [ ] Enable 2-Factor Authentication (Gmail)
- [ ] Generate App Password (Gmail)
- [ ] Update `/var/www/find-job-red/server/.env` with credentials
- [ ] Restart PM2: `pm2 restart find-job-red-backend`
- [ ] Test: Request password reset
- [ ] Verify: Check email inbox
- [ ] Success: Email received with reset link!

---

## 📞 Need Help?

### Current Configuration File
```bash
cat /var/www/find-job-red/server/.env | grep SMTP
```

### Test SMTP Connection
```bash
# Node.js test script
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'YOUR_EMAIL', pass: 'YOUR_APP_PASSWORD' }
});
transporter.verify((err, success) => {
  if (err) console.error('❌ Error:', err);
  else console.log('✅ Server is ready to send emails');
});
"
```

---

## 🎉 Summary

**Email functionality is READY!** 🚀

**What works now:**
- ✅ Beautiful HTML email templates
- ✅ Password reset emails
- ✅ Fallback to console logging (if SMTP not configured)
- ✅ Production-ready code
- ✅ Error handling
- ✅ Security measures

**Next step:**
1. **Add your SMTP credentials** to `.env` file
2. **Restart the server**
3. **Test password reset**
4. **Enjoy automated emails!** 📧

---

**File Locations:**
- Email Config: `/var/www/find-job-red/server/src/config/email.ts`
- Email Template: `/var/www/find-job-red/server/src/templates/passwordResetEmail.ts`
- Environment File: `/var/www/find-job-red/server/.env`
- Auth Routes: `/var/www/find-job-red/server/src/routes/auth.ts`

**Date Implemented:** October 14, 2025  
**Status:** ✅ **READY FOR CONFIGURATION**

