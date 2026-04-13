import React from 'react';
import type { AnimeStatus } from '../../../../shared/types/index.js';
import { AnimeStatusEnum } from '../../../../shared/types/index.js';

interface StatusBadgeProps {
  status: AnimeStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [AnimeStatusEnum.WATCHING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    [AnimeStatusEnum.COMPLETED]: 'bg-green-500/10 text-green-500 border-green-500/20',
    [AnimeStatusEnum.ON_HOLD]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    [AnimeStatusEnum.DROPPED]: 'bg-red-500/10 text-red-500 border-red-500/20',
    [AnimeStatusEnum.PLAN_TO_WATCH]: 'bg-white/10 text-white/60 border-[var(--border-color)]',
  } as const;

  const labels = {
    [AnimeStatusEnum.WATCHING]: 'Watching',
    [AnimeStatusEnum.COMPLETED]: 'Completed',
    [AnimeStatusEnum.ON_HOLD]: 'On Hold',
    [AnimeStatusEnum.DROPPED]: 'Dropped',
    [AnimeStatusEnum.PLAN_TO_WATCH]: 'Plan to Watch',
  } as const;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${(styles as any)[status]}`}>
      {(labels as any)[status]}
    </span>
  );
};
