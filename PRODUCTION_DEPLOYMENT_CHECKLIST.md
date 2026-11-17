# 🚀 Production Deployment Checklist

## Your Deployment URLs
Based on your previous setup:
- **Frontend:** `https://meetora-livid.vercel.app`
- **Backend:** `https://meetora-87vs.onrender.com` (or your Render URL)

## ✅ Required Environment Variables

### 1. Frontend (Vercel) Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:

```bash
# Backend API URL (your Render backend)
NEXT_PUBLIC_API_URL=https://meetora-87vs.onrender.com/api

# LiveKit URL (from your .env)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
```

**Important:** After adding, click **"Redeploy"** to apply changes!

---

### 2. Backend (Render) Environment Variables

Go to: **Render Dashboard → Your Service → Environment**

Verify/Add these:

```bash
# Database (Neon production database)
DATABASE_URL=postgresql://meetora_owner:npg_wWLF8UKHg2zi@ep-gentle-meadow-beugk51k-pooler.c-9.us-east-2.aws.neon.tech/meetora?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://meetora_owner:npg_wWLF8UKHg2zi@ep-gentle-meadow-beugk51k.c-9.us-east-2.aws.neon.tech/meetora?sslmode=require&channel_binding=require

# JWT
JWT_SECRET=meetora-secret-key-change-this-in-production-use-strong-random-value
JWT_EXPIRATION=7d

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://meetora-livid.vercel.app

# Email (Gmail SMTP)
EMAIL_FROM=your-email@gmail.com
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Google OAuth (IMPORTANT: Use production callback)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://meetora-87vs.onrender.com/api/auth/google/callback

# LiveKit (CRITICAL for meetings!)
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
```

**After adding:** Render will auto-redeploy.

---

## 🔧 Google OAuth Configuration

### Update Authorized Redirect URIs

Go to: **Google Cloud Console → APIs & Services → Credentials → Your OAuth Client**

Make sure these are added:

```
Development:
http://localhost:3001/api/auth/google/callback

Production:
https://meetora-87vs.onrender.com/api/auth/google/callback
```

**Also add Authorized JavaScript Origins:**
```
Development:
http://localhost:3002

Production:
https://meetora-livid.vercel.app
```

---

## 🧪 Testing Production Deployment

### Test 1: Backend Health Check

Open in browser:
```
https://meetora-87vs.onrender.com/api/health
```

**Expected:** `{"status":"ok"}` or similar

---

### Test 2: Frontend Loads

Open in browser:
```
https://meetora-livid.vercel.app
```

**Expected:** Sign-in page loads

---

### Test 3: Google OAuth Login

1. Click "Continue with Google"
2. Select your Google account
3. Should redirect back and log you in

**If fails:** Check Google OAuth callback URL is correct

---

### Test 4: Dashboard Access

After login:
```
https://meetora-livid.vercel.app/dashboard
```

**Expected:** Dashboard loads with personal room card

---

### Test 5: Personal Room Link Generation

1. In dashboard, find "Personal Meeting Room" card
2. Your link should look like:
   ```
   https://meetora-livid.vercel.app/meetings/personal-yourname-abc123
   ```
3. **NOT:** `http://localhost:3002/meetings/...`

**If shows localhost:** Check `NEXT_PUBLIC_API_URL` in Vercel is set correctly

---

### Test 6: Share Link & Join

**Step 1:** Copy your personal room link from dashboard

**Step 2:** Open in incognito window (or send to friend)

**Step 3:** Log in (or have friend log in)

**Step 4:** Should see "Joining personal room..."

**Step 5:** Should connect to LiveKit video room

**Expected:** 
- ✅ No "meeting not found" error
- ✅ Video/audio connects
- ✅ Both participants see each other

---

## 🐛 Troubleshooting Production Issues

### Issue: "Meeting not found" in production

**Causes:**
1. Backend not deployed with new code
2. Database not migrated
3. Environment variables missing

**Fix:**
```bash
# 1. Make sure code is pushed to GitHub
git add .
git commit -m "Add personal room support"
git push origin main

# 2. Render should auto-deploy from GitHub
# Check Render dashboard for deployment status

# 3. Run database migration on Render
# In Render dashboard → Shell → Run:
npx prisma db push --accept-data-loss
```

---

### Issue: "Failed to get LiveKit token"

**Causes:**
1. LiveKit env variables not set in Render
2. LiveKit credentials incorrect
3. Backend not restarted after adding env vars

