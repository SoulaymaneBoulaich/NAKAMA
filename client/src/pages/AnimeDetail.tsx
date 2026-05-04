import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { X, Plus, Edit3, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '../components/common/SafeImage';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EntryDetailDrawer } from '../components/anime/EntryDetailDrawer';

export const AnimeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userEntry, setUserEntry] = useState<any>(null);
  const [similarAnime, setSimilarAnime] = useState<any[]>([]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/anime/${id}`);
      setData(res.data);
      
      // Check if user has this in their list
      try {
        const entriesRes = await api.get('/entries');
        const entry = entriesRes.data.find((e: any) => e.animeId === String(id));
        setUserEntry(entry);
      } catch (e) {
        console.warn('Could not fetch user list status');
      }

      // Fetch similar anime
      try {
        const { getSimilarAnime } = await import('../api/jikan');
        const similar = await getSimilarAnime(String(id), 6);
        setSimilarAnime(similar);
      } catch (e) {
        console.warn('Could not fetch similar anime');
      }
    } catch (err: any) {
      console.error('Error fetching anime details:', err);
      const message = err.response?.status === 429 
        ? 'Archives are busy. Please wait a moment.' 
        : 'Failed to synchronize with the archives. The signal may be lost.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      openAuthModal('login');
      return;
    }
    if (id) fetchDetails();
  }, [id, user, authLoading]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-red-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Decrypting Archive Data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen w-full bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="space-y-4">
          <h2 className="text-white font-black uppercase italic tracking-tighter text-4xl">System Interference</h2>
          <p className="text-red-500 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto leading-relaxed">
            {error || 'The requested entry does not exist in the current timeline.'}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fetchDetails()} 
            className="px-8 py-3 bg-white text-black font-black uppercase italic tracking-widest text-[10px] rounded-xl hover:scale-105 transition-all"
          >
            Retry Sync
          </button>
          <button 
            onClick={() => navigate('/home')} 
            className="px-8 py-3 bg-white/5 border border-[var(--border-color)] text-white font-black uppercase italic tracking-widest text-[10px] rounded-xl hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] overflow-hidden selection:bg-white selection:text-black">
      {/* Top Exit Button */}
      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-white/5 backdrop-blur-md border border-[var(--border-color)] rounded-full text-white hover:bg-white/20 hover:border-white/30 transition-all group shadow-2xl active:scale-95"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      {/* Background Cinematic Art */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent z-10" />
        <SafeImage 
          src={data.images.jpg.large_image_url} 
          alt={data.title}
          className="w-full h-full object-cover opacity-30 transform scale-110 blur-sm"
        />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-20 container mx-auto px-12 min-h-screen flex flex-col justify-center py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                {data.genres.map((g: any) => (
                  <span key={g.name} className="px-3 py-1 bg-white/5 border border-[var(--border-color)] rounded-md text-[10px] font-black uppercase tracking-widest text-white/50">
                    {g.name}
                  </span>
                ))}
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-outfit font-extrabold tracking-tighter leading-[0.9] text-white uppercase max-w-2xl">
                {data.title}
              </h1>

              <div className="pt-4 flex flex-col space-y-1">
                <p className="text-lg font-outfit font-semibold text-white/50 uppercase tracking-tight">
                  IS A JAPANESE {data.type.toUpperCase()} SERIES {data.studios?.[0] ? `BY ${data.studios[0].name.toUpperCase()}` : ''}
                </p>
              </div>
            </div>

            <p className="text-xl text-white/40 leading-relaxed font-light max-w-3xl line-clamp-6">
              {data.synopsis}
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">MAL SCORE</span>
                <div className="flex items-center gap-2">
                   <Star size={16} className="fill-white text-white" />
                   <span className="text-2xl font-bold font-outfit">{data.score || '0.0'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">RELEASED</span>
                <span className="text-2xl font-bold font-outfit">{data.year || data.status.substring(0,4)}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">EPISODES</span>
                <span className="text-2xl font-bold font-outfit">{data.episodes || '?'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              {userEntry ? (
                <div className="flex items-center gap-4">
                  <StatusBadge status={userEntry.status} />
                  <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-[var(--border-color)] rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    <Edit3 size={18} /> Edit Entry
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  <Plus size={18} /> Add to My List
                </button>
              )}

              <button 
                onClick={async () => {
                  try {
                    const { data: wp } = await api.post('/api/watchparty', {
                        animeId: String(id),
                        animeTitle: data.title,
                        animeCover: data.images.jpg.large_image_url,
                        isPrivate: false,
                        maxParticipants: 10
                    });
                    navigate(`/watchparty/${wp.code}`);
                  } catch (e) {
                    alert('Failed to invoke watch party');
                  }
                }}
                className="flex items-center gap-3 px-8 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Invoke Party
              </button>
            </div>
          </motion.div>

          {/* Right Side: Hero Art / Character Cutout */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] w-[450px] mx-auto group">
               {/* Background Glow */}
               <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full transform scale-150 group-hover:bg-white/10 transition-all duration-700" />
               
               <div className="relative z-10 w-full h-full rounded-[40px] overflow-hidden border border-[var(--border-color)] shadow-[0_0_80px_rgba(0,0,0,0.5)] transform -rotate-2 hover:rotate-0 transition-all duration-700">
                  <SafeImage 
                    src={data.images.jpg.large_image_url} 
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-60" />
               </div>

               {/* Stylized Badge (Optional) */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white rounded-full flex items-center justify-center transform rotate-12 z-20 border-8 border-[var(--bg-primary)] shadow-xl">
                  <span className="text-black font-extrabold text-xl italic font-outfit">#{data.rank || '?'}</span>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Similar Signals Section */}
      {similarAnime.length > 0 && (
        <div className="relative z-20 pb-40">
           <div className="container mx-auto px-12">
              <div className="flex flex-col gap-2 mb-12">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-primary)] italic">Neural Correlation</span>
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter">Similar <span className="text-white/20">Signals</span></h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                 {similarAnime.map((anime: any) => (
                    <Link 
                      key={anime.mal_id} 
                      to={`/anime/${anime.mal_id}`}
                      className="group block space-y-4"
                    >
                       <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative">
                          <SafeImage 
                            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={anime.title} 
                          />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate group-hover:text-white transition-colors">{anime.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)]" />
                             <span className="text-[8px] font-bold text-white/20 uppercase">{anime.type}</span>
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        </div>
      )}


      {/* Floating Interaction (Add to List / Info) */}
      <EntryDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        animeId={id}
        onUpdate={fetchDetails}
      />
    </div>
  );
};
