import { prisma } from '../lib/prisma.js';
import * as jikan from './jikanService.js';
import { InteractionType } from '@prisma/client';
/**
 * NAKAMA Recommendation Engine Service
 */
const INTERACTION_WEIGHTS = {
    CLICK: 1,
    VIEW_DETAILS: 2,
    ADD_TO_LIST: 5,
    RATE: 10
};
export const recordInteraction = async (userId, animeId, type) => {
    try {
        const weight = INTERACTION_WEIGHTS[type] || 1;
        // 1. Record the interaction
        await prisma.userAnimeInteraction.create({
            data: {
                userId,
                animeId,
                type,
                weight
            }
        });
        // 2. Fetch anime details to update affinities (Async/Non-blocking)
        updateAffinities(userId, animeId, weight).catch(err => console.error('Affinity update error:', err));
    }
    catch (error) {
        console.error('Interaction recording error:', error);
    }
};
const updateAffinities = async (userId, animeId, weight) => {
    const anime = await jikan.getAnimeById(animeId);
    if (!anime)
        return;
    // Update Genre Affinities
    if (anime.genres) {
        for (const genre of anime.genres) {
            await prisma.genreAffinity.upsert({
                where: {
                    userId_genreId: {
                        userId,
                        genreId: genre.mal_id
                    }
                },
                create: {
                    userId,
                    genreId: genre.mal_id,
                    genreName: genre.name,
                    score: weight
                },
                update: {
                    score: { increment: weight }
                }
            });
        }
    }
    // Update Studio Affinities
    if (anime.studios) {
        for (const studio of anime.studios) {
            await prisma.studioAffinity.upsert({
                where: {
                    userId_studioId: {
                        userId,
                        studioId: studio.mal_id
                    }
                },
                create: {
                    userId,
                    studioId: studio.mal_id,
                    studioName: studio.name,
                    score: weight
                },
                update: {
                    score: { increment: weight }
                }
            });
        }
    }
};
export const generateRecommendations = async (userId) => {
    try {
        // 1. Get user's top genres and studios
        const topGenres = await prisma.genreAffinity.findMany({
            where: { userId },
            orderBy: { score: 'desc' },
            take: 3
        });
        const topStudios = await prisma.studioAffinity.findMany({
            where: { userId },
            orderBy: { score: 'desc' },
            take: 2
        });
        if (topGenres.length === 0 && topStudios.length === 0) {
            // Fallback: Recommend Top Popular Anime
            const topAnime = await jikan.getTopAnime('bypopularity', 10);
            return topAnime.map(a => ({
                animeId: String(a.mal_id),
                score: 0.5,
                reason: "Generic popular titles while we learn your taste."
            }));
        }
        // 2. Build discovery query based on affinities
        const genreIds = topGenres.map(g => g.genreId).join(',');
        const producerIds = topStudios.map(s => s.studioId).join(',');
        // 3. Discover matching anime
        const discoveries = await jikan.discoverAnime({
            genres: genreIds,
            producers: producerIds,
            order_by: 'score',
            sort: 'desc',
            limit: 20
        });
        // 4. Save to DB and return
        const recommendations = discoveries.map(anime => ({
            userId,
            animeId: String(anime.mal_id),
            score: 0.9, // Simplified scoring for now
            reason: `Based on your interest in ${topGenres.map(g => g.genreName).join(', ')}`
        }));
        // Upsert recommendations
        for (const rec of recommendations) {
            await prisma.animeRecommendation.upsert({
                where: {
                    userId_animeId: {
                        userId: rec.userId,
                        animeId: rec.animeId
                    }
                },
                create: rec,
                update: {
                    score: rec.score,
                    reason: rec.reason,
                    createdAt: new Date()
                }
            });
        }
        return recommendations;
    }
    catch (error) {
        console.error('Recommendation generation error:', error);
        return [];
    }
};
//# sourceMappingURL=recommendationService.js.map