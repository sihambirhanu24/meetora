# Module 2 Proposal: Workspaces & Teams

## Overview

Module 2 would build on the authentication foundation to add multi-tenancy through workspaces, allowing users to create and manage teams for collaborative communication.

## Key Features

### 1. Workspace Management
- Create workspace
- Edit workspace details
- Workspace settings
- Workspace members management
- Workspace roles (Owner, Admin, Member)

### 2. Team Structure
- Users can belong to multiple workspaces
- Invite members via email
- Accept/decline workspace invitations
- Role-based permissions
- Member list and management

### 3. User Profile
- Update profile information
- Upload profile picture
- Set job title and bio
- Workspace preferences

### 4. Invitations System
- Send workspace invitations
- Email notifications for invites
- Accept/decline flow
- Pending invitations view
- Set password from invite (for new users)

## Database Schema

### Workspace Model
```prisma
model Workspace {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  logo        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  members     WorkspaceMember[]
  invitations WorkspaceInvitation[]
}
```

### WorkspaceMember Model
```prisma
model WorkspaceMember {
  id          String   @id @default(uuid())
  workspaceId String
  userId      String
  role        String   // owner, admin, member
  joinedAt    DateTime @default(now())
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  
  @@unique([workspaceId, userId])
}
```

### WorkspaceInvitation Model
```prisma
model WorkspaceInvitation {
  id          String    @id @default(uuid())
  workspaceId String
  email       String
  role        String
  token       String    @unique
  expiresAt   DateTime
  status      String    // pending, accepted, declined, expired
  invitedBy   String
  createdAt   DateTime  @default(now())
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
}
```

## API Endpoints

### Workspace Endpoints
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - List user's workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `PATCH /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace (owner only)

### Member Endpoints
- `GET /api/workspaces/:id/members` - List workspace members
- `POST /api/workspaces/:id/members/invite` - Invite member
- `DELETE /api/workspaces/:id/members/:userId` - Remove member
- `PATCH /api/workspaces/:id/members/:userId/role` - Update member role

### Invitation Endpoints
- `GET /api/invitations` - List user's pending invitations
- `POST /api/invitations/:token/accept` - Accept invitation
- `POST /api/invitations/:token/decline` - Decline invitation
- `GET /api/invitations/:token` - Get invitation details

### Profile Endpoints
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/profile/avatar` - Upload avatar
- `GET /api/users/:id` - Get user profile (workspace members only)

## Frontend Pages

### Workspace Pages
- `/workspaces` - Workspace selector/list
- `/workspaces/new` - Create workspace
- `/workspaces/:id` - Workspace dashboard
- `/workspaces/:id/settings` - Workspace settings
- `/workspaces/:id/members` - Members management

### Profile Pages
- `/profile` - Edit profile
- `/profile/settings` - User settings

### Invitation Pages
- `/invitations` - Pending invitations list
- `/invitations/:token` - Accept invitation flow

## Security & Permissions

### Role Permissions
**Owner:**
- All permissions
- Delete workspace
- Transfer ownership

**Admin:**
- Invite/remove members
- Edit workspace settings
- Manage member roles (except owner)

**Member:**
- View workspace
- View members
- Use workspace features

## Module 2 Objectives

By the end of Module 2, users should be able to:
1. ✅ Create a workspace
2. ✅ Invite team members
3. ✅ Accept/decline invitations
4. ✅ Manage workspace members
5. ✅ Update their profile
6. ✅ Switch between workspaces
7. ✅ Manage workspace settings
8. ✅ Set appropriate roles and permissions

## Out of Scope (Future Modules)
- Real-time meetings (Module 3)
- Chat messaging (Module 4)
- Calendar integration (Module 5)
- File sharing (Module 6)
- Video recording (Module 7)

---

Would you like to proceed with this Module 2 plan, or would you prefer a different focus?
