import React, { useState, useEffect } from 'react';
import { getTopAnime } from '../../api/jikan';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Info } from 'lucide-react';

const Top10ThisWeek: React.FC = () => {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        setError(false);
        const data = await getTopAnime('bypopularity', 10);
        setAnime(data || []);
      } catch (err) {
        console.error('Failed to fetch top 10', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTop10();
  }, []);

  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  const weekLabel = `ARCHIVE UPDATED · ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()} — ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;

  if (loading) return (
    <div className="px-6 md:px-10 mt-12">
      <div className="h-[400px] w-full bg-[var(--bg-secondary)114] animate-pulse rounded-[32px] border border-[var(--border-color)]" />
    </div>
  );

  if (error && anime.length === 0) return (
    <div className="px-6 md:px-10 mt-12">
      <div className="h-[200px] border border-[var(--border-color)] rounded-[32px] bg-[var(--bg-secondary)114] flex flex-col items-center justify-center gap-4">
        <Info className="text-[#7c3aed]" size={32} />
        <p className="text-white/40 text-xs font-black uppercase tracking-widest">Archive sync interrupted.</p>
        <button onClick={() => window.location.reload()} className="text-[#7c3aed] text-[0.6rem] font-black uppercase tracking-[0.3em] hover:text-white transition-all">Manual Override</button>
      </div>
    </div>
  );

  return (
    <div className="px-6 md:px-10 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="font-jetbrains text-[0.6rem] tracking-[0.3em] text-[#7c3aed] uppercase block mb-2 font-bold opacity-80">
            Current Popularity Index
          </span>
          <h2 className="font-syne font-[800] text-4xl text-[#f4f4f5] italic uppercase tracking-tighter leading-none">
            Top 10 This Week<span className="text-[#7c3aed]">.</span>
          </h2>
        </div>
        <span className="font-jetbrains text-[0.65rem] text-[#52525b] font-black tracking-widest uppercase bg-white/5 border border-[var(--border-color)] px-4 py-2 rounded-full backdrop-blur-md">
          {weekLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 border-t border-[var(--border-color)] pt-6">
        {anime.map((item, index) => (
          <div 
            key={item.mal_id}
            onClick={() => navigate(`/anime/${item.mal_id}`)}
            className="flex items-center gap-6 py-4 px-6 group cursor-pointer hover:bg-[var(--bg-secondary)114] -mx-6 rounded-[24px] transition-all border-b border-[var(--border-color)] last:border-0 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <span className="font-syne font-[800] text-5xl text-[#1e1e24] group-hover:text-[#7c3aed]/20 transition-all w-16 text-center italic leading-none flex-shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>
            
            <div className="w-16 h-24 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0 shadow-2xl relative z-10 transition-transform group-hover:scale-105 group-hover:-rotate-2">
              <img src={item.images.webp.small_image_url} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="font-syne font-bold text-base text-[#f4f4f5] group-hover:text-[#7c3aed] transition-all truncate uppercase italic tracking-tight mb-1 group-hover:tracking-normal">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-3 mb-2">
                {item.genres.slice(0, 2).map((g: any) => (
                  <span key={g.mal_id} className="font-jetbrains text-[0.6rem] text-[#52525b] uppercase font-black tracking-widest">
                    {g.name}
                  </span>
                ))}
              </div>
              <div className="text-[0.7rem] text-[#71717a] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span>{item.type}</span>
                <span className="w-1 h-1 bg-[#232329] rounded-full" />
                <span className="text-white/20">{item.episodes || '?'} SECTIONS</span>
              </div>
            </div>

            <div className="text-right relative z-10 flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[#7c3aed] text-glow">
                <Star size={14} fill="currentColor" />
                <span className="font-jetbrains text-2xl font-black italic leading-none tracking-tighter">
                  {item.score || '0.0'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-[var(--border-color)] flex items-center justify-center text-[#7c3aed] mt-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 font-bold">
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Top10ThisWeek;
