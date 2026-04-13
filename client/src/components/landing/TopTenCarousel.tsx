import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

export const TopTenCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [topAnime, setTopAnime] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const response = await api.get('/public/popular');
        setTopAnime(response.data || []);
      } catch (err) {
        console.error('Error fetching top anime:', err);
      }
    };
    fetchTop();
  }, []);

  useEffect(() => {
    let interval: any;
    if (!isHovering && scrollRef.current && topAnime.length > 0) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollBy({ left: 30, behavior: 'smooth' });
          if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isHovering, topAnime]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getWeekLabel = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1;
    const start = new Date(curr.setDate(first));
    const end = new Date(curr.setDate(curr.getDate() + 6));
    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    return `WEEK OF ${format(start)} — ${format(end)}`;
  };

  const handleAnimeClick = (id: number) => {
    if (!user) {
      openAuthModal('login');
    } else {
      navigate(`/anime/${id}`);
    }
  };

  return (
    <section className="bg-[var(--bg-primary)] pt-20 pb-20 overflow-hidden relative group text-[#f4f4f5]">
      <div className="px-8 max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-6">
          <div className="space-y-1">
             <span className="font-jetbrains text-[0.6rem] tracking-[0.2em] text-[var(--accent-primary)] uppercase">Global Ranking</span>
             <h2 className="font-outfit font-extrabold text-3xl md:text-[2.2rem] text-[#f4f4f5] leading-none">Top 10 This Week</h2>
          </div>
          <span className="font-jetbrains text-[0.65rem] tracking-widest text-[#71717a] uppercase pb-1 border-b border-[#1e1e24] mb-1">
            {getWeekLabel()}
          </span>
        </div>
      </div>

      <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        {/* Navigation Arrows */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto hide-scrollbar gap-6 px-8 pb-10 pt-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topAnime.length === 0 ? (
            [...Array(10)].map((_, i) => (
              <div key={i} className="w-[220px] h-[320px] shrink-0 bg-[var(--bg-secondary)114] border border-[#1e1e24] rounded-2xl animate-pulse" />
            ))
          ) : (
            topAnime.map((anime, idx) => (
              <motion.div 
                key={anime.mal_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleAnimeClick(anime.mal_id)}
                className="group/card w-[220px] shrink-0 relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:z-10"
              >
                <div className="relative w-full h-[320px]">
                  <SafeImage 
                    src={anime.images.jpg.large_image_url} 
                    alt={anime.title} 
                    className="w-full h-full"
                  />
                  
                  {/* Rank Badge */}
                   <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-lg bg-black/80 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center">
                    <span className="font-outfit font-bold text-[0.9rem] text-white">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Gradient Decoration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity" />
                  
                  {/* Hover Info */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 translate-y-2 group-hover/card:translate-y-0 transition-transform text-left">
                    <h3 className="font-outfit font-bold text-[0.95rem] text-white line-clamp-2 leading-tight mb-2 drop-shadow-lg">
                      {anime.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                        <span className="text-[var(--accent-primary)] text-xs">★</span>
                        <span className="font-jetbrains text-[0.75rem] text-white/90">
                          {anime.score || 'N/A'}
                        </span>
                      </div>
                      <span className="font-jetbrains text-[0.6rem] text-white/50 uppercase tracking-tighter">
                        {anime.type || 'TV'}
                      </span>
                    </div>

                    <div className="mt-4 opacity-0 group-hover/card:opacity-100 transition-opacity">
                       <button className="w-full bg-white text-black rounded-xl py-2 font-dm-sans font-bold text-[0.75rem] hover:bg-[var(--accent-primary)] hover:text-white transition-all">
                         VIEW DETAILS
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
