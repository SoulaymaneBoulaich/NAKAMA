import React, { useState, useEffect, useMemo } from 'react';
import { getTopAnime, getSeasonalAnime, getGenres, getRecommendations } from '../api/jikan';
import { ExploreHero } from '../components/explore/ExploreHero';
import { StudioMatrix } from '../components/explore/StudioMatrix';
import { GenreLattice } from '../components/explore/GenreLattice';
import { HorizonTrack } from '../components/explore/HorizonTrack';
import { Spinner } from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

// Helper to deduplicate anime lists by mal_id
const deduplicateAnime = (list: any[]) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter(item => {
    if (!item || item.mal_id === undefined || seen.has(item.mal_id)) return false;
    seen.add(item.mal_id);
    return true;
  });
};

const Explore: React.FC = () => {
  const { user } = useAuth();
  // Global Data State
  const [loading, setLoading] = useState(true);
  const [heroAnime, setHeroAnime] = useState<any[]>([]);
  const [seasonalAnime, setSeasonalAnime] = useState<any[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<any[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<any[]>([]);
  const [allAnimeForFiltering, setAllAnimeForFiltering] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  // Selection States
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Parallel fetching for performance
        const [top, seasonal, upcoming, genreList] = await Promise.all([
          getTopAnime('bypopularity', 10).catch(() => []),
          getSeasonalAnime(20).catch(() => []),
          getTopAnime('upcoming', 20).catch(() => []),
          getGenres().catch(() => [])
        ]);

        setHeroAnime(deduplicateAnime(top).slice(0, 5));
        setSeasonalAnime(deduplicateAnime(seasonal));
        setUpcomingAnime(deduplicateAnime(upcoming));
        setGenres(genreList.slice(0, 24)); 
        
        // Fetch recommendations if user is logged in
        if (user) {
          const recs = await getRecommendations().catch(() => []);
          setRecommendedAnime(deduplicateAnime(recs));
        }

        // Greedy fetch for filtering - we take top 50 popular to ensure "instant" feel
        let greedyData = await getTopAnime('bypopularity', 50).catch(() => []);
        
        // Robust fallback: if popular fails, try airing
        if (!greedyData || greedyData.length === 0) {
          greedyData = await getTopAnime('airing', 50).catch(() => []);
        }

        setAllAnimeForFiltering(deduplicateAnime(greedyData));
        
      } catch (error) {
        console.error('Error fetching explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  // Instant Filtering Logic with safety checks
  const filteredAnime = useMemo(() => {
    const list = allAnimeForFiltering || [];
    if (selectedGenres.length === 0) return list.slice(0, 15);
    
    return list.filter(anime => 
      selectedGenres.every(genreId => 
        anime?.genres?.some((g: any) => g.mal_id === genreId)
      )
    ).slice(0, 15);
  }, [allAnimeForFiltering, selectedGenres]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* 1. Hero Section: Hot This Week */}
      <ExploreHero anime={heroAnime} />

      <div className="max-w-[1600px] mx-auto space-y-32 pb-40">
        {/* 2. Personalized "For You" Section (Only if user has data) */}
        {user && recommendedAnime.length > 0 && (
          <HorizonTrack 
            title="Sourced For You" 
            subtitle="Calculated from your archives"
            anime={recommendedAnime} 
            type="recommended"
          />
        )}

        {/* 3. The Studio Matrix */}
        <StudioMatrix />

        {/* 4. Dynamic Genre Lattice */}
        <GenreLattice 
          genres={genres} 
          selectedGenres={selectedGenres} 
          onToggleGenre={toggleGenre}
          anime={filteredAnime}
        />

        {/* 5. The Horizon: Seasonal & Upcoming */}
        <div className="space-y-24">
          <HorizonTrack 
            title="Latest This Season" 
            subtitle="Current resonance peaks"
            anime={seasonalAnime} 
            type="seasonal"
          />
          <HorizonTrack 
            title="Upcoming Archives" 
            subtitle="Future manifestations"
            anime={upcomingAnime} 
            type="upcoming"
          />
        </div>
      </div>

      {/* Persistence Indicator */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-2xl border border-[var(--border-color)] px-6 py-3 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Archive Link Established</span>
        </div>
      </div>
    </div>
  );
};

export default Explore;

