-- CreateEnum
CREATE TYPE "AniShotType" AS ENUM ('THOUGHT', 'WATCHING', 'COMPLETED', 'DROPPED', 'HYPE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "videoTitle" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "AniShot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "animeId" TEXT,
    "animeTitle" TEXT,
    "animeCover" TEXT,
    "type" "AniShotType" NOT NULL DEFAULT 'THOUGHT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AniShot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AniShotView" (
    "id" TEXT NOT NULL,
    "aniShotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AniShotView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AniShot_userId_idx" ON "AniShot"("userId");

-- CreateIndex
CREATE INDEX "AniShot_expiresAt_idx" ON "AniShot"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AniShotView_aniShotId_userId_key" ON "AniShotView"("aniShotId", "userId");

-- AddForeignKey
ALTER TABLE "AniShot" ADD CONSTRAINT "AniShot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AniShotView" ADD CONSTRAINT "AniShotView_aniShotId_fkey" FOREIGN KEY ("aniShotId") REFERENCES "AniShot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AniShotView" ADD CONSTRAINT "AniShotView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
