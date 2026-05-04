import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import type { TopTenEntry } from '../../../../shared/types/index.js';
import { Trophy, Crown, Star, ChevronRight, Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

interface ProfileTopTenProps {
  entries: TopTenEntry[];
  isSelf?: boolean;
  username: string;
}

const getRankStyle = (rank: number) => {
  if (rank === 1) return { bg: 'bg-gradient-to-r from-yellow-500/15 to-yellow-600/5', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: <Crown size={18} className="text-yellow-500" /> };
  if (rank === 2) return { bg: 'bg-gradient-to-r from-gray-300/10 to-gray-400/5', border: 'border-gray-400/30', text: 'text-gray-300', icon: <Trophy size={16} className="text-gray-300" /> };
  if (rank === 3) return { bg: 'bg-gradient-to-r from-amber-700/10 to-amber-800/5', border: 'border-amber-700/30', text: 'text-amber-600', icon: <Trophy size={16} className="text-amber-600" /> };
  return { bg: 'bg-[#161616]', border: 'border-gray-800/60', text: 'text-gray-600', icon: null };
};

const ProfileTopTen: React.FC<ProfileTopTenProps> = ({ entries, isSelf = false, username }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const sortedEntries = [...entries].sort((a, b) => a.rank - b.rank);

  // Fill empty slots for isSelf mode
  const slots = Array.from({ length: 10 }, (_, i) => {
    const rank = i + 1;
    return sortedEntries.find(e => e.rank === rank) || null;
  });

  const handleSlotClick = (rank: number) => {
    if (!isSelf) return;
    setSelectedSlot(rank);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Trophy size={18} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Top 10 Rankings</h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">All-Time Favorites</p>
          </div>
        </div>
      </div>

      {/* Rankings Grid */}
      <div className="space-y-2">
        {slots.map((entry, index) => {
          const rank = index + 1;
          const style = getRankStyle(rank);

          if (!entry) {
            // Empty slot
            return (
              <motion.div
                key={`empty-${rank}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSlotClick(rank)}
                className={`flex items-center gap-4 p-3 rounded-xl border border-dashed border-gray-800/60 bg-[var(--bg-secondary)] ${isSelf ? 'cursor-pointer hover:border-gray-600 hover:bg-[#161616]' : ''} transition-all group`}
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-gray-700 tabular-nums">{rank}</span>
                </div>
                <div className="w-10 h-14 rounded-lg bg-[var(--bg-tertiary)] flex-shrink-0" />
                <span className="text-xs text-gray-700 italic">
                  {isSelf ? 'Click to add...' : 'Empty slot'}
                </span>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleSlotClick(rank)}
              className={`flex items-center gap-4 p-3 rounded-xl border ${style.border} ${style.bg} group hover:scale-[1.01] transition-all duration-200 ${isSelf ? 'cursor-pointer' : ''}`}
            >
              {/* Rank */}
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 relative">
                {style.icon || (
                  <span className={`text-sm font-black tabular-nums ${style.text}`}>{rank}</span>
                )}
                {rank <= 3 && (
                  <span className={`absolute -top-1 -right-1 text-[8px] font-black ${style.text}`}>
                    {rank === 1 ? '♛' : rank === 2 ? '♕' : '♚'}
                  </span>
                )}
              </div>

              {/* Cover */}
              <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#222] border border-gray-800/30">
                {entry.animeCover ? (
                  <SafeImage
                    src={entry.animeCover}
                    alt={entry.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#222] to-[var(--bg-tertiary)]" />
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
                  {entry.animeTitle}
                </h4>
              </div>

              {/* Arrow */}
              <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 transition-colors flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Add Anime Modal */}
      <AnimatePresence>
        {showAddModal && isSelf && (
          <AddAnimeModal
            rank={selectedSlot!}
            onClose={() => setShowAddModal(false)}
            onAdded={() => {
              setShowAddModal(false);
              queryClient.invalidateQueries({ queryKey: ['profile', username, 'topten'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add/Edit Anime Modal sub-component
const AddAnimeModal = ({
  rank,
  onClose,
  onAdded,
}: {
  rank: number;
  onClose: () => void;
  onAdded: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleLiveSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const { data } = await api.get(`/anime/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(data.data || data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    };
    handleLiveSearch();
  }, [debouncedQuery]);

  const handleAdd = async (anime: any) => {
    setAdding(true);
    try {
      await api.post('/users/me/topten', {
        animeId: String(anime.mal_id),
        animeTitle: anime.title_english || anime.title,
        animeCover: anime.images?.jpg?.image_url || null,
        rank,
      });
      onAdded();
    } catch (err) {
      console.error('Failed to add to top ten', err);
    } finally {
      setAdding(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm(`Clear Rank #${rank}?`)) return;
    setAdding(true);
    try {
      // Find the entry for this rank and delete it
      // Note: We need the entry ID, but on the server we can also delete by rank
      await api.delete(`/users/me/topten/rank/${rank}`);
      onAdded();
    } catch (err) {
      console.error('Failed to clear rank', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-lg bg-[#0d0d0d] border border-pink-500/20 rounded-[2.5rem] shadow-[0_30px_100px_rgba(236,72,153,0.15)] overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Sakura Decorative Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles size={120} className="text-pink-500" strokeWidth={0.5} />
        </div>

        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-[9px] font-black text-pink-500 uppercase tracking-widest">Rank #{rank}</span>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase italic">Sakura Editor</h2>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Redesigning your destiny</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 border border-[var(--border-color)] flex items-center justify-center hover:bg-zinc-800 transition-all">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 py-4 relative z-10">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500 group-focus-within:scale-110 transition-transform">
              <Search size={20} strokeWidth={3} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Manifesting an anime..."
              className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/40 focus:bg-pink-500/5 transition-all font-medium"
              autoFocus
            />
            {searching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative z-10">
          <div className="space-y-2 mt-4">
            {results.length > 0 ? (
              results.slice(0, 10).map((anime: any, i) => (
                <motion.button
                  key={anime.mal_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAdd(anime)}
                  disabled={adding}
                  className="w-full flex items-center gap-4 p-3 bg-white/2 hover:bg-pink-500/10 border border-[var(--border-color)] hover:border-pink-500/30 rounded-2xl transition-all text-left group"
                >
                  <div className="w-12 h-16 bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)] flex-shrink-0">
                    <SafeImage src={anime.images?.jpg?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-white group-hover:text-pink-400 transition-colors uppercase italic truncate tracking-tighter">{anime.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{anime.type || 'TV'}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">{anime.score || '0.0'} Score</span>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : query.length > 2 && !searching ? (
              <div className="py-20 text-center">
                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">No resonance found in the archive</div>
              </div>
            ) : !searching && (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/5 flex items-center justify-center border border-pink-500/10">
                  <Star size={32} className="text-pink-500/30" strokeWidth={1} />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-500 uppercase italic tracking-tighter">Your #1 remains unclaimed</div>
                  <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Type to manifest into existence</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex gap-4 relative z-10">
          <button 
            onClick={handleClear}
            disabled={adding}
            className="flex-1 py-4 px-4 bg-zinc-900 hover:bg-red-950/20 border border-[var(--border-color)] hover:border-red-500/30 rounded-2xl text-[10px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-[0.2em] transition-all"
          >
            Purge Current Rank
          </button>
        </div>
      </motion.div>
    </div>
  );
};


export default ProfileTopTen;
