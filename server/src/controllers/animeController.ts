import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import * as jikan from '../services/jikanService.js';
import * as recs from '../services/recommendationEngine.js';

export const searchAnime = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });
    
    const results = await jikan.searchAnime(String(q));

    // Record interaction (Async/Non-blocking)
    const userId = (req as any).userId;
    if (userId && results && results.length > 0) {
      const firstResult = results[0];
      if (firstResult && firstResult.mal_id) {
        const animeId = String(firstResult.mal_id);
        recs.recordInteraction(userId, animeId, 'SEARCHED').catch(err => 
          console.error('Interaction record error:', err)
        );
      }
    }
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
  } catch (error) {
    res.status(500).json({ message: 'Error searching anime' });
  }
};

export const getAnimeDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const animeData = await jikan.getAnimeById(String(id));
    
    if (!animeData) {
      return res.status(404).json({ message: 'Anime not found in archives' });
    }

    // Record interaction (Async/Non-blocking)
    const userId = (req as any).userId; // Potentially available if authenticated
    if (userId) {
      recs.recordInteraction(userId, String(id), 'VIEWED_PAGE').catch(err => 
        console.error('Interaction record error:', err)
      );
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
        ? ratings.reduce((acc, r) => acc + (r as any)[cat], 0) / totalRatings 
        : 0
    }));

    // Fetch last 10 reviews
    const reviews = await prisma.rating.findMany({
      where: { animeId: id as string, NOT: { review: null } },
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
  } catch (error: any) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Anime not found' });
    }
    res.status(500).json({ message: 'Error fetching anime details' });
  }
};

export const getTopAnime = async (req: Request, res: Response) => {
  try {
    const { filter, limit } = req.query;
    const results = await jikan.getTopAnime(filter as string, limit ? Number(limit) : 20);
    res.status(200).json(results);
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error(`[TopAnime] Error (Status: ${status}):`, error.message);
    res.status(status).json({ message: 'Error fetching top anime' });
  }
};

export const getSeasonalAnime = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const results = await jikan.getSeasonalAnime(limit ? Number(limit) : 20);
    res.status(200).json(results);
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error(`[SeasonalAnime] Error (Status: ${status}):`, error.message);
    res.status(status).json({ message: 'Error fetching seasonal anime' });
  }
};

export const getGenres = async (req: Request, res: Response) => {
  try {
    const results = await jikan.getGenres();
    res.status(200).json(results);
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error(`[Genres] Error (Status: ${status}):`, error.message);
    res.status(status).json({ message: 'Error fetching genres' });
  }
};

export const discoverAnime = async (req: Request, res: Response) => {
  try {
    const { producers, genres, order_by, sort, limit } = req.query;
    const results = await jikan.discoverAnime({
      producers: producers as string,
      genres: genres as string,
      order_by: order_by as string,
      sort: sort as string,
      limit: limit ? Number(limit) : 20
    });
    res.status(200).json(results);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = status === 429 ? 'Anime signal congested (Rate limit). Please try again in a moment.' : 'Error discovering anime';
    console.error(`[DiscoverAnime] Error (Status: ${status}):`, error.message);
    res.status(status).json({ message });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const recommendations = await recs.getRecommendations(userId);
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Recommendations API error:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
};

export const getStudioDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studio = await jikan.getProducerDetails(id);
    const works = await jikan.discoverAnime({ producers: id, order_by: 'score', sort: 'desc', limit: 15 });
    
    res.status(200).json({ studio, works });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching studio details' });
  }
};
