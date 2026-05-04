import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import SearchBar from '../social/SearchBar';

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-20 right-0 h-20 z-[40] px-8 flex items-center justify-between bg-black/10 backdrop-blur-sm border-b border-white/5">
      {/* Search Bar - Center Left */}
      <div className="flex-1 pointer-events-auto max-w-xl">
        <SearchBar />
      </div>

      {/* Profile & Notifications - Right */}
      <div className="flex items-center gap-4 pointer-events-auto">
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
