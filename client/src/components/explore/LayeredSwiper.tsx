import React, { useState } from 'react';
import { Star, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayeredSwiperProps {
  data: any[];
}

const LayeredSwiper: React.FC<LayeredSwiperProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const currentItem = data[currentIndex];
  if (!currentItem) return null;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000 my-10 select-none">
      {/* Cards stack */}
      <div className="relative w-[320px] h-[450px]">
        {data.map((item, idx) => {
          const isCurrent = idx === currentIndex;
          const isNext = idx === (currentIndex + 1) % data.length;
          const isPrev = idx === (currentIndex - 1 + data.length) % data.length;

          if (!isCurrent && !isNext && !isPrev) return null;

          let zIndex = 0;
          let scale = 0.8;
          let opacity = 0;
          let x = 0;
          let rotate = 0;

          if (isCurrent) {
            zIndex = 30;
            scale = 1;
            opacity = 1;
          } else if (isNext) {
            zIndex = 20;
            scale = 0.9;
            opacity = 0.6;
            x = 100;
            rotate = 5;
          } else if (isPrev) {
            zIndex = 10;
            scale = 0.9;
            opacity = 0.6;
            x = -100;
            rotate = -5;
          }

          return (
            <div
              key={item.mal_id || idx}
              style={{
                zIndex,
                transform: `translateX(${x}px) scale(${scale}) rotate(${rotate}deg)`,
                opacity,
              }}
              className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-[var(--border-color)] shadow-2xl transition-all duration-700 ease-out cursor-pointer group"
              onClick={() => isCurrent && navigate(`/anime/${item.mal_id}`)}
            >
              <img 
                src={item.images?.jpg?.large_image_url} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={item.title} 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-primary)] rounded text-[9px] font-black uppercase text-white shadow-lg">
                    <Star size={10} fill="currentColor" />
                    {item.score || 'N/A'}
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.type}</span>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manifest Reality</span>
                  <div className="p-2 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-[-60px] flex items-center gap-6">
        <button 
          onClick={handlePrev}
          className="p-4 rounded-full bg-white/5 border border-[var(--border-color)] text-white hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all hover:scale-110 active:scale-95 group shadow-xl"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-[var(--border-color)] text-[10px] font-black text-white uppercase tracking-widest">
          <span className="text-[var(--accent-primary)]">{currentIndex + 1}</span>
          <span className="opacity-20">/</span>
          <span className="opacity-40">{data.length}</span>
        </div>

        <button 
          onClick={handleNext}
          className="p-4 rounded-full bg-white/5 border border-[var(--border-color)] text-white hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all hover:scale-110 active:scale-95 group shadow-xl"
        >
          <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <button 
        onClick={() => setCurrentIndex(0)}
        className="absolute top-0 right-10 p-2 text-zinc-700 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

const ChevronLeft: React.FC<{ size: number, className: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight: React.FC<{ size: number, className: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default LayeredSwiper;
