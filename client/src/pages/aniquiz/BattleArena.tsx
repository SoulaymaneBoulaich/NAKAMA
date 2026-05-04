import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Swords, 
    Shield, 
    Zap, 
    Timer as TimerIcon, 
    Trophy, 
    X,
    MessageSquare,
    Loader2,
    Users,
    Activity,
    Brain,
    Flame,
    Music,
    AlertTriangle,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Award
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/common/Avatar';
import { SafeImage } from '../../components/common/SafeImage';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface BattleQuestion {
    id: string;
    questionText: string;
    options: string[];
    type: string;
    animeReference: string;
    mediaUrl?: string;
}

interface Participant {
    username: string;
    avatar?: string;
    score: number;
    lastCorrect?: boolean;
}

export default function BattleArenaPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<'MATCHMAKING' | 'SYNCING' | 'ACTIVE' | 'FINISHED'>('MATCHMAKING');
    const [battleId, setBattleId] = useState<string | null>(null);
    const [p1, setP1] = useState<Participant | null>(null);
    const [p2, setP2] = useState<Participant | null>(null);
    const [question, setQuestion] = useState<BattleQuestion | null>(null);
    const [qIndex, setQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const battleSocket = io(`${SOCKET_URL}/battle`, { withCredentials: true });
        setSocket(battleSocket);

        battleSocket.emit('join-battle-queue', {
            userId: user?.id,
            username: user?.username,
            avatar: user?.avatar
        });

        battleSocket.on('match-found', ({ battleId, opponent, firstQuestion }) => {
            setBattleId(battleId);
            setP1(opponent.p1);
            setP2(opponent.p2);
            setQuestion(firstQuestion);
            setStatus('ACTIVE');
            startTimeRef.current = Date.now();
            startLocalTimer();
        });

        battleSocket.on('battle-score-update', ({ userId, score, isCorrect }) => {
            if (userId === user?.id) {
                setP1(prev => prev ? { ...prev, score, lastCorrect: isCorrect } : null);
            } else {
                setP2(prev => prev ? { ...prev, score, lastCorrect: isCorrect } : null);
            }
        });

        battleSocket.on('next-question', ({ question, index }) => {
            setQuestion(question);
            setQIndex(index);
            setSelectedAnswer(null);
            setTimeLeft(20);
            startTimeRef.current = Date.now();
            startLocalTimer();
        });

        battleSocket.on('battle-finished', (data) => {
            setResults(data);
            setStatus('FINISHED');
            if (timerRef.current) clearInterval(timerRef.current);
        });

        return () => {
            battleSocket.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startLocalTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswer = (answer: string) => {
        if (selectedAnswer || status !== 'ACTIVE' || timeLeft <= 0) return;
        
        setSelectedAnswer(answer);
        const responseTime = (Date.now() - startTimeRef.current) / 1000;
        
        socket?.emit('submit-battle-answer', {
            battleId,
            userId: user?.id,
            questionId: question?.id,
            answer,
            responseTime
        });
    };

    if (status === 'MATCHMAKING') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background animations */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)] animate-pulse" />
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-32 h-32 mx-auto mb-8 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-red-600/20 border-t-red-600 animate-spin" />
                        <div className="absolute inset-4 rounded-full border-2 border-white/5 border-b-white/20 animate-spin-reverse" />
                        <Swords className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-red-600 animate-bounce" />
                    </div>
                    
                    <h1 className="text-4xl font-black italic tracking-tighter mb-4">
                        SEEKING <span className="text-red-600">ANOMALY</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Matching with competitive Nakama...</p>
                    
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-zinc-700" />
                        <span className="text-zinc-700 text-xs font-bold">124 PLAYERS IN QUEUE</span>
                    </div>
                </motion.div>

                <button 
                    onClick={() => navigate('/aniquiz')}
                    className="absolute top-12 left-12 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all flex items-center gap-2 font-bold text-xs"
                >
                    <X className="w-4 h-4" /> CANCEL MATCH
                </button>
            </div>
        );
    }

    if (status === 'FINISHED' && results) {
        const isWinner = results.winnerId === user?.id;
        const isDraw = results.winnerId === null;
        const myResult = results.p1.userId === user?.id ? results.p1 : results.p2;

        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.15)_0%,transparent_100%)]">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-xl w-full bg-zinc-900/40 border border-zinc-800 rounded-[40px] p-12 backdrop-blur-3xl text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                    
                    <div className="mb-8">
                        {isWinner ? (
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-600/20 border border-red-600/40 mb-6 relative">
                                <Trophy className="w-12 h-12 text-red-500" />
                                <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20" />
                            </div>
                        ) : isDraw ? (
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 mb-6">
                                <Zap className="w-12 h-12 text-zinc-500" />
                            </div>
                        ) : (
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                                <AlertTriangle className="w-12 h-12 text-zinc-700" />
                            </div>
                        )}
                        <h2 className="text-5xl font-black italic tracking-tighter mb-2">
                            {isWinner ? 'VICTORY' : isDraw ? 'EQUILIBRIUM' : 'DEFEATED'}
                        </h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Battle Protocol Concluded</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="p-6 rounded-3xl bg-black/40 border border-zinc-800">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-2">My Score</div>
                            <div className="text-3xl font-black italic text-red-600">{myResult.score}</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-black/40 border border-zinc-800">
                            <div className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Rating Change</div>
                            <div className={`text-3xl font-black italic flex items-center justify-center gap-2 ${myResult.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {myResult.ratingChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {myResult.ratingChange > 0 ? `+${myResult.ratingChange}` : myResult.ratingChange}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black italic tracking-tight text-lg shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                        >
                            RE-QUEUE FOR BATTLE
                        </button>
                        <button 
                            onClick={() => navigate('/aniquiz')}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition-all"
                        >
                            EXIT ARENA
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Split Screen Header */}
            <div className="fixed top-0 inset-x-0 h-40 grid grid-cols-2 z-20">
                <div className={`p-8 border-r border-zinc-800 transition-all duration-500 ${p1?.lastCorrect === true ? 'bg-green-600/5' : p1?.lastCorrect === false ? 'bg-red-600/5' : 'bg-black'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden relative">
                            <Avatar src={p1?.avatar} username={p1?.username || ''} size="md" className="w-full h-full" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 border-2 border-black rounded-full" />
                        </div>
                        <div>
                            <div className="text-2xl font-black italic tracking-tighter truncate uppercase">{p1?.username}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Award className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-sm font-bold text-red-500 tabular-nums">{p1?.score} PTS</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`p-8 items-end flex flex-col transition-all duration-500 ${p2?.lastCorrect === true ? 'bg-green-600/5' : p2?.lastCorrect === false ? 'bg-red-600/5' : 'bg-black'}`}>
                   <div className="flex items-center gap-4 text-right">
                        <div>
                            <div className="text-2xl font-black italic tracking-tighter truncate uppercase">{p2?.username}</div>
                            <div className="flex items-center gap-2 mt-1 justify-end">
                                <span className="text-sm font-bold text-red-500 tabular-nums">{p2?.score} PTS</span>
                                <Award className="w-3.5 h-3.5 text-red-500" />
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden relative">
                            <Avatar src={p2?.avatar} username={p2?.username || ''} size="md" className="w-full h-full" />
                            <div className="absolute top-0 left-0 w-3 h-3 bg-zinc-600 border-2 border-black rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Central Progress Bar */}
            <div className="fixed top-40 inset-x-0 h-1 bg-zinc-900 z-30">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 20) * 100}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                    className={`h-full ${timeLeft < 5 ? 'bg-red-600 animate-pulse' : 'bg-white'}`}
                />
            </div>

            {/* Arena Content */}
            <div className="pt-56 pb-12 px-6 flex flex-col items-center max-w-4xl mx-auto min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        className="w-full"
                    >
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 mb-6">
                                <Brain className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{question?.animeReference}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-tight decoration-red-600 decoration-4">
                                "{question?.questionText}"
                            </h2>
                        </div>

                        {question?.mediaUrl && (
                            <div className="mb-12 rounded-[40px] overflow-hidden border border-zinc-800 aspect-video relative group">
                                <SafeImage src={question.mediaUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                            {question?.options.map((opt, i) => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(opt)}
                                    disabled={!!selectedAnswer || timeLeft <= 0}
                                    className={`p-6 rounded-[32px] text-lg font-bold border-2 transition-all relative group overflow-hidden ${
                                        selectedAnswer === opt 
                                        ? 'bg-red-600 border-red-600 text-white translate-y-1' 
                                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:-translate-y-1'
                                    } disabled:opacity-50`}
                                >
                                    <span className="relative z-10 italic uppercase">{opt}</span>
                                    <div className="absolute top-2 right-4 text-4xl font-black text-black/10 transition-transform group-hover:scale-125">{i + 1}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Background Protocol Stream */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10 mix-blend-overlay">
                <div className="absolute top-1/2 left-0 w-[200vw] h-96 -translate-x-1/4 -translate-y-1/2 -rotate-12 bg-red-600/20 blur-[120px]" />
                <div className="grid grid-cols-12 gap-4 p-8">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="text-[10px] font-mono text-white opacity-20">
                            {Math.random() > 0.5 ? 'SYNC' : 'GATE'}_{Math.random().toString(36).substring(7).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
