-- AlterTable
ALTER TABLE "meeting_participants" ADD COLUMN "isHandRaised" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isMuted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isCameraOff" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "meeting_messages" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_reactions" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_messages_meetingId_idx" ON "meeting_messages"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_messages_userId_idx" ON "meeting_messages"("userId");

-- CreateIndex
CREATE INDEX "meeting_messages_createdAt_idx" ON "meeting_messages"("createdAt");

-- CreateIndex
CREATE INDEX "meeting_reactions_meetingId_idx" ON "meeting_reactions"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_reactions_userId_idx" ON "meeting_reactions"("userId");

-- CreateIndex
CREATE INDEX "meeting_reactions_createdAt_idx" ON "meeting_reactions"("createdAt");

-- AddForeignKey
ALTER TABLE "meeting_messages" ADD CONSTRAINT "meeting_messages_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_messages" ADD CONSTRAINT "meeting_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_reactions" ADD CONSTRAINT "meeting_reactions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_reactions" ADD CONSTRAINT "meeting_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
