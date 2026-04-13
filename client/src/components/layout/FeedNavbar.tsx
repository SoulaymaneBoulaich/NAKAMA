import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface FeedNavbarProps {
  activeTab: 'trending' | 'following' | 'playlists';
  onTabChange: (tab: 'trending' | 'following' | 'playlists') => void;
}

export const FeedNavbar: React.FC<FeedNavbarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabs: { id: 'trending' | 'following' | 'playlists'; label: string }[] = [
    { id: 'trending', label: 'TRENDING' },
    { id: 'following', label: 'FOLLOWING' },
    { id: 'playlists', label: 'PLAYLISTS' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-[var(--bg-primary)] border-b border-[#232329] z-50 px-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#18181d] transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-[var(--accent-primary)] font-jp uppercase italic">仲間</span>
          <span className="font-syne font-extrabold text-[1rem] text-[#f4f4f5] tracking-tight hidden sm:block">NAKAMA</span>
        </div>
      </div>

      {/* Center Tabs */}
      <div className="flex items-center gap-8 h-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`h-full flex items-center px-1 text-[0.85rem] font-dm-sans font-semibold uppercase tracking-[0.08em] transition-all relative ${
              activeTab === tab.id ? 'text-[#f4f4f5]' : 'text-[#71717a] hover:text-[#f4f4f5]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabBorder"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7c3aed]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <button className="relative text-[#71717a] hover:text-[#f4f4f5] transition-colors p-1">
          <Bell size={20} />
          <div className="absolute top-0 right-0 w-4 h-4 bg-[#7c3aed] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg-primary)]">
            3
          </div>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#232329] bg-[var(--bg-secondary)114]">
          <img 
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nakama'} 
            alt={user?.username} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
