import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Lock, PlayCircle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaylistCardProps {
  playlist: {
    id: string;
    title: string;
    description?: string | null;
    visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
    user: {
      username: string;
      avatar?: string | null;
    };
    entries?: { animeCover: string }[];
    _count: {
      entries: number;
      likes?: number;
    };
  };
}

const VisibilityIcon = ({ visibility }: { visibility: string }) => {
  switch (visibility) {
    case 'PUBLIC': return <Globe size={14} className="text-[#34d399]" />;
    case 'SHARED': return <Share2 size={14} className="text-[#3b82f6]" />;
    case 'PRIVATE': return <Lock size={14} className="text-[#71717a]" />;
    default: return null;
  }
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  // Use first 3 entries for the fanned effect, fallback to defaults if not enough
  const displayCovers = playlist.entries?.slice(0, 3).map(e => e.animeCover) || [];
  while (displayCovers.length < 3) {
    displayCovers.push('https://images.unsplash.com/photo-1578632738980-42042217c37a?q=80&w=300&auto=format&fit=crop');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer mb-8"
    >
      <Link to={`/playlists/${playlist.id}`} className="block">
        <div className="flex flex-col gap-6">
          {/* Letterboxd Fanned Cover Effect */}
          <div className="relative w-full h-[180px] flex items-center justify-center">
            {/* Third Cover (Back) */}
            <div className="absolute left-[calc(50%+30px)] top-[15px] w-[110px] h-[160px] rounded-xl bg-[#232329] border border-[var(--border-color)] shadow-2xl rotate-[6deg] group-hover:rotate-[10deg] transition-transform duration-500 overflow-hidden -translate-x-1/2">
              <img src={displayCovers[2]} className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-70" alt="" />
            </div>
            {/* Second Cover (Middle) */}
            <div className="absolute left-[calc(50%+15px)] top-[5px] w-[110px] h-[160px] rounded-xl bg-[#18181d] border border-[var(--border-color)] shadow-xl rotate-[-3deg] group-hover:rotate-[-6deg] transition-transform duration-500 overflow-hidden -translate-x-1/2">
              <img src={displayCovers[1]} className="w-full h-full object-cover opacity-70 transition-opacity group-hover:opacity-90" alt="" />
            </div>
            {/* Main Cover (Front) */}
            <div className="absolute left-[calc(50%-20px)] top-0 w-[110px] h-[160px] rounded-xl bg-[var(--bg-secondary)114] border border-white/20 shadow-lg group-hover:scale-105 group-hover:border-[var(--accent-primary)]/50 transition-all duration-500 overflow-hidden z-10 -translate-x-1/2">
              <img src={displayCovers[0]} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg z-20">
                <VisibilityIcon visibility={playlist.visibility} />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="text-center pt-2">
            <h3 className="text-[1.15rem] font-dm-sans font-black uppercase italic tracking-tight text-[#f4f4f5] group-hover:text-[var(--accent-primary)] transition-colors truncate px-2">
              {playlist.title}
            </h3>
            
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-[0.75rem] font-dm-sans font-bold text-[#71717a]">
                <PlayCircle size={14} className="text-[var(--accent-primary)]" /> 
                {playlist._count.entries}
              </div>
              <div className="w-[4px] h-[4px] rounded-full bg-[#1e1e24]" />
              <div className="flex items-center gap-1 text-[0.75rem] font-dm-sans font-bold text-[#71717a]">
                <Heart size={14} className="text-[var(--accent-primary)]" /> 
                {playlist._count.likes || 0}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 opacity-1 group-hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 rounded-full border border-[var(--border-color)] overflow-hidden">
                <img src={playlist.user.avatar || ''} className="w-full h-full object-cover" alt="" />
              </div>
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest">{playlist.user.username}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
