import React, { useState } from 'react';
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
      <div className="flex flex-col gap-6 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full h-[200px] bg-[#111114] border border-[#1a1a1a] rounded-[14px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[0.75rem] pt-6">
      {Array.isArray(posts) && posts.length > 0 ? (
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h3 className="text-[#f4f4f5] text-[0.9rem] font-bold uppercase tracking-[0.1em] font-dm-sans">
            Nothing trending yet
          </h3>
          <p className="text-[#71717a] text-[0.72rem] font-normal uppercase tracking-[0.08em] mt-2 max-w-[40ch] leading-relaxed font-dm-sans">
            New posts will appear here as they gain traction
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingTab;

