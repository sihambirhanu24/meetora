# ✅ Gmail Email Setup - Action Required

Your `.env` file has been updated to use **real SMTP email sending**!

---

## 🔧 What You Need to Do NOW

### Step 1: Get Your Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Search for **"App passwords"** or find it under Security settings
4. Click **"App passwords"**
5. Create a new app password:
   - Select app: **Mail**
   - Select device: **Other** (type "Meetora")
6. Click **Generate**
7. **COPY the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

⚠️ **Important:** You need your actual Gmail account password to access this setting!

---

### Step 2: Edit Your .env File

Open the file:
```bash
nano ~/Desktop/liveproject/backend/.env
```

**Find these lines and replace with YOUR information:**

```env
EMAIL_FROM="YOUR_GMAIL_ADDRESS@gmail.com"
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="YOUR_GMAIL_ADDRESS@gmail.com"
SMTP_PASSWORD="YOUR_16_CHAR_APP_PASSWORD"
```

**Replace:**
- `YOUR_GMAIL_ADDRESS@gmail.com` → Your actual Gmail address (appears twice)
- `YOUR_16_CHAR_APP_PASSWORD` → The 16-character password you copied (remove spaces)

**Example:**
```env
EMAIL_FROM="john.doe@gmail.com"
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="john.doe@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"
```

**Save and close:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 3: Restart Your Backend

```bash
# Stop the backend if running (Ctrl+C)

# Start it again
cd ~/Desktop/liveproject/backend
npm run start:dev
```

**Wait for:** `🚀 Meetora API running on http://localhost:3001/api`

---

### Step 4: Test Real Email Sending

**Option A: Use the Frontend**
1. Go to http://localhost:3000/auth/sign-up
2. Register with **your real Gmail address**
3. Check your Gmail inbox for verification email!

**Option B: Use curl**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Real",
    "lastName": "Email",
    "email": "YOUR_GMAIL_ADDRESS@gmail.com",
    "password": "Test123!@#"
  }'
```

---

## ✅ What to Expect

**In your Gmail inbox, you'll receive:**

**Subject:** Verify your Meetora account

**Body:**
```
Welcome to Meetora!

Please verify your email address by clicking the link below:

[Verify Email Button/Link]

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.
```

**Click the link** and your email will be verified!

---

## 🐛 Troubleshooting

### "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:** 
- Make sure you're using the **App Password**, NOT your regular Gmail password
- Remove any spaces from the App Password
- Double-check 2-Step Verification is enabled

---

### "Connection timeout"

**Solution:**
- Check your internet connection
- Make sure port 587 is not blocked by your firewall
- Try using port 465 instead:
  ```env
  SMTP_PORT=465
  ```

---

### "Emails still logging to console"

**Solution:**
- Make sure `EMAIL_PROVIDER="smtp"` (not "console")
- Make sure there are no spaces or quotes around smtp
- Restart the backend
- Check for typos in the .env file

---

### "Password contains spaces"

**Solution:** Remove spaces from the App Password:
```env
# Wrong:
SMTP_PASSWORD="abcd efgh ijkl mnop"

# Correct:
SMTP_PASSWORD="abcdefghijklmnop"
```

---

## 📧 Test Other Email Features

Once registration emails work, test these:

### Forgot Password
1. Go to http://localhost:3000/auth/forgot-password
2. Enter your email
3. Check Gmail for reset link!

### All Emails Now Go to Real Inbox
- ✅ Registration verification
- ✅ Password reset
- ✅ Any future email features

---

## 🔄 Switch Back to Console Mode

If you want to go back to console logging (faster for development):

```env
EMAIL_PROVIDER="console"
```

Then restart the backend.

---

## 📊 Comparison

| Mode | Where Emails Go | Best For |
|------|----------------|----------|
| **console** | Backend terminal | Fast development, testing |
| **smtp** (Gmail) | Real Gmail inbox | Realistic testing, demo |

---

## ✅ Quick Checklist

- [ ] Got Gmail App Password (16 characters)
- [ ] Updated .env with your Gmail address
- [ ] Updated .env with App Password (no spaces)
- [ ] Changed EMAIL_PROVIDER to "smtp"
- [ ] Saved .env file
- [ ] Restarted backend
- [ ] Tested registration
- [ ] Received email in Gmail inbox

---

## 🎯 Current Status

**Before:**
```env
EMAIL_PROVIDER="console"  ← Emails logged to terminal
```

**After (when you update with your credentials):**
```env
EMAIL_PROVIDER="smtp"     ← Real emails sent to Gmail
EMAIL_FROM="you@gmail.com"
SMTP_USER="you@gmail.com"
SMTP_PASSWORD="your-app-password"
```

---

## 🚀 You're Almost There!

1. **Get your Gmail App Password** (5 minutes)
2. **Edit .env file** with your credentials (2 minutes)
3. **Restart backend** (30 seconds)
4. **Test registration** (1 minute)
5. **Check Gmail inbox** → ✅ Email received!

**Need help?** Come back with any error messages you see!

---

**Next Steps:**
1. Get Gmail App Password from Google Account settings
2. Update the .env file with YOUR credentials
3. Restart backend
4. Register and check your Gmail!
