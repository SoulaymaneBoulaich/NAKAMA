import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquare, Heart, Share2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shots: any[];
  initialIndex: number;
}

const AniShotViewerModal: React.FC<Props> = ({ isOpen, onClose, shots, initialIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const currentShot = shots[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const duration = 5000; // 5 seconds per shot
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < shots.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleLike = async () => {
    if (!user) {
      addToast('error', 'Log in to interact with shots');
      return;
    }
    try {
      await api.post(`/anishots/${currentShot.id}/like`);
      // Update local state if needed
    } catch (err) {
      console.error('Like failed');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-sans"
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-4 z-50 flex gap-1.5">
          {shots.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
                transition={{ duration: idx === currentIndex ? 0.05 : 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Content Container */}
        <div className="relative w-full max-w-[500px] h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-10 right-6 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all">
            <X size={24} />
          </button>

          {/* Media Rendering */}
          <div className="w-full h-full relative" onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)}>
            {currentShot.mediaType === 'video' ? (
              <video 
                src={currentShot.mediaUrl}
                autoPlay
                loop
                muted={isMuted}
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={currentShot.mediaUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            )}

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#7c3aed] overflow-hidden shadow-lg p-0.5">
                    <img src={currentShot.user?.avatar || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" alt="" />
                  </div>
                  <div>
                    <div className="text-white font-black uppercase tracking-tighter italic text-lg leading-tight">{currentShot.user?.username}</div>
                    <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{new Date(currentShot.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
                <button className="px-6 py-2 bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-lg active:scale-95 pointer-events-auto">Follow</button>
              </div>

              <div className="text-white font-medium text-[15px] leading-relaxed line-clamp-3">
                {currentShot.title}
              </div>

              <div className="flex items-center gap-6 pointer-events-auto">
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white group-hover:bg-[var(--accent-primary)] transition-all">
                    <Heart size={20} />
                  </div>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Like</span>
                </button>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white group-hover:bg-[#7c3aed] transition-all">
                    <MessageSquare size={20} />
                  </div>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Reply</span>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white group-hover:bg-blue-600 transition-all">
                    <Share2 size={20} />
                  </div>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Send</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all">
            <ChevronLeft size={32} />
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all">
            <ChevronRight size={32} />
          </button>

          {/* Mute Toggle */}
          <button onClick={() => setIsMuted(!isMuted)} className="absolute top-24 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AniShotViewerModal;
