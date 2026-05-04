import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Book, 
  Star, 
  Edit3, 
  ChevronLeft,
  Share2,
  Heart,
  Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useQuery } from '@tanstack/react-query';
import { RateChronicleModal } from '../../components/chronicles/RateChronicleModal';
import { Spinner } from '../../components/common/Spinner';
import { SafeImage } from '../../components/common/SafeImage';
import { Avatar } from '../../components/common/Avatar';

const ChronicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const { data: chronicle, isLoading, error, refetch } = useQuery({
    queryKey: ['chronicle', id],
    queryFn: async () => {
      const res = await api.get(`/chronicles/${id}`);
      return res.data;
    }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <Spinner size="lg" />
    </div>
  );

  if (error || !chronicle) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-white">
      <h2 className="text-4xl font-black uppercase italic mb-4">Archive Node Missing</h2>
      <button onClick={() => navigate('/chronicles')} className="text-[var(--accent-primary)] font-bold uppercase tracking-widest text-xs">Return to Grid</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      {/* Dynamic Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-[var(--bg-primary)] z-10" />
        <SafeImage 
          src={chronicle.coverImage || 'https://images.unsplash.com/photo-1541560052-3744e409ec86?q=80&w=1976&auto=format&fit=crop'} 
          className="w-full h-full object-cover opacity-60 scale-105"
          alt=""
        />

        {/* Floating Controls */}
        <div className="absolute top-10 left-10 right-10 z-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/chronicles')}
            className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-[var(--accent-primary)] transition-all group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-3">
             <button className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all">
               <Share2 size={24} />
             </button>
             <button className="p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-white/10 transition-all">
               <Heart size={24} />
             </button>
          </div>
        </div>

        {/* Title Manifest */}
        <div className="absolute bottom-20 left-10 right-10 z-20 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[var(--accent-primary)] rounded-lg">
                <Book size={16} className="text-white" />
              </div>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Active Chronicle Record</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-white uppercase italic tracking-tighter leading-none">
              {chronicle.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-primary)] p-0.5">
                    <Avatar src={chronicle.user?.avatar} username={chronicle.user?.username || ''} size="md" className="w-full h-full rounded-full" />
                  </div>
                  <span className="text-sm font-black text-white uppercase italic">{chronicle.user?.username}</span>
               </div>
               <div className="h-6 w-[1px] bg-white/10" />
               <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
                  <Star size={18} className="text-[var(--accent-primary)]" fill="currentColor" />
                  <span className="text-xl font-black text-white italic">{chronicle.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">Resonance Level</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-3 gap-20">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-16">
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-[var(--accent-primary)]" />
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Manifesto Summary</h3>
               </div>
               <p className="text-xl text-zinc-300 font-bold leading-relaxed italic">
                 {chronicle.description}
               </p>
               
               <div className="flex flex-wrap gap-3">
                  {chronicle.tags?.map((tag: string) => (
                    <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-[var(--border-color)] hover:text-white hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer">
                       <Hash size={10} className="text-[var(--accent-primary)]" />
                       {tag}
                    </div>
                  ))}
               </div>
            </section>

            <section className="space-y-12">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-[1px] bg-[var(--accent-primary)]" />
                     <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Fragment Logs</h3>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:translate-x-1 transition-transform">
                     Manifest New Fragment
                     <Plus size={14} />
                  </button>
               </div>

               <div className="space-y-6">
                  {chronicle.chapters?.map((chapter: any, idx: number) => (
                    <div key={chapter.id} className="group relative bg-[#0d0d0f] border border-[var(--border-color)] rounded-[2rem] p-8 hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase italic tracking-widest">Shard {idx + 1}</span>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(chapter.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">{chapter.title}</h4>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         {/* Sidebar Stats */}
         <aside className="space-y-12">
            <div className="bg-[#0d0d0f] border border-[var(--border-color)] rounded-[3rem] p-10 space-y-10">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">Resonance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-6 rounded-3xl text-center space-y-2">
                        <div className="text-2xl font-black text-white italic">{(chronicle.chapters || []).length}</div>
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Shards</div>
                     </div>
                     <div className="bg-white/5 p-6 rounded-3xl text-center space-y-2">
                        <div className="text-2xl font-black text-white italic">{chronicle.views || 0}</div>
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Views</div>
                     </div>
                  </div>
               </div>

               <div className="h-[1px] bg-white/5" />

               <div className="space-y-6">
                  <button 
                    onClick={() => setIsRateModalOpen(true)}
                    className="w-full py-5 bg-white/5 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-widest transition-all"
                  >
                     <Plus size={16} className="text-[var(--accent-primary)]" />
                     Anchor Resonance
                  </button>
                  <button className="w-full py-5 bg-white/5 border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-widest transition-all">
                     <Edit3 size={16} className="text-zinc-600" />
                     Forge Shard
                  </button>
               </div>
            </div>

            {/* Recent Ratings */}
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-[var(--accent-primary)]" />
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Recent Decoders</h3>
               </div>
               <div className="space-y-4">
                  {chronicle.ratings?.slice(0, 3).map((r: any) => (
                    <div key={r.id} className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                       <Avatar src={r.user?.avatar} username={r.user?.username || 'ARCHIVE_USER'} size="sm" className="w-10 h-10 rounded-full" />
                       <div>
                          <p className="text-[10px] font-black text-white uppercase italic tracking-widest">{r.user?.username || 'ARCHIVE_USER'}</p>
                          <div className="flex items-center gap-1 mt-1 text-[var(--accent-primary)]">
                             <Star size={10} fill="currentColor" />
                             <span className="text-[10px] font-black">{r.rating}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </aside>
      </div>

      <RateChronicleModal
        isOpen={isRateModalOpen}
        chronicleId={id || ''}
        onClose={() => setIsRateModalOpen(false)}
        onRated={refetch}
      />
    </div>
  );
};

export default ChronicleDetail;
