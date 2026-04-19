import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, ListMusic } from 'lucide-react';

interface FloatingDockProps {
  activeTab: 'trending' | 'following' | 'playlists';
  onTabChange: (tab: 'trending' | 'following' | 'playlists') => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'following', icon: Users, label: 'Following' },
    { id: 'playlists', icon: ListMusic, label: 'Playlists' },
  ] as const;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 
      md:flex flex-col items-center gap-1.5 p-2.5 w-14
      bg-[rgba(17,17,20,0.92)] backdrop-blur-[20px] border border-[#232329] rounded-full 
      shadow-[0_8px_32px_rgba(0,0,0,0.5)]
      max-md:top-auto max-md:bottom-6 max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:translate-y-0
      max-md:flex-row max-md:w-auto max-md:px-4 max-md:py-2.5 transition-all duration-300">
      
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <div key={item.id} className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(item.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative
                ${isActive 
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                  : 'bg-transparent text-[#71717a] hover:bg-[#18181d] hover:text-[#f4f4f5]'
                }`}
            >
              <Icon size={18} strokeWidth={2.5} />
            </motion.button>

            {/* Tooltip */}
            <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 
              px-3 py-1.5 bg-[rgba(0,0,0,0.85)] text-white text-[0.8rem] font-dm-sans font-medium 
              rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 
              whitespace-nowrap max-md:hidden">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
