import axios from 'axios';
import NodeCache from 'node-cache';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL standard
const DISCOVERY_TTL = 3600 * 12; // 12 hours for discovery results
const jikanApi = axios.create({
    baseURL: JIKAN_BASE_URL,
    timeout: 10000, // 10s timeout
});
// Helper for handling Jikan requests with basic retry or better error logging
const fetchJikan = async (url, params = {}) => {
    try {
        const response = await jikanApi.get(url, { params });
        return response.data.data;
    }
    catch (error) {
        if (error.response?.status === 429) {
            console.warn(`[Jikan] Rate limited on ${url}. Retrying after 1s...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retryResponse = await jikanApi.get(url, { params });
            return retryResponse.data.data;
        }
        console.error(`[Jikan] Request failed for ${url}:`, error.message);
        throw error;
    }
};
export const searchAnime = async (query) => {
    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const results = await fetchJikan('/anime', { q: query, limit: 10 });
    cache.set(cacheKey, results);
    return results;
};
export const getAnimeById = async (id) => {
    const cacheKey = `anime_${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const result = await fetchJikan(`/anime/${id}/full`);
    cache.set(cacheKey, result);
    return result;
};
export const getTopAnime = async (filter, limit = 20) => {
    const cacheKey = `top_${filter || 'default'}_${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const results = await fetchJikan('/top/anime', { filter, limit });
    cache.set(cacheKey, results, DISCOVERY_TTL);
    return results;
};
export const getSeasonalAnime = async (limit = 20) => {
    const cacheKey = `seasonal_${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const results = await fetchJikan('/seasons/now', { limit });
    cache.set(cacheKey, results, DISCOVERY_TTL);
    return results;
};
export const getGenres = async () => {
    const cacheKey = 'genres';
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const results = await fetchJikan('/genres/anime');
    cache.set(cacheKey, results, DISCOVERY_TTL);
    return results;
};
export const discoverAnime = async (params) => {
    const cacheKey = `discover_${JSON.stringify(params)}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData)
        return cachedData;
    const results = await fetchJikan('/anime', params);
    cache.set(cacheKey, results, DISCOVERY_TTL);
    return results;
};
//# sourceMappingURL=jikanService.js.map