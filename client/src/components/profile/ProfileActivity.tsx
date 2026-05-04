import React, { useEffect, useState } from 'react';
import type { Activity } from '../../../../shared/types/index.js';
import { Plus, Edit3, Star, UserPlus, MessageSquare, Clock, Brain, Activity as ActivityIcon, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { motion } from 'framer-motion';
import { SafeImage } from '../common/SafeImage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ProfileActivityProps {
  activities: Activity[];
  isSelf?: boolean;
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({ activities, isSelf }) => {
  const [summary, setSummary] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSelf) {
      const fetchPrivateData = async () => {
        setLoading(true);
        try {
          const [summaryRes, analysisRes] = await Promise.all([
            axios.get(`${API_BASE}/activity/summary`, { withCredentials: true }),
            axios.get(`${API_BASE}/activity/analysis`, { withCredentials: true })
          ]);
          setSummary(summaryRes.data);
          setAnalysis(analysisRes.data);
        } catch (err) {
          console.error('[ProfileActivity] Error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPrivateData();
    }
  }, [isSelf]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ANIME_ADD': return <Plus size={14} className="text-green-500" />;
      case 'ANIME_UPDATE': return <Edit3 size={14} className="text-blue-500" />;
      case 'ANIME_RATE': return <Star size={14} className="text-yellow-500" />;
      case 'FOLLOW': return <UserPlus size={14} className="text-purple-500" />;
      case 'POST_CREATE': return <MessageSquare size={14} className="text-red-500" />;
      default: return <ActivityIcon size={14} className="text-gray-500" />;
    }
  };

  const getActionText = (activity: Activity) => {
    switch (activity.type) {
      case 'ANIME_ADD': return 'Added';
      case 'ANIME_UPDATE': return 'Updated';
      case 'ANIME_RATE': return `Rated ${activity.metadata?.score}/10`;
      case 'FOLLOW': return 'Followed';
      case 'POST_CREATE': return 'Posted in';
      default: return 'Did something';
    }
  };

  return (
    <div className="space-y-12">
      {/* Private Behavioral Dashboard (Owner Only) */}
      {isSelf && (
        <section className="bg-[#121212] border border-[var(--border-color)] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Brain size={120} className="text-[var(--accent-primary)]" />
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
              <ActivityIcon size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">Activity Intelligence</h2>
              <span className="text-[8px] font-bold text-[var(--accent-primary)] uppercase tracking-widest leading-none">Private to you</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Screen Time */}
            <div className="bg-black/40 border border-gray-800/40 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Total Screen Time</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black italic tracking-tighter text-white">
                  {Math.round((summary?.totalDuration || 0) / 60)}
                </span>
                <span className="text-xs font-bold text-gray-600 uppercase">Minutes</span>
              </div>
              <p className="text-[9px] text-gray-500 mt-2 uppercase font-bold tracking-tight">
                Active across {summary?.sessionCount || 0} sessions
              </p>
            </div>

            {/* Discourse Analysis */}
            <div className="md:col-span-2 bg-black/40 border border-gray-800/40 p-6 rounded-2xl">
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Brain size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Discussion DNA</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {analysis?.slice(0, 5).map((item, i) => (
                  <div key={i} className="bg-[var(--bg-secondary)] border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-3 group">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.sentiment === 'POSITIVE' ? 'bg-green-500' : 
                      item.sentiment === 'NEGATIVE' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-tight text-white">{item.topic || 'General Discussion'}</div>
                      <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Sentiment: {item.sentiment}</div>
                    </div>
                  </div>
                ))}
                {(!analysis || analysis.length === 0) && (
                  <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest py-2">No deep discourse analyzed yet</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Activity Timeline */}
      <section className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-gray-800 before:via-gray-900 before:to-transparent">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-800/10 border border-gray-800/30 rounded-lg">
            <Clock size={16} className="text-white" />
          </div>
          <h2 className="text-xs font-black uppercase italic tracking-tighter text-white">Timeline Feed</h2>
        </div>

        {activities.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-2xl bg-black/20">
            <ActivityIcon size={24} className="text-gray-800 mb-2" />
            <span className="text-[10px] text-gray-700 uppercase tracking-widest font-black">Null History</span>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div 
              key={activity.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-12 group"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-0.5 w-[38px] h-[38px] rounded-2xl bg-black border border-gray-800 flex items-center justify-center z-10 group-hover:border-[var(--accent-primary)]/50 transition-all duration-500 shadow-xl group-hover:scale-110">
                {getIcon(activity.type)}
              </div>

              {/* Content Card */}
              <div className="bg-[#111] border border-gray-800/60 p-5 rounded-2xl hover:border-gray-700 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                        {getActionText(activity)}
                      </span>
                      <div className="w-1 h-1 bg-gray-800 rounded-full" />
                      <span className="text-[9px] text-gray-600 font-mono uppercase">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[var(--accent-primary)] transition-colors">
                      {activity.entityTitle}
                    </h3>
                  </div>
                </div>

                {activity.entityImage && (
                  <div className="mt-4 flex gap-4">
                    <div className="w-20 h-28 bg-[#181818] rounded-xl overflow-hidden border border-gray-800 flex-shrink-0 group-hover:border-gray-700 transition-all">
                      <SafeImage src={activity.entityImage} alt={activity.entityTitle || ''} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                    {activity.type === 'ANIME_UPDATE' && activity.metadata?.status && (
                      <div className="flex flex-col justify-end pb-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">State Modification</span>
                        <div className="flex items-center gap-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 px-3 py-1 rounded-lg">
                          <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase italic tracking-tighter">
                            {activity.metadata.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
};

export default ProfileActivity;
