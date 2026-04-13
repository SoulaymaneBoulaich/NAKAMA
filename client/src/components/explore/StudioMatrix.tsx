import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import jikanApi from '../../api/jikan';

interface Studio {
  id: number;
  name: string;
  logo: string; // We'll use custom monochromatic icons/SVGs
}

const STUDIOS: Studio[] = [
  { id: 569, name: 'MAPPA', logo: 'M' },
  { id: 43, name: 'Ufotable', logo: 'U' },
  { id: 4, name: 'Bones', logo: 'B' },
  { id: 11, name: 'Madhouse', logo: 'MAD' },
  { id: 2, name: 'Kyoto Animation', logo: 'KYO' },
];

export const StudioMatrix: React.FC = () => {
  const [selectedStudio, setSelectedStudio] = useState<Studio>(STUDIOS[0]);
  const [studioAnime, setStudioAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudioAnime(selectedStudio.id);
  }, [selectedStudio]);

  const fetchStudioAnime = async (id: number) => {
    setLoading(true);
    try {
      // Use Jikan search with producer filter
      const { data } = await jikanApi.get(`/anime?producers=${id}&order_by=score&sort=desc&limit=6`);
      setStudioAnime(data.data);
    } catch (err) {
      console.error('Failed to fetch studio anime', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">The Studio Matrix</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Forge of Manifestation</p>
        </div>

        {/* Studio Selectors */}
        <div className="flex flex-wrap gap-4">
          {STUDIOS.map(studio => (
            <button
              key={studio.id}
              onClick={() => setSelectedStudio(studio)}
              className={`px-8 py-4 rounded-2xl border transition-all relative overflow-hidden group ${
                selectedStudio.id === studio.id 
                  ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20 scale-105' 
                  : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="text-lg font-black italic tracking-tighter uppercase">{studio.name}</span>
              {selectedStudio.id === studio.id && (
                <motion.div 
                  layoutId="studio-active"
                  className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-40"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Expansion Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStudio.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] p-10 relative overflow-hidden group/panel"
        >
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 p-20 text-[10rem] font-black italic text-white/5 pointer-events-none select-none -translate-y-1/4 translate-x-1/4">
             {selectedStudio.name}
           </div>

           <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
             {loading ? (
               [...Array(6)].map((_, i) => (
                 <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" />
               ))
             ) : (
               studioAnime.map((anime, index) => (
                 <div key={`${selectedStudio.id}-${anime.mal_id}-${index}`} className="group cursor-pointer space-y-3">
                   <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-[var(--bg-tertiary)] relative">
                     <img src={anime.images.jpg.large_image_url} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ArrowUpRight className="text-white" size={32} />
                     </div>
                   </div>
                   <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter line-clamp-1 group-hover:text-[var(--accent-primary)] transition-colors">
                     {anime.title}
                   </h4>
                 </div>
               ))
             )}
           </div>

           <div className="mt-12 flex justify-center">
             <button className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all group">
               View All {selectedStudio.name} Archives
               <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
           </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
