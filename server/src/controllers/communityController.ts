import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import slugify from 'slugify';
import { getStringParam, getStringQuery } from '../utils/params.js';

// Removed local prisma = new PrismaClient()

export const browseCommunities = async (req: Request, res: Response) => {
  try {
    const search = getStringQuery(req.query.search, '');
    const category = getStringQuery(req.query.category, '');
    const sort = getStringQuery(req.query.sort, '');
    
    let orderBy: any = { memberCount: 'desc' };
    if (sort === 'new') orderBy = { createdAt: 'desc' };
    if (sort === 'active') {
      orderBy = [
        { posts: { _count: 'desc' } },
        { memberCount: 'desc' }
      ];
    }

    const communities = await prisma.community.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } }
            ]
          } : {},
          category ? { category: category as string } : {}
        ]
      },
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      },
      orderBy,
      take: 24
    });

    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommunity = async (req: Request, res: Response) => {
  try {
    const slug = getStringParam(req.params.slug);
    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        rules: { orderBy: { order: 'asc' } },
        members: {
          where: { role: 'ADMIN' },
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          }
        },
        _count: {
          select: { members: true, posts: true }
        }
      }
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, category, bannerUrl, avatarUrl, rules } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name as string, { lower: true, strict: true });
    
    const existing = await prisma.community.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ error: 'A community with this name already exists' });

    const validationDeadline = new Date();
    validationDeadline.setDate(validationDeadline.getDate() + 7);

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        category,
        bannerUrl,
        avatarUrl,
        validationDeadline,
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        },
        memberCount: 1,
        rules: {
          create: (rules || []).map((text: string, index: number) => ({
            ruleText: text,
            order: index
          }))
        }
      }
    });

    res.status(201).json(community);
  } catch (error) {
    console.error('Create Community Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const slug = getStringParam(req.params.slug);
    const cursor = getStringQuery(req.query.cursor, '');
    const limit = 15;

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const posts = await prisma.post.findMany({
      where: { communityId: community.id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
        poll: {
          include: {
            options: {
              include: {
                votes: {
                  select: { userId: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      })
    });

    const nextCursor = posts.length === limit ? (posts[posts.length - 1]?.id || null) : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const slug = getStringParam(req.params.slug);

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const existingMember = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } }
    });

    if (existingMember) return res.status(400).json({ error: 'Already a member' });

    const newMemberCount = community.memberCount + 1;
    const shouldValidate = !community.isValidated && newMemberCount >= 30;

    await prisma.$transaction([
      prisma.communityMember.create({
        data: { userId, communityId: community.id }
      }),
      prisma.community.update({
        where: { id: community.id },
        data: { 
          memberCount: newMemberCount,
          isValidated: shouldValidate ? true : community.isValidated
        }
      })
    ]);

    res.status(200).json({ message: 'Joined successfully', validated: shouldValidate });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const leaveCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const slug = getStringParam(req.params.slug);

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } }
    });

    if (!member) return res.status(400).json({ error: 'Not a member' });
    if (member.role === 'ADMIN') return res.status(400).json({ error: 'Admins cannot leave. Transfer ownership or delete the community.' });

    await prisma.$transaction([
      prisma.communityMember.delete({
        where: { id: member.id }
      }),
      prisma.community.update({
        where: { id: community.id },
        data: { memberCount: { decrement: 1 } }
      })
    ]);

    res.status(200).json({ message: 'Left successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const slug = getStringParam(req.params.slug);
    const { description, category, bannerUrl, avatarUrl, rules } = req.body;

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } }
    });

    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admins only.' });
    }

    const updated = await prisma.community.update({
      where: { id: community.id },
      data: {
        description,
        category,
        bannerUrl,
        avatarUrl,
        rules: rules ? {
          deleteMany: {},
          create: rules.map((text: string, index: number) => ({
            ruleText: text,
            order: index
          }))
        } : undefined
      } as any
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.userId!;
    const slug = getStringParam(req.params.slug);
    const userId = getStringParam(req.params.userId);

    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const adminMember = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: adminId, communityId: community.id } }
    });

    if (!adminMember || adminMember.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admins only.' });
    }

    const targetMember = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } }
    });

    if (!targetMember) return res.status(404).json({ error: 'Member not found' });
    if (targetMember.role === 'ADMIN') return res.status(400).json({ error: 'Cannot remove another admin' });

    await prisma.$transaction([
      prisma.communityMember.delete({ where: { id: targetMember.id } }),
      prisma.community.update({
        where: { id: community.id },
        data: { memberCount: { decrement: 1 } }
      })
    ]);

    res.status(200).json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const slug = getStringParam(req.params.slug);
    const community = await prisma.community.findUnique({ where: { slug } });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const members = await prisma.communityMember.findMany({
      where: { communityId: community.id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, bio: true }
        }
      },
      orderBy: { joinedAt: 'desc' },
      take: 50
    });

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCommunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const memberships = await prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
            memberCount: true
          }
        }
      }
    });

    const communities = memberships.map(m => m.community);
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
