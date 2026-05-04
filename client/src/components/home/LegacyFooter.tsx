import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Shield, FileText, ExternalLink, Quote, Send, ArrowRight, Settings, Compass, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../common/Spinner';

const QUOTES = [
  { text: "It's not the face that makes someone a monster; it's the choices they make with their lives.", author: "Naruto Uzumaki" },
  { text: "A person grows up when they are able to overcome hardships. Protection is important, but there are some things that a person must learn on their own.", author: "Jiraiya" },
  { text: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", author: "Kenshin Himura" },
  { text: "The world isn't perfect. But it's there for us, doing the best it can... that's what makes it so damn beautiful.", author: "Roy Mustang" }
];

export const RecommendationsSection: React.FC = () => {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const response = await api.get('/anime/recommendations');
        setRecs(response.data.slice(0, 3) || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Spinner size="md" /></div>;

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-20 space-y-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
             <Sparkles size={16} className="text-purple-400" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500">Tailored For You</span>
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase italic">ECHOES OF <span className="text-white">TASTE</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {recs.length > 0 ? recs.map((anime, idx) => (
          <motion.div
            key={anime.mal_id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-zinc-900/20 border border-white/5 rounded-[3rem] p-8 overflow-hidden hover:bg-zinc-900/40 transition-all duration-500"
          >
            <div className="flex gap-6 items-start">
              <div className="w-24 h-36 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                <img src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">98% Resonance</span>
                </div>
                <h3 className="text-xl font-black tracking-tighter leading-tight line-clamp-2 uppercase italic">{anime.title}</h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-3 italic">
                  "Based on your recent journey through {anime.genres?.[0]?.name || 'adventure'} titles, this masterpiece matches your preference for deep world-building and character growth."
                </p>
                <Link to={`/anime/${anime.mal_id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-purple-400 transition-colors">
                  Check Resonance <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-3 py-12 text-center text-zinc-500 font-bold uppercase tracking-widest italic bg-white/5 rounded-[3rem]">
            Your taste profile is evolving. Watch more to unlock resonance.
          </div>
        )}
      </div>
    </section>
  );
};

export const LegacyFooter: React.FC = () => {
  const [quoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));

  return (
    <footer className="bg-[#050505] pt-32 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
          {/* Mission Block */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">N</div>
               <span className="font-outfit font-black text-2xl tracking-tighter">NAKAMA</span>
            </div>
            <p className="text-zinc-500 text-lg leading-relaxed font-medium">
              We are not just a database. We are a digital sanctuary for those who live through stories. Nakama was built to unify the global anime community through friendship, technology, and legacy.
            </p>
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                <MessageCircle size={14} /> Contact Dev Team
              </button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Governance</h4>
              <ul className="space-y-4">
                <li><Link to="/policy/eligibility" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><Shield size={12} className="group-hover:text-[var(--accent-primary)]" /> Eligibility</Link></li>
                <li><Link to="/policy/privacy" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><FileText size={12} className="group-hover:text-[var(--accent-primary)]" /> Privacy Policy</Link></li>
                <li><Link to="/policy/system" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><Settings size={12} className="group-hover:text-[var(--accent-primary)]" /> System Status</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/explore" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><Compass size={12} /> Explore</Link></li>
                <li><Link to="/communities" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><Users size={12} /> Communities</Link></li>
                <li><Link to="/messages" className="text-zinc-500 hover:text-white text-sm font-bold transition-all flex items-center gap-2 group"><MessageSquare size={12} /> Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Quote Block */}
          <div className="lg:col-span-3">
             <div className="p-10 bg-zinc-900/30 border border-white/5 rounded-[3rem] relative overflow-hidden group">
                <Quote size={40} className="absolute -top-4 -left-4 text-white/5 -rotate-12 transition-transform group-hover:scale-125" />
                <p className="text-zinc-400 text-sm italic leading-relaxed mb-6 relative z-10">
                  "{QUOTES[quoteIdx].text}"
                </p>
                <cite className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] not-italic relative z-10">— {QUOTES[quoteIdx].author}</cite>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            © 2026 NAKAMA PROJECT • BUILT BY THE COMMUNITY FOR THE UNIVERSE
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white cursor-pointer transition-colors">Discord</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white cursor-pointer transition-colors">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
