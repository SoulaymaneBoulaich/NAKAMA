-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('CLICK', 'VIEW_DETAILS', 'RATE', 'ADD_TO_LIST');

-- CreateEnum
CREATE TYPE "ProjectorStatus" AS ENUM ('PLAYING', 'PAUSED', 'BUFFERING');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "theme" SET DEFAULT 'Monochrome';

-- CreateTable
CREATE TABLE "GenreAffinity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genreId" INTEGER NOT NULL,
    "genreName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenreAffinity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioAffinity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studioId" INTEGER NOT NULL,
    "studioName" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioAffinity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnimeInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnimeInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimeRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchParty" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "animeTitle" TEXT NOT NULL,
    "episode" INTEGER NOT NULL DEFAULT 1,
    "status" "ProjectorStatus" NOT NULL DEFAULT 'PAUSED',
    "currentTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchPartyMember" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastOnlineAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenreAffinity_userId_genreId_key" ON "GenreAffinity"("userId", "genreId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioAffinity_userId_studioId_key" ON "StudioAffinity"("userId", "studioId");

-- CreateIndex
CREATE INDEX "UserAnimeInteraction_userId_animeId_idx" ON "UserAnimeInteraction"("userId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeRecommendation_userId_animeId_key" ON "AnimeRecommendation"("userId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchParty_code_key" ON "WatchParty"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WatchPartyMember_partyId_userId_key" ON "WatchPartyMember"("partyId", "userId");

-- AddForeignKey
ALTER TABLE "GenreAffinity" ADD CONSTRAINT "GenreAffinity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAffinity" ADD CONSTRAINT "StudioAffinity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnimeInteraction" ADD CONSTRAINT "UserAnimeInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeRecommendation" ADD CONSTRAINT "AnimeRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchPartyMember" ADD CONSTRAINT "WatchPartyMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "WatchParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchPartyMember" ADD CONSTRAINT "WatchPartyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
