import React from 'react';
import PostCard from '../social/PostCard';
import api from '../../api/axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, Users } from 'lucide-react';

const FollowingTab: React.FC = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['following-feed'],
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/feed/following?cursor=${pageParam || ''}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: '',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full h-[200px] bg-[#111114] border border-[#1a1a1c] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const posts = data?.pages.flatMap(page => page.posts) || [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-16 h-16 bg-[#1a1a1c] border border-[#222] rounded-2xl flex items-center justify-center mb-6 text-red-600">
          <Users size={28} />
        </div>
        <h3 className="text-[#efeff1] text-lg font-black uppercase tracking-tight">
          Nothing here yet
        </h3>
        <p className="text-[#71717a] text-[0.9rem] mt-2 max-w-[40ch] leading-relaxed">
          Follow people and join communities to see their posts here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-0">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="py-4 text-[#71717a] hover:text-red-500 font-bold uppercase tracking-widest text-[0.8rem] transition-all"
        >
          {isFetchingNextPage ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Load more following'}
        </button>
      )}
    </div>
  );
};

export default FollowingTab;

