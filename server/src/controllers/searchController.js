import { prisma } from '../lib/prisma.js';
import * as jikan from '../services/jikanService.js';
/**
 * GET /api/search
 * Query params: q (search term), type (all, anime, users, communities)
 */
export const unifiedSearch = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const results = {};
        // 1. Search Anime (Always from Jikan for now)
        if (type === 'all' || type === 'anime') {
            try {
                const jikanData = await jikan.searchAnime(q);
                results.anime = jikanData.map((a) => ({
                    mal_id: a.mal_id,
                    title: a.title_english || a.title,
                    images: a.images,
                    type: a.type,
                    score: a.score,
                    year: a.year
                }));
            }
            catch (err) {
                console.error('Jikan search error:', err);
                results.anime = [];
            }
        }
        // 2. Search Users
        if (type === 'all' || type === 'users') {
            results.users = await prisma.user.findMany({
                where: {
                    username: { contains: q, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    username: true,
                    avatar: true,
                    bio: true,
                    isPremium: true,
                    _count: {
                        select: { followers: true }
                    }
                },
                take: 10
            });
        }
        // 3. Search Communities
        if (type === 'all' || type === 'communities') {
            results.communities = await prisma.community.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    description: true,
                    _count: {
                        select: { members: true }
                    }
                },
                take: 10
            });
        }
        res.json(results);
    }
    catch (error) {
        console.error('Unified search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};
//# sourceMappingURL=searchController.js.map