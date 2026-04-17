import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    AlertOctagon, 
    Skull, 
    TrendingDown, 
    Clock, 
    Target,
    ChevronLeft,
    Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface ShameEntry {
    accuracyRate: number;
    avgTimeSeconds: number;
    totalServed: number;
    question: {
        id: string;
        questionText: string;
        difficulty: string;
        animeReference: string;
        type: string;
    };
}

export default function HallOfShamePage() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<ShameEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShame();
    }, []);

    const fetchShame = async () => {
        try {
            const res = await api.get('/quiz/hall-of-shame');
            setEntries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/aniquiz')}
                            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tighter italic flex items-center gap-3">
                                HALL OF <span className="text-red-600">SHAME</span>
                                <AlertOctagon className="w-8 h-8 text-red-600 animate-pulse" />
                            </h1>
                            <p className="text-zinc-500 text-sm">Where connections fail and logic breaks. The 10 hardest questions in NAKAMA.</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {entries.map((entry, i) => (
                            <motion.div
                                key={entry.question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl"
                            >
                                {/* Rank Badge */}
                                <div className="absolute -top-2 -left-2 w-12 h-12 bg-red-600 flex items-center justify-center font-black text-xl italic skew-x-12 z-10 shadow-lg">
                                    #{i + 1}
                                </div>

                                <div className="flex justify-between items-start mb-6 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded bg-red-600/10 text-red-500 text-[10px] font-bold uppercase tracking-widest border border-red-600/20">
                                            {entry.question.difficulty}
                                        </span>
                                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{entry.question.type}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Accuracy</div>
                                        <div className="text-2xl font-black text-red-500 tabular-nums">
                                            {Math.round(entry.accuracyRate * 100)}%
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold italic leading-tight mb-6 line-clamp-2 h-14 group-hover:text-red-500 transition-colors">
                                    "{entry.question.questionText}"
                                </h3>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/50">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                                            <Target className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase">Attempts</span>
                                        </div>
                                        <div className="text-sm font-bold">{entry.totalServed}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase">Avg Time</span>
                                        </div>
                                        <div className="text-sm font-bold">{entry.avgTimeSeconds.toFixed(1)}s</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
                                            <Brain className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase">Source</span>
                                        </div>
                                        <div className="text-sm font-bold truncate text-red-500">{entry.question.animeReference}</div>
                                    </div>
                                </div>

                                {/* Decorative Background Elements */}
                                <Skull className="absolute -bottom-4 -right-4 w-24 h-24 text-red-600/[0.03] -rotate-12 group-hover:text-red-600/10 transition-all duration-700" />
                                <TrendingDown className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-red-600/[0.02] -z-10 group-hover:scale-110 transition-transform duration-1000" />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Statistics Banner */}
                <div className="mt-12 p-8 rounded-3xl bg-red-600/5 border border-red-600/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-xl font-bold mb-2 italic">THE ANOMALY EFFECT</h2>
                        <p className="text-zinc-500 text-sm max-w-xl">
                            These questions have been flagged as statistically anomalous. High failure rates indicate complex logic, obscure lore, or legendary tier difficulty.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-black border border-zinc-800 text-center">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Global Accuracy</div>
                            <div className="text-xl font-black text-red-500">22.4%</div>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-black border border-zinc-800 text-center">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Avg Dissolution</div>
                            <div className="text-xl font-black text-red-500">~12.8s</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
