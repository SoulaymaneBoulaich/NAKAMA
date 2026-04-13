import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

// Removed local prisma = new PrismaClient()

const checkVisibility = async (
  ownerId: string,
  requesterId: string | undefined,
  setting: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'
): Promise<boolean> => {
  if (ownerId === requesterId) return true;
  if (setting === 'PUBLIC') return true;
  if (setting === 'PRIVATE') return false;

  // FOLLOWERS case
  if (!requesterId) return false;
  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: requesterId,
        followingId: ownerId,
      },
    },
  });
  return !!isFollowing;
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: {
        privacySettings: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = requesterId
      ? !!(await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: requesterId,
              followingId: user.id,
            },
          },
        }))
      : false;

    // Filter sensitive info
    const profile = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      banner: user.banner,
      bio: user.bio,
      fullName: user.fullName,
      location: user.location,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      followerCount: (user as any)._count.followers,
      followingCount: (user as any)._count.following,
      isFollowing,
    };

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: { privacySettings: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const canSee = await checkVisibility(user.id, requesterId, (user as any).privacySettings?.showStats || 'PUBLIC');
    if (!canSee) return res.status(403).json({ message: 'Private section' });

    const [totalTracked, episodesResult, communitiesJoined, postsCount] = await Promise.all([
      prisma.animeEntry.count({ where: { userId: user.id } }),
      prisma.animeEntry.aggregate({
        where: { userId: user.id },
        _sum: { episodeProgress: true }
      }),
      prisma.communityMember.count({ where: { userId: user.id } }),
      prisma.post.count({ where: { userId: user.id } })
    ]);

    res.status(200).json({
      totalTracked,
      episodesWatched: episodesResult._sum.episodeProgress || 0,
      communitiesJoined,
      postsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const getUserFingerprint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: { privacySettings: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const canSee = await checkVisibility(user.id, requesterId, (user as any).privacySettings?.showFingerprint || 'PUBLIC');
    if (!canSee) return res.status(403).json({ message: 'Private section' });

    const ratings = await prisma.rating.findMany({
      where: { userId: user.id }
    });

    if (ratings.length === 0) {
      return res.status(200).json([]);
    }

    const categories = ['animation', 'characters', 'story', 'feeling', 'buildUp', 'ending'];
    const averages = categories.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      average: Number((ratings.reduce((acc, r) => acc + (r as any)[cat], 0) / ratings.length).toFixed(1))
    }));

    res.status(200).json(averages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fingerprint' });
  }
};

export const getUserTopTen = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: { privacySettings: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const canSee = await checkVisibility(user.id, requesterId, (user as any).privacySettings?.showTopTen || 'PUBLIC');
    if (!canSee) return res.status(403).json({ message: 'Private section' });

    const topTen = await prisma.topTenEntry.findMany({
      where: { userId: user.id },
      orderBy: { rank: 'asc' }
    });

    res.status(200).json(topTen);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top ten' });
  }
};

export const getUserActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: { privacySettings: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const canSee = await checkVisibility(user.id, requesterId, (user as any).privacySettings?.showActivity || 'PUBLIC');
    if (!canSee) return res.status(403).json({ message: 'Private section' });

    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity' });
  }
};

export const getUserPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;
    const requesterId = req.userId;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isSelf = user.id === requesterId;

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: user.id,
        ...(isSelf ? {} : { visibility: 'PUBLIC' }),
      },
      include: {
        _count: { select: { entries: true, follows: true } },
        entries: {
          take: 4,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists' });
  }
};

export const getUserPosts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, isPremium: true },
        },
        community: {
          select: { id: true, name: true, slug: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { bio, avatar, banner, fullName, phoneNumber, location } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        bio, 
        avatar, 
        banner,
        fullName,
        phoneNumber,
        location,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        banner: true,
        bio: true,
        fullName: true,
        phoneNumber: true,
        location: true,
        isPremium: true,
        createdAt: true,
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const getFullSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        privacySettings: true,
        notificationSettings: true,
      }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      personalization: {
        language: user.language,
        timezone: user.timezone,
        theme: user.theme,
        typography: user.typography,
        accentColor: user.accentColor,
        layoutDensity: user.layoutDensity,
      },
      privacy: user.privacySettings,
      notifications: user.notificationSettings,
      identity: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        location: user.location,
        searchIndexable: user.searchIndexable,
        showOnlineStatus: user.showOnlineStatus,
        showActivityStatus: user.showActivityStatus,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

export const updatePersonalization = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { language, timezone, theme, typography, accentColor, layoutDensity } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        language,
        timezone,
        theme,
        typography,
        accentColor,
        layoutDensity,
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating personalization' });
  }
};

