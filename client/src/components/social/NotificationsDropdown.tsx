import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Bell, Check, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Notification } from '../../../../shared/types';
import { Spinner } from '../common/Spinner';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
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
      case 'LIKE': return <Heart size={14} className="text-red-500 fill-red-500" />;
      case 'COMMENT': return <MessageSquare size={14} className="text-blue-500" />;
      case 'FOLLOW': return <UserPlus size={14} className="text-green-500" />;
      default: return <Bell size={14} className="text-zinc-400" />;
    }
  };

  const getLink = (notification: Notification) => {
    if (notification.type === 'FOLLOW') return `/profile/${notification.actor?.username}`;
    if (notification.referenceId) return `/posts/${notification.referenceId}`;
    return '#';
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            markAllReadMutation.mutate();
          }}
          className="text-[10px] font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
        >
          <Check size={12} /> Mark all read
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-8 text-center text-white">
            <Bell size={40} className="mx-auto text-zinc-800 mb-2" />
            <p className="text-zinc-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {notifications?.map((n) => (
              <Link 
                key={n.id} 
                to={getLink(n)}
                onClick={() => {
                  if (!n.isRead) markReadMutation.mutate(n.id);
                  onClose();
                }}
                className={`flex gap-3 p-4 hover:bg-zinc-800/50 transition-colors relative group ${!n.isRead ? 'bg-red-500/5' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={n.actor?.avatar || '/default-avatar.png'} 
                    alt={n.actor?.username}
                    className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover bg-zinc-800"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-zinc-900 p-1 rounded-full border border-[var(--border-color)] shadow-sm">
                    {getIcon(n.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-white">
                  <p className="text-sm text-zinc-300 leading-tight">
                    <span className="font-bold text-white">{n.actor?.username}</span> {n.message}
                  </p>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-red-600 rounded-full self-center flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link 
        to="/notifications" 
        onClick={onClose}
        className="block p-3 text-center text-xs font-bold text-zinc-500 hover:text-white bg-zinc-800/30 hover:bg-zinc-800 transition-all border-t border-[var(--border-color)] uppercase tracking-widest"
      >
        View All Notifications
      </Link>
    </div>
  );
};

export default NotificationsDropdown;
