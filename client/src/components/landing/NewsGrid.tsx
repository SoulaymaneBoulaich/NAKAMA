import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';
import { useAuth } from '../../context/AuthContext';

export const NewsGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/public/news');
        setNews(response.data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleNewsClick = (item: any) => {
    if (!user) {
      openAuthModal('signup');
    } else {
      navigate('/news/article', { state: { item } });
    }
  };

  return (
    <section className="bg-[var(--bg-primary)] pt-20 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-outfit font-extrabold text-3xl md:text-[2rem] text-[#f4f4f5] mb-8">
          Anime News & Releases
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#1e1e24] bg-[var(--bg-secondary)114] h-[340px] animate-pulse" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item, idx) => (
                <article 
                  key={idx}
                  onClick={() => handleNewsClick(item)}
                  className="flex flex-col bg-[var(--bg-secondary)114] border border-[#1e1e24] rounded-2xl overflow-hidden cursor-pointer group hover:border-[var(--accent-primary)] hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Image Top */}
                  <SafeImage 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-[180px]"
                  />
                  
                  {/* Content Bottom */}
                  <div className="flex flex-col p-4 md:p-5 flex-1">
                    <div className="mb-2">
                      <span className="inline-block font-jetbrains text-[0.6rem] tracking-[0.15em] bg-[#18181d] text-[var(--accent-primary)] uppercase py-1.5 px-3 rounded-full group-hover:bg-[var(--accent-primary)]/10 transition-colors">
                        {item.category || 'News'}
                      </span>
                    </div>
                    <h3 className="font-dm-sans font-semibold text-[0.95rem] text-[#f4f4f5] line-clamp-2 mb-2 leading-snug group-hover:text-[var(--accent-primary)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-dm-sans text-[0.8rem] text-[#71717a] line-clamp-3 mb-4 flex-1">
                      {item.summary}
                    </p>
                    <div className="mt-auto pt-4 border-t border-[#1e1e24]">
                      <span className="font-jetbrains text-[0.65rem] text-[#3f3f46]">
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => navigate('/news')}
                className="font-dm-sans font-semibold text-[0.9rem] text-[#f4f4f5] px-[2rem] py-[0.8rem] rounded-full border border-[#1e1e24] hover:bg-white/5 transition-colors"
              >
                View All News
              </button>
            </div>
          </>
        ) : (
          <div className="w-full py-10 flex border border-[#1e1e24] rounded-2xl bg-[var(--bg-secondary)114] justify-center items-center">
            <span className="font-jetbrains text-[0.7rem] text-[#71717a]">UNABLE TO LOAD NEWS FEED</span>
          </div>
        )}
      </div>
    </section>
  );
};
