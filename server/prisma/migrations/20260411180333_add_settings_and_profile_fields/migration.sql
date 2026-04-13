-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "LayoutDensity" AS ENUM ('COMPACT', 'COMFORTABLE');

-- AlterTable
ALTER TABLE "PrivacySettings" ADD COLUMN     "profileVisibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT 'Red',
ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "layoutDensity" "LayoutDensity" NOT NULL DEFAULT 'COMFORTABLE',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "searchIndexable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showActivityStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'Midnight',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "typography" TEXT NOT NULL DEFAULT 'Sans-Serif';

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
