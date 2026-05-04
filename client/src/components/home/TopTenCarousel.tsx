import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight, Play, Info, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../common/Spinner';
import { SafeImage } from '../common/SafeImage';

export const TopTenCarousel: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(4); // Anime #5 is index 4
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const response = await api.get('/anime/top', { params: { limit: 10 } });
        setItems(response.data || []);
      } catch (err) {
        console.error('Error fetching top 10:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  const getWeekLabel = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    return `WEEK OF ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  if (loading) return <div className="h-[600px] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-8 mb-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                 <Trophy size={16} className="text-yellow-500" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500">Weekly Charts</span>
            </div>
            <h2 className="text-6xl font-black tracking-tighter">THE <span className="text-white">DYNAMIC</span> <span className="italic text-zinc-700">10</span></h2>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl">
             <Calendar size={14} className="text-zinc-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{getWeekLabel()}</span>
          </div>
        </div>
      </div>

      {/* The Carousel Stack */}
      <div className="relative h-[550px] flex items-center justify-center perspective-2000">
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {items.map((anime, idx) => {
              const position = idx - focusedIndex;
              const isCenter = position === 0;
              const absPosition = Math.abs(position);
              
              // Only show items near the center for performance and focus
              if (absPosition > 4) return null;

              return (
                <motion.div
                  key={anime.mal_id}
                  layout
                  initial={{ opacity: 0, x: position * 100, scale: 0.8 }}
                  animate={{ 
                    opacity: 1 - absPosition * 0.2,
                    x: position * (isCenter ? 0 : 200),
                    z: -absPosition * 100,
                    scale: isCenter ? 1.1 : 0.8,
                    rotateY: position * -15,
                    zIndex: 10 - absPosition
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  }}
                  onClick={() => handleFocus(idx)}
                  className={`absolute w-[300px] aspect-[2/3] cursor-pointer preserve-3d group`}
                >
                  {/* Card Content */}
                  <div className={`relative w-full h-full rounded-[2rem] overflow-hidden border-2 transition-colors duration-500
                    ${isCenter ? 'border-white shadow-[0_0_80px_rgba(255,255,255,0.15)]' : 'border-white/5 shadow-2xl'}`}
                  >
                    <SafeImage 
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                      className={`w-full h-full object-cover transition-all duration-700
                        ${isCenter ? 'grayscale-0' : 'grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-75'}`}
                      alt={anime.title}
                    />

                    {/* Rank Indicator */}
                    <div className={`absolute top-6 left-6 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl backdrop-blur-xl border
                      ${isCenter ? 'bg-white text-black border-white' : 'bg-black/50 text-white border-white/10'}`}>
                      {idx + 1}
                    </div>

                    {/* Info Overlay (Only for center) */}
                    <AnimatePresence>
                      {isCenter && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8"
                        >
                          <h3 className="text-2xl font-black tracking-tight mb-2 leading-tight uppercase italic">{anime.title}</h3>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg border border-white/10">
                              <span className="text-yellow-500 text-sm">★</span>
                              <span className="text-sm font-bold">{anime.score}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{anime.type} • {anime.episodes} EPS</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/anime/${anime.mal_id}`);
                            }}
                            className="w-full py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Play size={12} className="fill-black" /> Enter Archives
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6 mt-12 relative z-20">
        <button 
          onClick={() => handleFocus(Math.max(0, focusedIndex - 1))}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-110 transition-all text-white disabled:opacity-20"
          disabled={focusedIndex === 0}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === focusedIndex ? 'w-8 bg-white' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>
        <button 
          onClick={() => handleFocus(Math.min(9, focusedIndex + 1))}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-110 transition-all text-white disabled:opacity-20"
          disabled={focusedIndex === 9}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};
