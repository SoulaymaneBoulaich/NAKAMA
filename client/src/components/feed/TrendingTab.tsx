import React from 'react';
import PostCard from '../social/PostCard';
import api from '../../api/axios';
import { useQuery } from '@tanstack/react-query';

const TrendingTab: React.FC = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['trending-feed'],
    queryFn: async () => {
      const res = await api.get('/feed/trending');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-[var(--border-color)]">
            <p className="text-zinc-500 font-black uppercase tracking-widest italic">No trending resonance found.</p>
            <p className="text-zinc-700 text-xs mt-2 uppercase tracking-widest font-bold">The collective is quiet... for now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingTab;
