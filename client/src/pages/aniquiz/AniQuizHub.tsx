import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, 
    Trophy, 
    Zap, 
    Star, 
    LayoutGrid, 
    ChevronRight, 
    Lock, 
    Swords, 
    Puzzle, 
    MessageSquarePlus, 
    Activity, 
    ShieldCheck, 
    Skull,
    History,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import DailyQuizWidget from '../../components/aniquiz/DailyQuizWidget';

interface Quiz {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    isGauntlet: boolean;
    _count?: {
        attempts: number;
    };
}

const AniQuizHub: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [hallOfFame, setHallOfFame] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quizRes, hofRes] = await Promise.all([
                    api.get('/quiz'),
                    api.get('/quiz/hall-of-fame')
                ]);
                setQuizzes(quizRes.data);
                setHallOfFame(hofRes.data);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const gauntletQuiz = quizzes.find(q => q.isGauntlet);
    const standardQuizzes = quizzes.filter(q => !q.isGauntlet);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Spinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-black pt-32 pb-40 px-6 sm:px-12">
            <div className="max-w-[1400px] mx-auto space-y-32">
                
                {/* Protocol Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-900 pb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-red-600" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Protocol / Neural-Matrix</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
                            ANI<span className="text-red-600">QUIZ</span><span className="text-white/10 italic">_HUB</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Global Sync</div>
                            <div className="text-xl font-black text-white italic">99.8%</div>
                        </div>
                        <div className="px-6 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Active Nakama</div>
                            <div className="text-xl font-black text-red-600 italic">1.2K</div>
                        </div>
                    </div>
                </div>

                {/* Primary Interaction Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Daily Logic & Main Gauntlet */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Daily Quiz Widget (New) */}
                        <DailyQuizWidget />

                        {/* Weekly Gauntlet */}
                        <div className="relative group rounded-[40px] overflow-hidden border border-white/5 bg-zinc-900/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent" />
                            <div className="relative p-10 flex flex-col md:flex-row items-center gap-12">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-widest">MAJOR EVENT</div>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rotation Phase 12</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">THE <span className="text-red-600">GAUNTLET</span></h2>
                                    <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                                        100 Questions. High-stakes endurance. Survive the threshold to claim a golden projection frame and permanent archives.
                                    </p>
                                    <div className="flex gap-4 pt-2">
                                        <button 
                                            onClick={() => navigate(`/aniquiz/play/${gauntletQuiz?.id}`)}
                                            className="px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-3"
                                        >
                                            COMMENCE <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/aniquiz/tournaments')}
                                            className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center gap-2"
                                        >
                                            <Trophy className="w-4 h-4 text-yellow-500" /> TOURNAMENTS
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden md:block w-48 h-48 rounded-full border border-dashed border-red-600/20 animate-spin-slow opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Sidebar (New) */}
                    <div className="lg:col-span-4 space-y-4">
                        <button 
                            onClick={() => navigate('/aniquiz/battle')}
                            className="w-full p-8 rounded-[40px] bg-red-600 hover:bg-red-700 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10 text-left">
                                <Swords className="w-10 h-10 mb-4 group-hover:rotate-12 transition-transform" />
                                <h3 className="text-2xl font-black italic tracking-tighter mb-1">REAL-TIME BATTLE</h3>
                                <p className="text-red-200 text-xs font-bold uppercase tracking-widest opacity-80">Join 1v1 Arena Protocol</p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        </button>

                        <button 
                            onClick={() => navigate('/aniquiz/rooms')}
                            className="w-full p-8 rounded-[40px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
                        >
                            <div className="text-left">
                                <Puzzle className="w-8 h-8 mb-4 text-red-500 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black italic tracking-tighter mb-1 uppercase">Anime Domains</h3>
                                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Specialized Title Arenas</p>
                            </div>
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => navigate('/aniquiz/contribute')}
                                className="p-6 rounded-[32px] bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 flex flex-col items-center justify-center gap-2 group transition-all"
                            >
                                <MessageSquarePlus className="w-5 h-5 text-zinc-500 group-hover:text-red-500" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Contribute</span>
                            </button>
                            <button 
                                onClick={() => navigate('/aniquiz/review')}
                                className="p-6 rounded-[32px] bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 flex flex-col items-center justify-center gap-2 group transition-all"
                            >
                                <ShieldCheck className="w-5 h-5 text-zinc-500 group-hover:text-red-500" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Review</span>
                            </button>
                        </div>

                         <button 
                            onClick={() => navigate('/aniquiz/shame')}
                            className="w-full p-6 rounded-[32px] bg-zinc-900/30 border border-zinc-900 hover:border-red-900/50 hover:bg-red-900/5 transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Skull className="w-5 h-5 text-zinc-700 group-hover:text-red-600" />
                                <span className="text-xs font-bold text-zinc-600 group-hover:text-red-600 uppercase tracking-[0.2em]">Hall of Shame</span>
                            </div>
                            <History className="w-4 h-4 text-zinc-800" />
                        </button>
                    </div>
                </div>

                {/* Leaderboards Reel */}
                <div className="space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                ASCENDANT <span className="text-yellow-500">LEADERS</span>
                                <Activity className="w-5 h-5 text-red-600" />
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">The current masters of all protocols</p>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                    </div>

                    <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide">
                        {hallOfFame.length === 0 ? (
                            <div className="w-full h-32 flex items-center justify-center border border-dashed border-zinc-800 rounded-[40px]">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">No ascendants in the current timeline yet...</span>
                            </div>
                        ) : (
                            hallOfFame.map((entry, idx) => (
                                <motion.div 
                                    key={entry.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex-shrink-0 w-80 bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-6 hover:bg-zinc-900 transition-all group backdrop-blur-xl"
                                >
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-yellow-500/50 overflow-hidden bg-zinc-800">
                                            {entry.user.avatar ? <img src={entry.user.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-red-600/10" />}
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-[14px] font-black shadow-lg">
                                            <Star className="w-4 h-4 text-black fill-black" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black italic uppercase tracking-widest truncate group-hover:text-red-500 transition-colors">{entry.user.username}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-yellow-500 uppercase tabular-nums">{entry.score} PTS</span>
                                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase truncate">Gauntlet Master</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Seasonal Matrices Grid */}
                <div className="space-y-12 pb-20">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">SEASONAL <span className="text-red-600">MATRICES</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Curated batches for focused manifestations</p>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {standardQuizzes.map((quiz) => (
                            <motion.div 
                                key={quiz.id}
                                whileHover={{ y: -10 }}
                                onClick={() => navigate(`/aniquiz/play/${quiz.id}`)}
                                className="group bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem] p-10 space-y-8 cursor-pointer hover:border-red-600/40 transition-all duration-500 relative"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                        <Star size={24} className="text-zinc-600 group-hover:text-white" />
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Threshold</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                            quiz.difficulty === 'KAGE' ? 'text-red-600' : 'text-zinc-400'
                                        }`}>{quiz.difficulty}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">
                                        {quiz.description}
                                    </p>
                                </div>

                                <div className="pt-8 border-t border-zinc-800/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-zinc-700" />
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{quiz._count?.attempts || 0} PROCESSED</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="bg-zinc-900/10 border border-dashed border-zinc-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 opacity-30">
                             <Lock size={32} className="text-zinc-800" />
                             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Next Cycle: Hidden Lore</p>
                        </div>
                     </div>
                </div>

            </div>
        </div>
    );
};

export default AniQuizHub;
