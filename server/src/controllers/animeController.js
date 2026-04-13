import { prisma } from '../lib/prisma.js';
import * as jikan from '../services/jikanService.js';
import * as recs from '../services/recommendationService.js';
export const searchAnime = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q)
            return res.status(400).json({ message: 'Query is required' });
        const results = await jikan.searchAnime(String(q));
        // Simple filter to return only necessary fields for search results
        const filteredResults = results.map(anime => ({
            mal_id: anime.mal_id,
            title: anime.title,
            images: anime.images,
            year: anime.year,
            episodes: anime.episodes,
            studios: anime.studios
        }));
        res.status(200).json(filteredResults);
    }
    catch (error) {
        res.status(500).json({ message: 'Error searching anime' });
    }
};
export const getAnimeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const animeData = await jikan.getAnimeById(String(id));
        if (!animeData) {
            return res.status(404).json({ message: 'Anime not found in archives' });
        }
        // Record interaction (Async/Non-blocking)
        const userId = req.userId; // Potentially available if authenticated
        if (userId) {
            recs.recordInteraction(userId, String(id), 'VIEW_DETAILS').catch(err => console.error('Interaction record error:', err));
        }
        // Fetch platform stats
        const ratings = await prisma.rating.findMany({
            where: { animeId: String(id) }
        });
        const totalRatings = ratings.length;
        const overallScore = totalRatings > 0
            ? ratings.reduce((acc, r) => acc + r.calculatedScore, 0) / totalRatings
            : 0;
        // Calculate category averages
        const categories = ['animation', 'characters', 'buildUp', 'story', 'feeling', 'ending'];
        const categoryStats = categories.map(cat => ({
            category: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, ' $1'),
            average: totalRatings > 0
                ? ratings.reduce((acc, r) => acc + r[cat], 0) / totalRatings
                : 0
        }));
        // Fetch last 10 reviews
        const reviews = await prisma.rating.findMany({
            where: { animeId: id, NOT: { review: null } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { username: true, avatar: true } } }
        });
        res.status(200).json({
            ...animeData,
            platformStats: {
                overallScore: Number(overallScore.toFixed(1)),
                totalRatings,
                categoryStats
            },
            reviews
        });
    }
    catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ message: 'Anime not found' });
        }
        res.status(500).json({ message: 'Error fetching anime details' });
    }
};
export const getTopAnime = async (req, res) => {
    try {
        const { filter, limit } = req.query;
        const results = await jikan.getTopAnime(filter, limit ? Number(limit) : 20);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching top anime' });
    }
};
export const getSeasonalAnime = async (req, res) => {
    try {
        const { limit } = req.query;
        const results = await jikan.getSeasonalAnime(limit ? Number(limit) : 20);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching seasonal anime' });
    }
};
export const getGenres = async (req, res) => {
    try {
        const results = await jikan.getGenres();
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching genres' });
    }
};
export const discoverAnime = async (req, res) => {
    try {
        const { producers, genres, order_by, sort, limit } = req.query;
        const results = await jikan.discoverAnime({
            producers: producers,
            genres: genres,
            order_by: order_by,
            sort: sort,
            limit: limit ? Number(limit) : 20
        });
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Error discovering anime' });
    }
};
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        // 1. Check if we have enough interactions to generate recommendations
        // For now, we'll just try to generate them or fetch existing ones
        let recommendations = await prisma.animeRecommendation.findMany({
            where: { userId },
            orderBy: { score: 'desc' },
            take: 20
        });
        if (recommendations.length < 5) {
            // Generate new ones if we have few
            await recs.generateRecommendations(userId);
            recommendations = await prisma.animeRecommendation.findMany({
                where: { userId },
                orderBy: { score: 'desc' },
                take: 20
            });
        }
        // 2. Fetch full anime data from Jikan proxy for each recommendation
        const fullData = await Promise.all(recommendations.map(async (rec) => {
            try {
                const anime = await jikan.getAnimeById(rec.animeId);
                return { ...anime, recommendationReason: rec.reason };
            }
            catch (err) {
                return null;
            }
        }));
        res.status(200).json(fullData.filter(a => a !== null));
    }
    catch (error) {
        console.error('Recommendations API error:', error);
        res.status(500).json({ message: 'Error generating recommendations' });
    }
};
//# sourceMappingURL=animeController.js.map