-- CreateEnum
CREATE TYPE "DebateMode" AS ENUM ('TURN_BASED', 'SIMULTANEOUS');

-- CreateEnum
CREATE TYPE "DebateCardType" AS ENUM ('FREEZE', 'MULTIPLIER', 'SHIELD', 'STEAL', 'SILENCE', 'OVERRULE');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('AVAILABLE', 'ACTIVE', 'USED');

-- AlterTable
ALTER TABLE "DebateArena" ADD COLUMN     "mode" "DebateMode" NOT NULL DEFAULT 'TURN_BASED',
ADD COLUMN     "teamAPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teamBPoints" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DebateArgument" ADD COLUMN     "isMediaBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DebateParticipant" ADD COLUMN     "isCaptain" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DebateCard" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DebateCardType" NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'AVAILABLE',
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "DebateCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DebateCard" ADD CONSTRAINT "DebateCard_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "DebateArena"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateCard" ADD CONSTRAINT "DebateCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
