import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UnifiedCreationModal } from '../social/UnifiedCreationModal';

interface OverlayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'HOME', path: '/home', bg: '/images/menu/home-bg.jpg' },
  { 
    label: 'NEWS', 
    path: '/news', 
    bg: null,
    carousel: [
      '/images/menu/news-1.jpg',
      '/images/menu/news-2.jpg',
      '/images/menu/news-3.jpg',
      '/images/menu/news-4.jpg'
    ] 
  },
  { label: 'FEED', path: '/feed', bg: '/images/menu/feed-bg.jpg' },
  { label: 'COMMUNITIES', path: '/communities', bg: '/images/menu/communities-bg.jpg' },
  { 
    label: 'PLAYLISTS', 
    path: '/playlists', 
    bg: null,
    carousel: [
      '/images/menu/playlist-1.jpg',
      '/images/menu/playlist-2.jpg',
      '/images/menu/playlist-3.jpg',
      '/images/menu/playlist-4.jpg',
      '/images/menu/playlist-5.jpg'
    ] 
  },
  { label: 'ANIJUDGE', path: '/anijudge', bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920' },
  { label: 'WATCH PARTY', path: '/watchparty', bg: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920' },
  { label: 'MESSAGES', path: '/messages', bg: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?q=80&w=1920' },
  { label: 'SETTINGS', path: '/settings', bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920' },
];

const DEFAULT_BG = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1920';

export const OverlayMenu: React.FC<OverlayMenuProps> = ({ isOpen, onClose }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }}
            animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            exit={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 overflow-hidden bg-black"
          >
            {/* Dynamic Background Images */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-black">
              {/* Default Background */}
              <img 
                src={DEFAULT_BG} 
                alt="Default Background" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hoveredIndex === null ? 'opacity-40' : 'opacity-0'}`} 
              />
              
              {/* Pre-render all background images for smooth transitions */}
              {NAV_ITEMS.map((item, index) => {
                if (item.carousel) {
                  return (
                    <div 
                      key={item.path}
                      className={`absolute inset-0 w-full h-full flex transition-all duration-700 ease-out overflow-hidden ${
                        hoveredIndex === index ? 'opacity-70 scale-105' : 'opacity-0 scale-100'
                      }`}
                    >
                      <motion.div
                        animate={{ x: hoveredIndex === index ? ['0%', '-50%'] : '0%' }}
                        transition={{ 
                          repeat: Infinity, 
                          ease: "linear", 
                          duration: 20 
                        }}
                        className="flex h-full w-max"
                      >
                        {/* Render twice for seamless looping */}
                        {[...item.carousel, ...item.carousel].map((src, i) => (
                          <img 
                            key={`${item.path}-${i}`}
                            src={src}
                            alt={`${item.label} carousel ${i}`}
                            className="shrink-0 w-[25vw] h-full object-cover"
                          />
                        ))}
                      </motion.div>
                    </div>
                  );
                }

                return (
                  <img
                    key={item.path}
                    src={item.bg as string}
                    alt={item.label}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                      hoveredIndex === index ? 'opacity-70 scale-105' : 'opacity-0 scale-100'
                    }`}
                  />
                );
              })}

              {/* Vignette overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/80 pointer-events-none" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center px-16 lg:px-32 py-20">
              
              <div className="flex justify-between h-full">
                {/* Left Side: Navigation Links */}
                <div className="flex flex-col justify-center h-full space-y-6">
                  {NAV_ITEMS.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: isOpen ? 0.1 + index * 0.05 : 0,
                        ease: "easeOut"
                      }}
                      className="w-fit"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black tracking-wide text-white/90 hover:text-white transition-colors text-left uppercase"
                      >
                        {item.label}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Right Side: Additional Actions & Socials */}
                <div className="flex flex-col justify-between items-end h-full pt-10">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex flex-col gap-6 text-right items-end"
                  >
                    <button
                      onClick={() => setIsCreationModalOpen(true)}
                      className="font-outfit text-2xl font-black uppercase tracking-widest text-[var(--accent-primary)] hover:text-red-400 transition-colors"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={handleLogout}
                      className="font-outfit text-xl font-bold uppercase tracking-wider text-white/50 hover:text-red-500 transition-colors mt-8"
                    >
                      Logout
                    </button>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="flex gap-6 font-dm-sans text-sm font-bold tracking-widest uppercase text-white/70"
                  >
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">TikTok</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnifiedCreationModal 
        isOpen={isCreationModalOpen} 
        onClose={() => setIsCreationModalOpen(false)} 
      />
    </>
  );
};
