import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AniShotViewerModal from './AniShotViewerModal';
import { AniShotCreationModal } from './AniShotCreationModal';

const AniShotRow: React.FC = () => {
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [selectedShotIndex, setSelectedShotIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: shots, isLoading } = useQuery({
    queryKey: ['anishots-feed'],
    queryFn: async () => {
       const res = await api.get('/anishots/feed');
       return res.data;
    }
  });

  return (
    <div className="relative mb-8 select-none">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[var(--accent-primary)]/10 rounded-lg">
            <Sparkles size={14} className="text-[var(--accent-primary)]" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">AniShots Resonance</span>
        </div>
        <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-[var(--accent-primary)]/20 via-white/5 to-transparent" />
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
        {/* Create Shot Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreationOpen(true)}
          className="flex-shrink-0 w-24 h-36 rounded-[1.5rem] bg-zinc-900 border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-3 group hover:border-[var(--accent-primary)]/50 transition-all hover:bg-zinc-800/50"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all shadow-xl">
            <Plus size={20} />
          </div>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">Manifest</span>
        </motion.button>

        {/* Status List */}
        {isLoading ? (
           Array(6).fill(0).map((_, i) => (
             <div key={i} className="flex-shrink-0 w-24 h-36 rounded-[1.5rem] bg-zinc-900 animate-pulse border border-[var(--border-color)]" />
           ))
        ) : (
          shots?.map((shot: any, idx: number) => (
            <motion.button
              key={shot.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedShotIndex(idx)}
              className="flex-shrink-0 w-24 h-36 rounded-[1.5rem] relative group perspective-1000"
            >
              <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden border border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/40 transition-all shadow-2xl">
                 <img 
                   src={shot.mediaUrl} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                   alt=""
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* User Avatar Circle */}
              <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] p-0.5 z-10 shadow-xl overflow-hidden">
                 <img src={shot.user?.avatar || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" alt="" />
              </div>

              {/* Play Icon if video */}
              {shot.mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 group-hover:text-white transition-all z-10">
                   <Play size={20} className="fill-current" />
                </div>
              )}

              <div className="absolute bottom-3 left-0 right-0 px-2 text-center truncate">
                 <span className="text-[9px] font-black text-white/90 uppercase truncate block italic tracking-tighter">{shot.user?.username}</span>
              </div>
            </motion.button>
          ))
        )}
      </div>

      <AniShotCreationModal 
        isOpen={isCreationOpen} 
        onClose={() => setIsCreationOpen(false)} 
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['anishots-feed'] })}
      />

      {selectedShotIndex !== null && (
        <AniShotViewerModal
          isOpen={selectedShotIndex !== null}
          onClose={() => setSelectedShotIndex(null)}
          shots={shots}
          initialIndex={selectedShotIndex}
        />
      )}
    </div>
  );
};

export default AniShotRow;
