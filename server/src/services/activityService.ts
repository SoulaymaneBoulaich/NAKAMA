import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

/**
 * Service for tracking user activity, screen time, and behavior analysis
 */

export const startSession = async (userId: string, initialPage: string) => {
  return await prisma.userActivitySession.create({
    data: {
      userId,
      startTime: new Date(),
      pageViews: [{ page: initialPage, timestamp: new Date() }] as Prisma.JsonArray,
      activeTime: 0
    }
  });
};

export const updateHeartbeat = async (sessionId: string, activeSeconds: number) => {
  const session = await prisma.userActivitySession.findUnique({
    where: { id: sessionId }
  });

  if (!session) return null;

  const now = new Date();
  const duration = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);

  return await prisma.userActivitySession.update({
    where: { id: sessionId },
    data: {
      endTime: now,
      duration,
      activeTime: { increment: activeSeconds }
    }
  });
};

export const logPageView = async (sessionId: string, url: string) => {
  const session = await prisma.userActivitySession.findUnique({
    where: { id: sessionId }
  });

  if (!session) return null;

  const pageViews = (session.pageViews as Prisma.JsonArray) || [];
  pageViews.push({ page: url, timestamp: new Date() });

  return await prisma.userActivitySession.update({
    where: { id: sessionId },
    data: { pageViews }
  });
};

/**
 * Analyze user behavior and discussions
 * severity: 0-10. If >= 8, trigger auto-lock
 */
export const analyzeBehavior = async (userId: string, content: string, type: 'DISCOURSE' | 'BEHAVIOR') => {
  // Simplified analysis logic (could integrate with AI in production)
  let severity = 0;
  
  const badWords = ['toxic', 'spam', 'hack', 'exploit', 'insult'];
  const hasBadWord = badWords.some(word => content.toLowerCase().includes(word));
  
  if (hasBadWord) severity = 5;
  if (content.length > 5000) severity += 2; // Potential spam

  const analysis = await prisma.discussionAnalysis.create({
    data: {
      userId,
      content: `Behavioral snippet: ${content.substring(0, 100)}...`,
      severity,
      type
    }
  });

  // Auto-locking mechanism
  if (severity >= 8) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspensionReason: `Automated Behavior Filter: High severity ${type} detected.`
      }
    });
  }

  return analysis;
};

export const getUserActivitySummary = async (userId: string) => {
  const sessions = await prisma.userActivitySession.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    take: 10
  });

  const totalScreenTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalActiveTime = sessions.reduce((acc, s) => acc + s.activeTime, 0);

  const analyses = await prisma.discussionAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    totalScreenTime,
    totalActiveTime,
    sessionsCount: sessions.length,
    recentSessions: sessions,
    recentAnalyses: analyses
  };
};
