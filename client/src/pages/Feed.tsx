import React, { useState } from 'react';
import { FeedNavbar } from '../components/layout/FeedNavbar';
import FollowingTab from '../components/feed/FollowingTab';
import TrendingTab from '../components/feed/TrendingTab';
import { PlaylistsTab } from '../components/feed/PlaylistsTab';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { Pencil } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'following' | 'playlists'>('following');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[#f4f4f5]">
      {/* Feed Navbar replaces Global Navbar */}
      <FeedNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content Area */}
      <main className="pt-[56px] pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40 group">
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#000]/80 backdrop-blur-md rounded-lg border border-[#232329] text-white text-[0.85rem] font-dm-sans font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0">
          Share your thoughts
        </div>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="w-[56px] h-[56px] bg-[#7c3aed] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(124,58,237,0.5)] cursor-pointer"
        >
          <Pencil size={22} />
        </motion.button>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};
