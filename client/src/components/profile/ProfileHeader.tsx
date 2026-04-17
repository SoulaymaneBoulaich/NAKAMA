import React from 'react';
import type { UserProfile, UserStats } from '../../../../shared/types/index.js';
import { useFollowMutation } from '../../hooks/useProfile';
import { Settings, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
  profile: UserProfile;
  isSelf: boolean;
  stats?: UserStats | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isSelf, stats }) => {
  const followMutation = useFollowMutation();

  const handleFollow = () => {
    followMutation.mutate({ 
      username: profile.username, 
      isFollowing: !!profile.isFollowing 
    });
  };

  return (
    <div className="relative w-full">
      {/* Banner */}
      <div className="h-48 md:h-56 w-full overflow-hidden relative">
        {profile.banner ? (
          <img 
            src={profile.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.5) saturate(1.2)' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(ellipse at 30% 50%, var(--accent-primary) 0%, transparent 70%), radial-gradient(ellipse at 70% 50%, var(--accent-secondary, var(--accent-primary)) 0%, transparent 70%)'
              }}
            />
          </div>
        )}
        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent" />
      </div>

      {/* Profile Info Bar - Dribbble Style */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* Left: Avatar + Name */}
          <div className="flex flex-col md:flex-row md:items-end gap-5 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group/avatar">
              <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[var(--bg-secondary)] bg-[var(--bg-tertiary)] overflow-hidden shadow-2xl transition-all duration-700 ${profile.isNakamaLeader ? 'ring-4 ring-yellow-500/50 ring-offset-4 ring-offset-[var(--bg-secondary)] shadow-yellow-500/20' : 'shadow-black/50 ring-2 ring-[var(--border-color)]/20'}`}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
                    <span className="text-4xl font-black text-[var(--text-primary)]/20">
                      {profile.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Golden Ornate Frame Overlay for Nakama Leader */}
                {profile.isNakamaLeader && (
                  <div className="absolute inset-0 pointer-events-none border-[6px] border-double border-yellow-600/30 rounded-full animate-pulse" />
                )}
              </div>

              {/* Status Badges Overlay */}
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                  {profile.isNakamaLeader && (
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center shadow-lg shadow-yellow-500/50" title="Nakama Leader">
                        <span className="text-[10px] font-black text-black">Ω</span>
                    </div>
                  )}
                  {profile.isUltraNakama && (
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center shadow-lg shadow-red-500/50" title="Ultra Nakama">
                        <span className="text-[10px] font-black text-white">U</span>
                    </div>
                  )}
                  {profile.isPremium && !profile.isNakamaLeader && !profile.isUltraNakama && (
                    <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full border-3 border-[var(--bg-secondary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/30">
                      <span className="text-[10px] font-black text-white">N</span>
                    </div>
                  )}
              </div>
            </div>

            {/* Name + Bio */}
            <div className="mb-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                    {profile.username}
                  </h1>
                </div>
                
                {profile.isNakamaLeader && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    Ω NAKAMA LEADER
                  </span>
                )}

                {profile.isUltraNakama && !profile.isNakamaLeader && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-[var(--accent-primary)] text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                    ULTRA NAKAMA
                  </span>
                )}

                {profile.isPremium && (
                  <span className="px-2.5 py-1 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/25 text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1">
                    <span>✦</span> PRO
                  </span>
                )}
              </div>
              <p className="text-[var(--text-secondary)] mt-2 max-w-xl text-sm leading-relaxed line-clamp-2">
                {profile.bio || "No bio yet."}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4">
                {isSelf ? (
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors tracking-wide"
                  >
                    <Settings size={14} />
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={followMutation.isPending}
                      className={`flex items-center gap-2 px-5 py-2 font-bold text-xs rounded-xl transition-all tracking-wide ${
                        profile.isFollowing
                          ? 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                          : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 shadow-lg shadow-[var(--accent-primary)]/20'
                      }`}
                    >
                      {profile.isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      {profile.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="p-2.5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all rounded-xl">
                      <MessageSquare size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats - Dribbble Style */}
          <div className="flex items-center gap-8 md:gap-10 mb-2 flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Followers</div>
              <div className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{(profile.followerCount || 0).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Following</div>
              <div className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{(profile.followingCount || 0).toLocaleString()}</div>
            </div>
            {stats && (
              <div className="text-center">
                <div className="text-xs text-[var(--text-secondary)] font-medium mb-1">Posts</div>
                <div className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{(stats.postsCount || 0).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
