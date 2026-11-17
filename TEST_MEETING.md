# 🧪 Quick Test Guide

## Step-by-Step Testing

### Prerequisites
- ✅ LiveKit credentials in `.env` files
- ✅ PostgreSQL database running
- ✅ Dependencies installed (`npm install` in both folders)

### Test 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd /home/sunlit24/Desktop/liveproject/backend
npm run start:dev
```

**Wait for:** `Nest application successfully started`

**Terminal 2 - Frontend:**
```bash
cd /home/sunlit24/Desktop/liveproject/frontend  
npm run dev
```

**Wait for:** `ready - started server on 0.0.0.0:3002`

### Test 2: Access Dashboard

1. Open browser: `http://localhost:3002`
2. Log in with your account
3. You should see the dashboard with "Personal Meeting Room" card

### Test 3: Copy Personal Room Link

1. In the "Personal Meeting Room" card, find your link
2. Click the **"Copy"** button
3. Link format: `http://localhost:3002/meetings/personal-yourname-abc123`

### Test 4: Join Your Own Room (First Window)

1. Click **"Join now"** button
2. Browser will ask for camera/microphone permissions → **Allow**
3. You should see:
   - "Joining personal room..." (briefly)
   - "Connecting to meeting..." (briefly)
   - **Your video appears in the LiveKit video grid!**

### Test 5: Join from Second Window

1. Open a **new incognito/private window** (Ctrl+Shift+N)
2. Go to: `http://localhost:3002`
3. Log in (can be same account or different)
4. **Paste the personal room link** in address bar
5. Allow camera/microphone permissions
6. **You should now see TWO videos:**
   - Your first window
   - Your second window

### Test 6: Test Features

Try these built-in LiveKit features:

**Camera/Mic:**
- Click camera icon → video turns off
- Click mic icon → audio mutes
- Toggle them back on

**Screen Share:**
- Click "Share Screen" button
- Select window/screen to share
- Your screen appears in the meeting

**Chat:**
- Click chat icon
- Type a message
- See it appear in both windows

**Settings:**
- Click settings/gear icon
- Select different camera/mic if you have multiple
- Adjust audio/video settings

### Expected Results

✅ **Personal Room Creation:**
```
Backend log: "Personal room joined: {id: '...', title: 'John's Personal Room'}"
```

✅ **LiveKit Token:**
```
Backend log: (no error when generating token)
Frontend console: "LiveKit token received"
```

✅ **Video Connection:**
```
Frontend console: "Connected to room"
LiveKit UI: Shows your video tile with name
```

✅ **Second User Joins:**
```
First window: New video tile appears
Second window: Both video tiles visible
```

## Common Issues & Fixes

### ❌ "No authentication token found"
**Cause:** Not logged in or token expired

**Fix:**
1. Make sure you're logged in
2. Check browser cookies for `access_token`
3. Try logout → login again

---

### ❌ "Failed to join personal room"
**Cause:** Backend not running or endpoint error

**Fix:**
1. Check backend terminal for errors
2. Verify backend is running on port 3001
3. Check backend logs for error details

---

### ❌ "Failed to get LiveKit token"
**Cause:** LiveKit credentials missing or invalid

**Fix:**
1. Check `backend/.env` has all three LiveKit variables
2. Verify credentials are correct (no extra spaces)
3. Restart backend: Ctrl+C then `npm run start:dev`

---

### ❌ Stuck on "Connecting to meeting..."
**Cause:** LiveKit service unreachable

**Fix:**
1. Check your internet connection
2. Visit https://status.livekit.io (check service status)
3. Test your LiveKit URL at https://test.livekit.io
4. Check firewall isn't blocking WebRTC

---

### ❌ Video shows but no audio
**Cause:** Browser permissions or device selection

**Fix:**
1. Click settings icon in LiveKit controls
2. Check microphone is selected
3. Check system audio isn't muted
4. Try different mic from device selector

---

### ❌ "Permission denied" for camera/mic
**Cause:** Browser blocked permissions

**Fix:**
1. Click lock icon in address bar
2. Allow camera and microphone
3. Refresh page
4. Click "Join now" again

---

## Debugging Commands

### Check if backend endpoint works:
```bash
# Get your access token from browser cookies
# Then test the endpoint:

curl -X POST http://localhost:3001/api/meetings/personal/personal-test-123456/join \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** JSON response with meeting object

### Check database for meetings:
```bash
# Connect to PostgreSQL
psql postgresql://meetora:meetora123@localhost:5432/meetora

# Query meetings
SELECT id, title, "meetingType", status, "createdAt" FROM meetings ORDER BY "createdAt" DESC LIMIT 5;

# Exit
\q
```

### Check frontend build:
```bash
cd frontend
npx tsc --noEmit
```

**Expected:** No errors

### Check backend build:
```bash
cd backend
npx tsc --noEmit --skipLibCheck
```

**Expected:** No errors

---

## Success Criteria

You know it's working when:

✅ Personal room link opens without errors
✅ "Joining personal room..." appears briefly
✅ Your video appears in the LiveKit interface
✅ Second window shows both videos
✅ Chat messages appear in both windows
✅ Mute/unmute works in real-time
✅ Screen sharing displays to other participants

---

## Performance Tips

### For Better Video Quality:
- Use wired internet (Ethernet) instead of WiFi
- Close other apps using camera/mic
- Use Chrome or Edge (best WebRTC support)
- Good lighting for camera

### For Lower Bandwidth:
- LiveKit auto-adjusts quality
- Settings → Video Quality → Lower resolution
- Turn off video, use audio only
- Disable screen sharing when not needed

---

## What to Show in a Demo

1. **Open dashboard** → "See my personal room"
2. **Copy link** → "This is my permanent meeting URL"
3. **Join meeting** → "Video connects instantly"
4. **Open second window** → "Anyone can join with the link"
5. **Show both videos** → "Real-time video/audio streaming"
6. **Test chat** → "Built-in messaging"
7. **Share screen** → "Present slides or code"
8. **Mute/unmute** → "Full control over media"

---

🎬 **Ready to test! Start both servers and try joining your personal room.** 🎬
