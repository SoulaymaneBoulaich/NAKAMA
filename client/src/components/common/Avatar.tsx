import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isNakamaLeader?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  username, 
  size = 'md', 
  className = '',
  isNakamaLeader = false
}) => {
  const sizeClasses = {
    'xs': 'w-6 h-6',
    'sm': 'w-8 h-8',
    'md': 'w-10 h-10',
    'lg': 'w-12 h-12',
    'xl': 'w-24 h-24 md:w-28 md:h-28',
    '2xl': 'w-32 h-32 md:w-40 md:h-40'
  };

  return (
    <div className={`relative flex-shrink-0 group/avatar ${className}`}>
      <div className={`
        relative rounded-full overflow-hidden shadow-xl transition-all duration-500
        ${sizeClasses[size]}
        ${isNakamaLeader ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-[var(--bg-secondary)]' : 'border border-white/5'}
        group-hover/avatar:scale-105 group-hover/avatar:shadow-2xl
      `}>
        {src ? (
          <img 
            src={src} 
            alt={username || 'User'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#272727] relative">
            <User className="w-3/5 h-3/5 text-[#71717a]" />
          </div>
        )}
      </div>

      {/* Nakama Leader Badge if applicable */}
      {isNakamaLeader && size !== 'xs' && size !== 'sm' && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <span className="text-[8px] font-black text-black">Ω</span>
        </div>
      )}
    </div>
  );
};
