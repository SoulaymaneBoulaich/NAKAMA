import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { ChronicleCard } from '../../components/chronicles/ChronicleCard';

export const ChroniclesExplorePage: React.FC = () => {
  const [chronicles, setChronicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchChronicles = useCallback(async (isNewSearch = false) => {
    try {
      setLoading(true);
      const currentPage = isNewSearch ? 1 : page;
      // Note: Backend still uses the /stories endpoint
      const { data } = await api.get('/stories', {
        params: {
          search,
          sort,
          status: status === 'ALL' ? undefined : status,
          page: currentPage
        }
      });

      if (isNewSearch) {
        setChronicles(data);
      } else {
        setChronicles(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 20);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Failed to fetch chronicles', error);
    } finally {
      setLoading(false);
    }
  }, [search, sort, status, page]);

  useEffect(() => {
    fetchChronicles(true);
  }, [sort, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChronicles(true);
  };

  const statusOptions = ['ALL', 'ONGOING', 'COMPLETED', 'HIATUS'];
  const sortOptions = [
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'mostRead', label: 'Most Read', icon: TrendingUp },
    { id: 'topRated', label: 'Top Rated', icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
              <Sparkles className="text-[var(--accent-primary)]" size={24} />
            </div>
            <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em]">Discover Infinite Tales</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
            Chronicles
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-[var(--accent-primary)] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search chronicles by title or tag..."
            className="w-full bg-zinc-900/50 border border-[var(--border-color)] focus:border-[var(--accent-primary)] rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-12 bg-zinc-900/30 p-2 rounded-3xl border border-[var(--border-color)]/50 backdrop-blur-md">
        <div className="flex items-center gap-1">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSort(option.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                sort === option.id 
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-red-900/20' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <option.icon size={14} />
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mr-2">
          <Filter size={14} className="text-zinc-600 mr-2" />
          {statusOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatus(opt)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                status === opt 
                  ? 'border-[var(--accent-primary)]/50 text-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
                  : 'border-transparent text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {chronicles.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {chronicles.map((chronicle) => (
              <ChronicleCard key={chronicle.id} chronicle={chronicle} />
            ))}
          </motion.div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-zinc-700">
               <Search size={40} />
            </div>
            <h3 className="text-2xl font-black text-zinc-500 uppercase italic tracking-tighter mb-2">No chronicles found</h3>
            <p className="text-zinc-600 text-sm font-medium">Try adjusting your filters or search query.</p>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Loading & Infinite Scroll */}
      <div className="mt-16 flex justify-center">
        {loading ? (
          <Loader2 className="text-[var(--accent-primary)] animate-spin" size={32} />
        ) : hasMore ? (
          <button 
            onClick={() => fetchChronicles()}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:border-[var(--accent-primary)]/50 transition-all"
          >
            Load More Chronicles
            <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full group-hover:scale-150 transition-transform" />
          </button>
        ) : chronicles.length > 0 ? (
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">End of the line. Record your own chronicle?</p>
        ) : null}
      </div>
    </div>
  );
};
