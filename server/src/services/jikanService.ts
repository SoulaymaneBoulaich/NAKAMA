import axios from 'axios';
import NodeCache from 'node-cache';
import type { JikanAnime } from '../../../shared/types/index.js';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const ANILIST_URL = 'https://graphql.anilist.co';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL standard
const DISCOVERY_TTL = 3600 * 12; // 12 hours for discovery results

const jikanApi = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NAKAMA/1.0',
    'Accept': 'application/json',
  },
});

let lastRequestTime = 0;
const MIN_REQUEST_GAP = 400;

const fetchJikan = async (url: string, params: any = {}, retries = 2) => {
  let attempt = 0;
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_GAP) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  while (attempt < retries) {
    try {
      const response = await jikanApi.get(url, { params });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Empty Jikan response');
    } catch (error: any) {
      attempt++;
      const isRetryable = [429, 502, 503, 504].includes(error.response?.status) || error.code === 'ECONNABORTED';
      if (isRetryable && attempt < retries) {
        const delay = Math.pow(2, attempt) * 600 + Math.random() * 400;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

const mapAniListToJikan = (media: any): JikanAnime => {
  const mal_id = media.idMal || media.id;
  const coverUrl = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || '';
  return {
    mal_id,
    url: `https://myanimelist.net/anime/${mal_id}`,
    images: {
      jpg: {
        image_url: coverUrl,
        small_image_url: media.coverImage?.medium || coverUrl,
        large_image_url: media.coverImage?.extraLarge || coverUrl,
      },
    },
    title: media.title?.english || media.title?.romaji || media.title?.native || 'Unknown Anime',
    title_english: media.title?.english || media.title?.romaji,
    type: media.format || 'TV',
    episodes: media.episodes || undefined,
    status: media.status || 'Finished Airing',
    duration: media.duration ? `${media.duration} min` : undefined,
    score: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : undefined,
    synopsis: media.description ? media.description.replace(/<[^>]*>?/gm, '').replace(/\n\n/g, ' ') : undefined,
    year: media.seasonYear || media.startDate?.year,
    studios: (media.studios?.nodes || []).map((s: any, idx: number) => ({ mal_id: s.id || idx + 1, name: s.name })),
    genres: (media.genres || []).map((g: string, idx: number) => ({ mal_id: idx + 1, name: g })),
  };
};

const fetchAniList = async (query: string, variables: any = {}) => {
  try {
    const response = await axios.post(
      ANILIST_URL,
      { query, variables },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NAKAMA/1.0',
        },
      }
    );
    return response.data?.data;
  } catch (err: any) {
    console.error('[AniList] Error:', err.message);
    return null;
  }
};

const FALLBACK_POPULAR_ANIME: JikanAnime[] = [
  {
    mal_id: 16498,
    url: 'https://myanimelist.net/anime/16498',
    images: {
      jpg: {
        image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
        small_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-buvcRTBx4NSm.jpg',
        large_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
      },
    },
    title: 'Attack on Titan',
    title_english: 'Attack on Titan',
    type: 'TV',
    episodes: 25,
    status: 'Finished Airing',
    score: 8.5,
    synopsis: 'Humans fight for survival behind massive walls against human-eating giants known as Titans.',
    year: 2013,
    studios: [{ mal_id: 858, name: 'WIT Studio' }],
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 2, name: 'Fantasy' }, { mal_id: 3, name: 'Drama' }],
  },
  {
    mal_id: 1,
    url: 'https://myanimelist.net/anime/1',
    images: {
      jpg: {
        image_url: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg',
        small_image_url: 'https://cdn.myanimelist.net/images/anime/4/19644t.jpg',
        large_image_url: 'https://cdn.myanimelist.net/images/anime/4/19644l.jpg',
      },
    },
    title: 'Cowboy Bebop',
    title_english: 'Cowboy Bebop',
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    score: 8.8,
    synopsis: 'In 2071, bounty hunters travel through the solar system tracking down interplanetary criminals.',
    year: 1998,
    studios: [{ mal_id: 14, name: 'Sunrise' }],
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 24, name: 'Sci-Fi' }],
  },
  {
    mal_id: 5114,
    url: 'https://myanimelist.net/anime/5114',
    images: {
      jpg: {
        image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1mE4E8zW2kLg.jpg',
        small_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5114-1mE4E8zW2kLg.jpg',
        large_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1mE4E8zW2kLg.jpg',
      },
    },
    title: 'Fullmetal Alchemist: Brotherhood',
    title_english: 'Fullmetal Alchemist: Brotherhood',
    type: 'TV',
    episodes: 64,
    status: 'Finished Airing',
    score: 9.1,
    synopsis: 'Two brothers search for a Philosopher Stone after an alchemy experiment goes catastrophically wrong.',
    year: 2009,
    studios: [{ mal_id: 4, name: 'Bones' }],
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 2, name: 'Adventure' }, { mal_id: 10, name: 'Fantasy' }],
  },
  {
    mal_id: 38000,
    url: 'https://myanimelist.net/anime/38000',
    images: {
      jpg: {
        image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg',
        small_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101922-PEn1CTc93blC.jpg',
        large_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg',
      },
    },
    title: 'Demon Slayer: Kimetsu no Yaiba',
    title_english: 'Demon Slayer: Kimetsu no Yaiba',
    type: 'TV',
    episodes: 26,
    status: 'Finished Airing',
    score: 8.5,
    synopsis: 'A young man turns into a demon slayer after his family is slaughtered and his sister turned into a demon.',
    year: 2019,
    studios: [{ mal_id: 43, name: 'ufotable' }],
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
  },
  {
    mal_id: 40748,
    url: 'https://myanimelist.net/anime/40748',
    images: {
      jpg: {
        image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pBrrPoint.jpg',
        small_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-bbBWj4pBrrPoint.jpg',
        large_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pBrrPoint.jpg',
      },
    },
    title: 'Jujutsu Kaisen',
    title_english: 'Jujutsu Kaisen',
    type: 'TV',
    episodes: 24,
    status: 'Finished Airing',
    score: 8.6,
    synopsis: 'A boy swallows a cursed talisman and becomes possessed, entering the secret world of Jujutsu Sorcerers.',
    year: 2020,
    studios: [{ mal_id: 569, name: 'MAPPA' }],
    genres: [{ mal_id: 1, name: 'Action' }, { mal_id: 37, name: 'Supernatural' }],
  }
];

