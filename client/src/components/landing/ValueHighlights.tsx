import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { JoinModal } from './JoinModal';
import { SafeImage } from '../common/SafeImage';

export const ValueHighlights: React.FC = () => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [judgeImage, setJudgeImage] = useState<string>('');

  useEffect(() => {
    // Fetch image for AniJudge section (using Bleach ID 269)
    fetch('https://api.jikan.moe/v4/anime/269/pictures')
      .then(res => res.json())
      .then(data => {
        if (data?.data && data.data.length > 0) {
          setJudgeImage(data.data[0].jpg.large_image_url || data.data[0].jpg.image_url);
        }
      })
      .catch(err => console.error('Error fetching judge image:', err));
  }, []);

  const openJoin = () => setIsJoinModalOpen(true);

  return (
    <>
      <div className="w-full bg-[var(--bg-primary)] overflow-hidden">
        
        {/* SECTION A — AniJudge */}
        <section className="relative w-full min-h-[70vh] flex items-center border-b border-[#1e1e24]">
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 pointer-events-none">
            <SafeImage 
              src={judgeImage} 
              alt="AniJudge Battle" 
              className="w-full h-full opacity-20"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <span className="font-jetbrains text-[0.65rem] tracking-[0.35em] text-[var(--accent-primary)] uppercase block mb-4">
                ANIJUDGE
              </span>
              <h2 className="font-outfit font-extrabold text-[clamp(2.2rem,4vw,3.5rem)] text-[#f4f4f5] leading-[1.1] mb-6">
                Every debate deserves an arena.
              </h2>
              <p className="font-dm-sans text-[1.05rem] text-[#71717a] leading-relaxed mb-8">
                3v3 turn-based debates. A neutral judge. A timer. A Hall of Fame that remembers every winner.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {['3 VS 3', 'TURN BASED', 'HALL OF FAME'].map(tag => (
                  <span key={tag} className="font-jetbrains text-[0.6rem] tracking-wider bg-[#18181d] border border-[#1e1e24] px-3 py-1.5 rounded-full text-[#f4f4f5] uppercase">
                    {tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={openJoin}
                className="group relative font-dm-sans font-bold text-[0.95rem] text-white px-[2.5rem] py-[1rem] rounded-full bg-[var(--accent-primary)] overflow-hidden transition-all hover:scale-105"
              >
                <div className="relative z-10">Join the Arena</div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION B — Track & Rate */}
        <section className="relative w-full min-h-[70vh] flex items-center bg-[#0d0d10] border-b border-[#1e1e24]">
          <div className="absolute left-0 top-0 bottom-0 w-full md:w-2/3 pointer-events-none">
            <div className="w-full h-full bg-[var(--bg-primary)] opacity-20 relative overflow-hidden flex items-center justify-center">
               <div className="relative w-full h-full max-w-lg aspect-square">
                  <div className="absolute top-[20%] left-[10%] w-[80%] h-[2px] bg-[var(--accent-primary)]/20" />
                  <div className="absolute top-[40%] left-[10%] w-[80%] h-[2px] bg-[var(--accent-primary)]/10" />
                  <div className="absolute top-[60%] left-[10%] w-[80%] h-[2px] bg-[var(--accent-primary)]/20" />
                  <div className="absolute top-[80%] left-[10%] w-[80%] h-[2px] bg-[var(--accent-primary)]/10" />
               </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-l from-[#0d0d10] via-[#0d0d10]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 flex justify-end">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="max-w-xl text-left md:text-right"
            >
              <span className="font-jetbrains text-[0.65rem] tracking-[0.35em] text-[var(--accent-primary)] uppercase block mb-4">
                ANIME TRACKING
              </span>
              <h2 className="font-outfit font-extrabold text-[clamp(2.2rem,4vw,3.5rem)] text-[#f4f4f5] leading-[1.1] mb-6">
                Your list. Your ratings. Your legacy.
              </h2>
              <p className="font-dm-sans text-[1.05rem] text-[#71717a] leading-relaxed mb-10 md:ml-auto md:max-w-[420px]">
                Rate anime across 6 criteria — Animation, Story, Characters, Build-Up, Feeling, and Ending. Your score carries weight here.
              </p>
              
              <button 
                onClick={openJoin}
                className="font-dm-sans font-bold text-[0.95rem] text-[#f4f4f5] px-[2.5rem] py-[1rem] rounded-full border border-[#1e1e24] bg-white/5 hover:bg-white/10 transition-all hover:scale-105"
              >
                Start Tracking
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION C — Chronicles */}
        <section className="relative w-full min-h-[70vh] flex items-center bg-[var(--bg-primary)]">
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 pointer-events-none">
            <div className="w-full h-full opacity-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <span className="font-jetbrains text-[0.65rem] tracking-[0.35em] text-[var(--accent-primary)] uppercase block mb-4">
                FAN CHRONICLES
              </span>
              <h2 className="font-outfit font-extrabold text-[clamp(2.2rem,4vw,3.5rem)] text-[#f4f4f5] leading-[1.1] mb-6">
                Forge the arcs that never happened.
              </h2>
              <p className="font-dm-sans text-[1.05rem] text-[#71717a] leading-relaxed mb-10">
                Solo or collaborative records. Chapters, resonance, and legacy. Your vision, the NAKAMA archives.
              </p>
              
              <button 
                onClick={openJoin}
                className="font-dm-sans font-bold text-[0.95rem] text-white px-[2.5rem] py-[1rem] rounded-full bg-[var(--accent-primary)] hover:brightness-110 shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
              >
                Start Writing
              </button>
            </motion.div>
          </div>
        </section>

      </div>
      
      <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </>
  );
};
