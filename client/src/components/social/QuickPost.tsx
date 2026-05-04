import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Image, Film, Hash } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface QuickPostProps {
  onOpenModal: () => void;
}

const QuickPost: React.FC<QuickPostProps> = ({ onOpenModal }) => {
  const { user } = useAuth();

  return (
    <div className="bg-zinc-900 border border-[var(--border-color)] rounded-2xl p-4 mb-6 transition-all hover:border-zinc-700">
      <div className="flex gap-4 items-center">
        <Avatar 
          src={user?.avatar} 
          username={user?.username || ''} 
          size="md"
          className="w-10 h-10 rounded-full border border-[var(--border-color)]"
        />
        <button 
          onClick={onOpenModal}
          className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 text-left px-4 py-2.5 rounded-full text-sm transition-colors"
        >
          What's on your mind, {user?.username}?
        </button>
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-color)]/50">
        <button 
          onClick={onOpenModal}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all"
        >
          <Image size={16} className="text-blue-500" />
          <span>Image</span>
        </button>
        <button 
          onClick={onOpenModal}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all"
        >
          <Film size={16} className="text-red-500" />
          <span>Anime</span>
        </button>
        <button 
          onClick={onOpenModal}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-all"
        >
          <Hash size={16} className="text-green-500" />
          <span>Community</span>
        </button>
      </div>
    </div>
  );
};

export default QuickPost;
