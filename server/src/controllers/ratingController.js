import { prisma } from '../lib/prisma.js';
import * as recs from '../services/recommendationEngine.js';
// Removed local prisma = new PrismaClient()
const calculateWeightedScore = (data) => {
    const weights = {
        story: 0.20,
        characters: 0.20,
        buildUp: 0.18,
        feeling: 0.18,
        ending: 0.14,
        animation: 0.10
    };
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(weights)) {
        const value = data[key];
        if (value && value > 0) {
            weightedSum += value * weight;
            totalWeight += weight;
        }
    }
    if (totalWeight === 0)
        return 0;
    return Number((weightedSum / totalWeight).toFixed(1));
};
export const getRatingByAnimeId = async (req, res) => {
    try {
        const { animeId } = req.params;
        const userId = req.userId;
        const rating = await prisma.rating.findUnique({
            where: { userId_animeId: { userId, animeId: String(animeId) } }
        });
        res.status(200).json(rating);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching rating' });
    }
};
export const upsertRating = async (req, res) => {
    try {
        const { animeId, animation, characters, buildUp, story, feeling, ending, review } = req.body;
        const userId = req.userId;
        const ratingData = {
            animation: animation || 0,
            characters: characters || 0,
            buildUp: buildUp || 0,
            story: story || 0,
            feeling: feeling || 0,
            ending: ending || 0,
        };
        const calculatedScore = calculateWeightedScore(ratingData);
        const rating = await prisma.rating.upsert({
            where: { userId_animeId: { userId, animeId: String(animeId) } },
            update: { ...ratingData, calculatedScore, review },
            create: { userId, animeId: String(animeId), ...ratingData, calculatedScore, review }
        });
        // Record interaction for Recommendation Engine
        recs.recordInteraction(userId, String(animeId), 'RATED').catch(err => console.error('Rating interaction record error:', err));
        res.status(200).json(rating);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving rating' });
    }
};
//# sourceMappingURL=ratingController.js.map