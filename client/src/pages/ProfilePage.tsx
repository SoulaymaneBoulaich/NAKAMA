import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  useProfile, 
  useProfileStats, 
  useProfileTopTen, 
  useProfileActivity,
  useProfilePlaylists,
  useProfilePosts,
  useProfileDebates
} from '../hooks/useProfile';
import { ProfileDebates } from '../components/profile/ProfileDebates';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTopTen from '../components/profile/ProfileTopTen';
import ProfileActivity from '../components/profile/ProfileActivity';
import ProfilePlaylists from '../components/profile/ProfilePlaylists';
import ProfilePosts from '../components/profile/ProfilePosts';
import { motion, AnimatePresence } from 'framer-motion';

type ProfileTab = 'playlists' | 'posts' | 'debates' | 'top10' | 'about' | 'activity';

const TABS: { key: ProfileTab; label: string; countKey?: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'debates', label: 'Debates' },
  { key: 'activity', label: 'Activity' },
];

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  
  const isInvalidUser = !username || username === 'home' || username === 'undefined';
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile(isInvalidUser ? '' : username!);
  const isSelf = currentUser?.username === username;
  
  const { data: stats } = useProfileStats(isInvalidUser ? '' : username!, !!profile);
  const { data: topten } = useProfileTopTen(isInvalidUser ? '' : username!, !!profile);
  const { data: activity } = useProfileActivity(isInvalidUser ? '' : username!, !!profile);
  const { data: playlists } = useProfilePlaylists(isInvalidUser ? '' : username!, !!profile);
  const { data: posts } = useProfilePosts(isInvalidUser ? '' : username!, !!profile);
  const { data: debatesData } = useProfileDebates(isInvalidUser ? '' : username!, !!profile);

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-600 uppercase tracking-widest font-bold">Loading Profile</span>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">404: Lost in the Void</h2>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Tab counts
  const tabCounts: Record<string, number | undefined> = {
    playlists: playlists?.length,
    posts: posts?.length || stats?.postsCount,
    debates: debatesData?.arenas.length,
    top10: topten?.length,
    activity: activity?.length,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'playlists':
        return (
          <ProfilePlaylists 
            playlists={playlists || []} 
            isSelf={isSelf}
            topTen={topten || []}
          />
        );
      case 'posts':
        return <ProfilePosts posts={posts || []} />;
      case 'activity':
        return <ProfileActivity activities={activity || []} isSelf={isSelf} />;
      case 'debates':
        return <ProfileDebates arenas={debatesData?.arenas || []} stats={debatesData?.stats || { wins: 0, losses: 0, draws: 0, judgedCount: 0 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] pb-20">
      <ProfileHeader profile={profile} isSelf={isSelf} stats={stats || undefined} />

      {/* Tabs Bar - Dribbble Style */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex items-center gap-0 -mb-px overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key];
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (activeTab === ('debates' as any) || count > 0) && (
                    <span className={`text-[10px] tabular-nums ml-0.5 ${
                      isActive ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)]/60'
                    }`}>
                      {count}
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-primary)] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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

      {/* Top 10 Popup for Owner */}
      {isSelf && (
        <>
          <button
            onClick={() => setIsTopTenOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--accent-primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
          >
            <span className="text-xl font-black italic tracking-tighter">10</span>
            <div className="absolute -top-12 right-0 bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[var(--border-color)]">
              Manage Top 10
            </div>
          </button>

          <AnimatePresence>
            {isTopTenOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsTopTenOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col"
                >
                  <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--accent-primary)]">
                      Top 10 Rankings
                    </h2>
                    <button 
                      onClick={() => setIsTopTenOpen(false)}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase text-xs font-bold tracking-widest"
                    >
                      Close [esc]
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <ProfileTopTen entries={topten || []} isSelf={isSelf} username={username || ''} />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
