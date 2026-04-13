import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Search, User, Users, Film, Star, ChevronRight, Loader2 } from 'lucide-react';


const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'anime' | 'users' | 'communities'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, activeTab],
    queryFn: async () => {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
      return res.data;
    },
    enabled: !!query,
  });

  const tabs = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'anime', label: 'Anime', icon: Film },
    { id: 'users', label: 'People', icon: User },
    { id: 'communities', label: 'Communities', icon: Users },
  ];

  if (!query) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
          <Search size={32} className="text-zinc-700" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">No search query</h1>
        <p className="text-zinc-500 max-w-xs uppercase text-[10px] tracking-widest font-bold">Please enter a search term in the navigation bar to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white pt-28 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Search Results</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">"{query}"</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-12 border-b border-zinc-900 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all relative
                ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'}
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Scanning the multiverse...</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Anime Results */}
            {(activeTab === 'all' || activeTab === 'anime') && data?.anime?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <Film className="text-red-600" size={20} />
                    Anime Results
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {data.anime.map((anime: any) => (
                    <Link 
                      key={anime.mal_id} 
                      to={`/anime/${anime.mal_id}`}
                      className="group block bg-zinc-900 border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-red-600 transition-all transform hover:-translate-y-1"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <img src={anime.image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-[var(--border-color)]">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-bold">{anime.score || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold truncate group-hover:text-red-500 transition-colors uppercase tracking-tight">{anime.title}</h4>
                        <p className="text-[10px] text-zinc-500 flex items-center justify-between mt-1">
                          <span>{anime.type}</span>
                          <span>{anime.year || ''}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* User Results */}
            {(activeTab === 'all' || activeTab === 'users') && data?.users?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <User className="text-red-600" size={20} />
                    People
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.users.map((user: any) => (
                    <Link 
                      key={user.id} 
                      to={`/profile/${user.username}`}
                      className="bg-zinc-900 border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between hover:border-zinc-500 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={user.avatar || '/default-avatar.png'} alt={user.username} className="w-14 h-14 rounded-full border-2 border-[var(--border-color)] object-cover" />
                        <div>
                          <h4 className="font-bold text-white uppercase italic tracking-tighter group-hover:text-red-500 transition-colors flex items-center gap-2">
                            {user.username}
                            {user.isPremium && <span className="bg-red-600 text-[8px] font-black px-1 rounded-sm uppercase italic">Pro</span>}
                          </h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 line-clamp-1 max-w-[200px]">{user.bio || 'Digital Nakama'}</p>
                          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-tighter mt-1">{user._count.followers} Followers</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-zinc-800 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Community Results */}
            {(activeTab === 'all' || activeTab === 'communities') && data?.communities?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <Users className="text-red-600" size={20} />
                    Communities
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.communities.map((community: any) => (
                    <Link 
                      key={community.id} 
                      to={`/communities/${community.id}`}
                      className="bg-zinc-900 border border-[var(--border-color)] p-4 rounded-2xl flex items-center justify-between hover:border-zinc-500 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={community.icon || '/default-community.png'} alt={community.name} className="w-14 h-14 rounded-2xl border-2 border-[var(--border-color)] object-cover" />
                        <div>
                          <h4 className="font-bold text-white uppercase italic tracking-tighter group-hover:text-red-500 transition-colors flex items-center gap-2">
                            n/{community.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1 line-clamp-1 max-w-[200px]">{community.description || 'Welcome to the circle.'}</p>
                          <p className="text-[9px] text-zinc-600 uppercase font-black tracking-tighter mt-1">{community._count.members} Members</p>
                        </div>
                      </div>
                      <div className="bg-zinc-800 group-hover:bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all">Join</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State for results */}
            {(!data?.anime?.length && !data?.users?.length && !data?.communities?.length) && (
              <div className="py-20 text-center">
                <p className="text-zinc-600 font-bold uppercase tracking-[0.5em] text-xs">No signals found in this sector</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
