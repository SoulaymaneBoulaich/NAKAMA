import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PlayCircle, List, ArrowRight, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SafeImage } from '../common/SafeImage';
import { Avatar } from '../common/Avatar';

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

  if (loading) {
    return (
      <div className="space-y-8 pt-8">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex gap-8 group animate-pulse">
            <div className="w-[140px] h-[190px] bg-[#111114] border border-[#1a1a1c] rounded-xl" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-6 w-1/3 bg-[#111114] rounded-lg" />
              <div className="h-16 w-full bg-[#111114] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full pt-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/10 rounded-lg border border-red-600/20">
            <List size={20} className="text-red-500" />
          </div>
          <h2 className="text-[1rem] font-black text-[#efeff1] uppercase tracking-wider font-dm-sans">Curated Playlists</h2>
        </div>
        <Link to="/playlists" className="text-[0.75rem] font-bold text-[#71717a] hover:text-red-500 transition-all uppercase tracking-widest px-4 py-2 border border-[#1a1a1c] rounded-lg hover:border-red-600/20">
          Global Browse
        </Link>
      </div>

      <div className="space-y-16">
        {playlists.map((playlist, idx) => (
          <motion.div 
            key={playlist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Letterboxd Fanned Cover Effect */}
              <div className="relative w-[180px] h-[210px] flex-shrink-0">
                {/* Layer 3 */}
                <div className="absolute left-[45px] top-[15px] w-[110px] h-[160px] rounded-lg bg-[#0a0a0c] border border-[#222] shadow-2xl rotate-[10deg] group-hover:rotate-[15deg] group-hover:translate-x-4 transition-all duration-700 overflow-hidden">
                  {playlist.entries?.[2] && (
                    <SafeImage src={playlist.entries[2].animeCover} className="w-full h-full object-cover opacity-40" alt="" />
                  )}
                </div>
                {/* Layer 2 */}
                <div className="absolute left-[25px] top-[8px] w-[110px] h-[160px] rounded-lg bg-[#0f0f12] border border-[#222] shadow-xl rotate-[4deg] group-hover:rotate-[8deg] group-hover:translate-x-2 transition-all duration-700 overflow-hidden">
                  {playlist.entries?.[1] && (
                    <SafeImage src={playlist.entries[1].animeCover} className="w-full h-full object-cover opacity-60" alt="" />
                  )}
                </div>
                {/* Main Cover */}
                <div className="absolute left-0 top-0 w-[110px] h-[160px] rounded-lg bg-[#1a1a1c] border border-white/10 shadow-lg group-hover:scale-105 group-hover:-translate-x-2 transition-all duration-700 overflow-hidden z-10">
                  <SafeImage src={playlist.entries?.[0]?.animeCover || '/placeholder-cover.jpg'} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Playlist Info */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#222]">
                    <Avatar 
                      src={playlist.user.avatar} 
                      username={playlist.user.username} 
                      size="xs"
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[0.7rem] font-black text-[#71717a] uppercase tracking-widest">{playlist.user.username}</span>
                </div>
                <h3 className="text-[1.4rem] font-black text-[#efeff1] group-hover:text-red-500 transition-colors mb-3 leading-tight tracking-tight">
                  {playlist.title}
                </h3>
                <p className="text-[0.9rem] text-[#71717a] line-clamp-3 mb-6 leading-relaxed">
                  {playlist.description || "No description provided."}
                </p>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-[0.8rem] text-[#efeff1] font-black uppercase tracking-widest bg-white/5 py-1 px-3 rounded-md border border-white/5">
                    <PlayCircle size={16} className="text-red-600" />
                    {playlist._count?.entries || 0} Anime
                  </div>
                  <div className="flex items-center gap-2 text-[0.8rem] text-[#71717a] font-bold">
                    <Heart size={16} />
                    {playlist._count?.follows || 0}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Footer Watermark */}
      <div className="py-24 text-center">
        <span className="text-[0.7rem] font-black text-[#1a1a1c] uppercase tracking-[0.4em] select-none">
          Curated for the Culture
        </span>
      </div>
    </div>
  );
};