**Fix:**
1. Go to Render → Environment
2. Verify all 3 LiveKit variables are present
3. Click "Manual Deploy" → "Deploy latest commit"

---

### Issue: CORS errors in browser console

**Causes:**
- Frontend making requests to wrong backend URL
- Backend not configured for frontend origin

**Fix:**

Check `frontend/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://meetora-87vs.onrender.com/api
```

Check backend CORS configuration allows your frontend domain.

---

### Issue: Personal room link shows localhost

**Causes:**
- Using `window.location.origin` which reflects current page
- Should use production URL

**This is actually CORRECT!** ✅

The frontend generates:
```javascript
const meetingUrl = `${window.location.origin}/meetings/personal-${roomId}`;
```

So:
- On localhost → `http://localhost:3002/meetings/...`
- On Vercel → `https://meetora-livid.vercel.app/meetings/...`

This is the RIGHT behavior! 🎉

---

### Issue: Can't join from mobile

**Causes:**
1. Mobile browser blocking WebRTC
2. Insecure context (needs HTTPS)
3. Camera/mic permissions denied

**Fix:**
1. Use Chrome or Safari on mobile (not Firefox)
2. Ensure using HTTPS (Vercel provides this)
3. Allow permissions when prompted
4. Test on desktop first to confirm it's not server issue

---

## 📊 Verify Deployment Status

### Check Frontend Build

Go to: **Vercel Dashboard → Deployments**

Look for:
- ✅ "Production" badge
- ✅ Green checkmark
- ✅ Recent timestamp

---

### Check Backend Status

Go to: **Render Dashboard → Your Service**

Look for:
- ✅ "Live" status (green dot)
- ✅ Recent deployment timestamp
- ✅ No error logs

Click "Logs" and verify no errors like:
- ❌ "LIVEKIT_API_KEY is not defined"
- ❌ "DATABASE_URL is not defined"
- ❌ Connection errors

---

## 🎯 Production Readiness Checklist

Before sharing links publicly:

- [ ] Backend deployed to Render (Live status)
- [ ] Frontend deployed to Vercel (Production)
- [ ] Database migrated (`npx prisma db push`)
- [ ] All environment variables set (both platforms)
- [ ] Google OAuth configured for production URLs
- [ ] LiveKit credentials verified in production
- [ ] Test login works on production
- [ ] Test personal room creation on production
- [ ] Test joining same room from 2 different browsers
- [ ] Test video/audio works between participants
- [ ] Test on mobile device

---

## 🚀 How to Share Links

### For Testing (Private)
Share personal room link to team members:
```
https://meetora-livid.vercel.app/meetings/personal-john-abc123
```

### For Public Use
1. Create a scheduled meeting (not personal room)
2. Add participants via email
3. They receive invitation with join link

### Best Practices
- ✅ Personal rooms for recurring 1-on-1s
- ✅ Scheduled meetings for team calls
- ✅ Share links only over secure channels
- ✅ Test link yourself before sharing

---

## 📝 Quick Deploy Commands

### Push Latest Changes
```bash
cd /home/sunlit24/Desktop/liveproject

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Fix personal room links and integrate LiveKit"

# Push to GitHub (triggers auto-deploy)
git push origin main
```

### Watch Deployments
- **Vercel:** Auto-deploys from GitHub (1-2 minutes)
- **Render:** Auto-deploys from GitHub (3-5 minutes)

Check their dashboards for build logs.

---

## ✅ Success Indicators

You know it's working when:

1. ✅ Personal room link uses production URL (not localhost)
2. ✅ Clicking link from different device/browser works
3. ✅ Both participants connect to video room
4. ✅ Video/audio streams between participants
5. ✅ Chat messages appear for both users
6. ✅ Meeting controls work (mute, camera, screen share)

---

## 🎉 You're Production Ready!

Your app should now work perfectly for sharing meeting links. The personal room links will:

1. Generate with your production URL
2. Work when shared to anyone (no "meeting not found")
3. Create instant meeting on first join
4. Connect to LiveKit for real video/audio
5. Support multiple participants in same room

**Test it now:**
1. Open: `https://meetora-livid.vercel.app/dashboard`
2. Copy your personal room link
3. Send to someone or open in incognito
4. Both should connect! 🎥

---

Need help? Check logs:
- **Vercel:** Dashboard → Your Project → Logs
- **Render:** Dashboard → Your Service → Logs
- **Browser:** F12 → Console tab
