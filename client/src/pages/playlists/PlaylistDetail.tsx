import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Play, 
  Settings, 
  Plus, 
  Heart, 
  ChevronLeft,
  Loader2,
  Trash2,
  Share2,
  Globe,
  Lock
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PlaylistEntryItem } from '../../components/playlists/PlaylistEntryItem';
import { PlaylistAddAnimeModal } from '../../components/playlists/PlaylistAddAnimeModal';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [showAddAnime, setShowAddAnime] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const { data } = await api.get(`/playlists/${id}`);
      setPlaylist(data);
      setEntries(data.entries);
      // Check if user follows
      if (user) {
         const hasFollowed = data.follows?.some((f: any) => f.userId === user.id);
         setIsFollowing(!!hasFollowed);
      }
    } catch (error) {
      console.error('Failed to fetch playlist', error);
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        saveOrder(newArray);
        return newArray;
      });
    }
  };

  const saveOrder = async (newEntries: any[]) => {
    setReordering(true);
    try {
      const orders = newEntries.map((e, index) => ({ id: e.id, order: index + 1 }));
      await api.put(`/playlists/${id}/entries/reorder`, { orders });
    } catch (error) {
      console.error('Failed to save order', error);
    } finally {
      setReordering(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Remove this anime from playlist?')) return;
    try {
      await api.delete(`/playlists/${id}/entries/${entryId}`);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  };

  const toggleFollow = async () => {
    try {
      const { data } = await api.post(`/playlists/${id}/follow`);
      setIsFollowing(data.following);
      // Update local count if we want to avoid full refresh
      setPlaylist((prev: any) => ({
        ...prev,
        _count: {
          ...prev._count,
          follows: data.following ? prev._count.follows + 1 : prev._count.follows - 1
        }
      }));
    } catch (error) {
      console.error('Failed to follow', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-red-500 animate-spin" />
      </div>
    );
  }

  const isOwner = user?.id === playlist.userId;
  const isCollaborator = playlist.collaborators.some((c: any) => c.userId === user?.id);
  const canEdit = isOwner || isCollaborator;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <Link to="/playlists" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-8 group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-widest text-[var(--accent-primary)]">Back to Library</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-64 h-64 bg-zinc-900 border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 relative group">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-800">
              <Play size={80} className="fill-zinc-800" strokeWidth={0} />
            </div>
          )}
          {canEdit && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                 <Settings size={24} />
               </button>
            </div>
          )}
        </div>

        <div className="flex flex-grow flex-col justify-end py-2">
          <div className="flex items-center gap-2 mb-2">
            {playlist.visibility === 'PUBLIC' ? <Globe size={14} className="text-green-500" /> : <Lock size={14} className="text-zinc-500" />}
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              {playlist.visibility} PLAYLIST
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase">
            {playlist.title}
          </h1>
          
          <p className="text-zinc-400 text-lg mb-6 leading-relaxed max-w-2xl">
            {playlist.description || "No description provided for this collection."}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden ring-2 ring-zinc-800">
                {playlist.user.avatar && <img src={playlist.user.avatar} className="w-full h-full object-cover" />}
              </div>
              <div>
                <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Curated by</span>
                <span className="text-zinc-200 font-black text-sm uppercase italic">{playlist.user.username}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

            <div className="flex items-center gap-6 text-zinc-500">
              <div className="text-center">
                 <span className="block text-[10px] font-bold uppercase tracking-wider">Tracks</span>
                 <span className="text-zinc-200 font-black">{entries.length}</span>
              </div>
              <div className="text-center">
                 <span className="block text-[10px] font-bold uppercase tracking-wider">Followers</span>
                 <span className="text-zinc-200 font-black">{playlist._count.follows}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-8 border-b border-[var(--border-color)]/50">
        <div className="flex items-center gap-3">
           {canEdit && (
             <button 
               onClick={() => setShowAddAnime(true)}
               className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
             >
               <Plus size={16} strokeWidth={3} />
               Add Entry
             </button>
           )}
           <button 
             onClick={toggleFollow}
             className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border ${
               isFollowing 
                 ? 'bg-zinc-800 border-zinc-700 text-zinc-400' 
                 : 'bg-transparent border-zinc-700 text-zinc-100 hover:border-zinc-500'
             }`}
           >
             <Heart size={16} fill={isFollowing ? 'currentColor' : 'none'} className={isFollowing ? 'text-red-500' : ''} />
             {isFollowing ? 'Following' : 'Follow'}
           </button>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
              <Share2 size={20} />
           </button>
           {isOwner && (
             <button className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                <Trash2 size={20} />
             </button>
           )}
           {reordering && <Loader2 size={20} className="text-red-500 animate-spin" />}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={entries.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {entries.map((entry) => (
                  <PlaylistEntryItem 
                    key={entry.id} 
                    entry={entry} 
                    isOwner={canEdit}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl bg-zinc-900/10">
             <div className="text-zinc-800 mb-4 flex justify-center">
                <Plus size={48} strokeWidth={1} />
             </div>
             <p className="text-zinc-500 font-medium">This playlist is currently empty.</p>
             {canEdit && (
               <button 
                 onClick={() => setShowAddAnime(true)}
                 className="mt-4 text-red-500 font-bold hover:underline uppercase tracking-widest text-xs"
               >
                 Add your first anime
               </button>
             )}
          </div>
        )}
      </div>

      <PlaylistAddAnimeModal 
        isOpen={showAddAnime} 
        onClose={() => setShowAddAnime(false)} 
        playlistId={id!} 
        onAddSuccess={() => {
          fetchPlaylist();
        }}
      />
    </div>
  );
};
