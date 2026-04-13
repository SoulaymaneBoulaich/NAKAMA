import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Globe, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
}

export const CreatePostModal: React.FC<Props> = ({ isOpen, onClose, communityId }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [animeQuery, setAnimeQuery] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();
  const [youtubeUrl] = useState('');


  if (!isOpen) return null;

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleSubmit = async () => {
    if (!content && !mediaFile && !youtubeUrl) return;
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      let videoUrl = youtubeUrl;

      // Upload if local file
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const endpoint = mediaType === 'image' ? '/upload/image' : '/upload/video';
        const uploadRes = await api.post(endpoint, formData);
        if (mediaType === 'image') imageUrl = uploadRes.data.url;
        else videoUrl = uploadRes.data.url;
      }

      // Prepare Poll Data
      const pollData = showPoll ? {
        question: pollQuestion || "Poll",
        options: pollOptions.filter(o => o.trim() !== '')
      } : null;

      await api.post('/posts', {
        content,
        communityId: communityId || null,
        imageUrl,
        videoUrl,
        animeId: selectedAnime?.mal_id?.toString(),
        poll: pollData
      });

      addToast('success', 'Post manifested in the collective');
      onClose();
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setShowPoll(false);
      setSelectedAnime(null);
    } catch (err) {
      addToast('error', 'Manifestation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-[var(--accent-primary)]/30 overflow-hidden p-0.5">
                <img src={user?.avatar || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <div>
                <div className="text-white font-black uppercase tracking-tighter italic text-lg">{user?.username}</div>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                  <Globe size={10} className="text-[var(--accent-primary)]" /> Collective Intelligence
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-1 px-8 py-8 custom-scrollbar">
            {/* Input Surface */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's manifesting in your archive?"
              className="w-full h-32 bg-transparent text-xl font-bold text-white placeholder:text-zinc-800 outline-none resize-none selection:bg-[var(--accent-primary)] selection:text-white italic tracking-tighter"
            />

            {/* Media Blocks */}
            {mediaPreview && (
              <div className="relative mt-4 rounded-3xl overflow-hidden group shadow-2xl border border-[var(--border-color)]">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} className="w-full max-h-96 object-cover" alt="" />
                ) : (
                  <video src={mediaPreview} className="w-full max-h-96 object-cover" controls />
                )}
                <button 
                  onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-[var(--accent-primary)] transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Anime Reference Section */}
            {selectedAnime ? (
              <div className="mt-6 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-[var(--border-color)] group">
                <div className="w-12 h-16 rounded-xl overflow-hidden border border-[var(--border-color)]">
                  <img src={selectedAnime.images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white italic truncate uppercase">{selectedAnime.title}</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Resonance Target Locked</div>
                </div>
                <button onClick={() => setSelectedAnime(null)} className="p-2 opacity-0 group-hover:opacity-100 transition-all text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>
            ) : (
               <div className="mt-6">
                  <input 
                    type="text" 
                    value={animeQuery}
                    onChange={(e) => setAnimeQuery(e.target.value)}
                    placeholder="Link Resonance Target (Anime Name)..."
                    className="w-full bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-zinc-500 italic outline-none placeholder:text-zinc-900"
                  />
               </div>
            )}

            {/* Poll Component */}
            {showPoll && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white/5 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-2xl"
              >
                <input 
                  type="text" 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="The query for the collective..."
                  className="w-full bg-transparent border-none text-white font-black uppercase italic tracking-tighter outline-none text-sm placeholder:text-zinc-600 mb-2"
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg text-[10px] font-black text-[var(--accent-primary)]">{idx + 1}</div>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-white/3 border-none text-xs font-bold p-2 px-4 rounded-xl text-zinc-300 outline-none focus:bg-white/10"
                      />
                    </div>
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <button onClick={addPollOption} className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-[var(--accent-primary)] transition-colors pl-10">+ Append Choice</button>
                )}
              </motion.div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="p-8 bg-black/40 border-t border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer group">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaSelect(e, 'image')} />
                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
              </label>
              <label className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all cursor-pointer group">
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaSelect(e, 'video')} />
                <Video size={20} className="group-hover:scale-110 transition-transform" />
              </label>
              <button 
                onClick={() => setShowPoll(!showPoll)}
                className={`p-4 rounded-2xl transition-all group ${showPoll ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content && !mediaFile && !youtubeUrl)}
              className="px-12 py-5 bg-[var(--accent-primary)] text-white rounded-2xl text-xs font-black uppercase tracking-[0.4rem] shadow-[0_10px_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Manifest</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
