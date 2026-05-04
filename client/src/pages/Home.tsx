import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Cinematic Components
import { HomeHeroSection } from '../components/landing/HomeHeroSection';
import { StudiosSection } from '../components/home/StudiosSection';
import { TopTenCarousel } from '../components/home/TopTenCarousel';
import { NewsSection } from '../components/home/NewsSection';
import { RecommendationsSection, LegacyFooter } from '../components/home/LegacyFooter';
import { Spinner } from '../components/common/Spinner';

type HomeTab = 'explore' | 'feed';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HomeTab>((searchParams.get('tab') as HomeTab) || 'explore');

  useEffect(() => {
    const tab = searchParams.get('tab') as HomeTab;
    if (tab === 'feed') {
      navigate('/feed', { replace: true });
      return;
    }
    if (tab) setActiveTab(tab);
    else setActiveTab('explore');
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[var(--accent-primary)] selection:text-white">
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'explore' ? (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              {/* Block 1: The Soul of Nakama (Animation) */}
              <HomeHeroSection />

              {/* Block 2: Famous Studios & Productions */}
              <StudiosSection />

              {/* Block 3: Dynamic Weekly Top 10 */}
              <TopTenCarousel />

              {/* Block 4: Nakama Intel (News Hub) */}
              <NewsSection />

              {/* Block 5: AI Resonance & Legacy Footer */}
              <RecommendationsSection />
              <LegacyFooter />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-20 min-h-[60vh]">
              <Spinner size="lg" />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
