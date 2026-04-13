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
    <div className="max-w-[720px] mx-auto px-4 sm:px-0 pt-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <List size={22} className="text-[var(--accent-primary)]" />
          <h2 className="text-xl font-black font-jp uppercase italic italic tracking-wider">Editorial Sets</h2>
        </div>
        <button className="flex items-center gap-2 text-[0.8rem] font-dm-sans font-bold text-[#71717a] hover:text-[#f4f4f5] transition-colors">
          Browse All <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-12">
        {loading ? (
          [1, 2].map(n => (
            <div key={n} className="w-full h-[180px] bg-[var(--bg-secondary)114] border border-[#232329] rounded-2xl animate-pulse" />
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
                <div className="relative w-[210px] h-[150px] flex-shrink-0">
                  {/* Third Cover */}
                  <div className="absolute left-[40px] top-[10px] w-[100px] h-[140px] rounded-lg bg-[#232329] border border-[var(--border-color)] shadow-2xl rotate-[3deg] group-hover:rotate-[6deg] transition-transform duration-500 overflow-hidden">
                    <img src={playlist.entries[2]?.animeCover || ''} className="w-full h-full object-cover opacity-60" alt="" />
                  </div>
                  {/* Second Cover */}
                  <div className="absolute left-[20px] top-[5px] w-[100px] h-[140px] rounded-lg bg-[#18181d] border border-[var(--border-color)] shadow-xl rotate-[-2deg] group-hover:rotate-[-5deg] transition-transform duration-500 overflow-hidden">
                    <img src={playlist.entries[1]?.animeCover || ''} className="w-full h-full object-cover opacity-80" alt="" />
                  </div>
                  {/* Main Cover */}
                  <div className="absolute left-0 top-0 w-[100px] h-[140px] rounded-lg bg-[var(--bg-secondary)114] border border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden z-10">
                    <img src={playlist.entries[0]?.animeCover || ''} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[var(--border-color)]">
                      <img src={playlist.user.avatar || ''} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-widest">{playlist.user.username}</span>
                  </div>
                  <h3 className="text-2xl font-black font-jp uppercase italic tracking-tight text-[#f4f4f5] group-hover:text-[var(--accent-primary)] transition-colors mb-2">
                    {playlist.title}
                  </h3>
                  <p className="text-[0.9rem] font-dm-sans text-[#71717a] line-clamp-2 mb-4 leading-relaxed">
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
