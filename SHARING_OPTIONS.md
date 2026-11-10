# How to Share Your Meetora App

You have several options to share your Meetora app with others. Choose based on your needs:

## Option 1: ngrok (Quick Testing - Recommended for Now) ⚡

**Best for:** Quick demos, testing with a few people, temporary sharing

**Pros:**
- ✅ Setup in 5 minutes
- ✅ No deployment needed
- ✅ Free tier available
- ✅ HTTPS automatically

**Cons:**
- ❌ URL changes each restart (free plan)
- ❌ Sessions expire after 2 hours
- ❌ Your computer must stay on
- ❌ Requires 2 terminals (backend + frontend)

**Setup:**
1. See `NGROK_SETUP.md` for detailed instructions
2. Or run: `./start-ngrok.sh` (automated helper)

**Quick start:**
```bash
# Install ngrok (once)
# Visit https://ngrok.com/download

# Start your servers
cd backend && npm run start:dev     # Terminal 1
cd frontend && npm run dev          # Terminal 2

# Start ngrok tunnels
ngrok http 3001                     # Terminal 3 (backend)
ngrok http 3000                     # Terminal 4 (frontend)

# Copy the HTTPS URLs and update .env files
# Share the frontend URL!
```

---

## Option 2: Same Network (LAN) 🏠

**Best for:** Sharing with people in the same location (home/office)

**Pros:**
- ✅ No external services needed
- ✅ Fast connection
- ✅ No data goes outside your network

**Cons:**
- ❌ Only works on same WiFi/network
- ❌ Requires finding your local IP
- ❌ Your computer must stay on

**Setup:**
```bash
# Find your local IP
hostname -I | awk '{print $1}'
# Example output: 192.168.1.100

# Start your servers
cd backend && npm run start:dev     # Terminal 1
cd frontend && npm run dev          # Terminal 2

# Update frontend/.env.local:
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001/api

# Share this URL with people on your network:
http://192.168.1.100:3000
```

**Note:** Others must be on the same WiFi network

---

## Option 3: Deploy to Cloud (Production) ☁️

**Best for:** Permanent hosting, many users, production use

### Recommended Stack:
- **Frontend:** Vercel (free tier)
- **Backend:** Render (free tier)
- **Database:** Already using Neon (cloud PostgreSQL)

**Pros:**
- ✅ Always online (24/7)
- ✅ Automatic HTTPS
- ✅ Fast, reliable
- ✅ Free tier available
- ✅ No need to keep your computer on

**Cons:**
- ❌ Takes 30-60 minutes to set up
- ❌ Requires GitHub push
- ❌ Need to configure environment variables

**Frontend - Deploy to Vercel:**
```bash
# 1. Push to GitHub (already done)
git push origin main

# 2. Go to https://vercel.com
# 3. Sign in with GitHub
# 4. Import your repository
# 5. Set environment variables:
#    NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
#    NEXT_PUBLIC_LIVEKIT_URL=wss://meetora-ozk0huqn.livekit.cloud
# 6. Deploy!

# Your frontend will be at: https://meetora.vercel.app
```

**Backend - Deploy to Render:**
```bash
# 1. Go to https://render.com
# 2. Sign in with GitHub
# 3. Create new Web Service
# 4. Connect your repository
# 5. Configure:
#    - Build Command: npm install && npm run build
#    - Start Command: npm run start:prod
#    - Environment: Node
# 6. Set environment variables (from backend/.env)
# 7. Deploy!

# Your backend will be at: https://meetora.onrender.com
```

---

## Option 4: Tunneling Alternatives 🌐

If ngrok doesn't work, try these alternatives:

### LocalTunnel
```bash
npm install -g localtunnel

# Backend
lt --port 3001 --subdomain meetora-backend

# Frontend  
lt --port 3000 --subdomain meetora-frontend
```

### Cloudflare Tunnel
```bash
# Install
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

### serveo.net
```bash
# Backend
ssh -R meetora-backend:80:localhost:3001 serveo.net

# Frontend
ssh -R meetora-frontend:80:localhost:3000 serveo.net
```

---

## Comparison Table

| Method | Setup Time | Cost | Reliability | Speed | Persistence |
|--------|-----------|------|-------------|-------|-------------|
| **ngrok** | 5 min | Free* | Medium | Fast | URL changes |
| **LAN** | 2 min | Free | High | Very Fast | Computer must be on |
| **Vercel + Render** | 60 min | Free* | Very High | Fast | Permanent |
| **LocalTunnel** | 5 min | Free | Medium | Medium | URL changes |
| **Cloudflare** | 10 min | Free | High | Fast | Requires account |

*Free tiers have limitations

---

## My Recommendation for Your Use Case

**For immediate testing (today):**
→ Use **ngrok** (see NGROK_SETUP.md)

**For regular use (this week):**
→ Deploy to **Vercel + Render** (30-60 min one-time setup)

**For local testing only:**
→ Use **LAN sharing** (if on same network)

---

## Meeting Links Explained

Once your app is accessible, meeting links will look like:

**Local:**
```
http://localhost:3000/meetings/abc-123-xyz-789
```

**ngrok:**
```
https://def456.ngrok.io/meetings/abc-123-xyz-789
```

**Production:**
```
https://meetora.vercel.app/meetings/abc-123-xyz-789
```

The meeting ID (abc-123-xyz-789) stays the same - only the domain changes!

---

## Need Help?

1. For ngrok setup: Read `NGROK_SETUP.md`
2. For deployment: Ask me to create deployment guides
3. For troubleshooting: Check the console errors

## Quick Test Command

To verify everything is working:
```bash
# Test if backend is running
curl http://localhost:3001/api

# Test if frontend is running
curl http://localhost:3000

# If both return something, you're ready to share!
```
