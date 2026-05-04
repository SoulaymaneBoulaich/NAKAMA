import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';

const TopCommunitiesWidget: React.FC = () => {
  const { data: communities, isLoading } = useQuery({
    queryKey: ['top-communities'],
    queryFn: async () => {
      const res = await api.get('/communities');
      return res.data;
    },
  });

  const displayCommunities = Array.isArray(communities) ? communities : [];

  return (
    <div className="bg-zinc-900 border border-[var(--border-color)] rounded-2xl overflow-hidden mt-6">
      <div className="p-4 border-b border-[var(--border-color)] bg-zinc-800/30 flex items-center gap-2">
        <Users size={16} className="text-red-500" />
        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Top Communities</h3>
      </div>
      
      <div className="p-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="p-3 animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
              <div className="w-24 h-3 bg-zinc-800 rounded" />
            </div>
          ))
        ) : (
          displayCommunities.slice(0, 5).map((community: any) => (
            <Link 
              key={community.id}
              to={`/communities/${community.slug}`}
              className="p-3 flex items-center justify-between hover:bg-zinc-800/50 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Avatar 
                  src={community.avatarUrl} 
                  username={community.name} 
                  size="sm"
                  className="w-8 h-8 rounded-lg border border-[var(--border-color)]"
                />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">
                    n/{community.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500">{community._count?.members || 0} Members</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
            </Link>
          ))
        )}
      </div>
      
      <Link 
        to="/communities"
        className="block w-full py-3 text-center text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest font-bold transition-colors border-t border-[var(--border-color)]"
      >
        Explore All
      </Link>
    </div>
  );
};

export default TopCommunitiesWidget;
