import React from 'react';
import { Play, Music, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Playlist } from '../../../../shared/types/index.js';

interface ProfilePlaylistsProps {
  playlists: Playlist[];
}

const ProfilePlaylists: React.FC<ProfilePlaylistsProps> = ({ playlists }) => {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-gray-800 flex items-center justify-center mb-6">
          <Music size={32} className="text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-400">No playlists yet</h3>
        <p className="text-gray-600 text-sm mt-2">This user hasn't created any playlists.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist, index) => (
        <motion.div
          key={playlist.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={`/playlists/${playlist.id}`} className="block group">
            <div className="bg-[#161616] border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1">
              {/* Cover Grid */}
              <div className="aspect-[16/10] bg-[var(--bg-secondary)] relative overflow-hidden">
                {playlist.entries && playlist.entries.length > 0 ? (
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[2px]">
                    {[0, 1, 2, 3].map((i) => {
                      const entry = playlist.entries?.[i];
                      return (
                        <div key={i} className="bg-[var(--bg-tertiary)] overflow-hidden">
                          {entry?.animeCover ? (
                            <img 
                              src={entry.animeCover} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center">
                    <Play size={40} className="text-gray-700" />
                  </div>
                )}
                {/* Overlay fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent opacity-60" />
                {/* Entry count badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                  <span className="text-[10px] font-bold text-white tabular-nums">
                    {playlist._count?.entries || 0} entries
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
                  {playlist.title}
                </h3>
                {playlist.description && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {playlist.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800/50">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users size={12} />
                    <span className="text-[10px] font-medium">{playlist._count?.follows || 0}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 uppercase tracking-widest">
                    {playlist.visibility}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default ProfilePlaylists;
