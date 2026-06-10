import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import SearchBar from '../social/SearchBar';
import { motion } from 'framer-motion';

interface TopBarProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ isMenuOpen, onMenuToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-20 z-[60] px-8 flex items-center justify-between bg-black/10 backdrop-blur-sm border-b border-white/5 transition-all">
      {/* Search Bar - Center Left */}
      <div className="flex-1 pointer-events-auto max-w-xl">
        <SearchBar />
      </div>

      {/* Menu Toggle - Center */}
      <div className="flex-1 flex justify-center pointer-events-auto">
        <button 
          onClick={onMenuToggle}
          className="w-12 h-12 relative flex flex-col items-center justify-center gap-[6px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all z-50 shadow-lg"
        >
          <motion.span 
            animate={{ 
              y: isMenuOpen ? 4 : 0, 
              rotate: isMenuOpen ? 45 : 0,
              backgroundColor: isMenuOpen ? '#ef4444' : '#ffffff' 
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-5 h-[2px] rounded-full"
          />
          <motion.span 
            animate={{ 
              y: isMenuOpen ? -4 : 0, 
              rotate: isMenuOpen ? -45 : 0,
              backgroundColor: isMenuOpen ? '#ef4444' : '#ffffff' 
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-5 h-[2px] rounded-full"
          />
        </button>
      </div>

      {/* Profile & Notifications - Right */}
      <div className="flex items-center justify-end gap-4 pointer-events-auto flex-1">
        <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all group relative">
          <Bell size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
          <div className="absolute top-3 right-3 w-2 h-2 bg-[var(--accent-primary)] rounded-full border-2 border-black" />
        </button>
        
        <button 
          onClick={() => navigate(`/profile/${user?.username}`)}
          className="p-0.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center group overflow-hidden"
        >
          <Avatar 
            src={user?.avatar} 
            username={user?.username} 
            name={user?.fullName}
            size="lg"
            className="!shadow-none"
          />
        </button>
      </div>
    </div>
  );
};
