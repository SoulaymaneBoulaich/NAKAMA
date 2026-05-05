import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  LayoutGrid, Users, Globe, UserCheck, ChevronDown,
  Loader2, Plus, Flame, TrendingUp
} from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/social/PostCard';
import { RightSidebar } from '../components/feed/RightSidebar';
import AniShotRow from '../components/feed/AniShotRow';
import { UnifiedCreationModal } from '../components/social/UnifiedCreationModal';

type FeedScope = 'all' | 'mine' | 'friends';
type FeedSection = 'personal' | 'communities';

const scopeOptions: { id: FeedScope; label: string; icon: React.FC<any> }[] = [
  { id: 'all',     label: 'All',       icon: Globe },
  { id: 'mine',    label: 'My Posts',  icon: LayoutGrid },
  { id: 'friends', label: 'Friends',   icon: UserCheck },
];

const PostSkeleton = () => (
  <div className="w-full bg-[#111114] border border-[#1a1a1c] rounded-2xl overflow-hidden animate-pulse">
    <div className="p-4 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-[#1f1f23] flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-[#1f1f23] rounded w-1/3" />
        <div className="h-3 bg-[#1f1f23] rounded w-1/5" />
      </div>
    </div>
    <div className="px-4 pb-4 space-y-2">
      <div className="h-3 bg-[#1f1f23] rounded" />
      <div className="h-3 bg-[#1f1f23] rounded w-5/6" />
      <div className="h-3 bg-[#1f1f23] rounded w-2/3" />
    </div>
  </div>
);

const FeedList: React.FC<{
  queryKey: string[];
  endpoint: string;
  emptyMsg: string;
  emptyIcon: React.FC<any>;
}> = ({ queryKey, endpoint, emptyMsg, emptyIcon: Icon }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`${endpoint}?cursor=${pageParam || ''}`);
      return res.data;
    },
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    initialPageParam: '',
  });

  if (isLoading) return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
    </div>
  );

  const posts = data?.pages.flatMap((p: any) => p.posts) || [];

  if (posts.length === 0) return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="w-16 h-16 bg-[#111] border border-[#222] rounded-2xl flex items-center justify-center mb-5 text-red-600">
        <Icon size={26} />
      </div>
      <p className="text-white/30 text-sm font-bold uppercase tracking-widest">{emptyMsg}</p>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post: any, i: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="py-4 text-[#555] hover:text-red-500 font-bold uppercase tracking-widest text-xs transition-all"
        >
          {isFetchingNextPage
            ? <Loader2 className="animate-spin mx-auto" size={18} />
            : '— load more —'}
        </button>
      )}
    </div>
  );
};

export const FeedPage: React.FC = () => {
  const [section, setSection] = useState<FeedSection>('personal');
  const [scope, setScope]     = useState<FeedScope>('all');
  const [scopeOpen, setScopeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) setScopeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentScope = scopeOptions.find(s => s.id === scope)!;

  const getEndpoint = (): string => {
    if (section === 'communities') return '/feed/communities';
    if (scope === 'mine')    return '/feed/mine';
    if (scope === 'friends') return '/feed/following';
    return '/feed/all';
  };

  const getQueryKey = (): string[] => {
    if (section === 'communities') return ['feed-communities'];
    return [`feed-personal-${scope}`];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-red-500/20">

      {/* ── Sticky header ── */}
      <div className="sticky top-20 z-30 bg-[#0a0a0c]/90 backdrop-blur-2xl border-b border-[#161618]">
        <div className="max-w-[1360px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">

          {/* Title */}
          <div className="flex items-center gap-3">
            <span className="font-jp text-red-600 text-xl font-black select-none">仲間</span>
            <span className="font-outfit font-black text-xl tracking-tight text-white">FEED</span>
          </div>

          {/* Section toggle */}
          <div className="flex items-center gap-1 bg-[#111114] border border-[#1e1e24] rounded-2xl p-1">
            {([
              { id: 'personal',     icon: LayoutGrid, label: 'Personal' },
              { id: 'communities',  icon: Users,      label: 'Communities' },
            ] as const).map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  section === s.id
                    ? 'bg-white text-black shadow'
                    : 'text-[#555] hover:text-white'
                }`}
              >
                <s.icon size={14} />
                <span className="hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Right: scope filter + create */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {section === 'personal' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  ref={scopeRef}
                  className="relative"
                >
                  <button
                    onClick={() => setScopeOpen(o => !o)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#111114] border border-[#1e1e24] rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all"
                  >
                    <currentScope.icon size={13} />
                    {currentScope.label}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${scopeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {scopeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-44 bg-[#111114] border border-[#222] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 z-50"
                      >
                        {scopeOptions.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => { setScope(opt.id); setScopeOpen(false); }}
                            className={`flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${
                              scope === opt.id
                                ? 'bg-red-600/10 text-red-500'
                                : 'text-[#666] hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <opt.icon size={14} />
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/30 active:scale-95"
            >
              <Plus size={14} strokeWidth={3} />
              <span className="hidden sm:block">Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1360px] mx-auto px-6 pt-6 pb-20 flex gap-8 items-start">

        <div className="flex-1 min-w-0 space-y-6">

          {section === 'personal' && (
            <div className="bg-[#0d0d10] border border-[#1a1a1c] rounded-2xl overflow-hidden">
              <AniShotRow />
            </div>
          )}

          <div className="flex items-center gap-3">
            {section === 'communities'
              ? <><Users size={16} className="text-red-600" /><span className="text-xs font-black uppercase tracking-widest text-[#444]">Community posts</span></>
              : <><TrendingUp size={16} className="text-red-600" /><span className="text-xs font-black uppercase tracking-widest text-[#444]">{currentScope.label} · posts</span></>
            }
            <div className="flex-1 h-[1px] bg-[#1a1a1c]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={section + scope}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FeedList
                queryKey={getQueryKey()}
                endpoint={getEndpoint()}
                emptyMsg={section === 'communities' ? 'Join communities to see posts' : 'Nothing yet — create a post!'}
                emptyIcon={section === 'communities' ? Users : Flame}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden xl:block w-[320px] flex-shrink-0">
          <RightSidebar />
        </div>
      </div>

      <UnifiedCreationModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};
