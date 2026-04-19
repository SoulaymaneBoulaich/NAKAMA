import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowingTab from '../components/feed/FollowingTab';
import TrendingTab from '../components/feed/TrendingTab';
import { PlaylistsTab } from '../components/feed/PlaylistsTab';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import AniShotRow from '../components/feed/AniShotRow';

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'following' | 'playlists'>('following');
  const navigate = useNavigate();

  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'following', label: 'Following' },
    { id: 'playlists', label: 'Playlists' }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'following':
        return <FollowingTab />;
      case 'trending':
        return <TrendingTab />;
      case 'playlists':
        return <PlaylistsTab />;
      default:
        return <FollowingTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f4f4f5] font-dm-sans selection:bg-white/10 relative">
      
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-[#0a0a0c] border-b border-[#1a1a1a] z-50 flex items-center px-6">
        {/* Back Arrow */}
        <button 
          onClick={() => navigate('/home')}
          className="absolute left-6 text-[#f4f4f5] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-[0.82rem] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive ? 'text-white' : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* AniShots Section - Edge to Edge */}
      <AnimatePresence>
        {activeTab === 'following' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-[52px] bg-[#0a0a0c]"
          >
            <AniShotRow />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className={`max-w-[680px] mx-auto ${activeTab !== 'following' ? 'pt-[52px]' : ''}`}>
        
        {/* Tab Content Area */}
        <div className="px-4 sm:px-0 pt-2 pb-32 min-h-screen relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Watermark */}
          <div className="py-8 pt-16 text-center text-[#2a2a2a] font-medium text-[0.75rem] uppercase tracking-[0.25em] select-none">
            — NAKAMA —
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
