import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Users, Bookmark, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

const HomeSidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: Bookmark, label: 'My List', path: '/mylist' },
    { icon: User, label: 'Profile', path: `/profile/${user?.username}` },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="sticky top-24 space-y-8">
      {/* User Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar 
              src={user?.avatar} 
              username={user?.username || ''} 
              size="lg"
              className="w-20 h-20 rounded-full border-2 border-[var(--accent-primary)] p-0.5"
            />
            {user?.isPremium && (
              <div className="absolute -bottom-1 -right-1 bg-[var(--accent-primary)] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[var(--bg-primary)] uppercase tracking-widest text-white">
                Pro
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg text-[var(--text-primary)]">{user?.username}</h3>
          <p className="text-[var(--text-secondary)] text-xs mb-4">Member since {new Date(user?.joinDate || Date.now()).getFullYear()}</p>
          
          <div className="flex w-full gap-4 border-t border-[var(--border-color)] pt-4">
            <div className="flex-1">
              <span className="block font-bold text-[var(--text-primary)] text-sm">0</span>
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-tighter">Followers</span>
            </div>
            <div className="border-r border-[var(--border-color)]" />
            <div className="flex-1">
              <span className="block font-bold text-[var(--text-primary)] text-sm">0</span>
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-tighter">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.1)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent'}
            `}
          >
            <item.icon size={20} className="transition-colors group-hover:text-[var(--accent-primary)]" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Links */}
      <div className="px-4 text-[10px] text-[var(--text-secondary)]/50 flex flex-wrap gap-x-3 gap-y-1 uppercase tracking-widest font-medium">
        <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
        <a href="#" className="hover:text-[var(--text-primary)] transition-colors">About</a>
        <span>© 2026 NAKAMA</span>
      </div>
    </div>
  );
};

export default HomeSidebar;
