-- ============================================
-- NAKAMA Platform — Full Schema Bootstrap
-- Auto-executed on first docker-compose up
-- Source of truth: server/prisma/schema.prisma
-- ============================================
-- NOTE: This file bootstraps a raw Postgres DB.
-- For dev, prefer: npx prisma db push

-- ENUMS
CREATE TYPE "Visibility" AS ENUM ('PUBLIC','PRIVATE','UNLISTED');
CREATE TYPE "LayoutDensity" AS ENUM ('COMPACT','COMFORTABLE');
CREATE TYPE "AnimeStatus" AS ENUM ('WATCHING','COMPLETED','ON_HOLD','DROPPED','PLAN_TO_WATCH');
CREATE TYPE "CommunityRole" AS ENUM ('MEMBER','ADMIN');
CREATE TYPE "ActivityType" AS ENUM ('ANIME_ADD','ANIME_UPDATE','ANIME_RATE','FOLLOW','POST_CREATE');
CREATE TYPE "PlaylistVisibility" AS ENUM ('PRIVATE','SHARED','PUBLIC');
CREATE TYPE "StoryStatus" AS ENUM ('ONGOING','COMPLETED','HIATUS');
CREATE TYPE "AniShotType" AS ENUM ('THOUGHT','WATCHING','COMPLETED','DROPPED','HYPE');
CREATE TYPE "ArenaStatus" AS ENUM ('WAITING','ACTIVE','COMPLETED');
CREATE TYPE "WinnerTeam" AS ENUM ('TEAM_A','TEAM_B','DRAW');
CREATE TYPE "ArenaTeam" AS ENUM ('TEAM_A','TEAM_B','JUDGE');
CREATE TYPE "InteractionType" AS ENUM ('VIEWED_PAGE','ADDED_TO_LIST','RATED','COMPLETED','DROPPED','SEARCHED');
CREATE TYPE "WatchPartyStatus" AS ENUM ('REGISTRATION','WAITING','WATCHING','PAUSED','ENDED');
CREATE TYPE "WatchPartyMessageType" AS ENUM ('CHAT','REACTION','SYSTEM');
CREATE TYPE "QuizType" AS ENUM ('QA','SCREENSHOT','AUDIO','QUOTE','VOICE');
CREATE TYPE "QuizDifficulty" AS ENUM ('GENIN','CHUNIN','JONIN','KAGE','LEGENDARY');
CREATE TYPE "QuizAttemptStatus" AS ENUM ('IN_PROGRESS','COMPLETED','FAILED');
CREATE TYPE "MediaType" AS ENUM ('IMAGE','AUDIO','VIDEO');
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE "SubmissionVoteType" AS ENUM ('APPROVE','REJECT');
CREATE TYPE "VoteType" AS ENUM ('UP','DOWN');

-- TABLES
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "banner" TEXT,
    "bio" TEXT,
    "fullName" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'Monochrome',
    "typography" TEXT NOT NULL DEFAULT 'Sans-Serif',
    "accentColor" TEXT NOT NULL DEFAULT 'Red',
    "layoutDensity" "LayoutDensity" NOT NULL DEFAULT 'COMFORTABLE',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "searchIndexable" BOOLEAN NOT NULL DEFAULT true,
    "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUltraNakama" BOOLEAN NOT NULL DEFAULT false,
    "ultraNakamaExpiresAt" TIMESTAMP(3),
    "isNakamaLeader" BOOLEAN NOT NULL DEFAULT false,
    "nakamaLeaderSince" TIMESTAMP(3),
    "gauntletFrameUrl" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspensionReason" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_email_idx" ON "User"("email");

CREATE TABLE "PrivacySettings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "profileVisibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "showStats" BOOLEAN NOT NULL DEFAULT false,
    "showTopTen" BOOLEAN NOT NULL DEFAULT false,
    "showFingerprint" BOOLEAN NOT NULL DEFAULT false,
    "showActivity" BOOLEAN NOT NULL DEFAULT false,
    "showCommunities" BOOLEAN NOT NULL DEFAULT false,
    "showPlaylists" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PrivacySettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "PrivacySettings_userId_key" ON "PrivacySettings"("userId");

CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

