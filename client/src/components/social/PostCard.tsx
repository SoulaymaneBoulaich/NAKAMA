import React, { useState } from 'react';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Hash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { Post } from '../../../../shared/types';
import CommentSection from './CommentSection';
import PollCard from './PollCard';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../common/Avatar';
import { SafeImage } from '../common/SafeImage';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Optimistic State
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(post.userVote || null);
  const [upvotes, setUpvotes] = useState(post.upvoteCount);
  const [downvotes, setDownvotes] = useState(post.downvoteCount);

  const voteMutation = useMutation({
    mutationFn: (type: 'UP' | 'DOWN') => api.post(`/votes/${post.id}`, { type }),
    onMutate: async (type) => {
      // Optimistic Update
      const oldVote = userVote;
      const newVote = oldVote === type ? null : type;
      
      setUserVote(newVote);
      
      // Calculate new counts
      let newUpCount = upvotes;
      let newDownCount = downvotes;

      // Remove old vote impact
      if (oldVote === 'UP') newUpCount--;
      if (oldVote === 'DOWN') newDownCount--;

      // Add new vote impact
      if (newVote === 'UP') newUpCount++;
      if (newVote === 'DOWN') newDownCount++;

      setUpvotes(newUpCount);
      setDownvotes(newDownCount);

      return { oldVote, upvotes, downvotes };
    },
    onError: (err, type, context: any) => {
      // Rollback
      setUserVote(context.oldVote);
      setUpvotes(context.upvotes);
      setDownvotes(context.downvotes);
    },
    onSuccess: (data) => {
      // Sync with server response
      setUpvotes(data.data.upvoteCount);
      setDownvotes(data.data.downvoteCount);
      setUserVote(data.data.userVote);
    }
  });

  const netScore = upvotes - downvotes;

  const renderMedia = () => {
    if (post.videoUrl) {
      const isYoutube = post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be');
      if (isYoutube) {
        let videoId = '';
        if (post.videoUrl.includes('v=')) videoId = post.videoUrl.split('v=')[1].split('&')[0];
        else if (post.videoUrl.includes('youtu.be/')) videoId = post.videoUrl.split('youtu.be/')[1];
        return (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#222] bg-black mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div className="relative rounded-xl overflow-hidden border border-[#222] bg-black mb-4">
          <video src={post.videoUrl} className="w-full max-h-[500px]" controls />
        </div>
      );
    }

    if (post.imageUrl) {
      return (
        <div className="relative rounded-xl overflow-hidden border border-[#222] bg-[#0a0a0c] mb-4">
          <SafeImage 
            src={post.imageUrl} 
            alt="Post content"
            className="w-full object-cover max-h-[600px] hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
      );
    }

    return null;
  };

  const textContent = post.content;
  const shouldTruncate = textContent.length > 240;
  const displayedContent = isExpanded ? textContent : textContent.slice(0, 240);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f11] border border-[#1f1f23] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#2f2f35]"
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user.username}`} className="relative">
            <Avatar 
              src={post.user.avatar} 
              username={post.user.username} 
              size="md"
            />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/profile/${post.user.username}`} className="font-bold text-[0.9rem] text-[#efeff1] hover:text-red-500 transition-colors">
                {post.user.username}
              </Link>
              {post.community && (
                <>
                  <span className="text-[#555] text-[0.8rem]">•</span>
                  <Link to={`/communities/${post.community.slug}`} className="text-red-500 text-[0.85rem] font-bold hover:underline">
                    n/{post.community.slug}
                  </Link>
                </>
              )}
            </div>
            <span className="text-[#71717a] text-[0.7rem]">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <button className="p-2 text-[#444] hover:text-[#efeff1] hover:bg-white/5 rounded-full transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-4">
        <div className="relative mb-3">
          <p className="text-[0.95rem] text-[#efeff1] leading-[1.6] whitespace-pre-wrap">
            {displayedContent}
            {!isExpanded && shouldTruncate && "..."}
          </p>
          {shouldTruncate && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-red-500 text-[0.85rem] font-bold hover:underline flex items-center gap-1"
            >
              {isExpanded ? (
                <>Show less <ChevronUp size={14} /></>
              ) : (
                <>See more <ChevronDown size={14} /></>
              )}
            </button>
          )}
        </div>

        {renderMedia()}

        {post.poll && (
          <div className="mb-4 bg-[#0a0a0c] border border-[#222] rounded-xl overflow-hidden">
            <PollCard poll={post.poll as any} onVoteSuccess={() => {}} />
          </div>
        )}

        {post.animeId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg group cursor-pointer hover:bg-red-500/10 transition-colors">
            <Hash size={14} className="text-red-500/60" />
            <span className="text-[0.75rem] font-bold text-red-500/80 group-hover:text-red-500 transition-colors uppercase tracking-wider">
              {post.animeData?.title || "Anime Tag"}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 border-t border-[#1a1a1c] bg-[#121214] flex items-center justify-between">
        <div className="flex items-center bg-[#1a1a1c] rounded-full p-1 border border-[#222]">
          <button 
            onClick={() => voteMutation.mutate('UP')}
            className={`p-1.5 rounded-full transition-all ${
              userVote === 'UP' 
                ? 'text-red-600 bg-red-600/10' 
                : 'text-[#666] hover:text-red-600 hover:bg-red-600/5'
            }`}
          >
            <ArrowBigUp 
              size={22} 
              fill={userVote === 'UP' ? 'currentColor' : 'none'} 
              strokeWidth={2}
            />
          </button>
          
          <span className={`px-2 text-[0.9rem] font-black min-w-[2ch] text-center ${
            netScore > 0 ? 'text-red-600' : netScore < 0 ? 'text-blue-500' : 'text-[#888]'
          }`}>
            {netScore}
          </span>

          <button 
            onClick={() => voteMutation.mutate('DOWN')}
            className={`p-1.5 rounded-full transition-all ${
              userVote === 'DOWN' 
                ? 'text-blue-500 bg-blue-500/10' 
                : 'text-[#666] hover:text-blue-500 hover:bg-blue-500/5'
            }`}
          >
            <ArrowBigDown 
              size={22} 
              fill={userVote === 'DOWN' ? 'currentColor' : 'none'} 
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              showComments 
                ? 'bg-red-600/10 text-red-500 border border-red-500/20' 
                : 'text-[#888] hover:text-[#efeff1] hover:bg-white/5'
            }`}
          >
            <MessageSquare size={18} strokeWidth={2.5} />
            <span className="text-[0.85rem] font-bold">{post._count?.comments || 0}</span>
          </button>

          <button className="p-2 text-[#666] hover:text-[#efeff1] hover:bg-white/5 rounded-full transition-all">
            <Share2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Comments Thread */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#1a1a1c] bg-[#0d0d0f] overflow-hidden"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
