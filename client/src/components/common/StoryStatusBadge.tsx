import React from 'react';

interface StoryStatusBadgeProps {
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS';
  size?: 'sm' | 'md';
}

export const StoryStatusBadge: React.FC<StoryStatusBadgeProps> = ({ status, size = 'md' }) => {
  const styles = {
    ONGOING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
    HIATUS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const labels = {
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    HIATUS: 'Hiatus',
  };

  return (
    <span className={`${size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]'} font-black rounded-full border uppercase tracking-[0.2em] italic ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
