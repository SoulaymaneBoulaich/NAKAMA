import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, 
    Crown, 
    Timer, 
    Users, 
    Swords, 
    ChevronRight, 
    Star, 
    Gamepad2,
    Calendar,
    Loader2,
    Shield
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

interface Tournament {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: 'REGISTRATION' | 'ONGOING' | 'ENDED' | 'CANCELLED';
    prizePool: number;
    _count: {
        participants: number;
    };
}

interface Gauntlet {
    id: string;
    seasonName: string;
    attempts: any[];
    endDate: string;
}

export default function CommunityTournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [gauntlet, setGauntlet] = useState<Gauntlet | null>(null);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tRes, gRes] = await Promise.all([
                api.get('/quiz/tournaments'),
                api.get('/quiz/gauntlet/seasonal')
            ]);
            setTournaments(tRes.data);
            setGauntlet(gRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id: string) => {
        setJoiningId(id);
        try {
            await api.post('/quiz/tournaments/join', { tournamentId: id });
            addToast('Synchronized!', 'You are registered for this event. Prepare your mind.', 'success');
            fetchData();
        } catch (err: any) {
            addToast('Error', err.response?.data?.message || 'Failed to join tournament', 'error');
        } finally {
            setJoiningId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section - Seasonal Gauntlet */}
                {gauntlet && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 relative rounded-[40px] overflow-hidden border border-red-600/20 bg-zinc-900/40 backdrop-blur-3xl group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-transparent pointer-events-none" />
                        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield className="w-6 h-6 text-red-500" />
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-[0.3em]">Institutional Protocol</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6">
                                    {gauntlet.seasonName.toUpperCase()} <br />
                                    <span className="text-red-600">GAUNTLET</span>
                                </h1>
                                <p className="text-zinc-400 text-lg max-w-xl mb-8 leading-relaxed">
                                    The ultimate test of endurance. Face a localized sequence of questions from the current season. Only the top 1% achieve legendary status.
                                </p>
                                <div className="flex flex-wrap gap-8 items-center">
                                    <div className="flex items-center gap-3">
                                        <Timer className="w-5 h-5 text-zinc-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Ends In</div>
                                            <div className="text-sm font-bold">{new Date(gauntlet.endDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-zinc-500" />
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Reward Pool</div>
                                            <div className="text-sm font-bold">LEGENDARY BADGE</div>
                                        </div>
                                    </div>
                                    <button className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                                        ENTER GAUNTLET <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Mini Leaderboard */}
                            <div className="w-full md:w-80 bg-black/40 rounded-3xl border border-zinc-800 p-6 backdrop-blur-xl">
                                <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-orange-500" />
                                    CURRENT ASCENDANTS
                                </h3>
                                <div className="space-y-4">
                                    {gauntlet.attempts.length > 0 ? gauntlet.attempts.map((attempt, i) => (
                                        <div key={i} className="flex items-center justify-between group/user">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs font-bold text-zinc-600 w-4 italic">{i+1}</div>
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                                                    {attempt.user.avatar ? <img src={attempt.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-red-600/10" />}
                                                </div>
                                                <span className="text-sm font-bold group-hover/user:text-red-500 transition-colors uppercase italic">{attempt.user.username}</span>
                                            </div>
                                            <div className="text-sm font-black italic tracking-widest text-red-500">{attempt.score}</div>
                                        </div>
                                    )) : (
                                        <div className="py-10 text-center text-zinc-700 text-xs font-bold uppercase italic tracking-widest leading-loose">
                                            No ascendants <br/> for this timeline.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Periodic Tournaments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <Swords className="w-6 h-6 text-red-500" />
                            <h2 className="text-3xl font-extrabold italic tracking-tighter">EVENT <span className="text-red-600">HORIZON</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tournaments.map((tournament) => (
                                <motion.div
                                    key={tournament.id}
                                    layout
                                    className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 hover:border-red-600/20 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:bg-red-600/10 group-hover:border-red-600/30 transition-all">
                                            <Gamepad2 className="w-6 h-6 text-zinc-500 group-hover:text-red-500" />
                                        </div>
                                        <div className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-zinc-700 uppercase tracking-widest">
                                            {tournament.status}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold italic mb-2 uppercase">{tournament.title}</h3>
                                    <p className="text-zinc-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                        {tournament.description}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-3 bg-black/40 rounded-2xl border border-zinc-800">
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Participants</div>
                                            <div className="text-sm font-bold flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                {tournament._count.participants}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-black/40 rounded-2xl border border-zinc-800">
                                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Start Date</div>
                                            <div className="text-sm font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(tournament.startDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={joiningId === tournament.id || tournament.status !== 'REGISTRATION'}
                                        onClick={() => handleJoin(tournament.id)}
                                        className="w-full py-3 bg-zinc-800 hover:bg-red-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] disabled:opacity-50"
                                    >
                                        {joiningId === tournament.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'REGISTER PROTOCOL'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Highlights / Hall of Fame */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <Star className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-bold italic tracking-tighter uppercase text-zinc-400">Past <span className="text-white">Victors</span></h2>
                        </div>
                        
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-orange-500 shadow-inner">
                                        {i === 1 ? '🥇' : i === 2 ? '🥈' : '🥉'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold uppercase italic">Nakama_{Math.random().toString(36).substring(7)}</div>
                                        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">WINTER 2026 GAUNTLET</div>
                                    </div>
                                    <div className="ml-auto">
                                        <div className="text-xs font-black text-red-600 italic">4.2K PTS</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
