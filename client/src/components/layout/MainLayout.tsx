import React, { useState } from 'react';
import { OverlayMenu } from './OverlayMenu';
import { TopBar } from './TopBar';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-white selection:text-black">
      <OverlayMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <motion.div 
        animate={{ 
          scale: isMenuOpen ? 0.93 : 1,
          y: isMenuOpen ? "2%" : 0,
          rotateX: isMenuOpen ? 5 : 0,
          opacity: isMenuOpen ? 0.5 : 1,
          filter: isMenuOpen ? 'blur(4px)' : 'blur(0px)',
          transformPerspective: 1000
        }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="w-full min-h-screen relative bg-[var(--bg-primary)] origin-top overflow-x-hidden"
      >
        <TopBar isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
        <main className="relative z-10 pt-20">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};
