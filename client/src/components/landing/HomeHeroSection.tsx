import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import api from '../../api/axios';

export const HomeHeroSection: React.FC = () => {
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const response = await api.get('/public/hero');
        const urls = response.data
          ?.map((anime: any) => anime.images.jpg.large_image_url)
          .filter(Boolean) || [];
        setPosters(urls);
      } catch (error) {
        console.error('Error fetching hero posters:', error);
      }
    };
    fetchPosters();
  }, []);

  // Performance Optimization: Reduce DOM nodes and duplication
  // 5 columns is enough for the effect without killing performance
  const columns = [1, 2, 3, 4, 5];
  
  // 2x duplication is enough for a seamless loop if the duration and offset match
  const optimizedPosters = useMemo(() => [...posters, ...posters], [posters]);

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center">
      
      {/* 3D INFINITE POSTER WALL */}
      <div className="absolute inset-0 z-0 perspective-2000 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ rotateY: -15, rotateX: 10, translateZ: -200 }}
          animate={{ rotateY: -25, rotateX: 15, translateZ: -300 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="absolute inset-[-20%] flex gap-6 opacity-20 preserve-3d"
          style={{ willChange: 'transform' }}
        >
          {columns.map((col) => (
            <div key={col} className="flex-1 min-w-[250px] preserve-3d">
              <motion.div 
                animate={{ y: col % 2 === 0 ? [0, -1500] : [-1500, 0] }}
                transition={{ 
                  duration: 40 + (col * 8), 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="flex flex-col gap-6 preserve-3d"
                style={{ willChange: 'transform' }}
              >
                {optimizedPosters.map((url, i) => (
                  <div key={i} className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-zinc-900/50">
                    <img 
                      src={url} 
                      alt="" 
                      loading="lazy"
                      className="w-full h-full object-cover grayscale transition-opacity duration-1000" 
                      onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                      style={{ opacity: 0 }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* OVERLAYS */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 z-10 bg-[var(--bg-primary)]/60 backdrop-blur-[1px]" />

      {/* CONTENT */}
      <div className="relative z-20 text-center px-8 flex flex-col items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="relative mb-8 flex flex-col items-center"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50">
              NAKAMA
            </span>
            <h1 className="font-jp font-black text-[clamp(5rem,12vw,13rem)] tracking-widest text-[var(--text-primary)] drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] opacity-100">
              仲間
            </h1>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="max-w-2xl font-dm-sans text-zinc-400 text-lg md:text-xl tracking-[0.2em] leading-relaxed mt-[-2.5rem] uppercase font-bold"
        >
          Unity • Friendship • Legacy
        </motion.p>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-30"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Archive Depth</span>
        <ChevronDown size={18} className="text-[var(--accent-primary)]" />
      </motion.div>
    </div>
  );
};
