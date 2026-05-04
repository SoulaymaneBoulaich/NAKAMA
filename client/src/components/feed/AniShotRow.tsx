import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import api from '../../api/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AniShotViewerModal from './AniShotViewerModal';
import { AniShotCreationModal } from './AniShotCreationModal';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

const AniShotRow: React.FC = () => {
  const { user } = useAuth();
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
    <div className="w-full bg-[#0a0a0c] border-b border-[#1a1a1c] overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-3 px-4 sm:px-6">
        
        {/* OWN BUBBLE (STORY STYLE) */}
        <div className="flex flex-col items-center flex-shrink-0 gap-1.5">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreationOpen(true)}
            className="relative w-[64px] h-[64px]"
          >
            <div className="w-full h-full rounded-full p-[2px] bg-[#1a1a1c] border border-[#2a2a2e]">
               <Avatar 
                 src={user?.avatar} 
                 username={user?.username || ''}
                 size="sm"
                 className="w-full h-full rounded-full grayscale opacity-80"
               />
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-red-600 rounded-full border-2 border-[#0a0a0c] flex items-center justify-center text-white">
              <Plus size={14} strokeWidth={3} />
            </div>
          </motion.button>
          <span className="text-[0.7rem] text-[#71717a] font-medium truncate w-[64px] text-center">
            Your Shot
          </span>
        </div>

        {/* STATUS LIST */}
        {isLoading ? (
           Array(8).fill(0).map((_, i) => (
             <div key={i} className="flex flex-col items-center flex-shrink-0 gap-1.5 animate-pulse">
               <div className="w-[64px] h-[64px] rounded-full bg-[#111114] border border-[#1a1a1c]" />
               <div className="w-10 h-2 bg-[#111114] rounded" />
             </div>
           ))
        ) : (
          shots?.map((shot: any, idx: number) => (
            <div key={shot.id} className="flex flex-col items-center flex-shrink-0 gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedShotIndex(idx)}
                className={`relative w-[64px] h-[64px] rounded-full p-[2.5px] ${
                  shot.viewed 
                    ? 'bg-[#2a2a2e]' 
                    : 'bg-gradient-to-tr from-[#9333ea] via-[#d946ef] to-[#f472b6]'
                }`}
              >
                <div className="w-full h-full rounded-full p-[1.5px] bg-[#0a0a0c]">
                   <Avatar 
                     src={shot.user?.avatar} 
                     username={shot.user?.username || ''}
                     size="sm"
                     className="w-full h-full rounded-full"
                   />
                </div>
              </motion.button>
              <span className="text-[0.7rem] text-[#efeff1] font-medium truncate w-[64px] text-center">
                {shot.user?.username}
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

