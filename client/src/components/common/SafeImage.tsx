import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  fallback?: React.ReactNode;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  objectFit = 'cover',
  fallback 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const containerClass = `relative overflow-hidden ${className}`;

  if (!src || hasError) {
    return (
      <div className={containerClass}>
        {fallback || (
          <div className="w-full h-full bg-[#18181d] flex items-center justify-center p-4">
             <div className="text-[#3f3f46] opacity-30 blur-[1px]">
               <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                 <circle cx="8.5" cy="8.5" r="1.5" />
                 <polyline points="21 15 16 10 5 21" />
               </svg>
             </div>
             <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e24]/10 to-transparent" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--bg-secondary)114] animate-pulse z-10"
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          scale: isLoaded ? 1 : 1.05 
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full h-full object-${objectFit} transition-transform duration-700`}
      />
    </div>
  );
};
