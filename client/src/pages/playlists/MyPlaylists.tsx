import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Play, Lock, Globe, Share2,
  ListMusic, Info, Loader2, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { PlaylistCard } from '../../components/playlists/PlaylistCard';
import { CreatePlaylistModal } from '../../components/social/CreatePlaylistModal';

const MAX_PLAYLISTS = 3;

// ─── Limit banner ──────────────────────────────────────────────────────────────
const LimitBanner: React.FC<{ count: number }> = ({ count }) => {
  const remaining = MAX_PLAYLISTS - count;
  const full = remaining === 0;

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all ${
      full
        ? 'bg-red-500/5 border-red-500/20 text-red-400'
        : 'bg-[#0d0d10] border-[#1a1a1c] text-[#555]'
    }`}>
      <Info size={15} className={full ? 'text-red-500' : 'text-[#444]'} />
      {full
        ? 'You\'ve reached the 3-playlist limit. Remove one to create another.'
        : `${remaining} playlist slot${remaining > 1 ? 's' : ''} remaining`
      }
      {/* Slot dots */}
      <div className="ml-auto flex items-center gap-1.5">
        {Array.from({ length: MAX_PLAYLISTS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < count ? 'bg-red-600' : 'bg-[#1e1e24]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-36 text-center"
  >
    <div className="relative mb-8">
      {/* Fanned empty cards */}
      {[-6, -2, 4].map((deg, i) => (
        <div
          key={i}
          className="absolute w-24 h-32 bg-[#111114] border border-[#1e1e24] rounded-xl"
          style={{ transform: `rotate(${deg}deg) translateX(${(i-1)*12}px)`, zIndex: i, left: '-48px', top: 0 }}
        />
      ))}
      <div className="relative w-24 h-32 bg-[#111114] border border-[#222] rounded-xl flex items-center justify-center" style={{ zIndex: 3, marginLeft: '0px' }}>
        <ListMusic size={28} className="text-[#333]" />
      </div>
    </div>
    <h3 className="font-outfit font-black text-xl text-white/80 tracking-tight mb-2">No playlists yet</h3>
    <p className="text-[#555] text-sm max-w-xs mb-8 leading-relaxed">
      Curate your first anime collection. You can publish up to 3 playlists.
    </p>
    <button
      onClick={onCreate}
      className="flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-900/30 active:scale-95"
    >
      <Plus size={16} strokeWidth={3} />
      Create first playlist
    </button>
  </motion.div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
export const MyPlaylistsPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PUBLIC' | 'PRIVATE' | 'SHARED'>('all');

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(Array.isArray(data) ? data : []);
    } catch { setPlaylists([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const filtered = playlists.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.visibility === filter;
    return matchSearch && matchFilter;
  });

  const canCreate = playlists.length < MAX_PLAYLISTS;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-red-500/20 pb-20">

      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-[#161618]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/8 to-transparent pointer-events-none" />
        <div className="max-w-[1100px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">My Library</span>
                <div className="h-[1px] w-8 bg-red-600/40" />
              </div>
              <h1 className="font-outfit font-black text-4xl tracking-tight text-white flex items-center gap-3">
                Playlists
                <Sparkles size={22} className="text-red-600/60" />
              </h1>
              <p className="text-[#555] text-sm mt-2">
                Curate and publish up to 3 anime playlists.
              </p>
            </div>

            <button
              onClick={() => canCreate && setShowCreate(true)}
              disabled={!canCreate}
              title={!canCreate ? 'Remove a playlist to create a new one' : ''}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all self-start md:self-auto ${
                canCreate
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 active:scale-95'
                  : 'bg-[#1a1a1c] text-[#555] cursor-not-allowed'
              }`}
            >
              <Plus size={16} strokeWidth={3} />
              New Playlist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 pt-6 space-y-6">

        {/* Limit indicator */}
        {!loading && playlists.length > 0 && <LimitBanner count={playlists.length} />}

        {/* Search + filter */}
        {!loading && playlists.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
              <input
                type="text"
                placeholder="Search playlists…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0d0d10] border border-[#1a1a1c] text-white placeholder-[#444] text-sm rounded-xl focus:outline-none focus:border-[#333] transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#0d0d10] border border-[#1a1a1c] rounded-xl p-1">
              {([
                { id: 'all',     label: 'All',     icon: Play },
                { id: 'PUBLIC',  label: 'Public',  icon: Globe },
                { id: 'PRIVATE', label: 'Private', icon: Lock },
                { id: 'SHARED',  label: 'Shared',  icon: Share2 },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    filter === opt.id
                      ? 'bg-white text-black'
                      : 'text-[#555] hover:text-white'
                  }`}
                >
                  <opt.icon size={11} />
                  <span className="hidden sm:block">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-red-600" size={28} />
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} />
        ) : (
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-[#444] text-sm font-bold uppercase tracking-widest"
              >
                No playlists match your search
              </motion.p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2">
                {filtered.map((playlist, i) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <PlaylistCard playlist={playlist} />
                  </motion.div>
                ))}

                {/* Empty slot cards */}
                {playlists.length < MAX_PLAYLISTS && filter === 'all' && !search && (
                  Array.from({ length: MAX_PLAYLISTS - playlists.length }).map((_, i) => (
                    <motion.button
                      key={`empty-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (playlists.length + i) * 0.05 }}
                      onClick={() => setShowCreate(true)}
                      className="group relative flex flex-col items-center justify-center aspect-[3/4] bg-[#0d0d10] border border-dashed border-[#1e1e24] rounded-2xl hover:border-red-600/40 hover:bg-red-600/5 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full border border-[#222] group-hover:border-red-600/40 flex items-center justify-center mb-3 transition-colors">
                        <Plus size={18} className="text-[#333] group-hover:text-red-600 transition-colors" strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#333] group-hover:text-red-600/70 transition-colors">
                        Add playlist
                      </span>
                    </motion.button>
                  ))
                )}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <CreatePlaylistModal isOpen={showCreate} onClose={() => { setShowCreate(false); fetchPlaylists(); }} />
    </div>
  );
};
