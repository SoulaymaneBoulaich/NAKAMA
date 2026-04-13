import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Cinematic Components from Landing
import { HomeHeroSection } from '../components/landing/HomeHeroSection';
import { TopTenCarousel } from '../components/landing/TopTenCarousel';
import { SpotlightSection } from '../components/landing/SpotlightSection';
import { NewsGrid } from '../components/landing/NewsGrid';
import { ValueHighlights } from '../components/landing/ValueHighlights';
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-white selection:bg-[var(--accent-primary)] selection:text-white pb-20">
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
              <HomeHeroSection />
              <TopTenCarousel />
              <SpotlightSection />
              <NewsGrid />
              <ValueHighlights />
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
