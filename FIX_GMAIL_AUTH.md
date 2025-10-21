# 🔧 Fix Gmail Authentication Issue

## ❌ Current Problem

Gmail is rejecting the credentials with error:
```
Username and Password not accepted
Error Code: 535-5.7.8 BadCredentials
```

## ✅ Solution Steps

### Step 1: Verify 2-Factor Authentication is ENABLED

**Check:** https://myaccount.google.com/security

Look for **"2-Step Verification"** - it **MUST** be **ON** (blue)

If it's OFF:
1. Click on "2-Step Verification"
2. Follow the setup wizard
3. Verify with phone/authenticator app
4. **Important:** Must be fully enabled before continuing

---

### Step 2: Generate FRESH App Password

**Go to:** https://myaccount.google.com/apppasswords

1. **Delete any old "BizResearch" app password**
2. **Create new one:**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: **BizResearch Email**
   - Click **Generate**
3. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)
   - ⚠️ You'll only see it once!
   - Copy it somewhere safe

---

### Step 3: Update the Server Configuration

**Option A: Use the update script** (Recommended)
```bash
cd /var/www/find-job-red
./UPDATE_SMTP_PASSWORD.sh "paste-your-new-app-password-here"
```

**Example:**
```bash
./UPDATE_SMTP_PASSWORD.sh "abcd efgh ijkl mnop"
# or without spaces:
./UPDATE_SMTP_PASSWORD.sh "abcdefghijklmnop"
```

**Option B: Manual edit**
```bash
nano /var/www/find-job-red/server/.env
```

Find and update:
```env
SMTP_PASS=your-new-app-password  # Paste here (spaces ok)
```

Save and restart:
```bash
pm2 restart find-job-red-backend --update-env
```

---

### Step 4: Test Email Sending

```bash
curl -X POST https://bizresearch.biz/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nakaya123san@gmail.com"}'
```

**Then check logs:**
```bash
pm2 logs find-job-red-backend --lines 20
```

**Look for:**
```
✅ Password reset email sent to: nakaya123san@gmail.com
```

**Check your email inbox!**

---

## 🔍 Common Issues

### Issue 1: "2-Step Verification not enabled"

**Solution:**
- Must enable 2FA FIRST
- Then generate App Password
- Cannot generate App Password without 2FA

### Issue 2: "App Password option not available"

**Possible Reasons:**
- 2-Step Verification not enabled
- Using Google Workspace (different process)
- Account too new

**Solution for Google Workspace:**
- Admin must enable "Less secure apps"
- Or use OAuth2 instead

### Issue 3: "Invalid login" even with new password

**Try:**
1. Revoke the app password
2. Generate a completely new one
3. Copy it EXACTLY as shown
4. Update .env immediately
5. Restart server

### Issue 4: Still not working?

**Alternative: Use Different Email**

Try Outlook instead of Gmail:
```bash
nano /var/www/find-job-red/server/.env
```

Update to:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-password
```

---

## 🧪 Test SMTP Connection Directly

```bash
# Test if credentials work
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'nakaya123san@gmail.com',
    pass: 'YOUR_NEW_APP_PASSWORD_HERE'
  }
});
transport.verify().then(() => {
  console.log('✅ SMTP connection successful!');
}).catch((err) => {
  console.error('❌ SMTP connection failed:', err.message);
});
"
```

---

## 📧 Fallback System (Working NOW)

**Good news:** Even without email, the system works!

When email fails, the reset link is logged to console:
```bash
pm2 logs find-job-red-backend | grep "Fallback - Password reset link"
```

You can copy this link and use it manually until email is configured.

---

## ✅ Quick Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] Old app passwords deleted
- [ ] NEW app password generated at https://myaccount.google.com/apppasswords
- [ ] Copied the 16-character code exactly
- [ ] Updated .env file with new password
- [ ] Restarted server: `pm2 restart find-job-red-backend --update-env`
- [ ] Tested: `curl -X POST https://bizresearch.biz/api/auth/forgot-password ...`
- [ ] Checked logs: `pm2 logs find-job-red-backend`
- [ ] Checked email inbox

---

## 🎯 Current Status

**System Status:**
- ✅ Email code implemented
- ✅ Transporter created
- ✅ Template beautiful
- ✅ Server running
- ❌ Gmail authentication failing
- ✅ Fallback system working (console logs)

**What to do:**
1. Generate FRESH Gmail App Password
2. Run: `./UPDATE_SMTP_PASSWORD.sh "your-new-password"`
3. Test again
4. Check inbox!

---

**Need the fresh app password?**  
Go here NOW: https://myaccount.google.com/apppasswords

