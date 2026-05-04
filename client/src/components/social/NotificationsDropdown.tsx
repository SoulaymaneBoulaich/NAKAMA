import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Bell, Check, Heart, MessageSquare, UserPlus, Settings, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../../../../shared/types';
import { Spinner } from '../common/Spinner';
import { Avatar } from '../common/Avatar';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: isOpen
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart size={12} className="text-red-500 fill-red-500" />;
      case 'COMMENT': return <MessageSquare size={12} className="text-blue-500" />;
      case 'FOLLOW': return <UserPlus size={12} className="text-green-500" />;
      default: return <Bell size={12} className="text-zinc-400" />;
    }
  };

  const getLink = (notification: Notification) => {
    if (notification.type === 'FOLLOW') return `/profile/${notification.actor?.username}`;
    if (notification.referenceId) return `/posts/${notification.referenceId}`;
    return '#';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-3 w-[400px] bg-[#1a1a1c] border border-white/5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
      <div className="p-4 px-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a1c]">
        <h3 className="text-base font-bold text-white font-dm-sans">Notifications</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              markAllReadMutation.mutate();
            }}
            className="text-[11px] font-bold text-[#3ea6ff] hover:text-[#65b8ff] transition-colors uppercase tracking-widest"
          >
            Mark all read
          </button>
          <button className="text-zinc-500 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-[#1a1a1c]">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Spinner />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-16 text-center">
            <Bell size={48} className="mx-auto text-[#272727] mb-4" />
            <p className="text-zinc-500 text-sm font-medium">Your notifications will live here</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications?.map((n) => (
              <Link 
                key={n.id} 
                to={getLink(n)}
                onClick={() => {
                  if (!n.isRead) markReadMutation.mutate(n.id);
                  onClose();
                }}
                className="flex gap-4 p-4 px-6 hover:bg-white/5 transition-all relative items-start group"
              >
                <div className="flex-shrink-0 pt-1">
                  {!n.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#3ea6ff] rounded-full" />
                  )}
                  <Avatar 
                    src={n.actor?.avatar} 
                    username={n.actor?.username || ''}
                    size="md"
                    className="w-12 h-12"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] leading-snug">
                    <span className="font-bold text-white">{n.actor?.username}</span>
                    <span className="text-zinc-400"> {n.message}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-[#71717a] font-medium">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-500">
                    <MoreHorizontal size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link 
        to="/notifications" 
        onClick={onClose}
        className="block p-3.5 text-center text-[11px] font-bold text-[#3ea6ff] hover:bg-[#262626] transition-all border-t border-white/5 uppercase tracking-[0.2em]"
      >
        View All activity
      </Link>
    </div>
  );
};

export default NotificationsDropdown;
