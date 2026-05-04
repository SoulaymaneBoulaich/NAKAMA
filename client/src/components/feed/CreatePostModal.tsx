import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Globe, Sparkles, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { SafeImage } from '../common/SafeImage';
import { Avatar } from '../common/Avatar';

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
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();

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
    if (!content && !mediaFile && !linkUrl) return;
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      let videoUrl = linkUrl;

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

      addToast('success', 'Post shared successfully');
      onClose();
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setShowPoll(false);
      setSelectedAnime(null);
      setLinkUrl('');
      setShowLinkInput(false);
    } catch (err) {
      addToast('error', 'Failed to share post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0a0a0c] border border-[#1a1a1a] rounded-[32px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar 
                src={user?.avatar} 
                username={user?.username || ''} 
                size="md" 
                className="w-10 h-10"
              />
              <div>
                <div className="text-[#f4f4f5] font-bold text-[0.95rem] font-dm-sans">{user?.username}</div>
                <div className="flex items-center gap-2 text-[0.65rem] font-bold text-[#71717a] uppercase tracking-[0.15em] font-dm-sans">
                  <Globe size={11} className="text-[#71717a]" /> Public Post
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[#71717a] hover:text-[#f4f4f5] transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-8 py-8 custom-scrollbar">
            {/* Input Surface */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 bg-transparent text-[1.1rem] font-medium text-[#f4f4f5] placeholder:text-[#3a3a3c] outline-none resize-none font-dm-sans leading-relaxed tracking-tight"
            />

            {/* Link Input Section */}
            {showLinkInput && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3"
              >
                <LinkIcon size={18} className="text-blue-500" />
                <input 
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Paste a link or clip URL..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-blue-400 placeholder:text-zinc-700 font-medium"
                />
                <button onClick={() => setShowLinkInput(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* Media Blocks */}
            {mediaPreview && (
              <div className="relative mt-4 rounded-3xl overflow-hidden group border border-[#1a1a1a] bg-[#000]">
                {mediaType === 'image' ? (
                  <SafeImage src={mediaPreview} className="w-full max-h-96 object-cover" alt="" />
                ) : (
                  <video src={mediaPreview} className="w-full max-h-96 object-cover" controls />
                )}
                <button 
                  onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                  className="absolute top-4 right-4 p-2.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Anime Reference Section */}
            {selectedAnime ? (
              <div className="mt-6 flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-[#1a1a1a] group">
                <div className="w-10 h-14 rounded-xl overflow-hidden border border-[#2a2a2a]">
                  <SafeImage src={selectedAnime.images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <div className="text-[0.82rem] font-bold text-[#f4f4f5] font-dm-sans truncate tracking-tight">{selectedAnime.title}</div>
                  <div className="text-[0.65rem] text-[#71717a] uppercase tracking-widest font-bold font-dm-sans">Anime Tagged</div>
                </div>
                <button onClick={() => setSelectedAnime(null)} className="p-2 opacity-0 group-hover:opacity-100 transition-all text-[#71717a] hover:text-[#f4f4f5]">
                  <X size={14} />
                </button>
              </div>
            ) : (
               <div className="mt-4">
                  <input 
                    type="text" 
                    value={animeQuery}
                    onChange={(e) => setAnimeQuery(e.target.value)}
                    placeholder="Tag an anime..."
                    className="w-full bg-transparent border-none text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#3a3a3a] outline-none placeholder:text-[#2a2a2a] font-dm-sans"
                  />
               </div>
            )}

            {/* Poll Component */}
            {showPoll && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white/5 rounded-2xl border border-[#1a1a1a] space-y-4"
              >
                <input 
                  type="text" 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask the community..."
                  className="w-full bg-transparent border-none text-[#f4f4f5] font-bold text-[0.9rem] outline-none placeholder:text-[#71717a] mb-2 font-dm-sans"
                />
                <div className="space-y-3">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 flex items-center justify-center bg-[#111114] border border-[#1a1a1a] rounded-md text-[0.65rem] font-bold text-white font-dm-sans">{idx + 1}</div>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-[#111114] border border-[#1a1a1a] text-[0.8rem] p-2.5 px-4 rounded-xl text-[#a1a1aa] outline-none focus:border-[#333] font-dm-sans"
                      />
                    </div>
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <button onClick={addPollOption} className="text-[0.65rem] font-bold text-[#71717a] uppercase tracking-[0.1em] hover:text-white transition-colors pl-10 font-dm-sans">+ Add Option</button>
                )}
              </motion.div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="px-8 py-6 bg-black/40 border-t border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#71717a] hover:text-[#f4f4f5] transition-all cursor-pointer group">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaSelect(e, 'image')} />
                <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
              </label>
              <label className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#71717a] hover:text-[#f4f4f5] transition-all cursor-pointer group">
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaSelect(e, 'video')} />
                <Video size={18} className="group-hover:scale-110 transition-transform" />
              </label>
              <button 
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={`p-3 rounded-xl transition-all group ${showLinkInput ? 'bg-white/10 text-white' : 'bg-white/5 text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/10'}`}
              >
                <LinkIcon size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={() => setShowPoll(!showPoll)}
                className={`p-3 rounded-xl transition-all group ${showPoll ? 'bg-white/10 text-white' : 'bg-white/5 text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/10'}`}
              >
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content && !mediaFile && !youtubeUrl)}
              className="px-10 py-3.5 bg-white text-black rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center gap-3 font-dm-sans"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Post</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
