import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { PlaylistCard } from '../../components/playlists/PlaylistCard';

export const MyPlaylistsPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to fetch playlists', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
            <Play className="text-red-500 fill-red-500" size={32} />
            MY PLAYLISTS
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and curate your favorite anime collections.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
        >
          <Plus size={20} />
          CREATE PLAYLIST
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search your playlists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-[var(--border-color)] rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="text-red-500 animate-spin" size={48} />
          <p className="text-zinc-500 mt-4 font-medium italic">Loading your masterpieces...</p>
        </div>
      ) : filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-zinc-900/20">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700 mb-6">
            <Search size={40} />
          </div>
          <h2 className="text-xl font-bold text-zinc-400">No playlists found</h2>
          <p className="text-zinc-600 mt-2">Try adjusting your search or create a new one!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 text-red-500 font-bold hover:underline"
          >
            Create your first playlist
          </button>
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreatePlaylistModal 
            onClose={() => setShowCreateModal(false)} 
            onCreated={() => {
              setShowCreateModal(false);
              fetchPlaylists();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick sub-component for Modal
const CreatePlaylistModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC'>('PRIVATE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/playlists', { title, description, visibility });
      onCreated();
    } catch (error) {
      console.error('Failed to create playlist', error);
      alert('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-black text-white tracking-tight">CREATE NEW PLAYLIST</h2>
          <p className="text-zinc-500 text-xs mt-1">Start curating your legend.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Title</label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Epic Battle Shonen Anthems..."
              className="w-full bg-zinc-950 border border-[var(--border-color)] rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this playlist special?"
              rows={3}
              className="w-full bg-zinc-950 border border-[var(--border-color)] rounded-xl py-3 px-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Visibility</label>
            <div className="grid grid-cols-3 gap-3">
              {(['PRIVATE', 'SHARED', 'PUBLIC'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                    visibility === v 
                      ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                      : 'bg-zinc-950 border-[var(--border-color)] text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-color)] text-zinc-400 font-bold hover:bg-zinc-800/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              disabled={loading}
              className="flex-[2] py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              CREATE PLAYLIST
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
