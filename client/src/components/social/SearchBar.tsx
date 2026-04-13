import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Globe, Tv, X, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useDebounce } from '../../hooks/useDebounce.js';
import type { SearchResponse } from '../../../../shared/types/index.js';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 200); // Faster debounce for "immediate" feel
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${debouncedQuery}`);
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSelect = (type: string, id: string | number) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'anime') navigate(`/anime/${id}`);
    if (type === 'user') navigate(`/profile/${id}`);
    if (type === 'community') navigate(`/communities/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-primary)] transition-colors z-10">
          <Search size={20} strokeWidth={3} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search Discovery..."
          className="w-full bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)] text-[var(--text-primary)] pl-14 pr-12 py-4 rounded-[1.25rem] focus:outline-none focus:border-[var(--accent-primary)]/40 focus:bg-[var(--bg-tertiary)] transition-all text-sm font-medium tracking-wide placeholder:text-[var(--text-secondary)]"
        />
        <AnimatePresence>
          {query && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => {
                setQuery('');
                setResults(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all z-10"
            >
              <X size={16} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {isOpen && (query.length >= 2) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden z-[100] max-h-[520px] backdrop-blur-3xl"
          >
            <div className="overflow-y-auto max-h-[520px] custom-scrollbar">
              {isLoading ? (
                <div className="p-16 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Querying Archive...</span>
                </div>
              ) : results ? (
                <div className="divide-y divide-white/5">
                  {/* Anime Section */}
                  {results.anime.length > 0 && (
                    <div className="p-4">
                      <div className="px-4 py-2 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                          <Tv size={14} className="text-[var(--accent-primary)]" /> 
                          Anime Suggestions
                        </div>
                        <TrendingUp size={14} className="text-zinc-800" />
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {results.anime.slice(0, 5).map((a: any) => (
                          <button
                            key={a.mal_id}
                            onClick={() => handleSelect('anime', a.mal_id)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all text-left group"
                          >
                            <div className="w-12 h-16 bg-zinc-900 rounded-xl overflow-hidden shadow-xl flex-shrink-0 border border-[var(--border-color)]">
                              {a.images?.jpg?.large_image_url ? (
                                <img src={a.images.jpg.large_image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                  <Tv size={16} className="text-zinc-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate uppercase italic tracking-tighter">{a.title}</div>
                              <div className="text-[10px] font-bold text-zinc-500 mt-0.5 uppercase tracking-widest flex items-center gap-2">
                                <span>{a.type || 'TV'}</span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                <span>{a.year || 'N/A'}</span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                <span className="text-[var(--accent-primary)]/60">{a.score || '0.0'} SCORE</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communities & Users shared grid */}
                  {(results.communities.length > 0 || results.users.length > 0) && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Communities */}
                      {results.communities.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">
                            <Globe size={14} className="text-[var(--accent-primary)]" /> Collectives
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {results.communities.slice(0, 3).map((c) => (
                              <button
                                key={c.id}
                                onClick={() => handleSelect('community', c.slug)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all text-left group"
                              >
                                <div className="w-10 h-10 rounded-xl border border-[var(--border-color)] overflow-hidden flex-shrink-0 shadow-lg">
                                  <img src={c.avatarUrl || '/default-community.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate uppercase italic">{c.name}</div>
                                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{c.memberCount} MBRS</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Users */}
                      {results.users.length > 0 && (
                        <div>
                          <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">
                            <User size={14} className="text-[var(--accent-primary)]" /> Nakama
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {results.users.slice(0, 3).map((u) => (
                              <button
                                key={u.id}
                                onClick={() => handleSelect('user', u.username)}
                                className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all text-left group"
                              >
                                <div className="w-10 h-10 rounded-full border border-[var(--border-color)] overflow-hidden flex-shrink-0 shadow-lg">
                                  <img src={u.avatar || '/default-avatar.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate uppercase italic">{u.username}</div>
                                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{u.followerCount} FLW</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {results.anime.length === 0 && results.users.length === 0 && results.communities.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-800 border border-[var(--border-color)]">
                        <Search size={32} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-black text-zinc-500 uppercase italic tracking-tighter">No resonance found</div>
                        <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Adjust your query hash</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full p-5 text-center flex items-center justify-center gap-3 bg-[var(--bg-tertiary)]/2 hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)] transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] group-hover:text-[var(--bg-primary)] transition-colors">Manifest Full Search</span>
                    <Sparkles size={14} className="text-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] transition-colors" />
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
