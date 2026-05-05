import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Compass, Users, MessageSquare,
  PlaySquare, Settings, LogOut,
  ChevronRight, TrendingUp, LayoutGrid,
  Newspaper, Plus, Rss, ListMusic
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UnifiedCreationModal } from '../social/UnifiedCreationModal';

// ─── Orbit menu items (Feed, Communities, Playlists) ──────────────────────────
const ORBIT_ITEMS = [
  {
    icon: LayoutGrid,
    label: 'Feed',
    path: '/feed',
    color: '#ef4444',           // red
    glyph: 'フィード',
  },
  {
    icon: Users,
    label: 'Communities',
    path: '/communities',
    color: '#3b82f6',           // blue
    glyph: 'コミュ',
  },
  {
    icon: ListMusic,
    label: 'Playlists',
    path: '/playlists',
    color: '#10b981',           // green
    glyph: 'リスト',
  },
] as const;

// ─── Orbit trigger + radial menu ─────────────────────────────────────────────
const OrbitMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const isOrbitActive = ORBIT_ITEMS.some(i => location.pathname.startsWith(i.path));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Item positions: spread upward in an arc (above the trigger)
  const positions = [
    { x: -48, y: -68 },   // Feed — upper-left
    { x: 18,  y: -84 },   // Communities — up-centre
    { x: 62,  y: -52 },   // Playlists — upper-right
  ];

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      {/* Orbit buttons */}
      <AnimatePresence>
        {open && ORBIT_ITEMS.map((item, i) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, x: positions[i].x, y: positions[i].y, scale: 1 }}
              exit={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, delay: i * 0.04 }}
              onClick={() => navigate(item.path)}
              title={item.label}
              className="absolute z-[200] flex flex-col items-center justify-center w-12 h-12 rounded-full border transition-all"
              style={{
                background: isActive ? item.color : '#111114',
                borderColor: isActive ? item.color : '#2a2a2e',
                boxShadow: isActive ? `0 0 18px ${item.color}55` : '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              <item.icon
                size={16}
                style={{ color: isActive ? '#fff' : item.color }}
              />
              <span
                className="text-[8px] font-black uppercase tracking-tight mt-0.5 leading-none"
                style={{ color: isActive ? '#fff' : '#555' }}
              >
                {item.label.substring(0, 4)}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* Main trigger circle */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.9 }}
        className="relative z-[201] flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
        style={{
          background: open
            ? 'linear-gradient(135deg, #ef444420, #3b82f620, #10b98120)'
            : isOrbitActive
            ? '#1a1a1c'
            : 'transparent',
          border: `1px solid ${open ? '#ffffff20' : isOrbitActive ? '#ef444440' : '#2a2a2e'}`,
          boxShadow: open ? '0 0 24px rgba(239,68,68,0.15)' : 'none',
        }}
      >
        {/* Three micro dots (representing the 3 pages) */}
        <div className="flex flex-col items-center gap-[3px]">
          {ORBIT_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              animate={{
                width: open ? 10 : 5,
                opacity: open ? 1 : isOrbitActive ? 0.7 : 0.3,
              }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="h-[3px] rounded-full"
              style={{ background: item.color }}
            />
          ))}
        </div>

        {/* Pulse ring when a child route is active */}
        {isOrbitActive && !open && (
          <motion.div
            className="absolute inset-0 rounded-full border border-red-500/20"
            animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};

// ─── Main nav items (excluding orbit items which are handled above) ────────────
const navItems = [
  { icon: Home,         label: 'Home',        path: '/home' },
  { icon: Newspaper,    label: 'News',         path: '/news' },
  { icon: TrendingUp,   label: 'AniJudge',     path: '/anijudge' },
  { icon: PlaySquare,   label: 'Watch Party',  path: '/watchparty' },
  { icon: MessageSquare, label: 'Messages',    path: '/messages' },
  { icon: Settings,     label: 'Settings',     path: '/settings' },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Edge trigger strip */}
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
            x: isHovered ? 0 : -20,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 40,
            width: { delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          className="h-[96vh] ml-3 rounded-[2.5rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col py-8"
        >
          {/* Logo */}
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

          <nav className="flex-1 w-full space-y-2 px-4 overflow-hidden">

            {/* Create button */}
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

            {/* Orbit menu row (Feed / Communities / Playlists) */}
            <div className="flex items-center h-12 w-full rounded-2xl relative group/item px-1">
              {/* Always-visible orbit trigger */}
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <OrbitMenu />
              </div>
              {/* Expanded label */}
              <motion.div
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                transition={{ delay: 0.42 }}
                className="ml-4 flex items-center gap-2 whitespace-nowrap overflow-hidden"
              >
                <span className="font-dm-sans font-bold text-sm text-zinc-500 tracking-wide">
                  Feed · Communities · Playlists
                </span>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-white/5 mx-2" />

            {/* Regular nav items */}
            {navItems.map(item => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center h-12 w-full rounded-2xl transition-all duration-300 relative group/item
                    ${isActive ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
                >
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

          {/* Footer */}
          <div className="w-full px-4 pt-6 border-t border-white/5 space-y-2 overflow-hidden">
            <button
              onClick={logout}
              className="flex items-center h-12 w-full rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-300"
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

      <UnifiedCreationModal isOpen={isCreationModalOpen} onClose={() => setIsCreationModalOpen(false)} />
    </>
  );
};

};
