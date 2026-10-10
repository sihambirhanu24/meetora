# How to Enable Real Email Sending

Currently, emails are logged to the backend console (development mode). To send real emails, follow these steps:

---

## Option 1: Gmail SMTP (Easiest for Testing)

### Step 1: Enable App Password in Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App Passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character password

### Step 2: Update .env File

```bash
cd ~/Desktop/liveproject/backend
nano .env  # or use your favorite editor
```

**Change these lines:**
```env
# Email configuration
EMAIL_FROM="your-email@gmail.com"
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
```

### Step 3: Restart Backend

```bash
# Stop the backend (Ctrl+C)
npm run start:dev
```

**Done!** Emails will now be sent to real email addresses.

---

## Option 2: SendGrid (Professional, Free Tier Available)

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day free)
3. Verify your email
4. Create an API key

### Step 2: Update .env File

```env
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

### Step 3: Restart Backend

---

## Option 3: Mailtrap (Testing Only)

**Perfect for testing without sending real emails!**

### Step 1: Create Mailtrap Account

1. Go to https://mailtrap.io/
2. Sign up for free account
3. Go to **Email Testing** → **Inboxes**
4. Copy SMTP credentials

### Step 2: Update .env File

```env
EMAIL_FROM="noreply@meetora.com"
EMAIL_PROVIDER="smtp"
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your-mailtrap-username"
SMTP_PASSWORD="your-mailtrap-password"
```

### Step 3: Restart Backend

**Emails will be captured in your Mailtrap inbox** (not sent to real addresses, but you can see them in a real email interface)

---

## Option 4: Other SMTP Providers

### AWS SES
- Very cheap for production
- Requires AWS account
- Configuration: https://docs.aws.amazon.com/ses/

### Mailgun
- Free tier: 5,000 emails/month
- Configuration: https://www.mailgun.com/

### Postmark
- Free trial, then paid
- Excellent deliverability
- Configuration: https://postmarkapp.com/

---

## Testing Your Email Configuration

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Email",
    "lastName": "Test",
    "email": "your-real-email@gmail.com",
    "password": "Test123!@#"
  }'
```

### Step 2: Check Your Email

- **Console mode:** Check backend terminal
- **Real SMTP:** Check your email inbox
- **Mailtrap:** Check Mailtrap dashboard

---

## Troubleshooting

### "Error: Invalid login"
- Check SMTP username and password
- For Gmail, make sure you're using **App Password**, not your regular password
- Verify 2-Step Verification is enabled

### "Connection timeout"
- Check SMTP_HOST and SMTP_PORT
- Try port 465 (SSL) instead of 587 (TLS)
- Check firewall settings

### "Emails go to spam"
- Use a real domain for EMAIL_FROM
- Set up SPF and DKIM records (for production)
- Use a reputable SMTP provider

### "Still logging to console"
- Make sure `EMAIL_PROVIDER="smtp"` (not "console")
- Restart the backend after changing .env
- Check for typos in variable names

---

## Recommended Setup for Development

**For learning/testing:**
```env
EMAIL_PROVIDER="console"  # Keep it simple, look at backend logs
```

**For realistic testing:**
```env
EMAIL_PROVIDER="smtp"
# Use Mailtrap - captures emails in a fake inbox
```

**For production:**
```env
EMAIL_PROVIDER="smtp"
# Use SendGrid, AWS SES, or Mailgun
```

---

## Current Status

**Right now you have:**
- ✅ Email service working
- ✅ Verification emails sent
- ✅ Password reset emails sent
- 📧 Emails logged to console (development mode)

**This is perfect for development!** No real emails are sent, but you can test the full flow by copying links from the backend console.

---

## Quick Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Console** | Simple, no config needed | Must copy links manually | Development |
| **Mailtrap** | Real email interface, safe | Not real delivery | Testing |
| **Gmail** | Easy setup, free | Limited (500/day), needs app password | Testing |
| **SendGrid** | Professional, free tier | Requires account | Production |
| **AWS SES** | Cheap, scalable | Complex setup | Production |

---

## What We Recommend

**Keep console mode for now!** It's working perfectly for development.

**When you're ready for production:**
1. Use **Mailtrap** for testing (free)
2. Use **SendGrid** or **AWS SES** for production (reliable, scalable)

---

**Need Help?**
- Read the backend logs carefully
- Check `.env` for typos
- Restart backend after changes
- Test with curl first before using frontend

**Your emails ARE working** - they're just in development mode! 📧✅
