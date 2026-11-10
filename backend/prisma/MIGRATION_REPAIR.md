# Prisma Migration Repair Plan for Production (Neon)

## Problem Diagnosis

The `0_init` migration only created the `users` table. All other tables (meetings, meeting_participants, workspaces, etc.) were never created in production.

The second migration `20261030154441_add_meeting_chat_and_reactions` tries to:
```sql
ALTER TABLE "meeting_participants" ADD COLUMN "isHandRaised" ...
```

This fails with error P3018 because `meeting_participants` table doesn't exist.

## Root Cause

The initial migration was incomplete. Likely created manually or from a partial schema state.

## Repair Strategy (SAFE - Preserves Data)

### Option 1: Mark Failed Migration as Rolled Back, Then Create Complete Migration

This is the SAFEST option for production.

**Steps:**

1. **Mark the failed migration as rolled back**:
   ```bash
   npx prisma migrate resolve --rolled-back "20261030154441_add_meeting_chat_and_reactions"
   ```

2. **Create a new migration that includes ALL missing tables**:
   ```bash
   npx prisma migrate dev --name complete_schema_setup --create-only
   ```

3. **Review the generated migration** to ensure it:
   - Creates all missing tables (meetings, meeting_participants, workspaces, etc.)
   - Does NOT try to recreate the users table (already exists)
   - Includes the meeting_messages and meeting_reactions tables
   - Includes the isHandRaised, isMuted, isCameraOff columns on meeting_participants

4. **Apply to production**:
   ```bash
   npx prisma migrate deploy
   ```

### Option 2: Manual SQL Fix (Alternative)

If Option 1 doesn't work, manually apply the missing tables:

1. **Mark failed migration as rolled back** (same as above)

2. **Connect to Neon and run**:
   ```sql
   -- Check what tables exist
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   
   -- If only 'users' exists, run the complete schema SQL
   -- (Generated via: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script)
   ```

3. **Mark migrations as applied**:
   ```bash
   npx prisma migrate resolve --applied "20261030154441_add_meeting_chat_and_reactions"
   ```

## Testing Before Production

**CRITICAL:** Test on a separate Neon database first!

1. Create a test Neon database
2. Apply migrations
3. Verify all tables exist:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
4. Run Prisma validation:
   ```bash
   npx prisma validate
   npx prisma generate
   ```

## Verification Queries

After migration, run these in Neon console:

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected tables:
-- conversation_participants
-- conversations
-- meeting_messages
-- meeting_participants
-- meeting_reactions
-- meetings
-- messages
-- notifications
-- recordings
-- users
-- workspace_invitations
-- workspace_members
-- workspaces

-- Check meeting_participants structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'meeting_participants'
ORDER BY ordinal_position;

-- Should include: isHandRaised, isMuted, isCameraOff columns
```

## Important Notes

1. **DO NOT run `prisma migrate reset`** - This deletes all data
2. **DO NOT run `prisma db push`** - This bypasses migration history
3. **Always backup before migrations** - Neon provides automated backups
4. **Test on separate database first**
5. **The failed migration status is stored in `_prisma_migrations` table**

## Rollback Plan

If something goes wrong:

1. Restore from Neon backup (Neon auto-backups every hour)
2. Or manually recreate only the users table if no data exists yet

## Final State

After successful repair:
- All 13 tables created
- Migration history clean
- Schema matches prisma/schema.prisma
- No failed migrations

## Commands for Production Deployment

```bash
# 1. Set production DATABASE_URL and DIRECT_URL in environment
export DATABASE_URL="postgresql://meetora_owner:xxx@ep-gentle-meadow-beugk51k-pooler.c-9.us-east-2.aws.neon.tech/meetora?sslmode=require&channel_binding=require"
export DIRECT_URL="postgresql://meetora_owner:xxx@ep-gentle-meadow-beugk51k.c-9.us-east-2.aws.neon.tech/meetora?sslmode=require&channel_binding=require"

# 2. Mark failed migration as rolled back
npx prisma migrate resolve --rolled-back "20261030154441_add_meeting_chat_and_reactions"

# 3. Create complete migration
npx prisma migrate dev --name complete_schema_setup --create-only

# 4. Review the generated migration file

# 5. Deploy to production
npx prisma migrate deploy

# 6. Verify
npx prisma validate
npx prisma generate

# 7. Check migration status
npx prisma migrate status
```
