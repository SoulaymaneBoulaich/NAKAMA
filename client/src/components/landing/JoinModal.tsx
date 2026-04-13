import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [characterImage, setCharacterImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !characterImage) {
      const fetchChar = async () => {
        try {
          const response = await api.get('/public/character');
          if (response.data?.images?.jpg?.image_url) {
            setCharacterImage(response.data.images.jpg.image_url);
          }
        } catch (err) {
          console.error('Error fetching character for modal:', err);
        }
      };
      fetchChar();
    }
  }, [isOpen, characterImage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-[10px] p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[480px] bg-[var(--bg-primary)] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-[var(--border-color)]"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-[#71717a] hover:text-[#f4f4f5] transition-all hover:rotate-90"
          >
            <X size={20} />
          </button>

          {/* Glowing Border Background */}
          <div className="absolute inset-0 pointer-events-none z-10 border-[1px] border-[var(--accent-primary)]/20 rounded-[32px]" />
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[var(--accent-primary)]/10 blur-[100px] pointer-events-none" />

          {/* Top Banner with SafeImage */}
          <div className="relative h-[220px] w-full">
            <SafeImage 
              src={characterImage} 
              alt="Join NAKAMA" 
              className="w-full h-full"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/40 to-[var(--bg-primary)]" />
          </div>

          {/* Content */}
          <div className="relative px-10 pb-10 -mt-8 z-20">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-[2px] bg-[var(--accent-primary)] mb-6 rounded-full" />
              <h2 className="font-outfit font-extrabold text-[1.8rem] text-[#f4f4f5] leading-tight mb-3">
                Join the Culture.
              </h2>
              <p className="font-dm-sans text-[0.95rem] text-[#71717a] mb-10 max-w-[300px]">
                Track anime. Debate with nakama worldwide. Create your own arcs.
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => alert('Google OAuth integration in progress')}
                className="w-full bg-white text-black font-dm-sans font-bold text-[0.95rem] py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={() => navigate('/signup')}
                className="w-full bg-[var(--accent-primary)] text-white font-dm-sans font-bold text-[0.95rem] py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-95"
              >
                Create NAKAMA Account
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-[#1e1e24] flex items-center justify-between">
               <span className="font-dm-sans text-[0.8rem] text-[#3f3f46]">Already a member?</span>
               <button 
                 onClick={() => navigate('/login')}
                 className="font-jetbrains text-[0.7rem] text-[var(--accent-primary)] hover:text-white transition-colors underline underline-offset-4"
               >
                 LOG IN
               </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
