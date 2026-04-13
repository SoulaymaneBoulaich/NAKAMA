import React, { useState, useEffect } from 'react';
import { getGenres, getAnimeByGenre } from '../../api/jikan';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LayeredSwiper from './LayeredSwiper';

const GENRE_COLORS: Record<string, string> = {
  'Action': '#ef4444',
  'Adventure': '#f97316',
  'Comedy': '#eab308',
  'Romance': '#ec4899',
  'Fantasy': '#8b5cf6',
  'Sci-Fi': '#06b6d4',
  'Horror': 'var(--accent-primary)',
  'Mystery': '#a855f7',
  'Sports': '#22c55e',
  'Slice of Life': '#84cc16',
  'Mecha': '#3b82f6',
  'Psychological': '#7c3aed',
  'Drama': '#f59e0b',
  'Thriller': '#ef4444',
  'Supernatural': '#8b5cf6',
  'Historical': '#d97706',
  'Music': '#ec4899',
  'School': '#10b981'
};

const BrowseByGenreFull: React.FC = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<any | null>(null);
  const [genreAnime, setGenreAnime] = useState<any[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingAnime, setLoadingAnime] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        // Keep only genres that we have colors for or the first 18
        setGenres(data.slice(0, 18));
      } catch (err) {
        console.error('Failed to fetch genres', err);
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  const handleGenreClick = async (genre: any) => {
    if (selectedGenre?.mal_id === genre.mal_id) {
      setSelectedGenre(null);
      return;
    }
    setSelectedGenre(genre);
    setLoadingAnime(true);
    try {
      const data = await getAnimeByGenre(genre.mal_id, 10);
      setGenreAnime(data.data);
    } catch (err) {
      console.error('Failed to fetch genre anime', err);
    } finally {
      setLoadingAnime(false);
    }
  };

  if (loadingGenres) return <div className="px-6 md:px-10 h-[200px] animate-pulse rounded-3xl bg-[var(--bg-secondary)114]" />;

  return (
    <div className="px-6 md:px-10">
      <h2 className="font-syne font-[800] text-3xl text-[#f4f4f5] italic uppercase tracking-tighter mb-8">
        Browse by Genre
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {genres.map((genre) => (
          <div
            key={genre.mal_id}
            onClick={() => handleGenreClick(genre)}
            className={`h-[100px] rounded-2xl bg-[var(--bg-secondary)114] border-y border-r border-[#232329] cursor-pointer flex flex-col items-center justify-center gap-1 transition-all hover:bg-[#18181d] hover:scale-105 group relative overflow-hidden ${
              selectedGenre?.mal_id === genre.mal_id ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/20' : ''
            }`}
            style={{ borderLeft: `4px solid ${GENRE_COLORS[genre.name] || '#7c3aed'}` }}
          >
            <span className="font-dm-sans font-[600] text-sm text-[#f4f4f5] group-hover:text-[#7c3aed] transition-colors uppercase italic tracking-tighter">
              {genre.name}
            </span>
            <span className="font-jetbrains text-[0.65rem] text-[#71717a] font-bold uppercase tracking-widest">
              {genre.count || '0'} ANIME
            </span>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: GENRE_COLORS[genre.name] || '#7c3aed' }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedGenre && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden mt-8"
          >
            <div className="bg-[var(--bg-secondary)114] border border-[#232329] rounded-[24px] p-8 relative">
              <button
                onClick={() => setSelectedGenre(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#18181d] border border-[#232329] flex items-center justify-center text-[#71717a] hover:text-[#f4f4f5] transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
               <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ background: GENRE_COLORS[selectedGenre.name] || '#7c3aed' }}
               >
                 <Star size={24} fill="white" />
               </div>
               <div>
                  <h3 className="font-syne font-[800] text-2xl text-white italic uppercase tracking-tighter">
                    {selectedGenre.name} Essentials
                  </h3>
                  <p className="text-[#71717a] text-sm font-medium">Top rated {selectedGenre.name.toLowerCase()} anime you shouldn't miss.</p>
               </div>
              </div>

              {loadingAnime ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-[#18181d] animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-12">
                   <LayeredSwiper data={genreAnime} />
                   
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-6 opacity-20 hover:opacity-100 transition-opacity">
                    {genreAnime.map((anime) => (
                      <div 
                        key={anime.mal_id}
                        onClick={() => navigate(`/anime/${anime.mal_id}`)}
                        className="group cursor-pointer flex flex-col gap-3"
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-[#232329] bg-[#18181d] relative">
                          <img src={anime.images.webp.large_image_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-[#f4f4f5] group-hover:text-[#7c3aed] transition-colors uppercase italic truncate tracking-tighter">
                            {anime.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button className="flex items-center gap-2 px-8 py-3 bg-[#18181d] border border-[#232329] rounded-full text-xs font-bold text-[#f4f4f5] uppercase tracking-[0.2em] hover:bg-[#7c3aed] hover:border-[#7c3aed] transition-all">
                  Load More {selectedGenre.name}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseByGenreFull;
