-- CreateEnum
CREATE TYPE "ArenaStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WinnerTeam" AS ENUM ('TEAM_A', 'TEAM_B', 'DRAW');

-- CreateEnum
CREATE TYPE "ArenaTeam" AS ENUM ('TEAM_A', 'TEAM_B', 'JUDGE');

-- CreateTable
CREATE TABLE "Arena" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" "ArenaStatus" NOT NULL DEFAULT 'WAITING',
    "roundCount" INTEGER NOT NULL DEFAULT 3,
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "timerSeconds" INTEGER NOT NULL DEFAULT 120,
    "judgeId" TEXT,
    "winnerTeam" "WinnerTeam",
    "verdictText" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaParticipant" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "team" "ArenaTeam" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateRound" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "judgeQuestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebateRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateArgument" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "team" "WinnerTeam" NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebateArgument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallOfFameVote" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HallOfFameVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Arena_code_key" ON "Arena"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaParticipant_arenaId_userId_key" ON "ArenaParticipant"("arenaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFameVote_arenaId_userId_key" ON "HallOfFameVote"("arenaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "Arena" ADD CONSTRAINT "Arena_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arena" ADD CONSTRAINT "Arena_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaParticipant" ADD CONSTRAINT "ArenaParticipant_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaParticipant" ADD CONSTRAINT "ArenaParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateRound" ADD CONSTRAINT "DebateRound_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateArgument" ADD CONSTRAINT "DebateArgument_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "DebateRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateArgument" ADD CONSTRAINT "DebateArgument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallOfFameVote" ADD CONSTRAINT "HallOfFameVote_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallOfFameVote" ADD CONSTRAINT "HallOfFameVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
