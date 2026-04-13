/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ANIME_ADD', 'ANIME_UPDATE', 'ANIME_RATE', 'FOLLOW', 'POST_CREATE');

-- CreateEnum
CREATE TYPE "PlaylistVisibility" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actorId" TEXT;

-- AlterTable
ALTER TABLE "PrivacySettings" ADD COLUMN     "showPlaylists" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entityId" TEXT,
    "entityTitle" TEXT,
    "entityImage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "visibility" "PlaylistVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistEntry" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "animeTitle" TEXT NOT NULL,
    "animeCover" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistCollaborator" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistFollow" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistComment" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistEntry_playlistId_animeId_key" ON "PlaylistEntry"("playlistId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistCollaborator_playlistId_userId_key" ON "PlaylistCollaborator"("playlistId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistFollow_playlistId_userId_key" ON "PlaylistFollow"("playlistId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistEntry" ADD CONSTRAINT "PlaylistEntry_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistEntry" ADD CONSTRAINT "PlaylistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistCollaborator" ADD CONSTRAINT "PlaylistCollaborator_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistCollaborator" ADD CONSTRAINT "PlaylistCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistFollow" ADD CONSTRAINT "PlaylistFollow_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistFollow" ADD CONSTRAINT "PlaylistFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistComment" ADD CONSTRAINT "PlaylistComment_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistComment" ADD CONSTRAINT "PlaylistComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
