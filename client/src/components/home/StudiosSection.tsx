import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Star, Play, Info, X, Globe, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../common/Spinner';
import { SafeImage } from '../common/SafeImage';

const FAMOUS_STUDIOS = [
  { id: '1317', name: 'MAPPA', logo: 'https://mappa.co.jp/wp-content/themes/mappa/assets/images/common/logo.png', color: '#ff0000' },
  { id: '43', name: 'Ufotable', logo: 'http://www.ufotable.com/common/img/logo.png', color: '#5ec6ff' },
  { id: '4', name: 'Bones', logo: 'https://www.bones.co.jp/common/img/logo.png', color: '#ffdf00' },
  { id: '803', name: 'WIT Studio', logo: 'https://www.witstudio.co.jp/common/img/logo.png', color: '#00ffcc' },
  { id: '11', name: 'Madhouse', logo: 'https://www.madhouse.co.jp/common/img/logo.png', color: '#ffffff' },
  { id: '2', name: 'Kyoto Animation', logo: 'https://www.kyotoanimation.co.jp/common/img/logo.png', color: '#ffb700' },
];

interface StudioArticleModalProps {
  studio: any;
  isOpen: boolean;
  onClose: () => void;
}

const StudioArticleModal: React.FC<StudioArticleModalProps> = ({ studio, isOpen, onClose }) => {
  if (!isOpen || !studio) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header/Hero */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 z-10" />
          <SafeImage 
            src={studio.studio.images?.jpg?.image_url} 
            className="w-full h-full object-cover blur-md scale-110 opacity-30" 
            alt="" 
          />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-30 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-20 flex flex-col sm:flex-row items-end gap-6 sm:gap-10">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-white rounded-3xl p-4 shadow-2xl overflow-hidden group">
              <img 
                src={studio.studio.images?.jpg?.image_url} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain" 
                alt={studio.studio.titles[0].title} 
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent-primary)]">Production House</span>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic">{studio.studio.titles[0].title}</h2>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <Calendar size={14} className="text-[var(--accent-primary)]" />
                  Established {studio.studio.established ? new Date(studio.studio.established).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <Play size={14} className="text-[var(--accent-primary)]" />
                  {studio.studio.count} Productions
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  {studio.studio.favorites.toLocaleString()} Fans
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Bio & Details */}
            <div className="lg:col-span-1 space-y-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Biography</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  {studio.studio.about || "A premier animation studio recognized globally for its high-quality production and storytelling excellence. Each frame is a testament to the dedication and artistic vision that has shaped the modern anime landscape."}
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Legacy</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest">Official Website</span>
                    <ExternalLink size={14} className="text-zinc-500 group-hover:text-white" />
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Ranking</span>
                    <span className="text-[var(--accent-primary)] font-black italic">#4 Top Studio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Works */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Masterpieces</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Top Rated Works</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {studio.works.slice(0, 6).map((anime: any) => (
                  <div key={anime.mal_id} className="group cursor-pointer">
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden relative mb-2">
                      <SafeImage src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <div className="flex items-center gap-2">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-black tracking-tight">{anime.score}</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-tight line-clamp-1 italic group-hover:text-[var(--accent-primary)] transition-colors">{anime.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const StudiosSection: React.FC = () => {
  const [studiosData, setStudiosData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllStudios = async () => {
      setLoading(true);
      const data: Record<string, any> = {};
      
      // We'll fetch in batches to respect Jikan rate limits (if applicable through the backend)
      // For the home page, we want the first few works for each studio
      for (const studio of FAMOUS_STUDIOS) {
        try {
          const response = await api.get(`/anime/studios/${studio.id}`);
          data[studio.id] = response.data;
          // Small delay to prevent hitting rate limits too hard
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error fetching studio ${studio.name}:`, error);
        }
      }
      setStudiosData(data);
      setLoading(false);
    };

    fetchAllStudios();
  }, []);

  const handleStudioClick = (studioId: string) => {
    const data = studiosData[studioId];
    if (data) {
      setSelectedStudio(data);
      setIsModalOpen(true);
    }
  };

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto border-t border-white/5">
      {/* Header */}
      <div className="mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <h2 className="text-6xl sm:text-7xl font-[var(--font-syne)] font-black tracking-tighter uppercase italic">
            Studio
          </h2>
          <p className="text-zinc-500 text-xl sm:text-2xl font-medium tracking-tight max-w-2xl leading-tight">
            discover the work production station behind your favorite anime
          </p>
        </motion.div>
      </div>

      {/* Studio Rows */}
      <div className="space-y-12">
        {FAMOUS_STUDIOS.map((studio, index) => {
          const data = studiosData[studio.id];
          const studioWorks = data?.works?.slice(0, 5) || [];
          
          return (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group flex flex-col md:flex-row items-center gap-8 py-6 border-b border-white/5 last:border-0"
            >
              {/* Left: Studio Info */}
              <div className="flex items-center gap-6 w-full md:w-1/4 shrink-0">
                <div className="relative group/logo">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStudioClick(studio.id)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl p-4 border border-white/10 overflow-hidden shadow-xl"
                  >
                    <img 
                      src={data?.studio?.images?.jpg?.image_url || studio.logo} 
                      alt={studio.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover/logo:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Hover Name Overlay */}
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity p-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white text-center leading-tight">
                        {studio.name}
                      </span>
                    </div>
                  </motion.button>
                </div>

                <div className="flex-1 hidden sm:block">
                  <h3 className="text-lg font-black uppercase italic tracking-tighter group-hover:text-[var(--accent-primary)] transition-colors">
                    {studio.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                    {data?.studio?.count || '--'} Works
                  </p>
                </div>
              </div>

              {/* Middle: Animes */}
              <div className="flex-1 w-full flex items-center gap-4 overflow-hidden">
                {loading ? (
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-32 h-44 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {studioWorks.map((anime: any) => (
                      <motion.div
                        key={anime.mal_id}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate(`/anime/${anime.mal_id}`)}
                        className="w-32 sm:w-36 shrink-0 cursor-pointer group/anime"
                      >
                        <div className="aspect-[2/3] rounded-2xl overflow-hidden relative mb-2">
                          <SafeImage src={anime.images?.jpg?.image_url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/anime:opacity-100 transition-opacity flex items-center justify-center">
                             <Play size={20} className="text-white fill-white" />
                          </div>
                        </div>
                        <h4 className="text-[9px] font-black uppercase tracking-tight line-clamp-1 italic text-zinc-400 group-hover/anime:text-white transition-colors">
                          {anime.title}
                        </h4>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: See More */}
              <div className="shrink-0 flex items-center">
                <motion.button
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(`/search?studio=${studio.id}`)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 group/btn"
                >
                  <ArrowRight size={24} className="group-hover/btn:text-[var(--accent-primary)] transition-colors" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Studio Article Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <StudioArticleModal 
            studio={selectedStudio} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
