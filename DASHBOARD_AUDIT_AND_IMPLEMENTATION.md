# Meetora Dashboard - Complete Audit & Implementation Checklist

## AUDIT SUMMARY (Phase 1 - Completed)

### ✅ What's Already Working

**Backend Infrastructure:**
- ✅ Authentication (JWT + Google OAuth)
- ✅ Meetings module with LiveKit integration
- ✅ Workspaces module with member management
- ✅ Messages module (no real-time)
- ✅ Notifications module
- ✅ Recordings module
- ✅ Search module
- ✅ Prisma ORM with PostgreSQL
- ✅ Email service (SMTP)

**Frontend - Already Functional:**
- ✅ Welcome Section with 3 action buttons (working dialogs)
- ✅ Instant Meeting Dialog - Creates meetings and navigates
- ✅ Schedule Meeting Dialog - Fully functional with validation
- ✅ Create Workspace Dialog - Fully functional
- ✅ AppSidebar - Navigation works, active state works
- ✅ AppHeader - Search with debounce, notifications bell, preferences panel, profile dropdown
- ✅ Profile dropdown - View Profile, Settings, Logout all work
- ✅ Global Search - Connected to backend, results display by type
- ✅ Notification Bell - Shows notifications, mark as read
- ✅ Preferences Panel - Theme switching (light/dark)
- ✅ Quick Access Cards - All have correct hrefs

### ⚠️ Issues Found

**1. Dashboard Components - Displaying Mock/Hardcoded Data:**
- ❌ ProfileSummaryCard - Shows hardcoded "Verified" badge
- ❌ WorkspaceSummaryCard - Shows "Personal Workspace" hardcoded
- ❌ WorkspaceCountCard - Shows "3 Active Workspaces" hardcoded
- ❌ ScheduledMeetingsPanel - Needs real meetings data
- ❌ MeetingRoomPanel - Personal meeting room URL hardcoded
- ❌ DeviceCheckPanel - Not actually checking devices
- ❌ RecentActivityPanel - Mock data

**2. Storage Widget (Sidebar):**
- ❌ Hardcoded "2.4 GB / 5 GB"
- ❌ No backend integration

**3. Personal Meeting Room:**
- ❌ Meeting link shows localhost
- ❌ No copy button functionality
- ❌ Join button may not work
- ❌ Settings button does nothing

**4. Device Check:**
- ❌ Not requesting camera/mic permissions
- ❌ Not detecting actual devices
- ❌ No MediaStream testing

**5. Meetings Display:**
- ❌ No filters working (All/Today/Upcoming)
- ❌ No actual data from backend
- ❌ No pagination
- ❌ No edit/cancel actions

**6. Recent Activity:**
- ❌ Shows fake activity data
- ❌ Not connected to any real backend events

### 🔍 Backend Gaps Identified

**Need to Check/Implement:**
1. Personal meeting room endpoint (permanent room per user)
2. Storage calculation endpoint
3. Recent activity/audit log system
4. LiveKit token generation endpoint
5. Meeting link generation (should be production URL)

---

## IMPLEMENTATION PLAN

### Phase 1: Dashboard Data Components ✅ (Current Phase)

**Tasks:**
1. Read and update ProfileSummaryCard to show real user data
2. Update WorkspaceSummaryCard with real workspace
3. Update WorkspaceCountCard with actual count
4. Update ScheduledMeetingsPanel with real meetings
5. Add filters (All/Today/Upcoming) to meetings
6. Add edit/cancel meeting actions

### Phase 2: Personal Meeting Room

**Tasks:**
1. Create backend endpoint for personal meeting room
2. Generate permanent room identifier per user
3. Update MeetingRoomPanel with real URL
4. Implement copy-to-clipboard functionality
5. Make Join button functional
6. Create settings modal for personal room

### Phase 3: Device Check Panel

**Tasks:**
1. Request camera permissions
2. Request microphone permissions
3. Detect available devices
4. Display actual device status
5. Show permission denied states
6. Clean up MediaStreams on unmount

### Phase 4: Storage Widget

**Tasks:**
1. Create backend endpoint for storage calculation
2. Calculate meeting recordings size
3. Calculate uploaded files size
4. Return used/total storage
5. Update sidebar widget with real data

### Phase 5: Recent Activity

**Tasks:**
1. Decide on activity tracking approach
2. Create backend activity logging
3. Display real recent activities
4. OR remove component if not needed

### Phase 6: Testing & Polish

**Tasks:**
1. Test all dashboard buttons
2. Test navigation
3. Test API integrations
4. Test meeting creation flow
5. Test workspace creation
6. Test device permissions
7. Fix any bugs found
8. Run builds (frontend + backend)

