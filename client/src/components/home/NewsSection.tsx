import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Newspaper, ArrowUpRight, Clock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../common/Spinner';

export const NewsSection: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Step 1: Get top 5 airing anime
        const topResponse = await api.get('/anime/top', { params: { limit: 5, filter: 'airing' } });
        const airingAnime = topResponse.data || [];
        
        // Step 2: Fetch news for each (Limited by Jikan rate limits, so we take the best)
        // For simplicity and stability, we'll use the top anime data as "News Highlights"
        // but structured as articles
        const articles = airingAnime.map((anime: any, idx: number) => ({
          id: anime.mal_id,
          title: anime.title,
          summary: anime.synopsis || "Latest updates from the front lines of production.",
          image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          category: anime.type || "Update",
          isHot: idx < 2,
          date: anime.status || "Ongoing"
        }));
        
        setNews(articles);
      } catch (err) {
        console.error('Error fetching real news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <div className="h-[400px] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
               <Newspaper size={16} className="text-[var(--accent-primary)]" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500">Global Intel</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter">NAKAMA <span className="text-white">INTEL</span></h2>
        </div>
        <Link 
          to="/news"
          className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all"
        >
          Explore All Intelligence <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900/20"
          >
            {/* Image Section */}
            <div className="absolute inset-0 z-0">
              <img 
                src={article.image} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 brightness-50 group-hover:brightness-75" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Badges */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
              <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-zinc-300">
                {article.category}
              </div>
              {article.isHot && (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2.5 bg-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                  <Flame size={16} className="text-white fill-white" />
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
              <div className="flex items-center gap-3 text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                <Clock size={10} /> {article.date}
              </div>
              <h3 className="text-2xl font-black leading-tight mb-4 group-hover:text-[var(--accent-primary)] transition-colors uppercase italic tracking-tighter line-clamp-2">
                {article.title}
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 mb-8 transition-colors group-hover:text-zinc-400">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500">
                <Link to={`/anime/${article.id}`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                  Read Intel <ArrowUpRight size={14} />
                </Link>
                <button className="text-zinc-500 hover:text-white transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
