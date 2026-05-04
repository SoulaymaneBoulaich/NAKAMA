import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Ghost, Sparkles, Hash } from 'lucide-react';
import { SafeImage } from '../common/SafeImage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TasteAlignmentProps {
  ownerId: string;
}

const TasteAlignment: React.FC<TasteAlignmentProps> = ({ ownerId }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`${API_BASE}/recommendations/match-taste/${ownerId}`, {
          withCredentials: true
        });
        setMatches(response.data);
      } catch (err) {
        console.error('[TasteAlignment] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) fetchMatches();
  }, [ownerId]);

  if (loading) {
    return (
      <div className="bg-[#121212] border border-[var(--border-color)] rounded-2xl p-6 h-full flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Calculating Taste Alignment</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-[#121212] border border-[var(--border-color)] rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <Ghost size={32} className="text-gray-800 mb-4" />
        <h3 className="text-xs font-black uppercase italic tracking-tighter text-white mb-2">Taste Void Detected</h3>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">No overlapping loves found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-[var(--border-color)] rounded-2xl p-6 h-full relative overflow-hidden group">
      {/* Decorative background */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[var(--accent-primary)]/10 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
            <Sparkles size={18} className="text-[var(--accent-primary)]" />
          </div>
          <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Neural Match Alignment</h3>
        </div>
        <span className="text-[9px] font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
          ML Analysis
        </span>
      </div>

      <div className="space-y-4">
        {matches.map((match, i) => (
          <motion.div 
            key={match.animeId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 bg-black/40 border border-gray-800/40 p-3 rounded-2xl group/item hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer"
          >
            <div className="w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
              <SafeImage src={match.cover} alt={match.title} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black text-white uppercase tracking-tight truncate group-hover/item:text-[var(--accent-primary)] transition-colors">
                {match.title}
              </h4>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {match.matchedTags?.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="text-[8px] font-bold text-gray-500 flex items-center gap-0.5 border border-gray-800 px-1.5 py-0.5 rounded uppercase">
                    <Hash size={7} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-black italic text-[var(--accent-primary)] tabular-nums">
                {Math.min(99, Math.round(match.score * 5))}%
              </div>
              <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Match</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
          Based on your shared affinity for <br/> 
          <span className="text-white">{matches[0]?.matchedTags?.join(' • ')}</span>
        </p>
      </div>
    </div>
  );
};

export default TasteAlignment;
