import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Sparkles, MessageSquare, Flame, Play, Plus } from 'lucide-react';
import api from '../../api/axios';
import type { AniShot, AniShotType } from '../../../../shared/types';
import { Spinner } from '../common/Spinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (shot: AniShot) => void;
}

export const AniShotCreationModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [shotType] = useState<AniShotType>('THOUGHT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animeQuery, setAnimeQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!mediaFile || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Step 1: Upload Media
      const formData = new FormData();
      formData.append('file', mediaFile);
      
      const uploadRes = await api.post('/upload/anishot', formData);
      const { url: mediaUrl } = uploadRes.data;

      // Step 2: Manifest AniShot Metadata
      const res = await api.post('/anishots', {
        content: title, // Map UI 'title' to server 'content'
        mediaUrl,
        type: shotType,
        animeId: selectedAnime?.id,
        animeTitle: selectedAnime?.title, // If possible, or just send id
        animeCover: selectedAnime?.coverImage
      });

      onCreated(res.data);
      onClose();
      setMediaFile(null);
      setMediaPreview(null);
      setTitle('');
      setAnimeQuery('');
      setSelectedAnime(null);
    } catch (err) {
      console.error('Failed to manifest shot', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-xl bg-[#0d0d0f] border border-[var(--border-color)] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-10 py-8 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl">
                <Camera size={20} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <div className="text-white font-black uppercase tracking-tighter italic text-xl">Manifest AniShot</div>
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Share the ephemeral resonance</div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-10 space-y-8">
            {/* Media Upload Surface */}
            <div 
              className={`relative aspect-[9/16] w-full max-w-[240px] mx-auto rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden group cursor-pointer ${
                mediaPreview ? 'border-[var(--accent-primary)]/40' : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/30'
              }`}
              onClick={() => document.getElementById('shot-upload')?.click()}
            >
              {mediaPreview ? (
                <>
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} className="w-full h-full object-cover" autoPlay loop muted />
                  ) : (
                    <img src={mediaPreview} className="w-full h-full object-cover" alt="" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sparkles className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-5 bg-white/5 rounded-full text-zinc-600 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all shadow-xl">
                    <Plus size={32} />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-black text-white uppercase tracking-widest italic">Ignite Medium</div>
                    <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Image or Video</div>
                  </div>
                </>
              )}
              <input 
                id="shot-upload"
                type="file" 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            {/* Input Surface */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                   <MessageSquare size={12} className="text-[var(--accent-primary)]" /> 
                   Manifestation Title
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 'PEAK RESONANCE ATTAINED...'"
                  className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 focus:bg-white/10 transition-all italic placeholder:text-zinc-800"
                />
              </div>

               {/* Anime Search Placeholder/Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                   <Flame size={12} className="text-[var(--accent-primary)]" /> 
                   Resonance Target
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={animeQuery}
                    onChange={(e) => setAnimeQuery(e.target.value)}
                    placeholder="Link Anime Record..."
                    className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[11px] font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 transition-all uppercase tracking-widest placeholder:text-zinc-900"
                  />
                  {selectedAnime && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[var(--accent-primary)] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight">
                        Locked
                        <X size={10} className="cursor-pointer" onClick={() => setSelectedAnime(null)} />
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <button
              onClick={handleSubmit}
              disabled={!mediaFile || isSubmitting}
              className="w-full py-6 bg-[var(--accent-primary)] text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>DROP SHOT</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
