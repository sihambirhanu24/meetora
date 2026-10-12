# 🔧 QUICK FIX: Error 401: invalid_client

**The Problem:** Your `.env` file still has placeholder values for Google OAuth credentials.

**The Solution:** Get real credentials from Google (5-10 minutes)

---

## 🚀 Step-by-Step Fix (Follow Exactly)

### Step 1: Go to Google Cloud Console

**Open this link:** https://console.cloud.google.com/

**Sign in** with your Google account (sihambirhanu4@gmail.com)

---

### Step 2: Create a New Project

1. Click the project dropdown at the top (says "Select a project")
2. Click **"NEW PROJECT"** button (top right)
3. Project name: **Meetora**
4. Click **"CREATE"**
5. Wait 10-20 seconds for project to be created
6. **Select your new "Meetora" project** from the dropdown

---

### Step 3: Enable Google+ API

1. In the search bar at top, type: **"Google+ API"**
2. Click on **"Google+ API"** in the results
3. Click **"ENABLE"** button
4. Wait for it to enable (takes a few seconds)

---

### Step 4: Configure OAuth Consent Screen

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Or: Left menu → **"APIs & Services"** → **"OAuth consent screen"**

3. **Choose User Type:**
   - Select **"External"**
   - Click **"CREATE"**

4. **App Information (Page 1):**
   - App name: **Meetora**
   - User support email: **sihambirhanu4@gmail.com**
   - Scroll down to "Developer contact"
   - Developer contact: **sihambirhanu4@gmail.com**
   - Click **"SAVE AND CONTINUE"**

5. **Scopes (Page 2):**
   - Click **"ADD OR REMOVE SCOPES"**
   - Find and check these TWO scopes:
     ✓ `.../auth/userinfo.email`
     ✓ `.../auth/userinfo.profile`
   - Click **"UPDATE"** (bottom)
   - Click **"SAVE AND CONTINUE"**

6. **Test Users (Page 3):**
   - Click **"+ ADD USERS"**
   - Enter: **sihambirhanu4@gmail.com**
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

7. **Summary (Page 4):**
   - Review and click **"BACK TO DASHBOARD"**

---

### Step 5: Create OAuth Client ID (MOST IMPORTANT!)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Or: Left menu → **"APIs & Services"** → **"Credentials"**

3. Click **"+ CREATE CREDENTIALS"** (top)
4. Choose **"OAuth client ID"**

5. **Configure OAuth Client:**
   - Application type: **Web application**
   - Name: **Meetora Web Client**

6. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3000`
   - Click **"+ ADD URI"** again
   - Add: `http://localhost:3001`

7. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:3001/api/auth/google/callback`
   - ⚠️ **MUST BE EXACT!** Copy-paste this: `http://localhost:3001/api/auth/google/callback`

8. Click **"CREATE"**

---

### Step 6: Copy Your Credentials

A popup will appear with your credentials!

**YOU WILL SEE:**
```
Client ID: 123456789-abc123xyz.apps.googleusercontent.com
Client Secret: GOCSPX-abc123xyz...
```

**COPY BOTH!** (Click the copy icons or select and copy)

---

### Step 7: Update Your .env File

**Open your terminal:**

```bash
nano ~/Desktop/liveproject/backend/.env
```

**Find these lines:**
```env
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
```

**Replace with YOUR actual values:**
```env
GOOGLE_CLIENT_ID="123456789-abc123xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123xyz..."
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 8: Restart Backend

```bash
cd ~/Desktop/liveproject/backend
npm run start:dev
```

**Wait for:** `🚀 Meetora API running on http://localhost:3001/api`

---

### Step 9: Test It!

1. Go to: http://localhost:3000/auth/sign-in
2. Click **"Sign in with Google"**
3. Choose your Google account
4. Grant permissions
5. ✅ **You'll be logged in and redirected to dashboard!**

---

## 🐛 Common Issues

### "Error 401: invalid_client" (what you have now)
**Cause:** `.env` still has placeholder values or wrong credentials
**Fix:** Make sure you copied BOTH Client ID and Secret correctly (no extra spaces)

### "Error 400: redirect_uri_mismatch"
**Cause:** Callback URL doesn't match
**Fix:** Make sure redirect URI in Google Console is EXACTLY:
```
http://localhost:3001/api/auth/google/callback
```

### "Access blocked: This app's request is invalid"
**Cause:** OAuth consent screen not configured
**Fix:** Complete Step 4 above (add your email to test users)

### "Error 403: access_denied"
**Cause:** User didn't grant permissions or not in test users list
**Fix:** Add your email to test users in OAuth consent screen

---

## ✅ Verification Checklist

Before testing, make sure:

- [x] Created Google Cloud project named "Meetora"
- [x] Enabled Google+ API
- [x] Configured OAuth consent screen (External)
- [x] Added scopes: userinfo.email and userinfo.profile
- [x] Added yourself as test user
- [x] Created OAuth Client ID (Web application)
- [x] Added redirect URI: `http://localhost:3001/api/auth/google/callback`
- [x] Copied Client ID to .env
- [x] Copied Client Secret to .env
- [x] Saved .env file
- [x] Restarted backend

---

## 📸 What Your .env Should Look Like

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="123456789-abc123xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456ghi789jkl"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

**Note:** Your actual values will be different!

---

## 🎯 Current Status

**Your .env file currently has:**
```env
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"          ← PLACEHOLDER! Must replace
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"  ← PLACEHOLDER! Must replace
```

**That's why you see "Error 401: invalid_client"**

---

## 💡 Quick Summary

1. Go to https://console.cloud.google.com/
2. Create project "Meetora"
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth credentials
6. Copy Client ID and Secret
7. Paste into .env file
8. Restart backend
9. Test!

**Time needed:** 5-10 minutes

---

**Need help?** Take screenshots of any errors and show me!
