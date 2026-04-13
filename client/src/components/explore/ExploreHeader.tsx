import React from 'react';
import { Search, Sparkles, Tv, Flame, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExploreHeaderProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const genres = [
  { id: 'all', name: 'Infinite', icon: Globe },
  { id: 'shonen', name: 'Shonen', icon: Flame },
  { id: 'seinen', name: 'Seinen', icon: Tv },
  { id: 'fantasy', name: 'Ethereal', icon: Sparkles },
  { id: 'action', name: 'Kinetic', icon: Flame },
];

const ExploreHeader: React.FC<ExploreHeaderProps> = ({ 
  selectedGenre, 
  onGenreChange,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="pt-32 pb-16 px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-12"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[var(--accent-primary)]" />
              <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.5em] italic">Archive Discovery</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
              Explore <br />
              <span className="text-transparent border-text-white drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]">Resonance</span>
            </h1>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs max-w-md leading-relaxed">
              Synthesizing seasonal data streams and local collective ratings to manifest the definitive anime hierarchy.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-md">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Query the void..."
                className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-8 text-white font-bold italic transition-all focus:outline-none focus:border-[var(--accent-primary)]/40 focus:bg-white/10 placeholder:text-zinc-800"
              />
            </div>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => {
                const Icon = g.icon;
                const isActive = selectedGenre === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => onGenreChange(g.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'bg-[var(--accent-primary)] text-white shadow-[0_10px_20px_rgba(220,38,38,0.2)]' 
                        : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={12} strokeWidth={3} />
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExploreHeader;
