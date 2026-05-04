import axios from 'axios';
import NodeCache from 'node-cache';
import type { JikanAnime } from '../../../shared/types/index.js';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL standard
const DISCOVERY_TTL = 3600 * 12; // 12 hours for discovery results

const jikanApi = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 30000, // 30s timeout for stability
});

// Helper for handling Jikan requests with exponential backoff retries and rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_GAP = 500; // 500ms between requests to stay safe (3 req/sec limit)

const fetchJikan = async (url: string, params: any = {}, retries = 3) => {
  let attempt = 0;
  
  // Basic rate limit queueing
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_GAP) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  while (attempt < retries) {
    try {
      const response = await jikanApi.get(url, { params });
      return response.data.data;
    } catch (error: any) {
      attempt++;
      
      const isRateLimit = error.response?.status === 429;
      const isTimeout = error.code === 'ECONNABORTED';
      
      if ((isRateLimit || isTimeout) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[Jikan] ${isRateLimit ? 'Rate limited' : 'Timeout'} on ${url}. Retrying in ${Math.round(delay)}ms (Attempt ${attempt}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`[Jikan] Request failed for ${url} after ${attempt} attempts:`, error.message);
      throw error;
    }
  }
};

export const searchAnime = async (query: string): Promise<JikanAnime[]> => {
  const cacheKey = `search_${query}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  const results = await fetchJikan('/anime', { q: query, limit: 10 });
  cache.set(cacheKey, results);
  return results;
};

export const getAnimeById = async (id: string): Promise<JikanAnime> => {
  const cacheKey = `anime_${id}`;
  const cachedData = cache.get<JikanAnime>(cacheKey);
  if (cachedData) return cachedData;

  const result = await fetchJikan(`/anime/${id}/full`);
  cache.set(cacheKey, result);
  return result;
};

export const getTopAnime = async (filter?: string, limit = 20): Promise<JikanAnime[]> => {
  // Validate Jikan filters to prevent 400 errors
  const validFilters = ['airing', 'upcoming', 'bypopularity', 'favorite'];
  const activeFilter = filter && validFilters.includes(filter) ? filter : undefined;

  const cacheKey = `top_${activeFilter || 'default'}_${limit}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  const results = await fetchJikan('/top/anime', { filter: activeFilter, limit });
  cache.set(cacheKey, results, DISCOVERY_TTL);
  return results;
};

export const getSeasonalAnime = async (limit = 20): Promise<JikanAnime[]> => {
  const cacheKey = `seasonal_${limit}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  const results = await fetchJikan('/seasons/now', { limit });
  cache.set(cacheKey, results, DISCOVERY_TTL);
  return results;
};

export const getGenres = async (): Promise<any[]> => {
  const cacheKey = 'genres';
  const cachedData = cache.get<any[]>(cacheKey);
  if (cachedData) return cachedData;

  const results = await fetchJikan('/genres/anime');
  cache.set(cacheKey, results, DISCOVERY_TTL);
  return results;
};

export const discoverAnime = async (params: { 
  producers?: string, 
  genres?: string, 
  order_by?: string, 
  sort?: string, 
  limit?: number 
}): Promise<JikanAnime[]> => {
  const cacheKey = `discover_${JSON.stringify(params)}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  const results = await fetchJikan('/anime', params);
  cache.set(cacheKey, results, DISCOVERY_TTL);
  return results;
};

export const getProducerDetails = async (id: string): Promise<any> => {
  const cacheKey = `producer_${id}`;
  const cachedData = cache.get<any>(cacheKey);
  if (cachedData) return cachedData;

  const result = await fetchJikan(`/producers/${id}/full`);
  cache.set(cacheKey, result, DISCOVERY_TTL);
  return result;
};
