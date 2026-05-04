import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Users, Shield, Calendar, Info, MessageSquare } from 'lucide-react';
import PostCard from '../components/social/PostCard';
import CreatePost from '../components/social/CreatePost';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from '../components/common/SafeImage';
import { Avatar } from '../components/common/Avatar';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  avatarUrl?: string;
  memberCount: number;
  isValidated: boolean;
  createdAt: string;
  rules: { id: string, ruleText: string, order: number }[];
  members: { role: string, user: { id: string, username: string, avatar?: string } }[];
}

const CommunityDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'rules'>('posts');

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [commRes, postsRes] = await Promise.all([
        api.get(`/communities/${slug}`),
        api.get(`/communities/${slug}/posts`)
      ]);
      
      setCommunity(commRes.data);
      setPosts(postsRes.data.posts);
      
      if (user) {
        // In a real app, you'd have an endpoint to check membership status or it would be in the community payload
        // For simplicity, we'll check the members array if it was full, but here it's only admins
        // Let's assume the backend check is needed or we just try to join.
        // For now, let's just check if user is incommRes.data.members (admins)
        const admin = commRes.data.members.find((m: any) => m.user.id === user.id);
        setIsAdmin(!!admin);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      navigate('/communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [slug, user]);

  const handleJoinLeave = async () => {
    if (!user) return navigate('/login');
    try {
      if (isMember) {
        await api.delete(`/communities/${slug}/leave`);
        setIsMember(false);
      } else {
        await api.post(`/communities/${slug}/join`, {});
        setIsMember(true);
      }
      fetchCommunityData();
    } catch (error) {
      console.error('Join/Leave error:', error);
    }
  };

  if (loading || !community) return <div className="h-screen flex items-center justify-center text-red-600 font-black animate-pulse">LOADING CORE...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-[var(--border-color)] mb-6 group">
        <div className="h-48 md:h-64 bg-zinc-800 relative">
          {community.bannerUrl ? (
            <SafeImage src={community.bannerUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-900/20 to-zinc-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-zinc-950 border-4 border-black overflow-hidden shadow-2xl shadow-black/50">
            <Avatar 
              src={community.avatarUrl} 
              name={community.name}
              size="xl"
              className="w-full h-full"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                {community.name}
              </h1>
              {community.isValidated && <Shield size={24} className="text-red-500" />}
            </div>
            <div className="flex items-center gap-4 text-zinc-400 font-bold text-sm">
              <span className="flex items-center gap-1.5"><Users size={16} /> {community.memberCount.toLocaleString()} Members</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> Est. {new Date(community.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isAdmin && (
              <button 
                onClick={() => navigate(`/communities/${slug}/edit`)}
                className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-2xl transition-all border border-zinc-700"
              >
                <Shield size={20} />
              </button>
            )}
            <button 
              onClick={handleJoinLeave}
              className={`px-8 py-3 rounded-2xl font-black tracking-widest transition-all transform active:scale-95 shadow-xl ${
                isMember 
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900/50' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20'
              }`}
            >
              {isMember ? 'LEAVE' : 'JOIN NICHE'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-[var(--border-color)] sticky top-4 z-20 backdrop-blur-md">
            {(['posts', 'members', 'rules'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-widest ${
                  activeTab === tab 
                  ? 'bg-zinc-800 text-zinc-100 shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'posts' && (
            <>
              {isMember && (
                <CreatePost 
                  communityId={community.id} 
                  onPostCreated={(newPost) => setPosts([newPost, ...posts])} 
                />
              )}
              
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-[var(--border-color)] rounded-3xl">
                    <MessageSquare size={48} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-500 font-bold">No transmissions yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* This would ideally fetch from /api/communities/[slug]/members */}
               <p className="col-span-2 text-zinc-500 italic text-center py-10 border border-[var(--border-color)] rounded-2xl bg-zinc-900/30">
                 Member directory is loading core data packets...
               </p>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="bg-zinc-900/40 border border-[var(--border-color)] rounded-3xl p-8 space-y-6">
              {community.rules.length > 0 ? (
                community.rules.map((rule, idx) => (
                  <div key={rule.id} className="flex gap-6 pb-6 border-b border-[var(--border-color)]/50 last:border-0 last:pb-0">
                    <span className="text-4xl font-black text-red-600/20 italic">0{idx + 1}</span>
                    <div>
                      <p className="text-zinc-100 font-bold text-lg leading-relaxed">{rule.ruleText}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 italic text-center">No explicit rules established for this niche.</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 border border-[var(--border-color)] rounded-3xl p-6">
            <h2 className="text-sm font-black text-zinc-500 tracking-[0.2em] mb-4 uppercase">About</h2>
            <p className="text-zinc-300 font-medium leading-relaxed mb-6">
              {community.description || "The fans of this niche haven't written a description yet. Be the first to shape its identity."}
            </p>
            
            <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-bold">COMMUNITY ID</span>
                <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg font-mono text-xs">{community.id.split('-')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-bold">ESTABLISHED</span>
                <span className="text-zinc-300">{new Date(community.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-[var(--border-color)] rounded-3xl p-6">
            <h2 className="text-sm font-black text-zinc-500 tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
              <Shield size={14} /> ADJUDICATORS
            </h2>
            <div className="space-y-3">
              {community.members.filter(m => m.role === 'ADMIN').map(admin => (
                <div 
                  key={admin.user.id} 
                  className="flex items-center gap-3 p-2 bg-zinc-950/50 border border-[var(--border-color)] rounded-xl hover:border-red-900/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/profile/${admin.user.username}`)}
                >
                   <Avatar 
                    src={admin.user.avatar} 
                    name={admin.user.username}
                    size="md"
                    className="w-10 h-10"
                   />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-bold truncate group-hover:text-red-500 transition-colors uppercase italic">{admin.user.username}</p>
                    <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Admin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!community.isValidated && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-yellow-500/10 rotate-12">
                <Info size={120} />
              </div>
              <h3 className="text-yellow-500 font-black text-xs tracking-widest uppercase mb-2 flex items-center gap-2">
                <Info size={14} /> Critical Warning
              </h3>
              <p className="text-yellow-500/90 text-sm font-medium leading-relaxed">
                This community is in <strong>STAGINGPHASE</strong>. It must reach 30 members within 7 days of creation or it will be purged from the core servers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
