import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  useProfile, 
  useProfileStats, 
  useProfileFingerprint, 
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
import ProfileAbout from '../components/profile/ProfileAbout';
import { motion, AnimatePresence } from 'framer-motion';

type ProfileTab = 'playlists' | 'posts' | 'debates' | 'top10' | 'about' | 'activity';

const TABS: { key: ProfileTab; label: string; countKey?: string }[] = [
  { key: 'playlists', label: 'Playlists' },
  { key: 'posts', label: 'Posts' },
  { key: 'debates', label: 'Debates' },
  { key: 'top10', label: 'Top 10' },
  { key: 'activity', label: 'Activity' },
  { key: 'about', label: 'About' },
];

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('playlists');
  
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile(username || '');
  const isSelf = currentUser?.username === username;
  
  const { data: stats } = useProfileStats(username || '', !!profile);
  const { data: fingerprint } = useProfileFingerprint(username || '', !!profile);
  const { data: topten } = useProfileTopTen(username || '', !!profile);
  const { data: activity } = useProfileActivity(username || '', !!profile);
  const { data: playlists } = useProfilePlaylists(username || '', !!profile);
  const { data: posts } = useProfilePosts(username || '', !!profile);
  const { data: debatesData } = useProfileDebates(username || '', !!profile);

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
        return <ProfilePlaylists playlists={playlists || []} />;
      case 'posts':
        return <ProfilePosts posts={posts || []} />;
      case 'top10':
        return <ProfileTopTen entries={topten || []} isSelf={isSelf} username={username || ''} />;
      case 'about':
        return <ProfileAbout profile={profile} stats={stats} fingerprint={fingerprint} />;
      case 'activity':
        return <ProfileActivity activities={activity || []} />;
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
    </div>
  );
};

export default ProfilePage;
