# 🔐 Google OAuth "Sign in with Google" Setup

I've implemented **"Sign in with Google"** OAuth authentication! Users can now sign in with their Google account.

---

## 🎯 What You Need to Do (Setup Google OAuth)

### Step 1: Create Google Cloud Project (10 minutes)

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create New Project:**
   - Click "Select a project" → "New Project"
   - Name: "Meetora"
   - Click "Create"

3. **Enable Google+ API:**
   - In the search bar, type "Google+ API"
   - Click "Enable"

### Step 2: Create OAuth Credentials

1. **Go to Credentials:**
   - Left menu → "APIs & Services" → "Credentials"

2. **Configure OAuth Consent Screen:**
   - Click "OAuth consent screen"
   - Choose "External"
   - Fill in:
     - App name: "Meetora"
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Click "Add or Remove Scopes"
     - Select: `userinfo.email`, `userinfo.profile`
   - Click "Save and Continue"
   - Test users: Add your Gmail address
   - Click "Save and Continue"

3. **Create OAuth Client ID:**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Meetora Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3001/api/auth/google/callback
     ```
   - Click "Create"

4. **COPY Your Credentials:**
   - You'll see a popup with:
     - **Client ID** (looks like: `xxx.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-xxx`)
   - **Keep these safe!**

---

### Step 3: Update .env File

```bash
nano ~/Desktop/liveproject/backend/.env
```

**Add your Google OAuth credentials:**

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"
```

**Save:** Ctrl+O, Enter, Ctrl+X

---

### Step 4: Restart Backend

```bash
cd ~/Desktop/liveproject/backend
npm run start:dev
```

---

## ✅ Testing "Sign in with Google"

### Backend is Ready!

The backend now has these new endpoints:
- `GET /api/auth/google` - Initiates Google OAuth
- `GET /api/auth/google/callback` - Handles Google callback

### Test with Browser:

1. Open: http://localhost:3001/api/auth/google
2. You'll be redirected to Google sign-in
3. Choose your Google account
4. Grant permissions
5. You'll be redirected back to dashboard!

---

## 🎨 Now Add Frontend Button

I'll create the "Sign in with Google" button for the frontend:

### The button will:
- Show "Continue with Google" option
- Redirect to `/api/auth/google`
- Handle the OAuth flow automatically
- Log user in after Google authentication

---

## 🔄 How It Works

1. User clicks "Sign in with Google" button
2. Redirected to `/api/auth/google`
3. Redirected to Google OAuth page
4. User grants permission
5. Google redirects to `/api/auth/google/callback`
6. Backend:
   - Receives Google user data
   - Creates user if new (auto-verified email!)
   - Generates JWT token
   - Sets HTTP-only cookie
   - Redirects to dashboard
7. User is logged in!

---

## ✨ Features Implemented

- ✅ OAuth flow with Google
- ✅ Auto-create user on first Google login
- ✅ Email auto-verified for Google users
- ✅ Profile image from Google
- ✅ Secure JWT token generation
- ✅ Same authentication as regular login
- ✅ Works with existing dashboard

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch"
**Solution:** Make sure redirect URI in Google Console exactly matches:
```
http://localhost:3001/api/auth/google/callback
```

### "Access blocked: This app's request is invalid"
**Solution:** 
- Make sure OAuth consent screen is configured
- Add your email to "Test users"
- Enable Google+ API

### "Invalid client"
**Solution:**
- Check `GOOGLE_CLIENT_ID` in .env
- Check `GOOGLE_CLIENT_SECRET` in .env
- No extra spaces or quotes

---

## 📊 Database Changes

Google users are stored in the same `users` table:
- `email`: From Google account
- `firstName`: From Google profile
- `lastName`: From Google profile
- `profileImage`: Google profile picture
- `emailVerified`: Automatically `true`
- `passwordHash`: Random (Google users don't need password)

---

## 🔒 Security

- ✅ OAuth 2.0 standard
- ✅ Google handles authentication
- ✅ Secure token exchange
- ✅ HTTP-only cookies
- ✅ Same security as regular login

---

## 🎯 Current Status

**Backend:**
- ✅ Google OAuth strategy implemented
- ✅ OAuth routes configured
- ✅ User creation/login logic ready
- ✅ Dependencies installed
- ⏳ Waiting for Google credentials

**Frontend:**
- ⏳ Need to add "Sign in with Google" button
- ⏳ Need to style the button

---

## 🚀 Next Steps

1. **You:** Get Google OAuth credentials (Step 1-2 above)
2. **You:** Add credentials to .env file
3. **You:** Restart backend
4. **Me:** Add frontend button (if you want)
5. **You:** Test it!

---

**The backend is ready!** Just need Google OAuth credentials from Google Cloud Console.

Want me to add the frontend button too?
