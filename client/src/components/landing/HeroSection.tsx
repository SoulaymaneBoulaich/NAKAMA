import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    // Fetch via stabilized public endpoint
    const fetchPosters = async () => {
      try {
        const response = await api.get('/public/hero');
        const urls = response.data
          ?.map((anime: any) => anime.images.jpg.large_image_url)
          .filter(Boolean) || [];
        setPosters(urls);
      } catch (error) {
        console.error('Error fetching hero posters:', error);
      }
    };
    fetchPosters();
  }, []);

  const headingWords = ["Your", "anime", "world,", "all", "in", "one", "place."];

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-[var(--bg-primary)]">
      {/* Animated Poster Grid Background */}
      {posters.length > 0 && (
        <div className="absolute inset-0 flex w-[120%] -left-[10%] opacity-40">
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col gap-2 animate-[slide-up_30s_linear_infinite]">
              {[...posters, ...posters].map((url, i) => (
                <SafeImage key={i} src={url} alt="Poster" className="w-full aspect-[2/3] rounded-md opacity-70" />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden mt-[-10%]">
            <div className="flex flex-col gap-2 animate-[slide-down_24s_linear_infinite]">
              {[...posters, ...posters].reverse().map((url, i) => (
                <SafeImage key={i} src={url} alt="Poster" className="w-full aspect-[2/3] rounded-md opacity-70" />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col gap-2 animate-[slide-up_36s_linear_infinite]">
              {[...posters, ...posters].map((url, i) => (
                <SafeImage key={i} src={url} alt="Poster" className="w-full aspect-[2/3] rounded-md opacity-70" />
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden mt-[-5%] hidden sm:block">
            <div className="flex flex-col gap-2 animate-[slide-down_20s_linear_infinite]">
              {[...posters, ...posters].reverse().map((url, i) => (
                <SafeImage key={i} src={url} alt="Poster" className="w-full aspect-[2/3] rounded-md opacity-70" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 z-10" 
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,12,0.8) 0%, rgba(10,10,12,0.6) 30%, rgba(10,10,12,0.7) 70%, rgba(10,10,12,1) 100%)'
        }}
      />

      {/* Content center */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-8 mt-10">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-jetbrains text-[0.65rem] tracking-[0.4em] text-[var(--accent-primary)] uppercase mb-4"
        >
          The Anime Super-Platform
        </motion.span>

        <h1 className="font-outfit font-extrabold text-[clamp(2.5rem,7vw,6.5rem)] leading-[1] text-[#f4f4f5] max-w-4xl mx-auto flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6">
          {headingWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + (i * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-dm-sans text-[1.1rem] text-[#71717a] tracking-[0.05em] mb-10"
        >
          Track. Rate. Debate. Create. Connect.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={() => navigate('/signup')}
            className="font-dm-sans font-semibold text-[0.95rem] text-white px-[2rem] py-[0.85rem] rounded-full bg-[var(--accent-primary)] hover:brightness-110 transition-all shadow-[0_4px_24px_rgba(220,38,38,0.4)]"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="font-dm-sans font-semibold text-[0.95rem] text-[#f4f4f5] px-[2rem] py-[0.85rem] rounded-full border border-[#1e1e24] bg-white/5 hover:bg-white/10 transition-colors"
          >
            Log In
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-jetbrains text-[0.55rem] tracking-[0.3em] text-[#3f3f46]">SCROLL TO EXPLORE</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-[#71717a]" />
        </motion.div>
      </motion.div>
    </div>
  );
};
