-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverUrl" TEXT,
    "tags" TEXT[],
    "status" "StoryStatus" NOT NULL DEFAULT 'ONGOING',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "totalChapters" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryCollaborator" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creditLabel" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryRating" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterComment" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryFollow" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_ownerId_idx" ON "Story"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryCollaborator_storyId_userId_key" ON "StoryCollaborator"("storyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_storyId_chapterNumber_key" ON "Chapter"("storyId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StoryRating_storyId_userId_key" ON "StoryRating"("storyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryFollow_storyId_userId_key" ON "StoryFollow"("storyId", "userId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryCollaborator" ADD CONSTRAINT "StoryCollaborator_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryCollaborator" ADD CONSTRAINT "StoryCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRating" ADD CONSTRAINT "StoryRating_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryRating" ADD CONSTRAINT "StoryRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterComment" ADD CONSTRAINT "ChapterComment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterComment" ADD CONSTRAINT "ChapterComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryFollow" ADD CONSTRAINT "StoryFollow_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryFollow" ADD CONSTRAINT "StoryFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