export const updatePrivacy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { profileVisibility, searchIndexable, showOnlineStatus, showActivityStatus, ...privacyData } = req.body;

    // Update User-level privacy fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        searchIndexable,
        showOnlineStatus,
        showActivityStatus,
      }
    });

    // Update PrivacySettings model
    const updatedPrivacy = await prisma.privacySettings.update({
      where: { userId },
      data: {
        ...privacyData,
        profileVisibility,
      }
    });

    res.status(200).json(updatedPrivacy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating privacy' });
  }
};

export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = req.body;

    const updated = await prisma.notificationSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
};

export const deactivateAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    await prisma.user.update({
      where: { id: userId },
      data: { deactivatedAt: new Date() }
    });

    res.status(200).json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating account' });
  }
};

export const exportUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        animeEntries: true,
        ratings: true,
        posts: true,
        playlists: true,
        activities: true,
        followers: true,
        following: true,
      }
    });

    if (!userData) return res.status(404).json({ message: 'User not found' });

    // Remove sensitive info
    const { passwordHash, resetToken, resetTokenExpiry, ...exportableData } = userData;

    res.status(200).json(exportableData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting data' });
  }
};

export const addTopTenEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { animeId, animeTitle, animeCover, rank } = req.body;

    if (!animeId || !animeTitle || !rank || rank < 1 || rank > 10) {
      return res.status(400).json({ message: 'Missing required fields (animeId, animeTitle, rank 1-10)' });
    }

    // Delete existing entry at this rank if any
    await prisma.topTenEntry.deleteMany({
      where: { userId, rank },
    });

    // Also delete if this anime is already in the list at a different rank
    await prisma.topTenEntry.deleteMany({
      where: { userId, animeId: String(animeId) },
    });

    const entry = await prisma.topTenEntry.create({
      data: {
        userId,
        animeId: String(animeId),
        animeTitle,
        animeCover: animeCover || null,
        rank,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error adding top ten entry:', error);
    res.status(500).json({ message: 'Error adding top ten entry' });
  }
};

export const removeTopTenEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { entryId } = req.params;

    await prisma.topTenEntry.deleteMany({
      where: { id: String(entryId), userId },
    });

    res.status(200).json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing top ten entry' });
  }
};
export const removeTopTenEntryByRank = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const rank = parseInt(String(req.params.rank));

    if (isNaN(rank) || rank < 1 || rank > 10) {
      return res.status(400).json({ message: 'Invalid rank' });
    }

    await prisma.topTenEntry.deleteMany({
      where: { userId, rank },
    });

    res.status(200).json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing top ten entry' });
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(200).json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive',
        },
        searchIndexable: true,
        deactivatedAt: null,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        isPremium: true,
      },
      take: 10,
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users' });
  }
};

export const getUserDebates = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ message: 'Username required' });

    const user = await prisma.user.findUnique({
      where: { username: String(username) },
      include: {
        arenasParticipated: {
          include: {
            arena: {
              include: {
                judge: { select: { username: true } },
                participants: { include: { user: { select: { username: true } } } }
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const arenas = user.arenasParticipated.map(ap => ap.arena);
    
    // Calculate stats
    const stats = {
      wins: arenas.filter(a => (a.winnerTeam === 'TEAM_A' && user.arenasParticipated.find(p => p.arenaId === a.id)?.team === 'TEAM_A') || 
                               (a.winnerTeam === 'TEAM_B' && user.arenasParticipated.find(p => p.arenaId === a.id)?.team === 'TEAM_B')).length,
      losses: arenas.filter(a => (a.winnerTeam === 'TEAM_A' && user.arenasParticipated.find(p => p.arenaId === a.id)?.team === 'TEAM_B') || 
                                (a.winnerTeam === 'TEAM_B' && user.arenasParticipated.find(p => p.arenaId === a.id)?.team === 'TEAM_A')).length,
      draws: arenas.filter(a => a.winnerTeam === 'DRAW').length,
      judgedCount: await prisma.arena.count({ where: { judgeId: user.id, status: 'COMPLETED' } })
    };

    res.status(200).json({ arenas, stats });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user debates' });
  }
};
