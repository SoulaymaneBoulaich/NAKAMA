import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Info, Star } from 'lucide-react';
import type { AnimeEntry, JikanAnime, AnimeStatus, Rating } from '../../../../shared/types/index.js';
import { AnimeStatusEnum } from '../../../../shared/types/index.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Spinner } from '../common/Spinner.js';
import { useToast } from '../common/Toast.js';

interface EntryDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entryId?: string;
  animeId?: string;
  onUpdate: () => void;
}

export const EntryDetailDrawer: React.FC<EntryDetailDrawerProps> = ({
  isOpen,
  onClose,
  animeId,
  onUpdate
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [entry, setEntry] = useState<Partial<AnimeEntry>>({
    status: AnimeStatusEnum.PLAN_TO_WATCH,
    episodeProgress: 0,
    rewatchCount: 0,
    privateNotes: ''
  });
  const [rating, setRating] = useState<Partial<Rating>>({
    animation: 0,
    characters: 0,
    buildUp: 0,
    story: 0,
    feeling: 0,
    ending: 0,
    calculatedScore: 0,
    review: ''
  });

  const fetchData = async () => {
    if (!animeId) return;
    setLoading(true);
    try {
      // 1. Fetch Anime Details
      const animeRes = await api.get(`/anime/${animeId}`);
      setAnime(animeRes.data);

      // 2. Fetch Entry
      const entriesRes = await api.get(`/entries`);
      const currentEntry = entriesRes.data.find((e: any) => e.animeId === String(animeId));
      if (currentEntry) setEntry(currentEntry);

      // 3. Fetch Rating
      const ratingRes = await api.get(`/ratings/${animeId}`);
      if (ratingRes.data) setRating(ratingRes.data);
    } catch (error) {
      console.error('Error fetching entry details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && animeId) fetchData();
  }, [isOpen, animeId]);

  const calculateScore = (data: Partial<Rating>) => {
    const weights: Record<string, number> = {
      story: 0.20, characters: 0.20, buildUp: 0.18, feeling: 0.18, ending: 0.14, animation: 0.10
    };
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      const val = (data as any)[key] || 0;
      if (val > 0) {
        weightedSum += val * weight;
        totalWeight += weight;
      }
    }
    return totalWeight === 0 ? 0 : Number((weightedSum / totalWeight).toFixed(1));
  };

  const handleRatingChange = (category: string, value: number) => {
    const newRating = { ...rating, [category]: value };
    newRating.calculatedScore = calculateScore(newRating);
    setRating(newRating);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save Entry
      if (entry.id) {
        await api.put(`/entries/${entry.id}`, entry);
      } else {
        await api.post(`/entries`, { ...entry, animeId: String(animeId) });
      }

      // Save Rating
      await api.post(`/ratings`, {
        ...rating,
        animeId: String(animeId)
      });

      addToast('success', 'Changes saved successfully');
      onUpdate();
      onClose();
    } catch (error) {
      addToast('error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry.id) return;
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/entries/${entry.id}`);
      addToast('success', 'Entry removed');
      onUpdate();
      onClose();
    } catch (error) {
      addToast('error', 'Failed to remove entry');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-[100]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--bg-secondary)111] border-l border-[var(--border-color)] z-[101] shadow-2xl overflow-y-auto"
          >
            {loading && !anime ? (
              <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>
            ) : anime && (
              <div className="p-8 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <img src={anime.images.jpg.image_url} className="w-20 h-28 object-cover rounded shadow-xl" />
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold tracking-tight">{anime.title}</h2>
                      <p className="text-xs text-white/40">{anime.studios[0]?.name} • {anime.year}</p>
                      <StatusBadge status={entry.status as AnimeStatus} />
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Status</label>
                    <select 
                      value={entry.status}
                      onChange={e => setEntry({ ...entry, status: e.target.value as AnimeStatus })}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2.5 rounded text-sm outline-none"
                    >
                      {(Object.values(AnimeStatusEnum) as string[]).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Progress</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" value={entry.episodeProgress} 
                        onChange={e => setEntry({ ...entry, episodeProgress: parseInt(e.target.value) })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-2.5 rounded text-sm"
                      />
                      <span className="text-white/20">/ {anime.episodes || '?'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Category Rating</h3>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-[var(--border-color)]">
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="text-sm font-bold">{rating.calculatedScore || '0.0'}</span>
                    </div>
                  </div>
                  
                  {['animation', 'characters', 'buildUp', 'story', 'feeling', 'ending'].map(cat => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-medium text-white/60 capitalize flex items-center gap-1">
                          {cat.replace(/([A-Z])/g, ' $1')}
                          <Info size={12} className="opacity-40 cursor-help" />
                        </span>
                        <span className="text-xs font-bold font-mono">{(rating as any)[cat] || '—'}</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" step="1"
                        value={(rating as any)[cat] || 0}
                        onChange={e => handleRatingChange(cat, parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 appearance-none rounded-full cursor-pointer accent-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-4 border-t border-[var(--border-color)]">
                  <textarea 
                    placeholder="Private notes (only visible to you)..."
                    value={entry.privateNotes || ''}
                    onChange={e => setEntry({ ...entry, privateNotes: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl text-sm min-h-[100px] outline-none placeholder:text-white/10"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-white text-black font-bold h-12 rounded-xl hover:bg-white/90 shadow-lg active:scale-95 transition-all"
                    >
                      {loading ? <Spinner size="sm" /> : 'Save Changes'}
                    </button>
                    {entry.id && (
                      <button onClick={handleDelete} className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