export const searchAnime = async (query: string): Promise<JikanAnime[]> => {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const results = await fetchJikan('/anime', { q: query, limit: 10 });
    if (results && results.length > 0) {
      cache.set(cacheKey, results);
      return results;
    }
  } catch (err) {
    console.warn('[SearchAnime] Jikan failed, falling back to AniList...');
  }

  const anilistQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description
          episodes
          seasonYear
          genres
          averageScore
          studios(isMain: true) { nodes { id name } }
        }
      }
    }
  `;
  const anilistData = await fetchAniList(anilistQuery, { search: query });
  if (anilistData?.Page?.media && anilistData.Page.media.length > 0) {
    const mapped = anilistData.Page.media.map(mapAniListToJikan);
    cache.set(cacheKey, mapped);
    return mapped;
  }

  const filtered = FALLBACK_POPULAR_ANIME.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    (a.title_english && a.title_english.toLowerCase().includes(query.toLowerCase()))
  );
  return filtered.length > 0 ? filtered : FALLBACK_POPULAR_ANIME.slice(0, 4);
};

export const getAnimeById = async (id: string): Promise<JikanAnime> => {
  const cacheKey = `anime_${id}`;
  const cachedData = cache.get<JikanAnime>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const result = await fetchJikan(`/anime/${id}/full`);
    if (result) {
      cache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn(`[GetAnimeById] Jikan failed for ${id}, falling back to AniList...`);
  }

  const numId = parseInt(id, 10);
  const anilistQuery = `
    query ($id: Int, $idMal: Int) {
      Media(type: ANIME, idMal: $idMal, id: $id) {
        id
        idMal
        title { romaji english native }
        coverImage { extraLarge large medium }
        bannerImage
        description
        episodes
        seasonYear
        genres
        averageScore
        studios(isMain: true) { nodes { id name } }
      }
    }
  `;
  const anilistData = await fetchAniList(anilistQuery, { id: isNaN(numId) ? undefined : numId, idMal: isNaN(numId) ? undefined : numId });
  if (anilistData?.Media) {
    const mapped = mapAniListToJikan(anilistData.Media);
    cache.set(cacheKey, mapped);
    return mapped;
  }

  const fallback = FALLBACK_POPULAR_ANIME.find(a => String(a.mal_id) === String(id)) || FALLBACK_POPULAR_ANIME[0];
  return fallback;
};

export const getTopAnime = async (filter?: string, limit = 20): Promise<JikanAnime[]> => {
  const validFilters = ['airing', 'upcoming', 'bypopularity', 'favorite'];
  const activeFilter = filter && validFilters.includes(filter) ? filter : undefined;

  const cacheKey = `top_${activeFilter || 'default'}_${limit}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const results = await fetchJikan('/top/anime', { filter: activeFilter, limit });
    if (results && results.length > 0) {
      cache.set(cacheKey, results, DISCOVERY_TTL);
      return results;
    }
  } catch (err) {
    console.warn('[TopAnime] Jikan failed, falling back to AniList...');
  }

  const sortOrder = activeFilter === 'upcoming' ? 'POPULARITY_DESC' : 'SCORE_DESC';
  const statusFilter = activeFilter === 'airing' ? 'RELEASING' : (activeFilter === 'upcoming' ? 'NOT_YET_RELEASED' : undefined);

  const anilistQuery = `
    query ($limit: Int, $sort: [MediaSort], $status: MediaStatus) {
      Page(page: 1, perPage: $limit) {
        media(type: ANIME, sort: $sort, status: $status) {
          id
          idMal
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description
          episodes
          seasonYear
          genres
          averageScore
          studios(isMain: true) { nodes { id name } }
        }
      }
    }
  `;
  const anilistData = await fetchAniList(anilistQuery, { limit, sort: [sortOrder], status: statusFilter });
  if (anilistData?.Page?.media && anilistData.Page.media.length > 0) {
    const mapped = anilistData.Page.media.map(mapAniListToJikan);
    cache.set(cacheKey, mapped, DISCOVERY_TTL);
    return mapped;
  }

  return FALLBACK_POPULAR_ANIME;
};

