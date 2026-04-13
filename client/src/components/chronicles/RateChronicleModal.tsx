import React, { useState } from 'react';
import { X, Loader2, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useToast } from '../common/Toast';

interface RateModalProps {
  isOpen: boolean;
  chronicleId: string;
  onClose: () => void;
  onRated: () => void;
}

export const RateChronicleModal: React.FC<RateModalProps> = ({ 
  isOpen,
  chronicleId, 
  onClose, 
  onRated 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      addToast('error', 'Select a resonance grade');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/chronicles/${chronicleId}/rate`, { rating, review });
      addToast('success', 'Resonance rating anchored');
      onRated();
      onClose();
    } catch (error) {
      addToast('error', 'Failed to anchor rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-lg bg-[#0d0d0f] border border-[var(--border-color)] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--accent-primary)]/10 rounded-2xl">
                <Sparkles size={20} className="text-[var(--accent-primary)]" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Rate Chronicle</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-600">
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setRating(num)}
                className={`w-9 h-12 rounded-lg text-[10px] font-black transition-all ${
                  rating >= num 
                    ? 'bg-[var(--accent-primary)] text-white' 
                    : 'bg-white/5 text-zinc-600 hover:text-white hover:bg-white/10'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Anchor your thoughts in the resonance..."
            className="w-full h-32 bg-white/5 border border-[var(--border-color)] rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-[var(--accent-primary)]/40 transition-all italic placeholder:text-zinc-800"
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-6 bg-[var(--accent-primary)] text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(220,38,38,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span className="font-black uppercase tracking-widest text-[11px]">Anchor Resonance</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
