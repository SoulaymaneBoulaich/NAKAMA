import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import type { Comment } from '../../../../shared/types';
import { Spinner } from '../common/Spinner';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}/comments`);
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const commentMutation = useMutation({
    mutationFn: (newComment: string) => api.post(`/posts/${postId}/comments`, { content: newComment }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/posts/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    commentMutation.mutate(content);
  };

  return (
    <div className="p-5 space-y-6">
      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative group">
        <input 
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add to the stream..."
          className="w-full bg-[var(--bg-secondary)114] border border-[#232329] rounded-2xl px-5 py-3.5 pr-14 text-sm font-dm-sans text-[#f4f4f5] placeholder-[#3f3f46] focus:outline-none focus:border-white transition-all transition-all"
        />
        <button 
          type="submit"
          disabled={!content.trim() || commentMutation.isPending}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black p-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          {commentMutation.isPending ? <Spinner size="sm" /> : <Send size={18} />}
          {commentMutation.isPending ? <Spinner size="sm" /> : <Send size={18} />}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : comments?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <MessageSquare size={32} strokeWidth={1.5} className="mb-3" />
            <p className="text-[0.8rem] font-dm-sans font-medium uppercase tracking-widest">Awaiting transmission</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-4 group/item">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#232329] flex-shrink-0">
                  <img 
                    src={comment.user.avatar || '/default-avatar.png'} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.85rem] font-dm-sans font-black text-[#f4f4f5] uppercase tracking-tight italic">
                        {comment.user.username}
                      </span>
                      <span className="text-[10px] font-dm-sans font-bold text-[#71717a] uppercase tracking-widest">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </span>
                    </div>
                    {/* Potential delete button for creator/owner */}
                    <button 
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className="p-1.5 text-[#71717a] hover:text-[var(--accent-primary)] opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="bg-[#18181d] border border-[#232329] rounded-2xl px-5 py-3 rounded-tl-none">
                    <p className="text-sm font-dm-sans text-[#a1a1aa] leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
