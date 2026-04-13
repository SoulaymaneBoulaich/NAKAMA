import React, { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import type { Post } from '../../../../shared/types';

interface FeedProps {
  type: 'trending' | 'following';
}

interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

const Feed: React.FC<FeedProps> = ({ type }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', type],
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/feed/${type}`, {
        params: { cursor: pageParam }
      });
      // Handle the case where the trending API might return an array directly (if not yet updated)
      // or the new object structure
      if (Array.isArray(res.data)) {
        return { posts: res.data, nextCursor: null };
      }
      return res.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-[var(--border-color)]">
        <p className="text-zinc-400 mb-4">Failed to load feed</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const allPosts = (data?.pages.flatMap((page) => page.posts) || []).filter(Boolean);

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-[var(--border-color)]">
        <p className="text-zinc-500">No posts found. Start following people or communities!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allPosts.map((post) => (
        post && <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            Loading more...
          </div>
        ) : hasNextPage ? (
          <button 
            onClick={() => fetchNextPage()}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Scroll for more
          </button>
        ) : (
          <p className="text-zinc-600 text-sm italic">You've reached the end of the line.</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
