import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { SafeImage } from '../components/common/SafeImage';

export const NewsArticlePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[#f4f4f5] pb-24">
      {/* Cinematic Hero */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-transparent opacity-60" />
        
        <SafeImage 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover scale-105 blur-[2px] opacity-40"
        />

        <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-6 md:px-12 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="font-jetbrains text-[0.7rem] tracking-[0.2em] bg-[var(--accent-primary)] text-white uppercase py-1.5 px-4 rounded-full shadow-[0_4px_12px_rgba(220,38,38,0.3)]">
                {item.category || 'News'}
              </span>
              <div className="flex items-center gap-2 text-[#71717a] font-dm-sans text-sm">
                <Calendar size={14} />
                {formatDate(item.publishedAt)}
              </div>
            </div>
            
            <h1 className="font-outfit font-extrabold text-[2.5rem] md:text-[4rem] leading-[1.1] tracking-tight mb-8">
              {item.title}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <motion.article 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-8"
          >
             {/* Back Button */}
             <button 
               onClick={() => navigate(-1)}
               className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors mb-10 group"
             >
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               <span className="font-jetbrains text-xs tracking-widest uppercase">Go Back</span>
             </button>

             <div className="relative rounded-3xl overflow-hidden border border-[#1e1e24] mb-12 shadow-2xl">
               <SafeImage src={item.imageUrl} alt={item.title} className="w-full h-auto aspect-video object-cover" />
             </div>

             <div className="prose prose-invert prose-lg max-w-none">
                <p className="font-dm-sans text-[1.25rem] leading-relaxed text-[#a1a1aa] mb-8 italic border-l-4 border-[var(--accent-primary)] pl-6 font-light">
                  {item.summary}
                </p>
                
                {/* Simulated Article Body Since RSS feeds usually only provide summaries or require heavy scraping */}
                <div className="font-dm-sans text-[1.1rem] leading-[1.8] text-[#d4d4d8] space-y-6">
                   <p>
                     The anime industry continues to evolve with groundbreaking announcements that shape the cultural landscape. 
                     This latest development underscores the growing global reach of Japanese media and its ability to connect 
                     audiences through shared narratives and unique visual storytelling.
                   </p>
                   <p>
                     As we follow this story, Nakama will continue to provide updates on release dates, character designs, 
                     and exclusive behind-the-scenes content. Stay tuned to our news feed for the most comprehensive coverage 
                     of your favorite series.
                   </p>
                </div>
             </div>

             <div className="mt-16 pt-10 border-t border-[#1e1e24] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)114] border border-[#1e1e24] rounded-xl text-sm font-bold hover:bg-[#18181d] transition-all group">
                    <Bookmark size={18} className="text-[#71717a] group-hover:text-[var(--accent-primary)] transition-colors" />
                    Save Article
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)114] border border-[#1e1e24] rounded-xl text-sm font-bold hover:bg-[#18181d] transition-all group">
                    <Share2 size={18} className="text-[#71717a] group-hover:text-[var(--accent-primary)] transition-colors" />
                    Share
                  </button>
                </div>

                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--accent-primary)] font-bold hover:underline"
                >
                  <ExternalLink size={18} />
                  Read Original Source
                </a>
             </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
             <div className="bg-[var(--bg-secondary)114]/50 border border-[#1e1e24] rounded-3xl p-8 backdrop-blur-md">
                <h4 className="font-outfit font-bold text-lg mb-6 flex items-center gap-2">
                  <Tag size={18} className="text-[var(--accent-primary)]" />
                  Related Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Industry', 'Anime', 'Manga', item.category].filter(Boolean).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#18181d] rounded-lg text-[10px] font-black uppercase tracking-widest text-[#71717a]">
                      #{tag}
                    </span>
                  ))}
                </div>
             </div>

             <div className="bg-gradient-to-br from-[var(--accent-primary)]/20 to-transparent border border-[var(--accent-primary)]/30 rounded-3xl p-8">
                <h4 className="font-outfit font-extrabold text-xl mb-4 text-[#f4f4f5]">Join the Conversation</h4>
                <p className="font-dm-sans text-sm text-[#a1a1aa] mb-6">
                  Share your thoughts on this latest update with the Nakama community.
                </p>
                <button className="w-full py-4 bg-white text-black font-outfit font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Post a Comment
                </button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
