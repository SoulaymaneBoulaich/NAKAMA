import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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
    <div className="relative py-[1.2rem] pb-[1.4rem] border-b border-[#1a1a1a] select-none">
      <div className="flex items-start gap-[1.2rem] overflow-x-auto scrollbar-hide px-6">
        
        {/* OWN BUBBLE (ADD) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreationOpen(true)}
            className="w-14 h-14 md:w-[56px] md:h-[56px] rounded-full bg-transparent border-[1.5px] border-[#333333] flex items-center justify-center group hover:border-white transition-colors"
          >
            <Plus size={18} className="text-[#71717a] group-hover:text-white transition-colors" />
          </motion.button>
          <span className="text-[0.62rem] font-medium text-[#71717a] uppercase tracking-[0.1em] text-center mt-1.5 font-dm-sans">
            Add
          </span>
        </div>

        {/* STATUS LIST */}
        {isLoading ? (
           Array(5).fill(0).map((_, i) => (
             <div key={i} className="flex flex-col items-center flex-shrink-0 animate-pulse">
               <div className="w-14 h-14 md:w-[56px] md:h-[56px] rounded-full bg-[#111114] border border-[#1a1a1a]" />
               <div className="w-8 h-1.5 bg-[#111114] rounded mt-2" />
             </div>
           ))
        ) : (
          shots?.map((shot: any, idx: number) => (
            <div key={shot.id} className="flex flex-col items-center flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedShotIndex(idx)}
                className={`w-14 h-14 md:w-[56px] md:h-[56px] rounded-full p-[2px] transition-all ${
                  shot.viewed 
                    ? 'border-2 border-[#2a2a2a]' 
                    : 'border-2 border-white'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#111114]">
                   <img 
                     src={shot.user?.avatar || '/default-avatar.png'} 
                     className="w-full h-full object-cover" 
                     alt=""
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = '/default-avatar.png';
                     }}
                   />
                </div>
              </motion.button>
              <span className="text-[0.62rem] font-medium text-[#71717a] uppercase tracking-[0.1em] truncate w-14 text-center mt-1.5 font-dm-sans">
                {shot.user?.username.split(' ')[0]}
              </span>
            </div>
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

