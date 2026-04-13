import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Book, Clock, Star, Sparkles, Filter, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useQuery } from '@tanstack/react-query';
import { CreateChronicleModal } from '../../components/chronicles/CreateChronicleModal';

const MyChronicles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const { data: chronicles, isLoading } = useQuery({
    queryKey: ['my-chronicles'],
    queryFn: async () => {
      const res = await api.get('/chronicles/me');
      return res.data;
    }
  });

  const filteredChronicles = chronicles?.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[var(--accent-primary)]" />
              <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.5em] italic">Archive Personal</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">
              My <br />
              <span className="text-transparent border-text-white drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]">Chronicles</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-4 px-10 py-6 bg-[var(--accent-primary)] text-white rounded-[2rem] text-sm font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
          >
            <Plus size={20} />
            Forge Chronicle
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-[var(--accent-primary)] transition-colors" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query your archives..."
              className="w-full bg-white/5 border border-[var(--border-color)] rounded-[1.5rem] py-5 pl-16 pr-8 text-white font-bold italic outline-none focus:border-[var(--accent-primary)]/40 transition-all placeholder:text-zinc-800"
            />
          </div>
          <button className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-[var(--border-color)] rounded-[1.5rem] text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all">
            <Filter size={16} />
            Sorting Hierarchy
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] animate-pulse" />
              ))
            ) : filteredChronicles?.length > 0 ? (
              filteredChronicles.map((c: any) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => navigate(`/chronicles/${c.id}`)}
                  className="group relative h-80 bg-zinc-900 border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-[var(--accent-primary)]/40 transition-all shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent group-hover:from-[var(--accent-primary)]/10 transition-colors" />
                  
                  <div className="p-10 h-full flex flex-col justify-between relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="p-4 bg-white/5 rounded-2xl text-zinc-600 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all">
                        <Book size={24} />
                      </div>
                      <button className="p-2 text-zinc-800 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                          <Clock size={12} />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-primary)]/10 rounded-lg text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-tighter">
                          <Star size={12} fill="currentColor" />
                          {c.rating?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--accent-primary)]/10 transition-all" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="p-8 bg-white/5 rounded-full text-zinc-800">
                    <Sparkles size={64} strokeWidth={1} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase italic">The Void is Empty</h3>
                    <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest leading-relaxed max-w-xs">
                      Manifest your first chronicle and anchor your legacy in the resonance stream.
                    </p>
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateChronicleModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreated={(id: string) => navigate(`/chronicles/${id}`)}
      />
    </div>
  );
};

export default MyChronicles;
