import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TrendingUp, Star } from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

const TrendingAnimeWidget: React.FC = () => {
  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: async () => {
      // Fetching from Jikan via our proxy or directly if allowed
      // Using our API is safer for caching
      const res = await axios.get('https://api.jikan.moe/v4/top/anime?filter=airing&limit=5');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });

  return (
    <div className="bg-zinc-900 border border-[var(--border-color)] rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border-color)] bg-zinc-800/30 flex items-center gap-2">
        <TrendingUp size={16} className="text-red-500" />
        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Airing Now</h3>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="p-4 animate-pulse flex gap-3">
              <div className="w-12 h-16 bg-zinc-800 rounded" />
              <div className="flex-1 space-y-2">
                <div className="w-full h-3 bg-zinc-800 rounded" />
                <div className="w-1/2 h-2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))
        ) : (
          trending?.map((anime: any) => (
            <a 
              key={anime.mal_id}
              href={anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 flex gap-3 hover:bg-zinc-800/50 transition-colors group"
            >
              <SafeImage 
                src={anime.images.jpg.small_image_url} 
                alt={anime.title} 
                className="w-12 h-16 object-cover rounded-md border border-[var(--border-color)]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
                  {anime.title_english || anime.title}
                </h4>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-[10px] text-zinc-400 font-medium">{anime.score}</span>
                  <span className="text-[10px] text-zinc-600 ml-1">• {anime.episodes || '?'} EPS</span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
      
      <button className="w-full py-3 text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-bold transition-colors">
        View Full Seasonal List
      </button>
    </div>
  );
};

export default TrendingAnimeWidget;
