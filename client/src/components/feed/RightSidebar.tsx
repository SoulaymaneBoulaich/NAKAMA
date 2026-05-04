import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

export const RightSidebar: React.FC = () => {
  const { data: popularCommunities } = useQuery({
    queryKey: ['popular-communities'],
    queryFn: async () => {
      const res = await api.get('/communities?limit=5');
      return res.data;
    }
  });

  return (
    <aside className="hidden lg:block w-[320px] sticky top-[72px] h-[calc(100vh-80px)] overflow-y-auto pr-4 scrollbar-hide">
      <div className="space-y-6 pb-12">
        
        {/* NAKAMA Stats */}
        <div className="bg-[#0f0f11] border border-[#1f1f23] rounded-2xl p-5">
          <h3 className="text-[#efeff1] text-[0.85rem] font-black uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-red-600" />
            Your Impact
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1c] p-3 rounded-xl border border-[#222]">
              <span className="block text-[#71717a] text-[0.7rem] uppercase font-bold mb-1">Posts</span>
              <span className="text-xl font-black text-red-600">12</span>
            </div>
            <div className="bg-[#1a1a1c] p-3 rounded-xl border border-[#222]">
              <span className="block text-[#71717a] text-[0.7rem] uppercase font-bold mb-1">Votes</span>
              <span className="text-xl font-black text-[#efeff1]">442</span>
            </div>
          </div>
        </div>

        {/* Popular Communities */}
        <div className="bg-[#0f0f11] border border-[#1f1f23] rounded-2xl overflow-hidden">
          <div className="p-5 pb-3">
            <h3 className="text-[#efeff1] text-[0.85rem] font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-red-600" />
              Hot Communities
            </h3>
          </div>
          <div className="divide-y divide-[#1a1a1c]">
            {popularCommunities?.communities?.map((community: any) => (
              <Link 
                key={community.id}
                to={`/communities/${community.slug}`}
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-[#222] overflow-hidden group-hover:border-red-600/30 transition-colors">
                  <SafeImage 
                    src={community.avatarUrl || '/community-default.png'} 
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.85rem] font-bold text-[#efeff1] group-hover:text-red-500 transition-colors">n/{community.slug}</span>
                  <span className="text-[0.7rem] text-[#71717a]">{community.memberCount} members</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/communities" className="block p-4 text-center text-[0.75rem] font-bold text-[#71717a] hover:text-red-500 hover:bg-white/5 transition-all">
            See all communities
          </Link>
        </div>

        {/* Neural Recommendations Promo */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-red-900 p-6 group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} strokeWidth={2.5} />
          </div>
          <h4 className="text-white text-[1.1rem] font-black leading-tight mb-2 pr-8">
            Discover your next obsession.
          </h4>
          <p className="text-red-100/70 text-[0.8rem] mb-4">
            AI-powered recommendations based on your unique anime taste.
          </p>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-[0.75rem] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform">
            Go Explore <ExternalLink size={12} />
          </button>
        </div>

        {/* Global Footer Links */}
        <div className="px-4 flex flex-wrap gap-x-4 gap-y-2">
          {['About', 'Privacy', 'Terms', 'Help', ' Nakama © 2026'].map((link) => (
            <span key={link} className="text-[0.7rem] text-[#444] cursor-pointer hover:text-[#71717a]">
              {link}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
