import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Search, X, Plus, Calendar, Film } from 'lucide-react';
import type { JikanAnime } from '../../../../shared/types/index.js';
import { AnimeStatusEnum } from '../../../../shared/types/index.js';
import { Spinner } from '../common/Spinner.js';
import { useToast } from '../common/Toast.js';

interface AnimeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess?: () => void;
}

export const AnimeSearchModal: React.FC<AnimeSearchModalProps> = ({ isOpen, onClose, onAddSuccess }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { addToast } = useToast();

  const search = useCallback(async (q: string) => {
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
      if (query) search(query);
    }, 300); // Fixed debounce from 3000 to 300
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleAdd = async (animeId: number) => {
    setAddingId(animeId);
    try {
      await api.post('/entries', {
        animeId: String(animeId),
        status: AnimeStatusEnum.PLAN_TO_WATCH,
        episodeProgress: 0
      });
      
      addToast('success', 'Anime added to your list!');
      if (onAddSuccess) onAddSuccess();
      onClose();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Failed to add anime');
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[var(--bg-secondary)111] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-10 duration-300">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-4">
          <Search className="w-5 h-5 text-white/40" />
          <input
            autoFocus
            type="text"
            placeholder="Search anime by title..."
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-white/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((anime) => (
                <div key={anime.mal_id} className="group p-3 flex gap-4 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]">
                  <img 
                    src={anime.images.jpg.image_url} 
                    alt={anime.title} 
                    className="w-16 h-24 object-cover rounded shadow-lg"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white font-bold truncate group-hover:text-white transition-colors">{anime.title}</h4>
                    <div className="flex gap-4 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {anime.year || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Film size={12} /> {anime.episodes || '?'} eps</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAdd(anime.mal_id)}
                    disabled={addingId === anime.mal_id}
                    className="self-center p-3 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {addingId === anime.mal_id ? <Spinner size="sm" /> : <Plus size={20} />}
                  </button>
                </div>
              ))}
            </div>
          ) : query.length >= 3 ? (
            <div className="p-12 text-center text-white/40">No results found for "{query}"</div>
          ) : (
            <div className="p-12 text-center text-white/40 italic">Type at least 3 characters to search...</div>
          )}
        </div>
      </div>
    </div>
  );
};
