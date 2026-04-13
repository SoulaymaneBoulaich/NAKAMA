import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import * as recEngine from '../services/recommendationEngine.js';
import axios from 'axios';

const router = Router();

/**
 * GET /api/recommendations
 * Returns personalized recommendations for the current user
 */
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await recEngine.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations API Error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * GET /api/recommendations/similar/:animeId
 * Returns anime similar to the specified ID based on tag overlap
 */
router.get('/similar/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;

    // 1. Fetch tags for this anime
    let tags = await prisma.animeTag.findMany({ where: { animeId } });
    if (tags.length === 0) {
      // Fallback fetch to populate tags
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
      const animeData = response.data.data;
      const newTagNames: string[] = [];
      if (animeData.genres) newTagNames.push(...animeData.genres.map((g: any) => g.name));
      if (animeData.themes) newTagNames.push(...animeData.themes.map((t: any) => t.name));
      if (animeData.studios) newTagNames.push(...animeData.studios.map((s: any) => s.name));
      
      for (const tag of newTagNames) {
        await prisma.animeTag.upsert({
          where: { animeId_tag: { animeId, tag } },
          create: { animeId, tag },
          update: {}
        });
      }
      tags = await prisma.animeTag.findMany({ where: { animeId } });
    }

    const tagNames = tags.map(t => t.tag);

    // 2. Find anime with overlapping tags
    const overlappingAnimes = await prisma.animeTag.findMany({
      where: {
        tag: { in: tagNames },
        animeId: { not: animeId }
      },
      take: 50
    });

    // 3. Count overlaps and sort
    const scores: Record<string, number> = {};
    for (const item of overlappingAnimes) {
      scores[item.animeId] = (scores[item.animeId] || 0) + 1;
    }

    const sortedIds = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => id);

    // 4. Fetch details (Simplified metadata for similar cards)
    // In a real app, you'd fetch from Jikan or a local cache
    // For now, we return IDs and the UI will have to handle metadata or we fetch briefly
    const results = [];
    for (const id of sortedIds) {
      try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
        const data = response.data.data;
        results.push({
          animeId: id,
          title: data.title,
          cover: data.images.webp.large_image_url,
          tags: data.genres.map((g: any) => g.name).slice(0, 3)
        });
        await new Promise(r => setTimeout(r, 500)); // Be gentle
      } catch (err) {
        console.error(`Failed to fetch metadata for similar anime ${id}:`, err);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Similar Recommendations API Error:', error);
    res.status(500).json({ error: 'Failed to fetch similar anime' });
  }
});

/**
 * POST /api/recommendations/feedback
 * Records user feedback and regenerates cache
 */
router.post('/feedback', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { animeId, feedbackType } = req.body;

    if (feedbackType === 'NOT_INTERESTED') {
      await recEngine.recordInteraction(userId, animeId, 'DROPPED');
      // Trigger cache regeneration
      await recEngine.generateRecommendations(userId);
      res.json({ message: 'Feedback recorded' });
    } else if (feedbackType === 'ALREADY_WATCHED') {
      res.json({ action: 'PROMPT_ADD_TO_LIST', message: 'Please add this to your list to improve recommendations' });
    } else {
      res.status(400).json({ error: 'Invalid feedback type' });
    }
  } catch (error) {
    console.error('Feedback API Error:', error);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

export default router;