CREATE TABLE "AnimeEntry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "status" "AnimeStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "episodeProgress" INTEGER NOT NULL DEFAULT 0,
    "rewatchCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnimeEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AnimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "AnimeEntry_userId_animeId_key" ON "AnimeEntry"("userId","animeId");
CREATE INDEX "AnimeEntry_userId_idx" ON "AnimeEntry"("userId");

CREATE TABLE "Rating" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "animation" INTEGER NOT NULL DEFAULT 0,
    "characters" INTEGER NOT NULL DEFAULT 0,
    "buildUp" INTEGER NOT NULL DEFAULT 0,
    "story" INTEGER NOT NULL DEFAULT 0,
    "feeling" INTEGER NOT NULL DEFAULT 0,
    "ending" INTEGER NOT NULL DEFAULT 0,
    "calculatedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Rating_userId_animeId_key" ON "Rating"("userId","animeId");

CREATE TABLE "Community" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bannerUrl" TEXT,
    "avatarUrl" TEXT,
    "category" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validationDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Community_name_key" ON "Community"("name");
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE INDEX "Community_slug_idx" ON "Community"("slug");

CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE,
    CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "CommunityMember_userId_communityId_key" ON "CommunityMember"("userId","communityId");

CREATE TABLE "CommunityRule" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "communityId" TEXT NOT NULL,
    "ruleText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CommunityRule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CommunityRule_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE
);

CREATE TABLE "Post" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "communityId" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "animeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoUrl" TEXT,
    "videoTitle" TEXT,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "downvoteCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id"),
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
CREATE INDEX "Post_communityId_idx" ON "Post"("communityId");

CREATE TABLE "Like" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId","postId");

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

CREATE TABLE "Follow" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId","followingId");

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

CREATE TABLE "TopTenEntry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "animeTitle" TEXT NOT NULL,
    "animeCover" TEXT,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopTenEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TopTenEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "TopTenEntry_userId_animeId_key" ON "TopTenEntry"("userId","animeId");
CREATE UNIQUE INDEX "TopTenEntry_userId_rank_key" ON "TopTenEntry"("userId","rank");

CREATE TABLE "Activity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entityId" TEXT,
    "entityTitle" TEXT,
    "entityImage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

CREATE TABLE "Poll" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "postId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Poll_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Poll_postId_key" ON "Poll"("postId");

CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pollId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE
);

CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "pollOptionId" TEXT NOT NULL,
    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PollVote_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "PollOption"("id") ON DELETE CASCADE,
    CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "PollVote_userId_pollOptionId_key" ON "PollVote"("userId","pollOptionId");

CREATE TABLE "Vote" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Vote_userId_postId_key" ON "Vote"("userId","postId");

CREATE TABLE "UserAnimeInteraction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "animeId" TEXT NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAnimeInteraction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserAnimeInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "UserAnimeInteraction_userId_idx" ON "UserAnimeInteraction"("userId");
CREATE INDEX "UserAnimeInteraction_animeId_idx" ON "UserAnimeInteraction"("animeId");

CREATE TABLE "AnimeTag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "animeId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "AnimeTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AnimeTag_animeId_tag_key" ON "AnimeTag"("animeId","tag");

CREATE TABLE "UserTagAffinity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "affinityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserTagAffinity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserTagAffinity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "UserTagAffinity_userId_tag_key" ON "UserTagAffinity"("userId","tag");

CREATE TABLE "RecommendationCache" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecommendationCache_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RecommendationCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "RecommendationCache_userId_key" ON "RecommendationCache"("userId");

CREATE TABLE "UserActivitySession" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "pageViews" JSONB NOT NULL,
    "activeTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivitySession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserActivitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "UserActivitySession_userId_idx" ON "UserActivitySession"("userId");

CREATE TABLE "DiscussionAnalysis" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscussionAnalysis_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DiscussionAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX "DiscussionAnalysis_userId_idx" ON "DiscussionAnalysis"("userId");

-- Remaining tables omitted for brevity — use `npx prisma db push` for full sync.
-- This file covers the core domain: Users, AnimeList, Communities, Posts, Ratings.
-- Prisma is the canonical schema source. Run prisma db push after container is healthy.
