import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  // Cleaned up unused animation logic for the minimalist logo
  const handleLogoClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const handleNavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('signup');
    }
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    if (user) {
      navigate('/home');
    } else {
      openAuthModal(action);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full h-16 bg-[var(--bg-primary)]/90 backdrop-blur-[20px] border-b border-[#1e1e24] z-40 px-4 md:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center cursor-pointer group" onClick={handleLogoClick}>
          <span className="text-2xl font-black text-white tracking-widest italic uppercase group-hover:text-[var(--accent-primary)] transition-colors font-jp">
            仲間
          </span>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Discover', 'News', 'Communities'].map((link) => (
            <a 
              key={link} 
              href="#" 
              onClick={handleNavClick}
              className="font-dm-sans font-medium text-[0.9rem] text-[#71717a] hover:text-[#f4f4f5] transition-colors duration-150"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button 
                onClick={() => handleAuthAction('login')}
                className="font-dm-sans font-semibold text-[0.85rem] text-[#f4f4f5] px-[1.2rem] py-[0.4rem] rounded-full border border-[#1e1e24] hover:bg-white/5 transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => handleAuthAction('signup')}
                className="font-dm-sans font-semibold text-[0.85rem] text-white px-[1.4rem] py-[0.4rem] rounded-full bg-[var(--accent-primary)] hover:brightness-110 transition-all shadow-[0_4px_14px_rgba(220,38,38,0.39)]"
              >
                Get Started
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/home')}
              className="font-dm-sans font-semibold text-[0.85rem] text-white px-[1.4rem] py-[0.4rem] rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-md"
            >
              Enter App
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
