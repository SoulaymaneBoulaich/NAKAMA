import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import type { AnimeEntry, AnimeStatus } from '../../../shared/types/index.js';
import { AnimeStatusEnum } from '../../../shared/types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ListSkeleton, GridSkeleton } from '../components/common/LoadingSkeleton.js';
import { AnimeSearchModal } from '../components/anime/AnimeSearchModal.js';
import { EntryDetailDrawer } from '../components/anime/EntryDetailDrawer.js';

export const MyListPage: React.FC = () => {
  const [entries, setEntries] = useState<AnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnimeStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entries');
      const apiEntries = Array.isArray(res.data) ? res.data : [];
      // For each entry, we also need to fetch basic Jikan data for the title/cover
      const fullEntries = await Promise.all(apiEntries.map(async (entry: any) => {
        const animeRes = await api.get(`/anime/${entry.animeId}`);
        return { ...entry, animeData: animeRes.data };
      }));
      setEntries(fullEntries);
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter(e => {
    const matchesTab = activeTab === 'ALL' || e.status === activeTab;
    const matchesSearch = e.animeData?.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    ALL: entries.length,
    WATCHING: entries.filter(e => e.status === AnimeStatusEnum.WATCHING).length,
    COMPLETED: entries.filter(e => e.status === AnimeStatusEnum.COMPLETED).length,
    ON_HOLD: entries.filter(e => e.status === AnimeStatusEnum.ON_HOLD).length,
    DROPPED: entries.filter(e => e.status === AnimeStatusEnum.DROPPED).length,
    PLAN_TO_WATCH: entries.filter(e => e.status === AnimeStatusEnum.PLAN_TO_WATCH).length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-3xl font-bold tracking-tight">My Anime List</h1>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Search your list..."
                className="w-full bg-[var(--bg-secondary)111] border border-[var(--border-color)] pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:border-white/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-[var(--bg-secondary)111] p-1 rounded-lg border border-[var(--border-color)]">
              <button 
                onClick={() => setViewMode('LIST')} 
                className={`p-1.5 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('GRID')} 
                className={`p-1.5 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-[var(--border-color)]">
          {Object.keys(counts).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex items-center gap-2
                ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white'}`}
            >
              {tab.replace(/_/g, ' ')}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>
                {(counts as any)[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          viewMode === 'LIST' ? <ListSkeleton /> : <GridSkeleton />
        ) : filteredEntries.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-lg text-white/40 italic">Your list is empty. Start tracking anime.</p>
            <button onClick={() => setIsSearchModalOpen(true)} className="px-6 py-2 bg-white text-black font-bold rounded-lg">Add First Anime</button>
          </div>
        ) : viewMode === 'LIST' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[11px] font-bold text-white/20 uppercase tracking-widest">
                  <th className="pb-4 pt-4 px-4 w-16">#</th>
                  <th className="pb-4 pt-4">Title</th>
                  <th className="pb-4 pt-4">Status</th>
                  <th className="pb-4 pt-4">Progress</th>
                  <th className="pb-4 pt-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 cursor-pointer">
                {filteredEntries.map((e, idx) => (
                  <tr key={e.id} onClick={() => setSelectedAnimeId(e.animeId)} className="hover:bg-white/5 transition-all group">
                    <td className="py-4 px-4 text-sm text-white/20 font-mono">{idx + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <img src={e.animeData?.images.jpg.image_url} className="w-10 h-14 object-cover rounded shadow" />
                        <span className="font-bold group-hover:text-white">{e.animeData?.title}</span>
                      </div>
                    </td>
                    <td className="py-4"><StatusBadge status={e.status} /></td>
                    <td className="py-4">
                      <span className="text-sm font-medium">{e.episodeProgress}</span>
                      <span className="text-xs text-white/20 italic ml-1">/ {e.animeData?.episodes || '?'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold">{e.rating?.calculatedScore || 'N/A'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredEntries.map((e) => (
              <div key={e.id} onClick={() => setSelectedAnimeId(e.animeId)} className="group cursor-pointer space-y-3">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--border-color)] group-hover:border-white/20 transition-all shadow-lg">
                  <img src={e.animeData?.images.jpg.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all">
                    <StatusBadge status={e.status} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold truncate group-hover:text-white transition-colors">{e.animeData?.title}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{e.episodeProgress} / {e.animeData?.episodes || '?'} EPS</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Button */}
        <button 
          onClick={() => setIsSearchModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-white text-black shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-4 border-black"
        >
          <Plus size={28} />
        </button>

        {/* Modals & Drawer */}
        <AnimeSearchModal 
          isOpen={isSearchModalOpen} 
          onClose={() => setIsSearchModalOpen(false)} 
          onAddSuccess={fetchEntries}
        />
        <EntryDetailDrawer 
          isOpen={!!selectedAnimeId} 
          onClose={() => setSelectedAnimeId(null)}
          animeId={selectedAnimeId || undefined}
          onUpdate={fetchEntries}
        />
      </div>
    </div>
  );
};
