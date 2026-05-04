import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowingTab from '../components/feed/FollowingTab';
import TrendingTab from '../components/feed/TrendingTab';
import CommunitiesTab from '../components/feed/CommunitiesTab';
import { PlaylistsTab } from '../components/feed/PlaylistsTab';
import { RightSidebar } from '../components/feed/RightSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bell, Search, PlusSquare } from 'lucide-react';
import AniShotRow from '../components/feed/AniShotRow';

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'following' | 'communities' | 'playlists'>('following');
  const navigate = useNavigate();

  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'following', label: 'Following' },
    { id: 'communities', label: 'Communities' },
    { id: 'playlists', label: 'Playlists' }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'following':
        return <FollowingTab />;
      case 'trending':
        return <TrendingTab />;
      case 'communities':
        return <CommunitiesTab />;
      case 'playlists':
        return <PlaylistsTab />;
      default:
        return <FollowingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#efeff1] font-dm-sans selection:bg-red-500/20 relative">
      
      {/* Premium Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-[#1a1a1c] z-50">
        <div className="max-w-[1440px] h-full mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-white/5 rounded-full transition-all text-[#71717a] hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-red-600 tracking-tighter select-none">仲間</span>
              <span className="hidden sm:block text-[0.7rem] font-black uppercase tracking-[0.3em] text-[#444] mt-1 ml-2">Feed</span>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#1f1f23]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 text-[0.8rem] font-bold rounded-lg transition-all ${
                    isActive 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                      : 'text-[#71717a] hover:text-[#efeff1] hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 text-[#71717a] hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 text-[#71717a] hover:text-white transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0a0a0c]" />
            </button>
            <button className="hidden sm:flex items-center gap-2 bg-[#efeff1] text-black px-4 py-2 rounded-lg text-[0.8rem] font-black uppercase tracking-wider hover:bg-white transition-all ml-2">
              <PlusSquare size={16} /> Post
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden fixed top-[64px] left-0 right-0 bg-[#0a0a0c] border-b border-[#1a1a1c] z-40 overflow-x-auto scrollbar-hide">
        <div className="flex px-4 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-[0.8rem] font-bold transition-all relative ${
                  isActive ? 'text-red-500' : 'text-[#71717a]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div layoutId="mobileTabIn" className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-[84px] md:pt-[100px] pb-32">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12 lg:items-start">
          
          {/* Main Feed Column */}
          <div className="space-y-0">
            {/* AniShots (Only on Following/Communities) */}
            <AnimatePresence>
              {(activeTab === 'following' || activeTab === 'communities') && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 rounded-2xl overflow-hidden border border-[#1a1a1c]"
                >
                  <AniShotRow />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-[680px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>

      {/* Decorative Watermark */}
      <div className="fixed bottom-12 right-12 opacity-5 pointer-events-none hidden xl:block select-none">
        <span className="text-[8rem] font-black text-white leading-none">仲間</span>
      </div>
    </div>
  );
};

export default FeedPage;
