# Making Your Meetora App Publicly Accessible with ngrok

## What is ngrok?
ngrok creates a secure tunnel from a public URL to your localhost, allowing others to access your local development server.

## Quick Setup Steps

### 1. Install ngrok

**Option A - Download manually:**
```bash
# Visit https://ngrok.com/download and download for Linux
# Extract and move to /usr/local/bin
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

**Option B - Package manager:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

### 2. Create ngrok Account and Setup

1. Go to https://dashboard.ngrok.com/signup
2. Sign up (free account works fine)
3. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
4. Run: `ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE`

### 3. Start Your Servers

**Terminal 1 - Backend:**
```bash
cd /home/sunlit24/Desktop/liveproject/backend
npm run start:dev
# Should start on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd /home/sunlit24/Desktop/liveproject/frontend
npm run dev
# Should start on http://localhost:3000
```

### 4. Create ngrok Tunnels

**Terminal 3 - Backend Tunnel:**
```bash
ngrok http 3001
```
You'll see output like:
```
Session Status    online
Account           Your Name (Plan: Free)
Forwarding        https://abc123xyz.ngrok.io -> http://localhost:3001
```
**Copy the HTTPS forwarding URL** (e.g., `https://abc123xyz.ngrok.io`)

**Terminal 4 - Frontend Tunnel:**
```bash
ngrok http 3000
```
You'll see:
```
Forwarding        https://def456ghi.ngrok.io -> http://localhost:3000
```
**Copy this HTTPS URL** (e.g., `https://def456ghi.ngrok.io`)

### 5. Update Environment Variables

**Frontend - `/frontend/.env.local`:**
```env
# Replace YOUR-BACKEND-NGROK-URL with your actual ngrok backend URL
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-NGROK-URL.ngrok.io/api

NEXT_PUBLIC_LIVEKIT_URL=wss://meetora-ozk0huqn.livekit.cloud
```

**Backend - `/backend/.env`:**
```env
# Update FRONTEND_URL with your ngrok frontend URL
FRONTEND_URL="https://YOUR-FRONTEND-NGROK-URL.ngrok.io"

# If using Google OAuth, update the callback URL:
GOOGLE_CALLBACK_URL="https://YOUR-BACKEND-NGROK-URL.ngrok.io/api/auth/google/callback"
```

### 6. Restart Servers

After updating environment variables, restart both servers:
- Stop them (Ctrl+C)
- Start again with `npm run start:dev` and `npm run dev`

### 7. Share Your Link!

Now you can share the **frontend ngrok URL** with anyone:
```
https://def456ghi.ngrok.io
```

They can:
- Sign up / Sign in
- Access all features
- Join meetings you create
- Send messages
- Everything works as if it were deployed!

## Important Notes

### Free Plan Limitations:
- URLs change every time you restart ngrok (unless you pay for static URLs)
- Sessions expire after 2 hours (need to restart)
- Limited to 1 process per tunnel (need 2 terminals for frontend + backend)

### For Meeting Links:
When you create a meeting, the link will be:
```
https://YOUR-FRONTEND-NGROK-URL.ngrok.io/meetings/MEETING_ID
```

Example:
```
https://def456ghi.ngrok.io/meetings/abc-123-xyz
```

### Security:
- ngrok URLs are public but hard to guess
- Your app's authentication still applies
- Don't share sensitive data over free ngrok
- For production, deploy to Vercel/Render instead

## Troubleshooting

**"Connection refused":**
- Make sure your backend/frontend servers are actually running
- Check the port numbers match (3001 for backend, 3000 for frontend)

**"Invalid host header":**
- Restart Next.js frontend after updating .env.local
- Next.js needs to recognize the ngrok domain

**"CORS errors":**
- Make sure FRONTEND_URL in backend .env matches your frontend ngrok URL
- Check that cookies are working (may need sameSite: 'none' for cross-domain)

**"Tunnel expired":**
- Free ngrok sessions expire after 2 hours
- Just restart ngrok to get a new URL
- Update .env files with new URL

## Alternative: Use ngrok Config File

For easier management, create `ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  backend:
    proto: http
    addr: 3001
  frontend:
    proto: http
    addr: 3000
```

Then start both tunnels at once:
```bash
ngrok start --all
```

## When You're Done

Just stop the ngrok processes (Ctrl+C) and your localhost is private again.

For permanent deployment, see DEPLOYMENT_GUIDE.md (when ready).
