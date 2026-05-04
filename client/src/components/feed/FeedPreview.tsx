import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import AniShotRow from './AniShotRow';
import { PostCard } from '../social/PostCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

export const FeedPreview: React.FC = () => {
  const { data: trendingFeed, isLoading } = useQuery({
    queryKey: ['trending-preview'],
    queryFn: async () => {
      const res = await api.get('/feed/trending?limit=3');
      return res.data;
    }
  });

  return (
    <section className="py-12 bg-[#0a0a0c]">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[#efeff1] uppercase tracking-tighter">Nakama Social</h2>
          <Link to="/feed" className="text-red-500 text-[0.8rem] font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
            View Live Feed <ArrowRight size={14} />
          </Link>
        </div>

        {/* Story Row with custom border */}
        <div className="mb-10 rounded-2xl overflow-hidden border border-[#1a1a1c] bg-[#0d0d0f]">
          <AniShotRow />
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-[200px] w-full bg-[#111114] rounded-2xl animate-pulse border border-[#1a1a1c]" />
            ))
          ) : (
            trendingFeed?.posts?.slice(0, 3).map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link 
            to="/feed"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[0.9rem] transition-all hover:scale-[1.02] shadow-xl shadow-red-600/20"
          >
            Go to Nakama Feed <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-[#444] text-[0.7rem] font-bold uppercase tracking-widest">
            Join the conversation • 2.4k Nakama online
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedPreview;
