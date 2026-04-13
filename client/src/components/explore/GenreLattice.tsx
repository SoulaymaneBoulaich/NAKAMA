import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { PlaylistSelectionModal } from '../common/PlaylistSelectionModal';

interface GenreLatticeProps {
  genres: any[];
  selectedGenres: number[];
  onToggleGenre: (id: number) => void;
  anime: any[];
}

export const GenreLattice: React.FC<GenreLatticeProps> = ({ 
  genres, 
  selectedGenres, 
  onToggleGenre,
  anime 
}) => {
  const [targetAnime, setTargetAnime] = useState<{id: number, title: string} | null>(null);

  return (
    <section className="px-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">Genre Lattice</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Convergence of Tagged Realities</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <Filter size={14} className="text-zinc-500" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {selectedGenres.length} Filters Active
          </span>
        </div>
      </div>

      {/* Genre Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.mal_id);
          return (
            <button
              key={genre.mal_id}
              onClick={() => onToggleGenre(genre.mal_id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isSelected 
                  ? 'bg-[var(--accent-dim)] border-[var(--accent-primary)] shadow-[0_0_20px_rgba(220,38,38,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-tighter italic transition-colors ${
                isSelected ? 'text-[var(--accent-primary)]' : 'text-zinc-500 group-hover:text-white'
              }`}>
                {genre.name}
              </span>
              <div className="absolute top-1 right-2 text-[8px] font-bold text-white/5 uppercase select-none">
                {genre.count ? `${(genre.count / 1000).toFixed(1)}k` : ''}
              </div>
            </button>
          )
        })}
      </div>

      {/* Results Matrix */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {anime.length > 0 ? (
            anime.map((item, index) => (
              <motion.div
                key={`${item.mal_id}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative h-[300px] rounded-2xl overflow-hidden border border-white/5 bg-[var(--bg-secondary)]"
              >
                <img 
                  src={item.images.jpg.large_image_url} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt="" 
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
                  <button 
                    onClick={() => setTargetAnime({id: item.mal_id, title: item.title})}
                    className="p-4 bg-[var(--accent-primary)] rounded-2xl text-white shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <Plus size={24} />
                  </button>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all delay-100">Quick Add</span>
                </div>

                {/* Bottom Title Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-[10px] font-black text-white uppercase italic tracking-tighter truncate leading-none">
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center">
               <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">No archives match the selected resonance</p>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      <PlaylistSelectionModal 
        isOpen={!!targetAnime}
        onClose={() => setTargetAnime(null)}
        animeId={targetAnime?.id || 0}
        animeTitle={targetAnime?.title || ''}
      />
    </section>
  );
};
