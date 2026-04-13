import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Post } from '../../../../shared/types';
import CommentSection from './CommentSection';
import PollCard from './PollCard';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post.id}/like`),
    onSuccess: (data) => {
      setIsLiked(data.data.liked);
      setLikeCount(prev => data.data.liked ? prev + 1 : prev - 1);
    }
  });

  const renderVideo = () => {
    if (!post.videoUrl) return null;

    const isYoutube = post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be');
    
    if (isYoutube) {
      let videoId = '';
      if (post.videoUrl.includes('v=')) videoId = post.videoUrl.split('v=')[1].split('&')[0];
      else if (post.videoUrl.includes('youtu.be/')) videoId = post.videoUrl.split('youtu.be/')[1];

      return (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black mb-4 group cursor-pointer">
        <video src={post.videoUrl} className="w-full max-h-[500px]" controls />
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-24px overflow-hidden hover:border-[var(--text-secondary)]/20 transition-all duration-300 shadow-sm"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user.username}`} className="relative group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border-color)] group-hover:border-[var(--accent-primary)] transition-colors">
              <img 
                src={post.user.avatar || '/default-avatar.png'} 
                alt={post.user.username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap text-[0.875rem]">
              <Link to={`/profile/${post.user.username}`} className="font-dm-sans font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors uppercase tracking-tight">
                {post.user.username}
              </Link>
              {post.community && (
                <>
                  <span className="text-[var(--text-secondary)] font-dm-sans">in</span>
                  <Link to={`/communities/${post.community.slug}`} className="text-[var(--accent-primary)] font-dm-sans font-bold hover:underline">
                    r/{post.community.slug}
                  </Link>
                </>
              )}
            </div>
            <span className="text-[var(--text-secondary)] text-[10px] font-dm-sans font-bold uppercase tracking-[0.15em]">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[1rem] font-dm-sans text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Media Rendering */}
      <div className="px-4 pb-4 space-y-4">
        {/* Poll */}
        {post.poll && (
          <div className="bg-[var(--bg-secondary)114] border border-[#232329] rounded-2xl p-1">
            <PollCard poll={post.poll as any} onVoteSuccess={() => {}} />
          </div>
        )}

        {/* Video */}
        {renderVideo()}

        {/* Image */}
        {post.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <img 
              src={post.imageUrl} 
              alt="Post content"
              className="w-full object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Anime Tag */}
        {post.animeId && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 rounded-full group cursor-pointer hover:bg-[var(--accent-primary)]/10 transition-all">
            <Hash size={14} className="text-[var(--accent-primary)]" />
            <span className="text-[0.75rem] font-dm-sans font-bold text-[var(--text-primary)] uppercase tracking-wider italic">
              {post.animeData?.title || "Anime Tag"}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-[var(--border-color)] flex items-center gap-8">
        <button 
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-2 group transition-all ${isLiked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'}`}
        >
          <div className={`p-2 rounded-full ${isLiked ? 'bg-[var(--accent-primary)]/10' : 'group-hover:bg-[var(--accent-primary)]/10'} transition-all`}>
            <Heart 
              size={20} 
              fill={isLiked ? 'currentColor' : 'none'} 
              strokeWidth={2.5}
              className={isLiked ? 'scale-110' : 'group-hover:scale-110 transition-transform'}
            />
          </div>
          <span className="text-[0.85rem] font-dm-sans font-black tracking-tight">{likeCount}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 group transition-all ${showComments ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'}`}
        >
          <div className={`p-2 rounded-full ${showComments ? 'bg-[var(--accent-primary)]/10' : 'group-hover:bg-[var(--accent-primary)]/10'} transition-all`}>
            <MessageSquare 
              size={20} 
              strokeWidth={2.5}
              className={showComments ? 'scale-110' : 'group-hover:scale-110 transition-transform'}
            />
          </div>
          <span className="text-[0.85rem] font-dm-sans font-black tracking-tight">{post._count?.comments || 0}</span>
        </button>

        <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] group transition-all ml-auto">
          <div className="p-2 rounded-full group-hover:bg-[var(--accent-primary)]/10 transition-all">
            <Share2 size={20} strokeWidth={2.5} />
          </div>
        </button>
      </div>

      {/* Inline Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default PostCard;
