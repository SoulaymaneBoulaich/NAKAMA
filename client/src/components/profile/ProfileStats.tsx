import React from 'react';
import type { UserStats } from '../../../../shared/types/index.js';
import { Monitor, Play, Users, MessageSquare } from 'lucide-react';

interface ProfileStatsProps {
  stats: UserStats;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    { label: 'Anime Tracked', value: stats.totalTracked, icon: Monitor, color: 'text-white' },
    { label: 'Episodes Watched', value: stats.episodesWatched, icon: Play, color: 'text-red-500' },
    { label: 'Communities', value: stats.communitiesJoined, icon: Users, color: 'text-white' },
    { label: 'Posts', value: stats.postsCount, icon: MessageSquare, color: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div 
          key={index} 
          className="bg-[var(--bg-tertiary)] border border-gray-800 p-4 rounded-sm flex flex-col gap-1 group hover:border-gray-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <item.icon size={16} className={`${item.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{item.label}</span>
          </div>
          <div className="text-2xl font-black text-white mt-1 tabular-nums">
            {item.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
