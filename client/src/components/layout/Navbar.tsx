import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  PenTool,
  Bookmark,
  Compass,
  Users,
  Newspaper,
  Layout,
  Sword,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '../social/SearchBar';
import NotificationsDropdown from '../social/NotificationsDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Feed', path: '/feed', icon: Layout },
    { label: 'Communities', path: '/communities', icon: Users },
    { label: 'Chronicles', path: '/chronicles', icon: PenTool },
    { label: 'AniJudge', path: '/anijudge', icon: Sword },
    { label: 'News', path: '/home', icon: Newspaper },
  ];

  if (location.pathname.startsWith('/anime/')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20 items-center gap-8">
          <div className="flex items-center flex-shrink-0">
            <Link to="/home" className="flex items-center group">
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-widest italic uppercase group-hover:text-[var(--accent-primary)] transition-colors font-jp">
                仲間
              </span>
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl">
            <SearchBar />
          </div>
          
          {/* Main Navigation - Right */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                to={link.path} 
                className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all rounded-lg hover:bg-[var(--accent-primary)]/5 border border-transparent hover:border-[var(--border-color)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Messages */}
            <Link 
                to="/messages"
                className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative p-2.5 rounded-xl hover:bg-[var(--accent-primary)]/5 border border-transparent hover:border-[var(--border-color)] ${location.pathname.startsWith('/messages') ? 'text-[var(--text-primary)] bg-[var(--accent-primary)]/10' : ''}`}
            >
                <MessageSquare size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-[var(--bg-primary)]" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative p-2.5 rounded-xl hover:bg-[var(--accent-primary)]/5 border border-transparent hover:border-[var(--border-color)] ${isNotificationsOpen ? 'text-[var(--text-primary)] bg-[var(--accent-primary)]/10' : ''}`}
              >
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-primary)]" />
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <NotificationsDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1 pl-1 pr-3 rounded-full border transition-all ${isProfileOpen ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-[var(--border-color)] bg-white/5 hover:border-white/20'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-color)] shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest hidden sm:block">
                  {user?.username}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsProfileOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-60 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2 rounded-2xl backdrop-blur-3xl"
                    >
                      <div className="px-5 py-4 border-b border-[var(--border-color)] mb-2">
                        <p className="text-[9px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] mb-1">User Base</p>
                        <p className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tighter truncate leading-none">
                          {user?.username}
                        </p>
                      </div>
                      
                      <Link 
                        to={`/profile/${user?.username}`} 
                        className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserIcon size={14} className="text-[var(--accent-primary)]" /> See Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings size={14} className="text-[var(--text-secondary)]" /> Settings
                      </Link>
                      <Link 
                        to="/mylist" 
                        className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Bookmark size={14} className="text-[var(--text-secondary)]" /> MyList
                      </Link>
                      <Link 
                        to="/chronicles/write" 
                        className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)]/5 transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <PenTool size={14} className="text-[var(--text-secondary)]" /> Write
                      </Link>
                      
                      <div className="h-[1px] bg-white/5 my-2 mx-5" />
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                      >
                        <LogOut size={14} /> Disconnect
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Icon */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[var(--text-primary)] p-2 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--border-color)]"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)] overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  to={link.path} 
                  className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-[var(--text-primary)] py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon size={18} className="text-[var(--accent-primary)]" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-[var(--border-color)]">
                <Link to={`/profile/${user?.username}`} className="block text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] py-3">My Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 py-3"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
