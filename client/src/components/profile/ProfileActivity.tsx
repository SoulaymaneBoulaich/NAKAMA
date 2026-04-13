import React from 'react';
import type { Activity } from '../../../../shared/types/index.js';
import { Plus, Edit3, Star, UserPlus, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileActivityProps {
  activities: Activity[];
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ANIME_ADD': return <Plus size={14} className="text-green-500" />;
      case 'ANIME_UPDATE': return <Edit3 size={14} className="text-blue-500" />;
      case 'ANIME_RATE': return <Star size={14} className="text-yellow-500" />;
      case 'FOLLOW': return <UserPlus size={14} className="text-purple-500" />;
      case 'POST_CREATE': return <MessageSquare size={14} className="text-red-500" />;
      default: return null;
    }
  };

  const getActionText = (activity: Activity) => {
    switch (activity.type) {
      case 'ANIME_ADD': return 'Added';
      case 'ANIME_UPDATE': return 'Updated';
      case 'ANIME_RATE': return `Rated ${activity.metadata?.score}/10`;
      case 'FOLLOW': return 'Followed';
      case 'POST_CREATE': return 'Posted in';
      default: return 'Did something';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-gray-800 rounded-sm">
        <span className="text-gray-600 uppercase tracking-widest text-xs font-bold">No recent activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-800">
      {activities.map((activity) => (
        <div key={activity.id} className="relative pl-10 group">
          {/* Timeline Dot */}
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-gray-800 flex items-center justify-center z-10 group-hover:border-gray-500 transition-colors">
            {getIcon(activity.type)}
          </div>

          {/* Content Card */}
          <div className="bg-[var(--bg-tertiary)] border border-gray-800 p-4 rounded-sm hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm">
                <span className="text-gray-400 font-medium uppercase tracking-tighter mr-2">
                  {getActionText(activity)}
                </span>
                <span className="text-white font-bold uppercase tracking-tight">
                  {activity.entityTitle}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>

            {activity.entityImage && (
              <div className="mt-3 w-16 h-24 bg-[#222] rounded-sm overflow-hidden">
                <img src={activity.entityImage} alt={activity.entityTitle || ''} className="w-full h-full object-cover" />
              </div>
            )}
            
            {activity.type === 'ANIME_UPDATE' && activity.metadata?.status && (
              <div className="mt-2 text-xs flex items-center gap-2">
                <span className="text-gray-500 uppercase font-bold tracking-widest text-[9px]">New Status:</span>
                <span className="text-red-500 font-black uppercase italic tracking-tighter">{activity.metadata.status}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileActivity;
