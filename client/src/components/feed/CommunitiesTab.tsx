import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { PostCard } from '../social/PostCard';
import { motion } from 'framer-motion';
import { Users, Compass, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunitiesTab: React.FC = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['communities-feed'],
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/feed/communities?cursor=${pageParam || ''}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: '',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-red-600" size={32} />
        <span className="text-[#71717a] text-[0.8rem] font-bold uppercase tracking-widest">Loading Community Feed</span>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32 px-6 text-center"
      >
        <div className="w-16 h-16 bg-[#1a1a1c] border border-[#222] rounded-2xl flex items-center justify-center mb-6">
          <Users className="text-red-600" size={28} />
        </div>
        <h2 className="text-xl font-black text-[#efeff1] mb-2 tracking-tight">Your Community Feed is Empty</h2>
        <p className="text-[#71717a] text-[0.9rem] max-w-[320px] mb-8">
          Join communities to see what other Nakama are discussing!
        </p>
        <Link 
          to="/communities"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[0.8rem] transition-all flex items-center gap-2"
        >
          <Compass size={16} /> Explore Communities
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[0.8rem] font-bold text-[#71717a] hover:text-red-500 uppercase tracking-widest transition-colors py-4 px-8 border border-[#1a1a1c] rounded-xl hover:border-red-600/20"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more posts'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunitiesTab;
