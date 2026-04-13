import React from 'react';
import { Bell, PlayCircle, Star, Calendar } from 'lucide-react';

interface HorizonTrackProps {
  title: string;
  subtitle: string;
  anime: any[];
  type: 'seasonal' | 'upcoming' | 'recommended';
}

export const HorizonTrack: React.FC<HorizonTrackProps> = ({ title, subtitle, anime, type }) => {
  return (
    <section className="px-8 space-y-8">
      <div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{title}</h2>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">{subtitle}</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x select-none">
        {anime.map((item, index) => (
          <div 
            key={`${title}-${item.mal_id}-${index}`} 
            className="flex-shrink-0 w-[200px] md:w-[240px] snap-start group cursor-pointer space-y-4"
          >
            {/* Card Frame */}
            <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[var(--bg-secondary)] shadow-2xl">
              <img 
                src={item.images.jpg.large_image_url} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="" 
              />
              
              {/* Overlays Based on Type */}
              <div className="absolute top-4 right-4 z-20">
                {type === 'seasonal' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-green-500/20 shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Live</span>
                  </div>
                ) : type === 'upcoming' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                    <Calendar size={10} className="text-[var(--accent-primary)]" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                       {item.aired?.prop?.from?.month || 'OCT'} {item.aired?.prop?.from?.year || '2026'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 backdrop-blur-md rounded-full border border-red-500/30 shadow-lg">
                    <Star size={10} className="text-red-500" fill="currentColor" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Match</span>
                  </div>
                )}
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                    {type === 'seasonal' ? (
                      <>
                        <PlayCircle size={14} /> Resume Sync
                      </>
                    ) : type === 'upcoming' ? (
                      <>
                        <Bell size={14} /> Notify Me
                      </>
                    ) : (
                      <>
                        <Star size={14} /> View Affinity
                      </>
                    )}
                  </button>
              </div>
            </div>

            {/* Info */}
            <div className="px-2">
              <div className="flex items-center gap-2 mb-1">
                 <Star size={10} className="text-[var(--accent-primary)]" fill="currentColor" />
                 <span className="text-[10px] font-black text-[var(--accent-primary)] italic">{item.score || 'N/A'}</span>
                 <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">• {item.type || 'TV'}</span>
              </div>
              <h4 className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
