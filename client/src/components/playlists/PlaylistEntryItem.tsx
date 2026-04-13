import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, MessageSquare } from 'lucide-react';

interface EntryProps {
  entry: {
    id: string;
    animeId: string;
    animeTitle: string;
    animeCover: string;
    note?: string | null;
    addedBy: {
      username: string;
      avatar?: string | null;
    };
  };
  isOwner: boolean;
  onDelete?: (id: string) => void;
}

export const PlaylistEntryItem: React.FC<EntryProps> = ({ entry, isOwner, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-3 bg-zinc-900/30 border border-[var(--border-color)]/50 rounded-lg group hover:border-zinc-700 transition-colors"
    >
      {isOwner && (
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={18} />
        </button>
      )}

      <div className="w-12 h-16 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
        <img src={entry.animeCover} alt={entry.animeTitle} className="w-full h-full object-cover" />
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-sm text-zinc-100 truncate">{entry.animeTitle}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-zinc-500">Added by {entry.addedBy.username}</span>
          {entry.note && (
             <div className="flex items-center gap-1 text-[10px] text-zinc-400">
               <span className="w-1 h-1 rounded-full bg-zinc-700" />
               <MessageSquare size={10} />
               <span className="truncate max-w-[150px]">{entry.note}</span>
             </div>
          )}
        </div>
      </div>

      {isOwner && (
        <button
          onClick={() => onDelete?.(entry.id)}
          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
