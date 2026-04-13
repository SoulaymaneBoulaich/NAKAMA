import React from 'react';
import type { UserProfile, UserStats, RatingCategoryStats } from '../../../../shared/types/index.js';
import { Calendar, Shield, Fingerprint, BarChart3, Monitor, Play, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

interface ProfileAboutProps {
  profile: UserProfile;
  stats?: UserStats | null;
  fingerprint?: RatingCategoryStats[] | null;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ profile, stats, fingerprint }) => {
  const chartData = fingerprint?.map(item => ({
    subject: item.category,
    A: item.average,
    fullMark: 10,
  })) || [];

  const statItems = stats ? [
    { label: 'Anime Tracked', value: stats.totalTracked, icon: Monitor },
    { label: 'Episodes Watched', value: stats.episodesWatched, icon: Play },
    { label: 'Communities', value: stats.communitiesJoined, icon: Users },
    { label: 'Posts', value: stats.postsCount, icon: MessageSquare },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Fingerprint size={14} className="text-gray-600" />
          About
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {profile.bio || "This user hasn't written a bio yet."}
        </p>
      </motion.div>

      {/* Quick Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#161616] border border-gray-800/60 rounded-2xl p-5 group hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <item.icon size={14} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                  <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">{item.label}</span>
                </div>
                <div className="text-2xl font-black text-white tabular-nums">
                  {item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Two-column: Fingerprint + Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fingerprint */}
        {fingerprint && fingerprint.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={14} className="text-gray-600" />
                Anime Fingerprint
              </h3>
              <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Category Avg</span>
            </div>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#555', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Radar
                    name="User"
                    dataKey="A"
                    stroke="var(--accent-primary)"
                    fill="var(--accent-primary)"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#161616] border border-gray-800/60 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield size={14} className="text-gray-600" />
              Account Details
            </h3>
            <div className="space-y-5">
              <div>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold block mb-1">Member Since</span>
                <span className="text-white font-bold text-lg">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold block mb-1">Account Type</span>
                <span className={`text-sm font-bold uppercase tracking-wider ${profile.isPremium ? 'text-red-500' : 'text-gray-400'}`}>
                  {profile.isPremium ? '★ Premium Nakama' : 'Default Citizen'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold block mb-1">Reputation</span>
                <span className="text-white font-medium text-sm">
                  {profile.isPremium ? 'Noble' : 'Vagabond'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-600" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                {profile.isPremium ? 'Joined the Elite' : 'Exploring Since'}{' '}
                {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileAbout;
