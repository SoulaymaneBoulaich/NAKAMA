import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChronicleCardProps {
  chronicle: {
    id: string;
    title: string;
    description: string;
    coverUrl?: string;
    owner: {
      username: string;
      avatar?: string;
    };
    tags: string[];
    status: string;
    totalViews: number;
    totalChapters: number;
    averageRating?: number;
    updatedAt: string;
  };
}

export const ChronicleCard: React.FC<ChronicleCardProps> = ({ chronicle }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-zinc-900/50 border border-[var(--border-color)] rounded-3xl overflow-hidden hover:border-[var(--accent-primary)]/50 transition-all duration-300 shadow-xl shadow-black/20"
    >
      <Link to={`/chronicles/${chronicle.id}`} className="block relative">
        <div className="aspect-[16/9] w-full relative overflow-hidden">
          {chronicle.coverUrl ? (
            <img 
              src={chronicle.coverUrl} 
              alt={chronicle.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center p-8">
               <BookOpen size={64} className="text-zinc-700 opacity-20" strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="px-2 py-1 bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] text-[8px] font-black uppercase tracking-widest rounded">
                Chronicle
              </span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white font-black text-[10px] uppercase">
                <Star size={10} className="text-yellow-500 fill-current" />
                {chronicle.averageRating?.toFixed(1) || '0.0'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {chronicle.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-widest bg-[var(--accent-primary)]/10 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-black text-white tracking-tighter mb-2 group-hover:text-[var(--accent-primary)] transition-colors uppercase italic leading-none truncate">
            {chronicle.title}
          </h3>
          
          <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-2 mb-6 h-8">
            {chronicle.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-800 overflow-hidden">
                {chronicle.owner.avatar && <img src={chronicle.owner.avatar} className="w-full h-full object-cover" />}
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter italic">
                {chronicle.owner.username}
              </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-500">
               <div className="flex items-center gap-1">
                 <Eye size={12} />
                 <span className="text-[10px] font-black tracking-tighter">{chronicle.totalViews}</span>
               </div>
               <div className="flex items-center gap-1">
                 <BookOpen size={12} />
                 <span className="text-[10px] font-black tracking-tighter">{chronicle.totalChapters}</span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
