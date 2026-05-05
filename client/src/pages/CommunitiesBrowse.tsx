import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Users, Flame, Clock, TrendingUp,
  ChevronRight, ArrowRight, Shield, Hash
} from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import CreateCommunityModal from '../components/communities/CreateCommunityModal';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  bannerUrl?: string;
  avatarUrl?: string;
  isValidated: boolean;
  _count: { members: number; posts: number };
}

const CATEGORIES = ['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Slice of Life', 'Shonen', 'Seinen'];

const SORT_OPTIONS = [
  { id: 'members',  label: 'Top',     icon: TrendingUp },
  { id: 'newest',   label: 'New',     icon: Clock },
  { id: 'activity', label: 'Active',  icon: Flame },
] as const;

type SortOption = typeof SORT_OPTIONS[number]['id'];

// ─── Community card ────────────────────────────────────────────────────────────
const CommunityCard: React.FC<{ community: Community; index: number }> = ({ community, index }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => navigate(`/communities/${community.slug}`)}
      className="group relative bg-[#0d0d10] border border-[#1a1a1c] rounded-2xl overflow-hidden cursor-pointer hover:border-[#2a2a2e] transition-all duration-300 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Banner */}
      <div className="relative h-28 bg-[#111] overflow-hidden">
        {community.bannerUrl ? (
          <SafeImage
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1c] to-[#111]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
          {community.category}
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="w-12 h-12 rounded-xl border-2 border-[#0d0d10] bg-[#1a1a1c] overflow-hidden shadow-lg">
          {community.avatarUrl
            ? <SafeImage src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-red-600 font-black text-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
          }
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pt-3 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-outfit font-black text-base text-white group-hover:text-red-400 transition-colors tracking-tight truncate">
              {community.name}
            </h3>
            <p className="text-[#555] text-xs mt-1 line-clamp-2 leading-relaxed">
              {community.description || 'No description.'}
            </p>
          </div>
          <ChevronRight size={16} className="text-[#333] group-hover:text-red-600 transition-colors flex-shrink-0 mt-1" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-[#555]">
            <Users size={13} />
            <span className="text-xs font-bold">{community._count.members.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#555]">
            <Hash size={13} />
            <span className="text-xs font-bold">{community._count.posts.toLocaleString()} posts</span>
          </div>
          {community.isValidated && (
            <div className="ml-auto flex items-center gap-1 text-teal-500">
              <Shield size={11} />
              <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl ring-1 ring-red-500/10" />
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CommunitySkeleton = () => (
  <div className="bg-[#0d0d10] border border-[#1a1a1c] rounded-2xl overflow-hidden animate-pulse">
    <div className="h-28 bg-[#111]" />
    <div className="px-5 -mt-5 pb-5 space-y-3">
      <div className="w-12 h-12 rounded-xl bg-[#1a1a1c]" />
      <div className="h-4 bg-[#1a1a1c] rounded w-2/3 mt-3" />
      <div className="h-3 bg-[#1a1a1c] rounded w-full" />
      <div className="h-3 bg-[#1a1a1c] rounded w-1/2" />
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CommunitiesBrowse: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/communities', {
        params: {
          search: search || undefined,
          category: category === 'All' ? undefined : category,
          sort
        }
      });
      setCommunities(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const t = setTimeout(fetchCommunities, 280);
    return () => clearTimeout(t);
  }, [fetchCommunities]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-red-500/20 pb-20">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden border-b border-[#161618]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 to-transparent pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Explore</span>
                <div className="h-[1px] w-8 bg-red-600/40" />
              </div>
              <h1 className="font-outfit font-black text-4xl tracking-tight text-white">
                Communities
              </h1>
              <p className="text-[#555] text-sm mt-2 max-w-md">
                Find your people. Join communities built around your favourite anime genres, studios, and series.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-900/30 active:scale-95 self-start md:self-auto"
            >
              <Plus size={16} strokeWidth={3} />
              Create Community
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 pt-6">

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
            <input
              type="text"
              placeholder="Search communities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d0d10] border border-[#1a1a1c] text-white placeholder-[#444] text-sm rounded-xl focus:outline-none focus:border-[#333] transition-colors"
            />
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-1 bg-[#0d0d10] border border-[#1a1a1c] rounded-xl p-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSort(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  sort === opt.id
                    ? 'bg-red-600 text-white'
                    : 'text-[#555] hover:text-white'
                }`}
              >
                <opt.icon size={12} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category chips ── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                category === cat
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-[#555] border-[#1e1e24] hover:border-[#333] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {Array.from({ length: 8 }).map((_, i) => <CommunitySkeleton key={i} />)}
            </motion.div>
          ) : communities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-16 h-16 bg-[#111] border border-[#222] rounded-2xl flex items-center justify-center mb-5 text-red-600">
                <Users size={26} />
              </div>
              <p className="text-white/30 text-sm font-bold uppercase tracking-widest mb-4">No communities found</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold transition-colors"
              >
                Be the first to create one <ArrowRight size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {communities.map((c, i) => (
                <CommunityCard key={c.id} community={c} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateCommunityModal
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); fetchCommunities(); }}
      />
    </div>
  );
};

export default CommunitiesBrowse;

