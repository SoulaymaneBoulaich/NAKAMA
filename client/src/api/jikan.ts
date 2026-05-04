import api from './axios';

/**
 * NAKAMA Frontend Jikan Client (Proxy Edition)
 * All calls are now routed through the backend to handle CORS, 
 * centralize caching, and manage rate limits gracefully.
 */

export const getTopAnime = async (filter: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity', limit = 20) => {
  const { data } = await api.get('/anime/top', { params: { filter, limit } });
  return data;
};

export const getSeasonalAnime = async (limit = 20) => {
  const { data } = await api.get('/anime/seasonal', { params: { limit } });
  return data;
};

export const getGenres = async () => {
  const { data } = await api.get('/anime/genres');
  return data;
};

export const getRecommendations = async () => {
  const { data } = await api.get('/anime/recommendations');
  return data;
};

export const getPersonalizedRecommendations = async (limit = 20) => {
  const { data } = await api.get('/recommendations/personalized', { params: { limit } });
  return data;
};

export const getSimilarAnime = async (animeId: string, limit = 10) => {
  const { data } = await api.get(`/recommendations/similar/${animeId}`, { params: { limit } });
  return data;
};

export const searchAnime = async (query: string, limit = 10) => {

  const { data } = await api.get('/anime/search', { params: { q: query, limit } });
  return data;
};

export const getAnimeByGenre = async (genreId: number, limit = 20) => {
  const { data } = await api.get('/anime/discover', { 
    params: { genres: genreId, order_by: 'score', sort: 'desc', limit } 
  });
  return { data }; // Wrap in data object to maintain backward compatibility with components
};

export const getAnimeByType = async (type: 'tv' | 'movie' | 'ova' | 'special', limit = 12) => {
  const { data } = await api.get('/anime/discover', { 
    params: { type, order_by: 'score', sort: 'desc', limit } 
  });
  return data;
};

export const getAnimeById = async (id: number) => {
  const { data } = await api.get(`/anime/${id}`);
  return data;
};

// Generic discovery method for components like StudioMatrix
export const jikanApi = {
  get: async (url: string) => {
    // Parse the legacy URL formats used by direct Jikan components
    const params = new URLSearchParams(url.split('?')[1]);
    const producerId = params.get('producers');
    const limit = params.get('limit');
    
    if (producerId) {
      const { data } = await api.get('/anime/discover', { 
        params: { producers: producerId, order_by: 'score', sort: 'desc', limit: limit || 6 } 
      });
      return { data: { data } }; // Double wrapper to match { data: { data: [] } } format from Jikan API
    }
    
    return api.get(url);
  }
};

export default jikanApi;
