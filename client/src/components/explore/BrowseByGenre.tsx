import { useState, useEffect } from 'react';
import { getGenres, getAnimeByGenre } from '../../api/jikan';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Tv, Flame, Globe, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BrowseByGenre: React.FC = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [anime, setAnime] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      const g = await getGenres();
      setGenres(g.slice(0, 10)); // Top 10 genres for the strip
      if (g.length > 0) setSelectedGenre(g[0]);
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      const fetchAnime = async () => {
        setIsLoading(true);
        const results = await getAnimeByGenre(selectedGenre.mal_id);
        setAnime(results.data.slice(0, 6));
        setIsLoading(false);
      };
      fetchAnime();
    }
  }, [selectedGenre]);

  const genreIcons: any = {
    'Action': Flame,
    'Adventure': Globe,
    'Comedy': Sparkles,
    'Drama': Tv,
    'Fantasy': Sparkles,
  };

  return (
    <div className="py-12 px-6">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[var(--accent-primary)]/10 rounded-xl">
            <Sparkles size={18} className="text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Genre Resonance</h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Filter the collective stream</p>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide max-w-xl">
          {genres.map((g) => {
            const Icon = genreIcons[g.name] || Globe;
            const isActive = selectedGenre?.mal_id === g.mal_id;
            return (
              <button
                key={g.mal_id}
                onClick={() => setSelectedGenre(g)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/20' 
                    : 'bg-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                <Icon size={12} />
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-3xl animate-pulse" />
            ))
          ) : (
            anime.map((a, idx) => (
              <motion.div
                key={a.mal_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/anime/${a.mal_id}`)}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 border border-[var(--border-color)] group-hover:border-[var(--accent-primary)]/40 transition-all">
                  <img src={a.images.jpg.large_image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-[var(--accent-primary)] uppercase">
                    <Star size={10} fill="currentColor" />
                    {a.score}
                  </div>
                </div>
                <h3 className="text-[10px] font-black text-white uppercase truncate px-1 tracking-wider italic">{a.title}</h3>
                <div className="flex items-center justify-between px-1 mt-1">
                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{a.type}</span>
                  <ArrowRight size={10} className="text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrowseByGenre;
