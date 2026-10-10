# 📧 How to Find Your Verification Email

**TL;DR:** Your emails ARE being sent! They're just logged to the **backend console** instead of your real email.

---

## 🔍 Step-by-Step Guide

### Step 1: Open Your Backend Terminal

The terminal where you ran:
```bash
cd ~/Desktop/liveproject/backend
npm run start:dev
```

**Keep this terminal visible while testing!**

---

### Step 2: Register a New User

Go to http://localhost:3000/auth/sign-up and register.

You'll see: "Registration successful. Please check your email to verify your account."

---

### Step 3: Look at the Backend Terminal

**Scroll up** in the backend terminal. You should see something like this:

```
[Nest] 123456  - 10/10/2026, 2:30:15 PM     LOG [HTTP] POST /api/auth/register 201 1234ms
📧 Email sent (console mode):
To: your-email@example.com
Subject: Verify your Meetora account
HTML: 
        <h1>Welcome to Meetora!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="http://localhost:3000/auth/verify-email?token=abc123xyz789...">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
---
```

---

### Step 4: Copy the Verification Link

From the console output, copy the **entire URL** that looks like:
```
http://localhost:3000/auth/verify-email?token=abc123xyz789defghij...
```

**Important:** Copy the whole link including the token!

---

### Step 5: Open the Link in Your Browser

Paste the link in your browser and press Enter.

You should see:
- ✅ "Email Verified!" message
- A green checkmark
- "Go to Sign In" button

---

### Step 6: Sign In

Now you can sign in with your email and password!

---

## 🎯 Visual Example

**What you'll see in the backend console:**

```bash
$ npm run start:dev

> meetora-backend@1.0.0 start:dev
> nest start --watch

[Nest] 215601  - 10/10/2026, 1:49:09 PM     LOG [NestApplication] Nest application successfully started
🚀 Meetora API running on http://localhost:3001/api

# ... then when you register:

[Nest] 215601  - 10/10/2026, 1:50:17 PM     LOG [HTTP] POST /api/auth/register 201 1432ms
📧 Email sent (console mode):                                    ← LOOK FOR THIS!
To: john@example.com                                             ← Your email
Subject: Verify your Meetora account
HTML: 
        <h1>Welcome to Meetora!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="http://localhost:3000/auth/verify-email?token=07518fa9873d4d38a3b2ffadd63f6f22bbce77cf7940292a594835c533cec76d">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
---                                                               ← End of email
```

**Copy this URL:** ↑ The link in the `<a href="...">` tag

---

## 🐛 Troubleshooting

### "I don't see any email in the console"

**Check:**
1. Is the backend actually running? Look for: `🚀 Meetora API running on http://localhost:3001/api`
2. Did you scroll up in the terminal? The email appears AFTER you register
3. Did the registration succeed? You should see `POST /api/auth/register 201`

---

### "The terminal has too much text"

**Solution:** Clear it and try again:

1. Stop the backend (Ctrl+C)
2. Clear the terminal: `clear`
3. Restart: `npm run start:dev`
4. Register again
5. The email will appear right after registration

---

### "I can't find the token"

**The token is the long string after `token=` in the URL:**

```
http://localhost:3000/auth/verify-email?token=THIS_IS_THE_TOKEN
                                              ^^^^^^^^^^^^^^^^^^^
```

It's usually 64 characters long (letters and numbers).

---

### "I closed the terminal!"

**No problem! You have options:**

**Option 1:** Register a new user (with a different email) and get a new verification email

**Option 2:** Check the database directly:
```bash
cd ~/Desktop/liveproject/backend
npx prisma studio
```
Then go to http://localhost:5555, find your user, and copy the `emailVerificationToken`

**Option 3:** Manually verify in database:
```bash
cd ~/Desktop/liveproject/backend
PGPASSWORD=meetora123 psql -U meetora -d meetora -h localhost -c "UPDATE users SET \"emailVerified\" = true WHERE email = 'your@email.com';"
```

---

## 💡 Pro Tips

### 1. Keep Backend Terminal Visible
When testing registration, have both terminals visible:
- **Left:** Backend (to see emails)
- **Right:** Frontend browser

### 2. Use Split Terminal
Most terminals support split panes:
- **VS Code:** `Ctrl+Shift+5`
- **Terminal:** `Ctrl+Shift+O` (depends on terminal)

### 3. Check All Emails
Other emails also go to console:
- ✉️ Registration: Verification link
- ✉️ Forgot Password: Reset link
- ✉️ Both appear in the same backend terminal

### 4. Save Important Tokens
If you need to test the same verification link multiple times, copy the token and save it temporarily.

---

## 🎓 Why This Design?

**Question:** Why not send real emails during development?

**Answer:**
1. **Safety:** Prevents accidentally spamming real email addresses
2. **Speed:** No need to check email, just copy from console
3. **Simplicity:** No SMTP configuration needed
4. **Testing:** Can see exactly what email would be sent
5. **Free:** No email service account needed

**For production:** You'll configure real SMTP (see `HOW_TO_ENABLE_REAL_EMAILS.md`)

---

## ✅ Quick Test

Try this to see how it works:

```bash
# Terminal 1: Start backend
cd ~/Desktop/liveproject/backend
clear
npm run start:dev

# Wait for: "🚀 Meetora API running on..."

# Then in browser: Register at http://localhost:3000/auth/sign-up

# Watch Terminal 1: Email will appear with verification link!
```

---

## 📚 Related Documentation

- **Setup Real Emails:** `HOW_TO_ENABLE_REAL_EMAILS.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

**Your verification emails ARE working!** They're just in the backend console instead of your inbox. This is the correct development setup! ✅

**Copy the link from the backend console and you're good to go!** 🚀
