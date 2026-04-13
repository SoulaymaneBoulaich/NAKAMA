import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TopTenCarousel } from '../components/landing/TopTenCarousel';
import { SpotlightSection } from '../components/landing/SpotlightSection';
import { NewsGrid } from '../components/landing/NewsGrid';
import { ValueHighlights } from '../components/landing/ValueHighlights';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-primary)] text-[#f4f4f5] selection:bg-[var(--accent-primary)] selection:text-white flex flex-col overflow-x-hidden">
      <LandingNavbar />
      
      <main className="flex-1 w-full">
        <HeroSection />
        <TopTenCarousel />
        <SpotlightSection />
        <NewsGrid />
        <ValueHighlights />
      </main>

      {/* Basic Footer */}
      <footer className="w-full bg-[var(--bg-primary)] border-t border-[#1e1e24] py-10 px-8 flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <span className="font-jp font-black text-[1.4rem] tracking-widest text-[#71717a] uppercase italic">仲間</span>
        </div>
        <p className="font-jetbrains text-[0.65rem] text-[#3f3f46] tracking-widest uppercase">
          © {new Date().getFullYear()} NAKAMA PLATFORM. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};
