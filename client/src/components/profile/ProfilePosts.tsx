import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '../../../../shared/types/index.js';

interface ProfilePostsProps {
  posts: Post[];
}

const ProfilePosts: React.FC<ProfilePostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] border border-gray-800 flex items-center justify-center mb-6">
          <MessageSquare size={32} className="text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-400">No posts yet</h3>
        <p className="text-gray-600 text-sm mt-2">This user hasn't posted anything.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700/80 transition-all duration-300 group"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {post.community && (
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {post.community.name}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-600 font-mono">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Post Content */}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-800/40">
              <img 
                src={post.imageUrl} 
                alt="" 
                className="w-full max-h-80 object-cover group-hover:scale-[1.01] transition-transform duration-500" 
              />
            </div>
          )}

          {/* Post Footer */}
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-800/40">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Heart size={14} />
              <span className="text-xs font-medium tabular-nums">{post._count?.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MessageSquare size={14} />
              <span className="text-xs font-medium tabular-nums">{post._count?.comments || 0}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProfilePosts;
