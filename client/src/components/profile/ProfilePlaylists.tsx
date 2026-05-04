import React, { useState } from 'react';
import { Play, Music, Users, Shield, Heart, Share2, Award, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Playlist, TopTenEntry } from '../../../../shared/types/index.js';
import TasteAlignment from './TasteAlignment';
import { SafeImage } from '../common/SafeImage';

interface ProfilePlaylistsProps {
  playlists: Playlist[];
  isSelf: boolean;
  topTen?: TopTenEntry[];
}

const ProfilePlaylists: React.FC<ProfilePlaylistsProps> = ({ playlists, isSelf, topTen = [] }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'created' | 'saved' | 'shared'>('all');

  // Categorize playlists
  const createdPlaylists = playlists.filter(p => !p.isFollowing && !p.isCollaborator);
  const savedPlaylists = playlists.filter(p => p.isFollowing);
  const sharedPlaylists = playlists.filter(p => p.isCollaborator || p.visibility === 'SHARED');

  const filteredPlaylists = () => {
    switch (activeSection) {
      case 'created': return createdPlaylists;
      case 'saved': return savedPlaylists;
      case 'shared': return sharedPlaylists;
      default: return playlists;
    }
  };

  const renderPlaylistGrid = (items: Playlist[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-primary)]/30">
          <Music size={24} className="text-gray-700 mb-2" />
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No results found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/playlists/${playlist.id}`} className="block group">
              <div className="bg-[#101010] border border-gray-800/40 rounded-2xl overflow-hidden hover:border-[var(--accent-primary)]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">
                <div className="aspect-[16/10] bg-[var(--bg-secondary)] relative overflow-hidden">
                  {playlist.entries && playlist.entries.length > 0 ? (
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 p-0.5 bg-black">
                      {[0, 1, 2, 3].map((i) => {
                        const entry = playlist.entries?.[i];
                        return (
                          <div key={i} className="bg-[var(--bg-tertiary)] overflow-hidden">
                            {entry?.animeCover ? (
                              <SafeImage src={entry.animeCover} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#121212] to-[#181818]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#121212] to-[#181818] flex items-center justify-center">
                      <Play size={40} className="text-gray-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                     <span className="text-[9px] font-black italic text-white uppercase tracking-tighter bg-[var(--accent-primary)] px-2 py-0.5 rounded">
                       {playlist.visibility}
                     </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wide truncate group-hover:text-[var(--accent-primary)] transition-colors">
                    {playlist.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-900">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Heart size={10} className="text-red-500/50" />
                      <span className="text-[10px] font-bold tabular-nums">{(playlist as any)._count?.follows || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Zap size={10} className="text-yellow-500/50" />
                      <span className="text-[10px] font-bold tabular-nums">{(playlist as any)._count?.entries || 0} ITEMS</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Anime Taste Match & Top 10 (Visitors Only) */}
      {!isSelf && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TasteAlignment ownerId={playlists[0]?.userId || ''} />
          
          <div className="bg-[#121212] border border-[var(--border-color)] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--accent-primary)]/10 blur-3xl rounded-full" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
                  <Award size={18} className="text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Elite Top 10</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {topTen.slice(0, 4).map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 bg-black/40 border border-gray-800/40 p-2 rounded-xl group/entry hover:border-gray-700 transition-all">
                  <span className="text-xs font-black italic text-[var(--accent-primary)]/40 w-4 group-hover/entry:text-[var(--accent-primary)] transition-colors">#{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <SafeImage src={entry.animeCover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tight">{entry.animeTitle}</span>
                </div>
              ))}
            </div>
            {topTen.length > 4 && (
              <button className="w-full mt-6 py-2 border border-gray-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white transition-all">
                View Full Ranking ({topTen.length})
              </button>
            )}
            {topTen.length === 0 && (
              <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest text-center py-8">No Rankings Set</p>
            )}
          </div>
        </div>
      )}

      {/* Playlist Grid with Categorization */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5">
            <Music size={18} className="text-[var(--accent-primary)]" />
            <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">Collection Library</h2>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-gray-800/40">
            {[
              { id: 'all', label: 'All', icon: Play },
              { id: 'created', label: 'Created', icon: Shield },
              { id: 'saved', label: 'Saved', icon: Heart },
              { id: 'shared', label: 'Collaborative', icon: Share2 },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSection === section.id 
                    ? 'bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <section.icon size={12} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {renderPlaylistGrid(filteredPlaylists())}
      </section>
    </div>
  );
};

export default ProfilePlaylists;
