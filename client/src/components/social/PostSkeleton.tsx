import React from 'react';

const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 border border-[var(--border-color)]/50 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-zinc-800 rounded" />
          <div className="w-16 h-3 bg-zinc-800/50 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-zinc-800 rounded" />
        <div className="w-3/4 h-4 bg-zinc-800 rounded" />
      </div>
      <div className="w-full h-48 bg-zinc-800 rounded-xl mb-4" />
      <div className="flex gap-6">
        <div className="w-12 h-4 bg-zinc-800 rounded" />
        <div className="w-12 h-4 bg-zinc-800 rounded" />
        <div className="w-12 h-4 bg-zinc-800 rounded" />
      </div>
    </div>
  );
};

export default PostSkeleton;
