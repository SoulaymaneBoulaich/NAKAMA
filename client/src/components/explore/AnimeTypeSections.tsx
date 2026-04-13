import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Sparkles, Flame, Apple, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Globe: React.FC<{ size: number, className?: string, strokeWidth?: number }> = ({ size, className, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 3} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const types = [
  { id: 'tv', name: 'Infinite Series', icon: Tv, desc: 'Long-form narratives spanning multiple resonance arcs' },
  { id: 'movie', name: 'Cinematic Fragments', icon: Globe, desc: 'High-fidelity singular manifestations' },
  { id: 'ova', name: 'Hidden Streams', icon: Sparkles, desc: 'Supplemental resonance patterns' },
  { id: 'special', name: 'Anomalous Records', icon: Flame, desc: 'Unique one-off transmissions' },
];

const AnimeTypeSections: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 space-y-32">
      {types.map((type, idx) => {
        const Icon: any = type.icon;
        const isEven = idx % 2 === 0;

        return (
          <div 
            key={type.id}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-32`}
          >
            {/* Visual Side */}
            <motion.div 
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="relative aspect-[16/9] rounded-[4rem] overflow-hidden group cursor-pointer border border-[var(--border-color)]" onClick={() => navigate('/explore')}>
                <div className="absolute inset-0 bg-zinc-900 group-hover:bg-[var(--accent-primary)]/5 transition-colors duration-700" />
                
                {/* Abstract shape representing the type */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-1000">
                   <Icon size={250} strokeWidth={0.5} className="text-white" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-full text-white/20 group-hover:text-[var(--accent-primary)] group-hover:scale-110 transition-all">
                    <Icon size={80} strokeWidth={1} />
                  </div>
                </div>

                {/* Scanline decoration */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/40 to-transparent" />
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
                  <Apple size={16} className="text-[var(--accent-primary)]" />
                </div>
                <span className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-[0.4em] italic">Frequency Grade B</span>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {type.name}
                </h2>
                <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed max-w-sm">
                  {type.desc}. Synchronized with global release nodes for real-time tracking.
                </p>
              </div>

              <button 
                onClick={() => navigate('/explore')}
                className="flex items-center gap-4 px-10 py-5 bg-white/5 hover:bg-[var(--accent-primary)] rounded-2xl text-[10px] font-black uppercase text-white tracking-widest transition-all group shadow-xl"
              >
                Enter Domain
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default AnimeTypeSections;