export const getSeasonalAnime = async (limit = 20): Promise<JikanAnime[]> => {
  const cacheKey = `seasonal_${limit}`;
  const cachedData = cache.get<JikanAnime[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const results = await fetchJikan('/seasons/now', { limit });
    if (results && results.length > 0) {
      cache.set(cacheKey, results, DISCOVERY_TTL);
      return results;
    }
  } catch (err) {
    console.warn('[SeasonalAnime] Jikan failed, falling back to AniList...');
  }

  const anilistQuery = `
    query ($limit: Int) {
      Page(page: 1, perPage: $limit) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description
          episodes
          seasonYear
          genres
          averageScore
          studios(isMain: true) { nodes { id name } }
        }
      }
    }
  `;
  const anilistData = await fetchAniList(anilistQuery, { limit });
  if (anilistData?.Page?.media && anilistData.Page.media.length > 0) {
    const mapped = anilistData.Page.media.map(mapAniListToJikan);
    cache.set(cacheKey, mapped, DISCOVERY_TTL);
    return mapped;
  }

  return FALLBACK_POPULAR_ANIME;
};

export const getGenres = async (): Promise<any[]> => {
  const cacheKey = 'genres';
  const cachedData = cache.get<any[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const results = await fetchJikan('/genres/anime');
    if (results && results.length > 0) {
      cache.set(cacheKey, results, DISCOVERY_TTL);
      return results;
    }
  } catch (err) {
    console.warn('[Genres] Jikan failed, falling back to static genre list...');
  }

  const defaultGenres = [
    { mal_id: 1, name: 'Action', count: 4200 },
    { mal_id: 2, name: 'Adventure', count: 3100 },
    { mal_id: 4, name: 'Comedy', count: 6800 },
    { mal_id: 8, name: 'Drama', count: 4500 },
    { mal_id: 10, name: 'Fantasy', count: 4900 },
    { mal_id: 24, name: 'Sci-Fi', count: 3200 },
    { mal_id: 22, name: 'Romance', count: 2800 },
    { mal_id: 37, name: 'Supernatural', count: 2100 },
    { mal_id: 36, name: 'Slice of Life', count: 2400 },
    { mal_id: 30, name: 'Sports', count: 1100 },
    { mal_id: 7, name: 'Mystery', count: 1600 },
    { mal_id: 14, name: 'Horror', count: 850 }
  ];
  cache.set(cacheKey, defaultGenres, DISCOVERY_TTL);
  return defaultGenres;
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

  try {
    const results = await fetchJikan('/anime', params);
    if (results && results.length > 0) {
      cache.set(cacheKey, results, DISCOVERY_TTL);
      return results;
    }
  } catch (err) {
    console.warn('[DiscoverAnime] Jikan failed, falling back to AniList...');
  }

  const anilistQuery = `
    query ($limit: Int) {
      Page(page: 1, perPage: $limit) {
        media(type: ANIME, sort: SCORE_DESC) {
          id
          idMal
          title { romaji english native }
          coverImage { extraLarge large medium }
          bannerImage
          description
          episodes
          seasonYear
          genres
          averageScore
          studios(isMain: true) { nodes { id name } }
        }
      }
    }
  `;
  const anilistData = await fetchAniList(anilistQuery, { limit: params.limit || 20 });
  if (anilistData?.Page?.media && anilistData.Page.media.length > 0) {
    const mapped = anilistData.Page.media.map(mapAniListToJikan);
    cache.set(cacheKey, mapped, DISCOVERY_TTL);
    return mapped;
  }

  return FALLBACK_POPULAR_ANIME;
};

export const getProducerDetails = async (id: string): Promise<any> => {
  const cacheKey = `producer_${id}`;
  const cachedData = cache.get<any>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const result = await fetchJikan(`/producers/${id}/full`);
    if (result) {
      cache.set(cacheKey, result, DISCOVERY_TTL);
      return result;
    }
  } catch (err) {
    console.warn(`[GetProducerDetails] Jikan failed for producer ${id}`);
  }

  return { mal_id: Number(id), titles: [{ title: `Studio ${id}` }], about: 'Notable Japanese animation studio.' };
};
