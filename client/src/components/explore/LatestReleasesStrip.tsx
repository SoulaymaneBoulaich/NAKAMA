import React, { useState, useEffect } from 'react';
import { getSeasonalAnime } from '../../api/jikan';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

const LatestReleasesStrip: React.FC = () => {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeasonal = async () => {
      try {
        const data = await getSeasonalAnime(15);
        setAnime(data);
      } catch (err) {
        console.error('Failed to fetch seasonal anime', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasonal();
  }, []);

  if (loading) return <div className="h-[300px] w-full bg-[var(--bg-secondary)114] animate-pulse rounded-3xl" />;

  return (
    <div className="bg-[#080809] py-12 overflow-hidden border-y border-[#1e1e24]/30">
      <div className="px-6 md:px-10 flex justify-between items-end mb-8">
        <div>
          <h2 className="font-syne font-[700] text-2xl text-white italic uppercase tracking-tighter">
            Latest This Season
          </h2>
        </div>
        <Link 
          to="/explore" 
          className="text-[#7c3aed] text-[0.8rem] font-bold uppercase tracking-widest hover:underline"
        >
          See All
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 md:px-10 scroll-smooth pb-4 touch-pan-x">
        {anime.map((item) => (
          <div 
            key={item.mal_id}
            onClick={() => navigate(`/anime/${item.mal_id}`)}
            className="w-[160px] flex-shrink-0 group cursor-pointer"
          >
            <div className="h-[230px] rounded-xl overflow-hidden border border-[#232329] bg-[var(--bg-secondary)114] relative shadow-2xl">
              <img src={item.images.webp.large_image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                <h4 className="font-dm-sans font-[600] text-[0.85rem] text-white line-clamp-2 uppercase italic mb-2 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.title}
                </h4>
                <button className="w-full py-1.5 bg-white text-[var(--bg-primary)] text-[0.7rem] font-black uppercase tracking-widest rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                 Details
                </button>
              </div>

              <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#7c3aed]">
                <Bookmark size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestReleasesStrip;
