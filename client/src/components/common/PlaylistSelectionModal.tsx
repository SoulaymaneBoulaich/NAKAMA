import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Music, Check, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

interface Playlist {
  id: string;
  name: string;
  animeCount: number;
}

interface PlaylistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: number;
  animeTitle: string;
}

export const PlaylistSelectionModal: React.FC<PlaylistSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  animeId,
  animeTitle
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedPlaylists, setAddedPlaylists] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/user/me/playlists');
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await api.post(`/playlists/${playlistId}/entries`, { animeId });
      setAddedPlaylists(prev => [...prev, playlistId]);
    } catch (err) {
      console.error('Failed to add to playlist', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Add to Archive</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[200px]">{animeTitle}</p>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {playlists.length === 0 ? (
                  <div className="text-center py-10 space-y-4">
                    <p className="text-xs text-zinc-500 uppercase font-black">No active manifestations found</p>
                    <button className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-[var(--accent-primary)] transition-all">
                      <Plus size={14} /> Create New Registry
                    </button>
                  </div>
                ) : (
                  playlists.map((playlist) => {
                    const isAdded = addedPlaylists.includes(playlist.id);
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                          isAdded 
                            ? 'bg-[var(--accent-dim)] border-[var(--accent-primary)] text-[var(--accent-primary)]' 
                            : 'bg-white/5 border-transparent hover:border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${isAdded ? 'bg-[var(--accent-primary)] text-white' : 'bg-white/5'}`}>
                            {isAdded ? <Check size={16} /> : <Music size={16} />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black uppercase italic tracking-tighter leading-none mb-1">{playlist.name}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">{playlist.animeCount} Archives</p>
                          </div>
                        </div>
                        {!isAdded && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
