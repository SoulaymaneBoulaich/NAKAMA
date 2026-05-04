import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  PenTool, 
  Users, 
  PlaySquare, 
  ChevronRight,
  Image as ImageIcon,
  BarChart3,
  Video,
  Link as LinkIcon,
  Plus
} from 'lucide-react';
import { CreatePostModal } from '../feed/CreatePostModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Avatar } from '../common/Avatar';
import { Spinner } from '../common/Spinner';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface UnifiedCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreationStep = 'HUB' | 'COMMUNITY_SELECT';

export const UnifiedCreationModal: React.FC<UnifiedCreationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<CreationStep>('HUB');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ['my-communities'],
    queryFn: async () => {
      const res = await api.get('/communities/my');
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: step === 'COMMUNITY_SELECT'
  });

  const handleClose = () => {
    setStep('HUB');
    setSelectedCommunity(null);
    onClose();
  };

  const options = [
    {
      id: 'post',
      title: 'Create a post',
      description: 'Share your thoughts, photos, or polls with everyone',
      icon: PenTool,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      action: () => setShowPostModal(true)
    },
    {
      id: 'community',
      title: 'Share with community',
      description: 'Post specifically to one of your joined collectives',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      action: () => setStep('COMMUNITY_SELECT')
    },
    {
      id: 'playlist',
      title: 'Create playlist',
      description: 'Curate your favorite anime into a Spotify-style collection',
      icon: PlaySquare,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      action: () => {
        setShowPlaylistModal(true);
        onClose();
      }
    }
  ];

  if (!isOpen && !showPostModal && !showPlaylistModal) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#121214] border border-white/5 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 px-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  {step !== 'HUB' && (
                    <button 
                      onClick={() => setStep('HUB')}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500"
                    >
                      <Plus size={20} className="rotate-45" />
                    </button>
                  )}
                  <h2 className="text-xl font-black text-white font-dm-sans tracking-tight uppercase italic">
                    {step === 'HUB' ? 'Create' : 'Select Collective'}
                  </h2>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2.5 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 px-8">
                {step === 'HUB' && (
                  <div className="space-y-3">
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={opt.action}
                        className="w-full flex items-center gap-5 p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all group text-left"
                      >
                        <div className={`w-14 h-14 ${opt.bg} ${opt.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                          <opt.icon size={28} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-white mb-1 group-hover:text-[var(--accent-primary)] transition-colors">{opt.title}</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">{opt.description}</p>
                        </div>
                        <ChevronRight size={20} className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                {step === 'COMMUNITY_SELECT' && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4">Your Collectives</p>
                    {isLoadingCommunities ? (
                      <div className="py-20 flex justify-center">
                        <Spinner />
                      </div>
                    ) : communities?.length === 0 ? (
                      <div className="py-20 text-center">
                        <Users size={48} className="mx-auto text-zinc-800 mb-4" />
                        <p className="text-zinc-500 text-sm">Join a community to share content with them</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {communities?.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCommunity(c);
                              setShowPostModal(true);
                              onClose();
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group text-left border border-transparent hover:border-white/5"
                          >
                            <Avatar src={c.avatarUrl} name={c.name} size="md" className="!rounded-2xl" />
                            <div className="flex-1">
                              <h5 className="text-sm font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">{c.name}</h5>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{c.memberCount} Members</p>
                            </div>
                            <Plus size={18} className="text-zinc-700 group-hover:text-[var(--accent-primary)] transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Nakama Protocol v2.4 // Unified Core</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreatePostModal 
        isOpen={showPostModal} 
        onClose={() => {
          setShowPostModal(false);
          setStep('HUB');
          setSelectedCommunity(null);
        }}
        communityId={selectedCommunity?.id}
      />

      <CreatePlaylistModal 
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />
    </>
  );
};
