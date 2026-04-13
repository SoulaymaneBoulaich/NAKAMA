import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Plus, Users, Filter, Sparkles } from 'lucide-react';
import CreateCommunityModal from '../components/communities/CreateCommunityModal';
import { useNavigate } from 'react-router-dom';
import TopCommunitiesWidget from '../components/social/TopCommunitiesWidget';
import { motion, AnimatePresence } from 'framer-motion';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  bannerUrl?: string;
  avatarUrl?: string;
  memberCount: number;
  isValidated: boolean;
  _count: {
    members: number;
    posts: number;
  };
}

const CommunitiesBrowse: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('members');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Slice of Life', 'Shonen', 'Seinen'];

  const fetchCommunities = async () => {
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
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCommunities();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
                    <Sparkles className="text-[var(--accent-primary)]" size={24} />
                  </div>
                  <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em]">Niche Collectives</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Communities
                </h1>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 bg-[var(--accent-primary)] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={18} />
                Create Community
              </button>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[var(--accent-primary)] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search collectives..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                  </select>
                </div>
                <div className="flex bg-white/5 border border-[var(--border-color)] rounded-2xl p-1">
                  <button 
                    onClick={() => setSort('members')}
                    className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === 'members' ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-red-900/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    Popular
                  </button>
                  <button 
                    onClick={() => setSort('new')}
                    className={`px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === 'new' ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-red-900/20' : 'text-zinc-500 hover:text-white'}`}
                  >
                    New
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 border border-[var(--border-color)] rounded-[2rem] h-64 animate-pulse"></div>
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communities.map((community) => (
                  <motion.div 
                    key={community.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/communities/${community.slug}`)}
                    className="group relative bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] overflow-hidden cursor-pointer hover:border-[var(--accent-primary)]/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                  >
                    <div className="h-28 bg-zinc-900 relative">
                      {community.bannerUrl ? (
                        <img src={community.bannerUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950"></div>
                      )}
                      {!community.isValidated && (
                        <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 text-[8px] font-black px-3 py-1 rounded-full border border-yellow-500/20 backdrop-blur-md tracking-widest">
                          PENDING VALIDATION
                        </div>
                      )}
                    </div>
                    
                    <div className="px-8 pb-8 -mt-10 relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-[var(--bg-secondary)] overflow-hidden shadow-2xl mb-4 group-hover:scale-105 transition-transform">
                        {community.avatarUrl ? (
                          <img src={community.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-800">
                            <Users size={32} />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-black text-white group-hover:text-[var(--accent-primary)] transition-colors mb-2 italic uppercase tracking-tighter truncate">
                        {community.name}
                      </h3>
                      <p className="text-zinc-500 text-xs font-medium line-clamp-2 mb-6 h-8 leading-relaxed">
                        {community.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-2 text-white font-black text-sm uppercase italic">
                          <Users size={16} className="text-[var(--accent-primary)]" />
                          {community.memberCount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-600 font-black tracking-[0.2em] uppercase">
                          {community.category || 'General'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white/5 border border-dashed border-[var(--border-color)] rounded-[3rem]">
                <Users size={64} className="mx-auto text-zinc-800 mb-6" />
                <h2 className="text-2xl font-black text-zinc-500 uppercase italic tracking-tighter mb-2">No collectives discovered</h2>
                <p className="text-zinc-600 text-sm font-medium">Be the first to architect a community for this Niche!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <TopCommunitiesWidget />
            
            <div className="p-8 bg-[var(--accent-primary)] rounded-[2.5rem] shadow-[0_20px_50px_rgba(220,38,38,0.2)] group relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-4">Unite Your<br/>Nakama</h2>
                 <p className="text-white/80 text-xs font-medium leading-relaxed mb-8">Create a space for your crew, host events, and lead the conversation in your favorite niche.</p>
                 <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-white text-[var(--accent-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                 >
                   Establish Collective
                 </button>
               </div>
               <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-black/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateCommunityModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchCommunities();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunitiesBrowse;
