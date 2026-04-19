import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { UserStats, JikanAnime } from '../../../../shared/types';
import { TrendingUp, Sparkles, ChevronRight, User } from 'lucide-react';

export const RecommendationSidebar: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trending, setTrending] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using Promise.allSettled to ensure failure of one doesn't break others
        const results = await Promise.allSettled([
          user ? api.get(`/user/${user.username}/stats`) : Promise.resolve({ data: null }),
          api.get('/recommendations/personalized?limit=3'),
          fetch('https://api.jikan.moe/v4/top/anime?limit=5').then(res => res.json())
        ]);

        if (results[0].status === 'fulfilled') setStats(results[0].value.data);
        if (results[1].status === 'fulfilled') setRecommendations(results[1].value.data);
        if (results[2].status === 'fulfilled') setTrending(results[2].value.data);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getRank = () => {
    if (!user) return { name: 'Guest', color: 'text-gray-400' };
    if (user.isNakamaLeader) return { name: 'Nakama Leader', color: 'text-yellow-500' };
    if (user.isUltraNakama) return { name: 'Ultra Nakama', color: 'text-red-500' };
    if (user.isPremium) return { name: 'Pro Member', color: 'text-indigo-500' };
    return { name: 'Classic Member', color: 'text-gray-400' };
  };

  const rank = getRank();

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[320px] sticky top-[80px] h-fit">
      {/* Stats Card */}
      {user && (
        <div className="bg-[#111114] border border-[#232329] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full border-2 border-[#232329] p-0.5 overflow-hidden bg-[#1c1c21]">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">@{user.username}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${rank.color}`}>{rank.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1c21] border border-[#232329] p-3 rounded-xl transition-all hover:border-white/10">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Tracked</p>
              <p className="text-xl font-black text-white">{stats?.totalTracked || 0}</p>
            </div>
            <div className="bg-[#1c1c21] border border-[#232329] p-3 rounded-xl transition-all hover:border-white/10">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Episodes</p>
              <p className="text-xl font-black text-white">{stats?.episodesWatched || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* For You */}
      <div className="bg-[#111114] border border-[#232329] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232329] flex items-center justify-between bg-gradient-to-r from-transparent to-red-500/5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-red-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Recommended</h3>
          </div>
          <ChevronRight size={14} className="text-gray-600" />
        </div>
        <div className="p-4 space-y-4">
          {!loading && recommendations.slice(0, 3).map((rec: any) => (
            <div key={rec.id} className="flex gap-3 group cursor-pointer">
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#232329]">
                <img 
                  src={rec.images?.jpg?.large_image_url || rec.animeCover} 
                  alt={rec.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-[9px] text-gray-500 font-bold mt-1 line-clamp-1">
                  {rec.genres?.slice(0, 2).map((g: any) => g.name).join(', ') || 'Anime'}
                </p>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && !loading && (
            <p className="text-[10px] text-gray-600 font-bold uppercase text-center py-4 italic">No recommendations yet</p>
          )}
          {loading && (
            <div className="space-y-4 animate-pulse">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-3">
                   <div className="w-12 h-16 bg-[#1c1c21] rounded-lg" />
                   <div className="flex-1 space-y-2 py-1">
                     <div className="h-3 bg-[#1c1c21] rounded w-full" />
                     <div className="h-2 bg-[#1c1c21] rounded w-2/3" />
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending Now */}
      <div className="bg-[#111114] border border-[#232329] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232329] flex items-center justify-between bg-gradient-to-r from-transparent to-green-500/5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Top</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {!loading && trending.slice(0, 5).map((anime, index) => (
            <div key={anime.mal_id} className="flex gap-3 items-center group cursor-pointer">
              <span className="text-xl font-black text-[#232329] italic w-4 group-hover:text-green-500/20 transition-colors">{index + 1}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#232329] flex-shrink-0 bg-[#1c1c21]">
                <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-white tracking-widest uppercase truncate group-hover:text-green-500 transition-colors">
                  {anime.title}
                </h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase">{anime.score} Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links / Footer */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-2 opacity-30 group-hover:opacity-100 transition-opacity">
        <button className="text-[9px] font-black text-white uppercase tracking-widest hover:text-red-500 transition-colors">Guidelines</button>
        <button className="text-[9px] font-black text-white uppercase tracking-widest hover:text-red-500 transition-colors">Support</button>
        <button className="text-[9px] font-black text-white uppercase tracking-widest hover:text-red-500 transition-colors">Terms</button>
        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1 w-full">© 2026 NAKAMA SYSTEM</span>
      </div>
    </aside>
  );
};
