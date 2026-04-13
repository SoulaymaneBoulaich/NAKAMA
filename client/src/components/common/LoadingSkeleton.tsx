import React from 'react';

export const ListSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-full h-20 bg-[var(--bg-secondary)111] animate-pulse rounded-lg border border-[var(--border-color)]" />
      ))}
    </div>
  );
};

export const GridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[2/3] bg-[var(--bg-secondary)111] animate-pulse rounded-lg border border-[var(--border-color)]" />
          <div className="h-4 bg-[var(--bg-secondary)111] animate-pulse rounded w-3/4" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-[400px] bg-[var(--bg-secondary)111] rounded-2xl border border-[var(--border-color)]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="h-10 bg-[var(--bg-secondary)111] w-1/2 rounded" />
          <div className="h-6 w-1/4 bg-[var(--bg-secondary)111] rounded" />
          <div className="h-32 bg-[var(--bg-secondary)111] rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-[var(--bg-secondary)111] rounded shadow-xl" />
        </div>
      </div>
    </div>
  );
};
