import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PlayCircle, List, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const PlaylistsTab: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get('/playlists/featured');
        setPlaylists(response.data);
      } catch (error) {
        console.error('Failed to fetch featured playlists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <div className="w-full pt-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {/* Label instead of icon for minimal look? Spec says "nothing decorative". 
              I'll keep a small icon but make it very subtle. */}
          <List size={18} className="text-white" />
          <h2 className="text-[0.9rem] font-bold text-[#f4f4f5] uppercase tracking-[0.1em] font-dm-sans">Featured Playlists</h2>
        </div>
        <button className="flex items-center gap-2 text-[0.72rem] font-medium font-dm-sans text-[#71717a] hover:text-[#f4f4f5] transition-colors uppercase tracking-[0.05em]">
          Browse All <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-12">
        {loading ? (
          [1, 2].map(n => (
            <div key={n} className="w-full h-[180px] bg-[#111114] border border-[#1a1a1a] rounded-[14px] animate-pulse" />
          ))
        ) : (
          playlists.map((playlist, idx) => (
            <motion.div 
              key={playlist.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Letterboxd Fanned Cover Effect */}
                <div className="relative w-[180px] h-[130px] flex-shrink-0">
                  {/* Third Cover */}
                  <div className="absolute left-[30px] top-[8px] w-[90px] h-[120px] rounded-md bg-[#232329] border border-[#1a1a1a] shadow-2xl rotate-[3deg] group-hover:rotate-[6deg] transition-transform duration-500 overflow-hidden">
                    <img src={playlist.entries[2]?.animeCover || ''} className="w-full h-full object-cover opacity-60" alt="" />
                  </div>
                  {/* Second Cover */}
                  <div className="absolute left-[15px] top-[4px] w-[90px] h-[120px] rounded-md bg-[#18181d] border border-[#1a1a1a] shadow-xl rotate-[-2deg] group-hover:rotate-[-5deg] transition-transform duration-500 overflow-hidden" />
                  {/* Main Cover */}
                  <div className="absolute left-0 top-0 w-[90px] h-[120px] rounded-md bg-[#111114] border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden z-10">
                    <img src={playlist.entries[0]?.animeCover || ''} className="w-full h-full object-cover" alt="" />
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[#1a1a1a]">
                      <img src={playlist.user.avatar || ''} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest font-dm-sans">{playlist.user.username}</span>
                  </div>
                  <h3 className="text-[1.1rem] font-bold text-[#f4f4f5] group-hover:text-white transition-colors mb-2 font-dm-sans leading-tight">
                    {playlist.title}
                  </h3>
                  <p className="text-[0.8rem] font-dm-sans text-[#71717a] line-clamp-2 mb-4 leading-relaxed">
                    {playlist.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-[#71717a] font-dm-sans font-bold">
                      <PlayCircle size={16} />
                      {playlist._count?.entries || 0} Entries
                    </div>
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-[#71717a] font-dm-sans font-bold">
                      <Heart size={16} />
                      {playlist._count?.likes || 0}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
