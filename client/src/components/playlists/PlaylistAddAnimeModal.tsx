import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Calendar, Film, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../common/Toast.js';

interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  year: number | null;
  episodes: number | null;
}

interface PlaylistAddAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onAddSuccess?: () => void;
}

export const PlaylistAddAnimeModal: React.FC<PlaylistAddAnimeModalProps> = ({ 
  isOpen, 
  onClose, 
  playlistId, 
  onAddSuccess 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { addToast } = useToast();

  const searchAnime = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/anime/search?q=${q}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) searchAnime(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchAnime]);

  const handleAdd = async (anime: JikanAnime) => {
    setAddingId(anime.mal_id);
    try {
      await api.post(`/playlists/${playlistId}/entries`, {
        animeId: String(anime.mal_id),
        animeTitle: anime.title,
        animeCover: anime.images.jpg.image_url,
        note: ""
      });
      
      addToast('success', 'Added to playlist!');
      if (onAddSuccess) onAddSuccess();
    } catch (error: any) {
      addToast('error', error.response?.data?.error || 'Failed to add to playlist');
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-4">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search anime to add..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-zinc-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="text-red-500 animate-spin" size={32} />
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((anime) => (
                <div key={anime.mal_id} className="group p-3 flex gap-4 hover:bg-zinc-800/50 rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]">
                  <img 
                    src={anime.images.jpg.image_url} 
                    alt={anime.title} 
                    className="w-16 h-24 object-cover rounded shadow-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white font-bold truncate group-hover:text-red-500 transition-colors uppercase italic tracking-tight">{anime.title}</h4>
                    <div className="flex gap-4 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {anime.year || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Film size={12} /> {anime.episodes || '?'} eps</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAdd(anime)}
                    disabled={addingId === anime.mal_id}
                    className="self-center p-3 bg-red-600 text-white rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-900/20"
                  >
                    {addingId === anime.mal_id ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                  </button>
                </div>
              ))}
            </div>
          ) : query.length >= 3 ? (
            <div className="p-12 text-center text-zinc-500 uppercase font-bold text-xs tracking-widest">No results found for "{query}"</div>
          ) : (
            <div className="p-12 text-center text-zinc-600 italic text-sm font-medium">Type at least 3 characters to search for anime...</div>
          )}
        </div>
      </div>
    </div>
  );
};
