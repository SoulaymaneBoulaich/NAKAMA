import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useToast } from '../common/Toast';
import { SafeImage } from '../common/SafeImage';
import { AnimeStatusEnum } from '../../../../shared/types';

export const SpotlightSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();
  
  const [trending, setTrending] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/public/trending');
        setTrending((response.data || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching trending spotlight:', err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (trending.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % trending.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [trending]);

  const handleAddToList = async (animeId: number) => {
    if (!user) {
      openAuthModal('signup');
      return;
    }

    try {
      await api.post('/entries', {
        animeId: String(animeId),
        status: AnimeStatusEnum.PLAN_TO_WATCH,
        episodeProgress: 0
      });
      addToast('success', 'Added to your list');
    } catch (error: any) {
      if (error.response?.status === 401) {
        openAuthModal('login');
      } else {
        addToast('error', 'Could not add to list');
      }
    }
  };

  const handleExploreInfo = (mal_id: number) => {
    if (!user) {
      openAuthModal('login');
    } else {
      navigate(`/anime/${mal_id}`);
    }
  };

  if (trending.length === 0) {
    return (
      <section className="w-full h-[550px] bg-[var(--bg-secondary)114] flex items-center justify-center border-t border-[#1e1e24]">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
           <span className="font-jetbrains text-[0.65rem] tracking-[0.3em] text-[#3f3f46]">SYNCHRONIZING SPOTLIGHT</span>
        </div>
      </section>
    );
  }

  const activeAnime = trending[currentIndex];

  return (
    <section className="relative w-full h-[550px] overflow-hidden border-t border-b border-[#1e1e24] bg-[var(--bg-primary)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAnime.mal_id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
             <SafeImage 
               src={activeAnime.images.jpg.large_image_url} 
               alt={activeAnime.title}
               className="w-full h-full opacity-40 blur-xl scale-110"
             />
             <SafeImage 
               src={activeAnime.images.jpg.large_image_url} 
               alt={activeAnime.title}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover hidden md:block opacity-20"
             />
          </div>

          {/* Dark Polish Overlay */}
          <div 
            className="absolute inset-0 z-1" 
            style={{
              background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.7) 40%, rgba(10,10,12,0.4) 100%)'
            }}
          />
          
          {/* Main Content Pane */}
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-8 md:px-16 flex items-center">
            <div className="flex flex-col md:flex-row items-center gap-12 w-full">
              
              {/* Poster View */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden md:block w-[260px] h-[380px] shrink-0 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-[var(--border-color)]"
              >
                 <SafeImage src={activeAnime.images.jpg.large_image_url} alt={activeAnime.title} className="w-full h-full" />
              </motion.div>

              {/* Text View */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <span className="inline-block font-jetbrains text-[0.65rem] tracking-[0.5em] text-[var(--accent-primary)] mb-6 uppercase border-b border-[var(--accent-primary)]/30 pb-1">
                    SPOTLIGHT AIRING
                  </span>
                  <h2 className="font-outfit font-extrabold text-4xl md:text-[3.5rem] text-[#f4f4f5] leading-[1] mb-6 drop-shadow-2xl">
                    {activeAnime.title}
                  </h2>
                  <p className="font-dm-sans text-[1rem] text-[#71717a] max-w-xl md:max-w-lg mb-10 leading-relaxed mx-auto md:mx-0 line-clamp-3">
                    {activeAnime.synopsis || 'Dive into the latest arc of this seasonal masterpiece.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <button 
                      onClick={() => handleAddToList(activeAnime.mal_id)}
                      className="font-dm-sans font-bold text-[0.9rem] text-white px-8 py-3.5 rounded-full bg-[var(--accent-primary)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105 transition-all"
                    >
                      ADD TO LIST
                    </button>
                    <button 
                      onClick={() => handleExploreInfo(activeAnime.mal_id)}
                      className="font-dm-sans font-bold text-[0.9rem] text-[#f4f4f5] px-8 py-3.5 rounded-full border border-[#1e1e24] bg-white/5 hover:bg-white/10 transition-all"
                    >
                      EXPLORE INFO
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bars Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {trending.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className="group py-2"
          >
             <div className={`h-[2px] transition-all duration-700 ${idx === currentIndex ? 'w-12 bg-[var(--accent-primary)]' : 'w-4 bg-[#1e1e24] group-hover:bg-[#3f3f46]'}`} />
          </button>
        ))}
      </div>
    </section>
  );
};
