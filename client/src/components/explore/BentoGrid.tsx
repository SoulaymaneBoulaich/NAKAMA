import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Maximize2, Minimize2, Sparkles, Tv, Flame, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BentoGridProps {
  anime: any[];
}

const BentoGrid: React.FC<BentoGridProps> = ({ anime }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  if (!anime || anime.length === 0) return null;

  // Bento configuration
  const gridConfig = [
    { span: 'md:col-span-4 md:row-span-2', height: 'h-[600px]' }, // Feature card
    { span: 'md:col-span-2 md:row-span-1', height: 'h-[290px]' },
    { span: 'md:col-span-2 md:row-span-1', height: 'h-[290px]' },
    { span: 'md:col-span-2 md:row-span-2', height: 'h-[600px]' },
    { span: 'md:col-span-2 md:row-span-1', height: 'h-[290px]' },
    { span: 'md:col-span-2 md:row-span-1', height: 'h-[290px]' },
  ];

  const displayAnime = expanded ? anime : anime.slice(0, 6);

  const toggleExpanded = () => setExpanded((prev: boolean) => !prev);

  const typeIcons: any = {
    'TV': Tv,
    'Movie': Globe,
    'Special': Sparkles,
    'OVA': Flame,
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-xl">
            <Plus size={18} className="text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Collective Grid</h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aggregated resonance patterns</p>
          </div>
        </div>
        
        <button 
          onClick={toggleExpanded}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest transition-all group"
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {expanded ? 'Collapse Manifest' : 'Expand Lattice'}
          <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] animate-pulse" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-fr">
        {displayAnime.map((item, idx) => {
          const config = gridConfig[idx % gridConfig.length];
          const Icon = typeIcons[item.type] || Tv;

          return (
            <motion.div
              key={item.mal_id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate(`/anime/${item.mal_id}`)}
              className={`${config.span} ${config.height} relative group rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-[var(--border-color)] cursor-pointer shadow-2xl`}
            >
              {/* Background with parallax effect on hover */}
              <img 
                src={item.images?.jpg?.large_image_url} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={item.title} 
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              <div className="absolute inset-0 bg-[var(--accent-primary)]/0 group-hover:bg-[var(--accent-primary)]/5 transition-colors duration-500" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-primary)] rounded-full text-[10px] font-black text-white uppercase italic shadow-lg shadow-[var(--accent-primary)]/20">
                    <Icon size={12} />
                    {item.type}
                  </div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.status}</span>
                </div>

                <h3 className={`font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 ${idx % 6 === 0 ? 'text-4xl' : 'text-xl'}`}>
                  {item.title}
                </h3>

                <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black text-white/60 uppercase tracking-tighter italic">
                    {item.episodes || '?'} Fragments
                  </div>
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <Sparkles size={14} className="text-[var(--accent-primary)] animate-pulse" />
                </div>
              </div>

              {/* Rank Badge for feature card */}
              {idx % 6 === 0 && (
                <div className="absolute top-8 left-8 w-16 h-16 rounded-3xl bg-black/40 backdrop-blur-2xl border border-[var(--border-color)] flex items-center justify-center">
                  <span className="text-3xl font-black text-white/20 italic">0{Math.floor(idx/6) + 1}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BentoGrid;
