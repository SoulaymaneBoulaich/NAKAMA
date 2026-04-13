import type { Request, Response } from 'express';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheItem<any>> = {};
const TWO_HOURS = 2 * 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;

/**
 * EVERGREEN FALLBACK DATA
 */
const EVERGREEN_DATA: Record<string, any> = {
  popular: [
    { mal_id: 21, title: 'One Piece', images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg' } }, score: 8.73, synopsis: 'Gol D. Roger was known as the "Pirate King"...' },
    { mal_id: 38000, title: 'Demon Slayer: Kimetsu no Yaiba', images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg' } }, score: 8.49, synopsis: 'Ever since the death of his father...' },
    { mal_id: 40748, title: 'Jujutsu Kaisen', images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222l.jpg' } }, score: 8.65, synopsis: 'Idly indulging in baseless paranormal activities...' }
  ],
  hero: [
    { mal_id: 21, title: 'One Piece', images: { jpg: { large_image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851l.jpg' } }, synopsis: 'Adventure on the high seas!' }
  ],
  character_nami: { 
    name: 'Nami', 
    about: 'Nami is a pirate and the navigator of the Straw Hat Pirates.', 
    images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/characters/2/263249.jpg' } } 
  }
};

/**
 * JIKAN REQUEST QUEUE
 */
let lastRequestTime = 0;
const MIN_GAP = 1200; 

const throttledFetch = async (url: string) => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  
  if (timeSinceLast < MIN_GAP) {
    const delay = MIN_GAP - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
  return fetch(url);
};

const fetchFromJikan = async (key: string, url: string, cacheTime: number) => {
  const now = Date.now();
  
  if (cache[key] && now - cache[key].timestamp < cacheTime) {
    return cache[key].data;
  }

  try {
    console.log(`[Jikan] Fetching ${key}...`);
    const response = await throttledFetch(url);
    
    if (!response.ok) {
      if (response.status === 429 && cache[key]) {
        console.warn(`[Jikan] Rate limited for ${key}, serving stale cache.`);
        return cache[key].data;
      }
      throw new Error(`Jikan failed: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.data || [];
    
    cache[key] = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.error(`[Jikan Error] ${key}:`, error);
    if (cache[key]) return cache[key].data;
    return EVERGREEN_DATA[key] || [];
  }
};

export const getNews = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache['news'] && now - cache['news'].timestamp < TWO_HOURS) {
      return res.json(cache['news'].data);
    }

    const feed = await parser.parseURL('https://www.animenewsnetwork.com/all/rss.xml');
    
    const newsItems = feed.items.slice(0, 12).map((item: any) => {
      let summary = item.contentSnippet || item.content || '';
      summary = summary.replace(/<[^>]*>?/gm, ''); 
      
      let imageUrl = null;

      if (item.mediaContent && item.mediaContent[0]) {
        imageUrl = item.mediaContent[0].$.url;
      } 
      else if (item.mediaThumbnail) {
        imageUrl = item.mediaThumbnail.$.url;
      }
      else {
        const source = item.contentEncoded || item.description || item.content || '';
        const imgMatch = source.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }

      return {
        title: item.title,
        summary: summary.substring(0, 180) + (summary.length > 180 ? '...' : ''),
        link: item.link,
        imageUrl,
        publishedAt: item.isoDate || item.pubDate,
        category: item.categories ? item.categories[0] : 'News'
      };
    });

    cache['news'] = { data: newsItems, timestamp: now };
    res.json(newsItems);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.json(cache['news'] ? cache['news'].data : []);
  }
};

export const getHero = async (req: Request, res: Response) => {
  const data = await fetchFromJikan('hero', 'https://api.jikan.moe/v4/seasons/now?limit=25', SIX_HOURS);
  res.json(data);
};

export const getPopular = async (req: Request, res: Response) => {
  const data = await fetchFromJikan('seasonal_popular', 'https://api.jikan.moe/v4/top/anime?filter=airing&limit=10', SIX_HOURS);
  res.json(data);
};

export const getTrending = async (req: Request, res: Response) => {
  const data = await fetchFromJikan('trending', 'https://api.jikan.moe/v4/top/anime?filter=airing&limit=10', SIX_HOURS);
  res.json(data);
};

export const getCharacter = async (req: Request, res: Response) => {
  const character = await fetchFromJikan('character_nami', 'https://api.jikan.moe/v4/characters/73', SIX_HOURS);
  res.json(character);
};
