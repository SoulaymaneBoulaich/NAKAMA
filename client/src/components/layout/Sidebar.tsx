import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Compass, 
  Film, 
  Users, 
  MessageSquare, 
  PlaySquare, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Newspaper,
  Plus
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UnifiedCreationModal } from '../social/UnifiedCreationModal';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: LayoutGrid, label: 'Feed', path: '/feed' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: TrendingUp, label: 'AniJudge', path: '/anijudge' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: PlaySquare, label: 'Watch Party', path: '/watchparty' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Invisible Global Trigger - Always on the edge */}
      <div 
        className="fixed left-0 top-0 w-2 h-full z-[101] bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
      />

      <div 
        className={`fixed left-0 top-0 h-full z-[100] flex items-center transition-all duration-300
          ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.aside
          initial={false}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            width: isHovered ? 280 : 80,
            x: isHovered ? 0 : -20 // Tiny subtle nudge instead of a long slide
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 40,
            width: { 
              delay: 0.3,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }
          }}
          className="h-[96vh] ml-3 rounded-[2.5rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col py-8"
        >
        {/* Logo Section - Locked Position */}
        <div className="px-7 mb-12 flex items-center h-10 w-full flex-shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-black text-xl flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">N</div>
          <motion.span 
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
            transition={{ delay: 0.4 }}
            className="ml-4 font-outfit font-black text-2xl tracking-tighter text-white whitespace-nowrap overflow-hidden"
          >
            NAKAMA
          </motion.span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 w-full space-y-2 px-4 overflow-hidden">
          {/* Create Button - The Plus Icon */}
          <button 
            onClick={() => setIsCreationModalOpen(true)}
            className="flex items-center h-12 w-full rounded-2xl transition-all duration-300 relative group/item bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 mb-6"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1">
              <Plus size={24} strokeWidth={3} />
            </div>
            <motion.span 
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              transition={{ delay: 0.4 }}
              className="ml-4 font-dm-sans font-black text-sm tracking-widest whitespace-nowrap overflow-hidden uppercase"
            >
              Create
            </motion.span>
          </button>

          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center h-12 w-full rounded-2xl transition-all duration-300 relative group/item
                  ${isActive ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}
                `}
              >
                {/* Icon is always in the same spot */}
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1">
                  <item.icon size={22} />
                </div>
                
                <motion.span 
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                  transition={{ delay: 0.4 }}
                  className="ml-4 font-dm-sans font-bold text-sm tracking-wide whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>

                {isActive && !isHovered && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-[-4px] w-1.5 h-6 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="w-full px-4 pt-6 border-t border-white/5 space-y-2 overflow-hidden">
          <button 
            onClick={logout}
            className={`flex items-center h-12 w-full rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300
            `}
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1">
              <LogOut size={22} />
            </div>
            <motion.span 
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              transition={{ delay: 0.4 }}
              className="ml-4 font-dm-sans font-bold text-sm tracking-wide whitespace-nowrap overflow-hidden"
            >
              Logout
            </motion.span>
          </button>
        </div>

        {/* Expansion Tip */}
        {!isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0], x: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20"
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
      </motion.aside>
    </div>

    <UnifiedCreationModal 
      isOpen={isCreationModalOpen} 
      onClose={() => setIsCreationModalOpen(false)} 
    />
    </>
  );
};
