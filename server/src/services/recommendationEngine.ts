import { prisma } from '../lib/prisma.js';
import axios from 'axios';
import { InteractionType } from '@prisma/client';

/**
 * Advanced Recommendation Engine Service
 */

const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  COMPLETED: 5.0,
  RATED: 4.0,
  ADDED_TO_LIST: 2.0,
  VIEWED_PAGE: 0.5,
  SEARCHED: 0.3,
  DROPPED: -2.0
};

/**
 * Record a user-anime interaction and update tag affinities
 */
export const recordInteraction = async (userId: string, animeId: string, interactionType: InteractionType) => {
  try {
    const weight = INTERACTION_WEIGHTS[interactionType];

    // 1. Create UserAnimeInteraction record
    await prisma.userAnimeInteraction.create({
      data: {
        userId,
        animeId,
        interactionType,
        weight
      }
    });

    // 2. Update Tag Affinities
    await updateTagAffinity(userId, animeId, weight);
  } catch (error) {
    console.error(`[RecEngine] Error recording interaction: ${error}`);
  }
};

/**
 * Update user's affinity scores for tags associated with an anime
 */
const updateTagAffinity = async (userId: string, animeId: string, weight: number) => {
  try {
    // 1. Fetch tags for this anime
    let tags = await prisma.animeTag.findMany({
      where: { animeId }
    });

    // 2. If no tags exist, fetch from Jikan API and store them
    if (tags.length === 0) {
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
      const animeData = response.data.data;
      
      const newTags: string[] = [];
      if (animeData.genres) newTags.push(...animeData.genres.map((g: any) => g.name));
      if (animeData.themes) newTags.push(...animeData.themes.map((t: any) => t.name));
      if (animeData.studios) newTags.push(...animeData.studios.map((s: any) => s.name));

      for (const tag of newTags) {
        await prisma.animeTag.upsert({
          where: { animeId_tag: { animeId, tag } },
          create: { animeId, tag },
          update: {} // No update needed if exists
        });
      }

      tags = await prisma.animeTag.findMany({ where: { animeId } });
    }

    // 3. Update UserTagAffinity
    for (const tagObj of tags) {
      await prisma.userTagAffinity.upsert({
        where: { userId_tag: { userId, tag: tagObj.tag } },
        create: { userId, tag: tagObj.tag, affinityScore: weight },
        update: { affinityScore: { increment: weight } }
      });
    }

    // 4. Normalize scores (Max 10.0)
    const affinities = await prisma.userTagAffinity.findMany({ where: { userId } });
    const maxScore = Math.max(...affinities.map(a => a.affinityScore));
    if (maxScore > 10.0) {
      const ratio = 10.0 / maxScore;
      for (const affinity of affinities) {
        await prisma.userTagAffinity.update({
          where: { id: affinity.id },
          data: { affinityScore: affinity.affinityScore * ratio }
        });
      }
    }
  } catch (error) {
    console.error(`[RecEngine] Error updating tag affinity: ${error}`);
  }
};

/**
 * Generate fresh recommendations for a user
 */
export const generateRecommendations = async (userId: string) => {
  try {
    // 1. Fetch user's top 20 tag affinities
    const topAffinities = await prisma.userTagAffinity.findMany({
      where: { userId },
      orderBy: { affinityScore: 'desc' },
      take: 20
    });

    if (topAffinities.length === 0) return [];

    // 2. Fetch animeIds user already interacted with
    const interactions = await prisma.userAnimeInteraction.findMany({
      where: { userId },
      select: { animeId: true }
    });
    const interactedIds = new Set(interactions.map(i => i.animeId));

    const candidates: any[] = [];

    // 3. For each top tag, fetch candidates (Jikan fallback logic)
    // We'll process them in batches to be safe with Jikan
    for (const affinity of topAffinities) {
      try {
        // Search Jikan for this tag (simplified search)
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(affinity.tag)}&limit=5&order_by=score&sort=desc`);
        const results = response.data.data;

        for (const anime of results) {
          const malId = String(anime.mal_id);
          if (interactedIds.has(malId)) continue;

          // Simple scoring: start with affinityScore
          let score = affinity.affinityScore;
          
          // Check for existing candidate
          const existing = candidates.find(c => c.animeId === malId);
          if (existing) {
            existing.score += score;
            if (!existing.matchedTags.includes(affinity.tag)) {
              existing.matchedTags.push(affinity.tag);
            }
          } else {
            candidates.push({
              animeId: malId,
              title: anime.title,
              cover: anime.images.webp.large_image_url,
              score: score,
              matchedTags: [affinity.tag]
            });
          }
        }
        
        // Respect Jikan rate limit (approx 1 request per sec)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`[RecEngine] Error fetching candidates for tag ${affinity.tag}:`, err);
      }
    }

    // 4. Sort and Store in cache
    const finalRecs = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    await prisma.recommendationCache.upsert({
      where: { userId },
      create: { userId, recommendations: finalRecs, generatedAt: new Date() },
      update: { recommendations: finalRecs, generatedAt: new Date() }
    });

    return finalRecs;
  } catch (error) {
    console.error(`[RecEngine] Error generating recommendations: ${error}`);
    return [];
  }
};

/**
 * Get recommendations (with caching logic)
 */
export const getRecommendations = async (userId: string) => {
  const cache = await prisma.recommendationCache.findUnique({
    where: { userId }
  });

  const SIX_HOURS = 6 * 60 * 60 * 1000;
  if (cache && (Date.now() - new Date(cache.generatedAt).getTime()) < SIX_HOURS) {
    return cache.recommendations;
  }

  return generateRecommendations(userId);
};