---

## DETAILED IMPLEMENTATION NOTES

### ProfileSummaryCard
**Current:**
- Shows user name and email (✅ real data)
- Shows hardcoded "Verified" badge

**Fix:**
- Use `user.emailVerified` from backend
- Show different states: Verified, Unverified, Pending

### WorkspaceSummaryCard
**Current:**
- Shows "Personal Workspace" hardcoded
- Shows "Free Plan" hardcoded
- Shows "3 members" hardcoded

**Fix:**
- Fetch user's workspaces
- Display first/default workspace
- Show real member count
- Show actual subscription (if implemented)

### WorkspaceCountCard
**Current:**
- Shows "3 Active Workspaces" hardcoded

**Fix:**
- Use workspaces query
- Count actual workspaces where user is member
- Display "No workspaces" if count is 0

### ScheduledMeetingsPanel
**Current:**
- May show mock meetings or empty state

**Fix:**
- Use `useMeetings()` hook (already exists)
- Filter by status: 'scheduled'
- Implement filter buttons (All/Today/Upcoming)
- Add edit meeting dialog
- Add cancel meeting confirmation
- Show loading skeleton
- Show empty state properly

### MeetingRoomPanel
**Current:**
- Shows localhost URL
- No copy functionality
- Join button unclear
- Settings does nothing

**Fix:**
- Backend: Create `/meetings/personal-room` endpoint
- Returns: `{ roomId, permanentUrl }`
- Frontend: Fetch and display real URL
- Implement copy to clipboard
- Join button navigates to `/meetings/personal`
- Settings opens modal with room preferences

### DeviceCheckPanel
**Current:**
- Shows static "Ready" status
- No actual device detection

**Fix:**
- Use navigator.mediaDevices.getUserMedia()
- Request camera permission
- Request microphone permission
- Display actual status
- Show errors (permission denied, no device)
- Clean up tracks on unmount
- Add "Test Devices" button

### Storage Widget (Sidebar)
**Current:**
- Hardcoded "2.4 GB / 5 GB"

**Fix:**
- Backend: Create `/users/storage` endpoint
- Calculate recordings size from DB
- Sum file sizes if file uploads exist
- Return { used: bytes, total: bytes }
- Frontend: Fetch and display
- Update progress bar percentage
- Show loading state

### Recent Activity Panel
**Options:**
1. Implement full activity logging
2. Show recent meetings only
3. Remove component

**Recommended:** Show recent meetings (simpler)
- Query last 5 meetings (any status)
- Display with timestamps
- Click to view meeting details

---

## FILES TO MODIFY

### Frontend Components:
1. `/frontend/src/components/dashboard/ProfileSummaryCard.tsx`
2. `/frontend/src/components/dashboard/WorkspaceSummaryCard.tsx`
3. `/frontend/src/components/dashboard/WorkspaceCountCard.tsx`
4. `/frontend/src/components/dashboard/ScheduledMeetingsPanel.tsx`
5. `/frontend/src/components/dashboard/MeetingRoomPanel.tsx`
6. `/frontend/src/components/dashboard/DeviceCheckPanel.tsx`
7. `/frontend/src/components/dashboard/RecentActivityPanel.tsx`
8. `/frontend/src/components/dashboard/AppSidebar.tsx` (storage widget)

### Backend (New Endpoints):
1. `/backend/src/meetings/meetings.controller.ts` - Add personal room endpoint
2. `/backend/src/users/users.controller.ts` - Add storage endpoint
3. `/backend/src/meetings/meetings.service.ts` - Personal room logic

### No Changes Needed (Already Working):
- WelcomeSection.tsx ✅
- AppHeader.tsx ✅
- AppSidebar.tsx (navigation) ✅
- InstantMeetingDialog.tsx ✅
- ScheduleMeetingDialog.tsx ✅
- CreateWorkspaceDialog.tsx ✅
- Authentication flow ✅
- Routing ✅

---

## SUCCESS CRITERIA

✅ All dashboard data comes from real API calls
✅ No hardcoded user information
✅ No mock data displayed as real
✅ Personal meeting room shows production URL
✅ Copy meeting link works
✅ Device check actually tests devices
✅ Storage shows real usage
✅ All buttons functional
✅ All navigation works
✅ Edit/cancel meetings works
✅ Frontend build succeeds
✅ Backend build succeeds
✅ No console errors

---

## CURRENT STATUS

**Phase:** 1 (Audit Complete)
**Next:** Begin implementing dashboard data components
