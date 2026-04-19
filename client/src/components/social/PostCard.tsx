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
      className="bg-[#111114] border border-[#1a1a1a] rounded-[14px] overflow-hidden transition-colors duration-300"
    >
      {/* Header */}
      <div className="p-[1.2rem] pb-[0.8rem] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user.username}`} className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#2a2a2a]">
              <img 
                src={post.user.avatar || '/default-avatar.png'} 
                alt={post.user.username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/profile/${post.user.username}`} className="font-dm-sans font-semibold text-[0.875rem] text-[#f4f4f5] hover:text-white transition-colors">
                {post.user.username}
              </Link>
              {post.community && (
                <Link to={`/communities/${post.community.slug}`} className="text-[#71717a] text-[0.875rem] font-dm-sans hover:text-[#f4f4f5]">
                  in {post.community.slug}
                </Link>
              )}
            </div>
            <span className="text-[#71717a] text-[0.7rem] font-dm-sans">
              {formatDistanceToNow(new Date(post.createdAt))}
            </span>
          </div>
        </div>
        <button className="text-[#3a3a3a] hover:text-[#f4f4f5] transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-[1.2rem] pb-4">
        <p className="text-[0.9rem] font-dm-sans text-[#f4f4f5] whitespace-pre-wrap leading-[1.7]">
          {post.content}
        </p>
      </div>

      {/* Media Rendering */}
      <div className="px-[1.2rem] pb-4 space-y-4">
        {/* Poll */}
        {post.poll && (
          <div className="bg-[#0a0a0c] border border-[#1a1a1a] rounded-[10px] p-0.5">
            <PollCard poll={post.poll as any} onVoteSuccess={() => {}} />
          </div>
        )}

        {/* Video */}
        {renderVideo()}

        {/* Image */}
        {post.imageUrl && (
          <div className="relative rounded-[12px] overflow-hidden border border-[#1a1a1a] bg-[#0a0a0c]">
            <img 
              src={post.imageUrl} 
              alt="Post content"
              className="w-full object-cover max-h-[600px]"
            />
          </div>
        )}

        {/* Anime Tag */}
        {post.animeId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0c] border border-[#1a1a1a] rounded-full group cursor-pointer hover:border-[#333] transition-colors">
            <Hash size={12} className="text-[#71717a]" />
            <span className="text-[0.72rem] font-medium text-[#71717a] font-dm-sans group-hover:text-[#f4f4f5]">
              {post.animeData?.title || "Anime Tag"}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-[1.2rem] py-[1rem] border-t border-[#1a1a1a] flex items-center gap-8">
        <button 
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-white' : 'text-[#71717a] hover:text-[#f4f4f5]'}`}
        >
          <Heart 
            size={18} 
            fill={isLiked ? 'currentColor' : 'none'} 
            strokeWidth={2}
          />
          <span className="text-[0.8rem] font-medium font-dm-sans">{likeCount}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition-colors ${showComments ? 'text-white' : 'text-[#71717a] hover:text-[#f4f4f5]'}`}
        >
          <MessageSquare 
            size={18} 
            strokeWidth={2}
          />
          <span className="text-[0.8rem] font-medium font-dm-sans">{post._count?.comments || 0}</span>
        </button>

        <button className="text-[#71717a] hover:text-[#f4f4f5] transition-colors ml-auto">
          <Share2 size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Inline Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#1a1a1a] bg-[#0a0a0c] overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default PostCard;
