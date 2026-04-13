import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, MessageSquare, Sparkles, Send, Loader2, Target } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../common/Toast';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (chronicleId: string) => void;
}

export const CreateChronicleModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      addToast('error', 'Chronicle title required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/chronicles', {
        title,
        description,
        tags,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      addToast('success', 'Chronicle initialized successfully!');
      onCreated(data.id);
      onClose();
    } catch (error) {
      addToast('error', 'Failed to forge chronicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0d0d0f] border border-[var(--border-color)] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl">
              <Book size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <div className="text-white font-black uppercase tracking-tighter italic text-xl">Forge Chronicle</div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Construct your archival legacy</div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                 <Target size={12} className="text-[var(--accent-primary)]" /> 
                 Manifesto Title
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Declare the title..."
                className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 transition-all italic placeholder:text-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                 <MessageSquare size={12} className="text-[var(--accent-primary)]" /> 
                 Abstract Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize the resonance..."
                className="w-full h-32 bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 transition-all italic placeholder:text-zinc-800 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                 <Sparkles size={12} className="text-[var(--accent-primary)]" /> 
                 Resonance Anchors (Tags)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                 {tags.map(t => (
                   <span key={t} className="px-3 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg text-[10px] font-black text-[var(--accent-primary)] uppercase flex items-center gap-2">
                      {t}
                      <X size={10} className="cursor-pointer" onClick={() => handleRemoveTag(t)} />
                   </span>
                 ))}
              </div>
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Press ENTER to anchor tag..."
                className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl px-6 py-4 text-[11px] font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 transition-all uppercase tracking-widest placeholder:text-zinc-900"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-6 bg-[var(--accent-primary)] text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(220,38,38,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
            <span className="font-black uppercase tracking-[0.2em] italic">Forge Collective Logic</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
