import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListPlus, ChevronLeft, ChevronRight, Star, Calendar, PlaySquare } from 'lucide-react';
import { PlaylistSelectionModal } from '../common/PlaylistSelectionModal';

interface ExploreHeroProps {
  anime: any[];
}

export const ExploreHero: React.FC<ExploreHeroProps> = ({ anime }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const next = () => setCurrentIndex(prev => (prev + 1) % anime.length);
  const prev = () => setCurrentIndex(prev => (prev - 1 + anime.length) % anime.length);

  const current = anime[currentIndex];
  if (!current) return null;

  return (
    <section className="relative w-full h-[85vh] overflow-hidden bg-[var(--bg-primary)]">
      {/* Background Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.mal_id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src={current.images.jpg.large_image_url} 
            alt={current.title}
            className="w-full h-full object-cover"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layout */}
      <div className="relative z-10 h-full max-w-[1600px] mx-auto px-8 flex flex-col justify-center">
        <motion.div
          key={`content-${current.mal_id}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-3xl space-y-8"
        >
          {/* Top Metadata */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent-primary)] rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                <Star size={12} fill="currentColor" />
                {current.score || '8.5'}
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-[10px] font-black uppercase tracking-widest border border-white/5">
                <Calendar size={12} />
                {current.year || '2024'}
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-[10px] font-black uppercase tracking-widest border border-white/5">
                <PlaySquare size={12} />
                {current.type || 'TV'}
             </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.9]">
            {current.title}
          </h1>

          {/* Synopsis */}
          <p className="text-lg text-zinc-400 font-bold uppercase tracking-widest max-w-xl line-clamp-3">
             {current.synopsis || "Unlocking the narrative potential of this archive manifestation. A journey into the core of friendship and legacy."}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 bg-[var(--accent-primary)] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-[var(--accent-primary)]/20 active:scale-95"
            >
              <ListPlus size={18} /> Add to Playlist
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Navigation & Counter */}
      <div className="absolute bottom-12 right-12 z-20 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-[var(--accent-primary)] transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-[var(--accent-primary)] transition-all">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/5">
          <span className="text-[var(--accent-primary)] text-xl font-black italic">{currentIndex + 1}</span>
          <span className="text-white/20 text-xs font-black">/</span>
          <span className="text-white/40 text-sm font-black italic">{anime.length}</span>
        </div>
      </div>

      <PlaylistSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        animeId={current.mal_id}
        animeTitle={current.title}
      />
    </section>
  );
};
