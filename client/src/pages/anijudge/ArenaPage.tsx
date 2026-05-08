import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Trophy, Check, Clock, Send, UserPlus, ShieldCheck, ArrowLeft, Hash, 
    AlertTriangle, Zap, MessageSquare, Info, ShieldAlert, Award, 
    Play, User, Crown, Ghost, Sparkles, X, Plus, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArenaSocket } from '../../hooks/useArenaSocket';
import { useAuth } from '../../context/AuthContext';
import { UserSearchModal } from '../../components/common/UserSearchModal';
import { Avatar } from '../../components/common/Avatar';
import './AniJudge.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ArenaPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useArenaSocket();
    
    const [arena, setArena] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [argument, setArgument] = useState('');
    const [copied, setCopied] = useState(false);
    const [timer, setTimer] = useState<any>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [verdict, setVerdict] = useState({ winnerTeam: 'TEAM_A', verdictText: '' });
    const [judgeQuestion, setJudgeQuestion] = useState('');
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [selectedDebaterForViolation, setSelectedDebaterForViolation] = useState<any>(null);
    const [violationForm, setViolationForm] = useState({ type: 'LOGICAL_FALLACY', severity: 'MILD', comment: '' });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchArena();
    }, [code]);

    useEffect(() => {
        if (socket && code && user) {
            socket.emit('join-arena', { code, userId: user.id });

            socket.on('arena-updated', (updatedArena: any) => setArena(updatedArena));
            socket.on('debate-started', (updatedArena: any) => setArena(updatedArena));
            socket.on('timer-tick', (data: any) => setTimer(data));
            socket.on('argument-submitted', (updatedArena: any) => {
                setArena(updatedArena);
                setArgument('');
                scrollToBottom();
            });
            socket.on('new-round-started', (data: any) => {
                setArena((prev: any) => ({
                    ...prev,
                    currentRound: data.roundNumber,
                    rounds: [...prev.rounds, { ...data.round, arguments: [] }]
                }));
                setJudgeQuestion('');
                scrollToBottom();
            });
            socket.on('violation-issued', (updatedArena: any) => setArena(updatedArena));
            socket.on('time-granted', (updatedArena: any) => setArena(updatedArena));
            socket.on('debate-ended', (updatedArena: any) => setArena(updatedArena));

            return () => {
                socket.off('arena-updated');
                socket.off('debate-started');
                socket.off('timer-tick');
                socket.off('argument-submitted');
                socket.off('new-round-started');
                socket.off('violation-issued');
                socket.off('time-granted');
                socket.off('debate-ended');
            };
        }
    }, [socket, code, user]);

    const fetchArena = async () => {
        try {
            const res = await axios.get(`${API_URL}/anijudge/${code}`, { withCredentials: true });
            setArena(res.data);
        } catch (err) {
            console.error(err);
            navigate('/anijudge');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleJoinTeam = (team: string) => {
        socket?.emit('join-team', { code, userId: user?.id, team });
    };

    const handleStartDebate = () => {
        socket?.emit('start-debate', { arenaId: arena.id, hostId: user?.id });
    };

    const handleSubmitArgument = () => {
        if (!argument.trim()) return;
        const myParticipant = arena.participants.find((p: any) => p.userId === user?.id);
        socket?.emit('submit-argument', { 
            arenaId: arena.id, 
            content: argument, 
            userId: user?.id, 
            team: myParticipant.team 
        });
    };

    const handleIssueViolation = () => {
        if (!violationForm.comment.trim()) return;
        socket?.emit('issue-violation', {
            arenaId: arena.id,
            judgeId: user?.id,
            participantId: selectedDebaterForViolation.id,
            ...violationForm
        });
        setIsViolationModalOpen(false);
    };

    const handleGrantExtraTime = (team: string) => {
        socket?.emit('grant-extra-time', { arenaId: arena.id, judgeId: user?.id, team, seconds: 60 });
    };

    const handleSubmitQuestion = () => {
        if (!judgeQuestion.trim()) return;
        socket?.emit('submit-judge-question', { arenaId: arena.id, question: judgeQuestion, userId: user?.id });
    };

    const handleSubmitVerdict = () => {
        if (!verdict.verdictText.trim()) return;
        socket?.emit('submit-verdict', { 
            arenaId: arena.id, 
            winnerTeam: verdict.winnerTeam, 
            verdictText: verdict.verdictText, 
            userId: user?.id 
        });
    };

    if (loading || !arena) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center font-syne">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 border-4 border-white/5 border-t-red-500 rounded-full animate-spin" />
                    <div className="text-xl font-black tracking-[0.4em] text-white animate-pulse">SYNCHRONIZING ARENA...</div>
                </div>
            </div>
        );
    }

    const myParticipant = arena.participants.find((p: any) => p.userId === user?.id);
    const isHost = arena.hostId === user?.id;
    const isJudge = arena.judgeId === user?.id;
    const isDebater = !!myParticipant && myParticipant.role === 'DEBATER';
    const isMyTurn = arena.status === 'ACTIVE' && timer?.activeTeam === myParticipant?.team;

    return (
        <div className="anijudge-root min-h-screen bg-[#0a0a0c] text-[#e1e1e6] flex flex-col relative overflow-hidden">
            
            {/* Top Bar */}
            <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/anijudge')} className="p-2 rounded-xl hover:bg-white/5 transition-all text-zinc-500 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                            <Hash size={12} className="text-red-500" />
                            {arena.code} · {arena.status}
                        </div>
                        <h1 className="text-lg font-bold font-syne truncate max-w-md">{arena.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {arena.status === 'ACTIVE' && timer && (
                        <div className={`flex items-center gap-4 px-6 h-12 rounded-2xl border transition-all ${timer.secondsRemaining < 15 ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Time Remaining</span>
                                <span className={`font-mono text-xl font-black leading-none ${timer.secondsRemaining < 15 ? 'text-red-500' : 'text-white'}`}>
                                    {Math.floor(timer.secondsRemaining / 60)}:{(timer.secondsRemaining % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <Clock size={24} className={timer.secondsRemaining < 15 ? 'text-red-500' : 'text-zinc-500'} />
                        </div>
                    )}
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(arena.code);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Plus size={18} className="text-red-500" />}
                        <span className="font-mono font-bold tracking-widest">{arena.code}</span>
                    </button>
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                        <img src={user?.avatar || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                
                {/* Left Panel: Participants & Judge Controls */}
                <aside className="w-80 border-r border-white/10 bg-black/20 overflow-y-auto p-6 hidden xl:block">
                    <div className="space-y-10">
                        {/* Judge Info */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Arbiter of Fate</h3>
                            {arena.judge ? (
                                <div className="p-4 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden">
                                            <img src={arena.judge.avatar} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <Crown size={14} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{arena.judge.username}</div>
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Grand Judge</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                    <Ghost size={32} className="text-zinc-700 mb-3" />
                                    <p className="text-xs text-zinc-500 italic">Seat is empty</p>
                                    {isHost && (
                                        <button onClick={() => setIsSearchOpen(true)} className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Assign Now</button>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Debaters */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Combatants</h3>
                            <div className="space-y-3">
                                {['TEAM_A', 'TEAM_B'].map(team => (
                                    <div key={team} className="space-y-2">
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${team === 'TEAM_A' ? 'text-blue-500' : 'text-red-500'}`}>
                                            {team.replace('_', ' ')}
                                        </div>
                                        {arena.participants.filter((p: any) => p.team === team).map((p: any) => (
                                            <div key={p.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={p.user.avatar} username={p.user.username} size="sm" className="w-8 h-8 rounded-xl" />
                                                    <span className="text-xs font-bold">{p.user.username}</span>
                                                </div>
                                                {isJudge && arena.status === 'ACTIVE' && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedDebaterForViolation(p);
                                                            setIsViolationModalOpen(true);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 transition-all hover:text-white"
                                                    >
                                                        <AlertTriangle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {arena.status === 'WAITING' && arena.participants.filter((p: any) => p.team === team).length < arena.maxDebaters / 2 && (
                                            <button 
                                                onClick={() => handleJoinTeam(team)}
                                                className="w-full h-10 rounded-xl border border-dashed border-white/10 text-[10px] font-black text-zinc-500 hover:border-white/30 hover:text-white transition-all uppercase tracking-widest"
                                            >
                                                + Join Slot
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Judge Toolbox */}
                        {isJudge && arena.status === 'ACTIVE' && (
                            <section className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Judge Toolbox</h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleGrantExtraTime('TEAM_A')}
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all flex items-center gap-3 px-4"
                                    >
                                        <Timer size={16} className="text-blue-500" />
                                        <span className="text-[10px] font-black uppercase text-zinc-300">+60s Team Alpha</span>
                                    </button>
                                    <button 
                                        onClick={() => handleGrantExtraTime('TEAM_B')}
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center gap-3 px-4"
                                    >
                                        <Timer size={16} className="text-red-500" />
                                        <span className="text-[10px] font-black uppercase text-zinc-300">+60s Team Omega</span>
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </aside>

                {/* Center Panel: Main Debate Area */}
                <section className="flex-1 flex flex-col min-w-0 bg-black/40">
                    
                    {/* WAITING STATE */}
                    {arena.status === 'WAITING' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-xl space-y-10"
                            >
                                <div className="inline-flex p-6 rounded-[2.5rem] bg-white/5 border border-white/10">
                                    <Swords size={64} className="text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-syne font-black tracking-tighter uppercase leading-none">Awaiting the Signal</h2>
                                    <p className="text-zinc-500 font-medium">The arena is initialized. Participants are gathering in the frequency. Once the judge is assigned and combatants are ready, the host can commence the conflict.</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 text-left">
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Rounds</div>
                                        <div className="text-2xl font-black font-syne">{arena.roundCount} Sets</div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Time Limit</div>
                                        <div className="text-2xl font-black font-syne">{arena.timeLimitPerRound}s / Turn</div>
                                    </div>
                                </div>

                                {isHost && (
                                    <button 
                                        onClick={handleStartDebate}
                                        disabled={!arena.judgeId || arena.participants.length < 2}
                                        className="w-full h-20 bg-white text-black rounded-3xl font-black text-xl tracking-tighter hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:grayscale active:scale-95 flex items-center justify-center gap-4"
                                    >
                                        COMMENCE CONFLICT
                                        <Zap size={24} className="fill-black" />
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {/* ACTIVE STATE */}
                    {arena.status === 'ACTIVE' && (
                        <div className="flex-1 flex flex-col min-h-0">
                            
                            {/* Round Info Banner */}
                            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-red-500 flex flex-col items-center justify-center text-black">
                                        <span className="text-[10px] font-black uppercase">Round</span>
                                        <span className="text-2xl font-black leading-none">{arena.currentRound}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold italic text-white/90">
                                            {arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.judgeQuestion || "Arbiter is considering the next move..."}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${timer?.activeTeam === 'TEAM_A' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {timer?.activeTeam ? `${timer.activeTeam.replace('_', ' ')} Speaking` : 'Preparation Phase'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Arguments Feed */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth" id="argument-feed">
                                <AnimatePresence mode="popLayout">
                                    {arena.rounds.flatMap((r: any) => r.arguments).map((arg: any) => (
                                        <motion.div 
                                            key={arg.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${arg.team === 'TEAM_A' ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-2xl group flex flex-col ${arg.team === 'TEAM_A' ? 'items-start' : 'items-end'}`}>
                                                <div className="flex items-center gap-3 mb-2 px-2">
                                                    {arg.team === 'TEAM_B' && <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{arg.user.username}</span>}
                                                    <Avatar src={arg.user.avatar} username={arg.user.username} size="sm" className="w-6 h-6 rounded-lg" />
                                                    {arg.team === 'TEAM_A' && <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{arg.user.username}</span>}
                                                </div>
                                                <div className={`p-6 rounded-[2rem] text-sm leading-relaxed ${
                                                    arg.team === 'TEAM_A' ? 'bg-blue-600/10 border border-blue-500/20 rounded-tl-none text-blue-100' : 'bg-red-600/10 border border-red-500/20 rounded-tr-none text-red-100'
                                                }`}>
                                                    {arg.content}
                                                </div>
                                                <div className="mt-2 text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-2">
                                                    {new Date(arg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={scrollRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-8 border-t border-white/10 bg-black/40">
                                {isMyTurn ? (
                                    <div className="max-w-4xl mx-auto flex gap-4">
                                        <div className="flex-1 relative">
                                            <textarea 
                                                value={argument}
                                                onChange={(e) => setArgument(e.target.value)}
                                                placeholder="Inject your argument into the frequency..."
                                                className="w-full h-32 bg-white/5 border border-white/20 rounded-3xl p-6 outline-none focus:border-red-500/50 transition-all resize-none text-white font-medium"
                                                maxLength={1000}
                                            />
                                            <div className="absolute bottom-4 right-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                {argument.length} / 1000
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleSubmitArgument}
                                            disabled={!argument.trim()}
                                            className="w-32 h-32 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group shadow-[0_0_30px_rgba(255,59,59,0.1)]"
                                        >
                                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Submit</span>
                                        </button>
                                    </div>
                                ) : isJudge && !timer?.activeTeam ? (
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        {arena.currentRound < arena.roundCount ? (
                                            <div className="space-y-4">
                                                <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Initiate Next Round</div>
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="text"
                                                        value={judgeQuestion}
                                                        onChange={(e) => setJudgeQuestion(e.target.value)}
                                                        placeholder="Ask a question to direct the debate..."
                                                        className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-blue-500/50 font-bold"
                                                    />
                                                    <button 
                                                        onClick={handleSubmitQuestion}
                                                        disabled={!judgeQuestion.trim()}
                                                        className="px-8 h-16 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                                    >
                                                        NEXT PHASE
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-[2.5rem] p-10 text-center space-y-8">
                                                <div className="space-y-2">
                                                    <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                                                    <h3 className="text-3xl font-syne font-black tracking-tight uppercase">Rendering Final Judgment</h3>
                                                    <p className="text-zinc-500 text-sm max-w-md mx-auto">The combat has ended. Your verdict will be recorded in the scrolls of eternity. Choose carefully, Arbiter.</p>
                                                </div>
                                                <div className="flex flex-col gap-4 max-w-xl mx-auto">
                                                    <div className="flex gap-4">
                                                        <select 
                                                            value={verdict.winnerTeam}
                                                            onChange={(e) => setVerdict({...verdict, winnerTeam: e.target.value})}
                                                            className="h-14 px-6 bg-black border border-white/10 rounded-2xl outline-none font-bold text-xs uppercase"
                                                        >
                                                            <option value="TEAM_A">ALPHA VICTORY</option>
                                                            <option value="TEAM_B">OMEGA VICTORY</option>
                                                            <option value="DRAW">DEADLOCK / DRAW</option>
                                                        </select>
                                                        <input 
                                                            type="text"
                                                            value={verdict.verdictText}
                                                            onChange={(e) => setVerdict({...verdict, verdictText: e.target.value})}
                                                            placeholder="Rationalize your decision..."
                                                            className="flex-1 h-14 bg-black border border-white/10 rounded-2xl px-6 outline-none focus:border-yellow-500/50"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleSubmitVerdict}
                                                        disabled={!verdict.verdictText.trim()}
                                                        className="w-full h-16 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-yellow-400 transition-all active:scale-95"
                                                    >
                                                        FINALIZE RECORD
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-32 flex flex-col items-center justify-center gap-4 text-zinc-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                                                {timer?.activeTeam ? `Receiving ${timer.activeTeam.replace('_', ' ')} Signal...` : 'Synchronizing Next Phase...'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* COMPLETED STATE */}
                    {arena.status === 'COMPLETED' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-12 backdrop-blur-xl"
                            >
                                <div className="space-y-4">
                                    <div className="inline-flex p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4">
                                        <Award size={64} />
                                    </div>
                                    <h2 className="text-6xl font-syne font-black tracking-tighter uppercase leading-none italic">
                                        {arena.winnerTeam === 'DRAW' ? "The Deadlock" : 
                                         arena.winnerTeam === 'TEAM_A' ? "Alpha Ascendant" : "Omega Ascendant"}
                                    </h2>
                                    <div className="flex items-center justify-center gap-3 text-zinc-500 text-sm font-bold uppercase tracking-widest">
                                        Rendered By <span className="text-white">{arena.judge?.username}</span>
                                    </div>
                                </div>

                                <div className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 italic text-2xl leading-relaxed text-zinc-300 font-medium font-syne">
                                    "{arena.verdictText}"
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Hall of Fame Status</div>
                                        <div className={`text-xl font-black ${arena.hallOfFameId ? 'text-green-500' : 'text-red-500'}`}>
                                            {arena.hallOfFameId ? 'INDELIBLE RECORD' : 'DENIED ENTRY'}
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Reach</div>
                                        <div className="text-xl font-black text-white">432 SPECTATORS</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/anijudge')}
                                    className="w-full h-20 bg-white text-black rounded-3xl font-black text-xl tracking-tighter hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-4"
                                >
                                    EXIT TERMINAL
                                    <ArrowLeft size={24} />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </section>

                {/* Right Panel: Violations & Feed */}
                <aside className="w-80 border-l border-white/10 bg-black/20 overflow-y-auto p-6 hidden 2xl:block">
                    <div className="space-y-10">
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                                <ShieldAlert size={14} className="text-red-500" />
                                Infractions
                            </h3>
                            <div className="space-y-3">
                                {arena.violations?.length === 0 ? (
                                    <p className="text-xs text-zinc-600 italic px-2">No violations recorded yet.</p>
                                ) : (
                                    arena.violations?.map((v: any) => (
                                        <div key={v.id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-red-500 uppercase">{v.type.replace('_', ' ')}</span>
                                                <span className="text-[8px] font-bold text-zinc-600">{v.severity}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-white">Target: {v.participant.user.username}</div>
                                            <p className="text-[10px] text-zinc-400 italic">"{v.comment}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </aside>
            </main>

            {/* Violation Modal */}
            <AnimatePresence>
                {isViolationModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0d0d0f] rounded-[2rem] border border-white/10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold font-syne uppercase">Issue Violation</h3>
                                </div>
                                <button onClick={() => setIsViolationModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="p-4 rounded-2xl bg-white/5 flex items-center gap-3 mb-4">
                                    <Avatar src={selectedDebaterForViolation?.user.avatar} username={selectedDebaterForViolation?.user.username} size="sm" />
                                    <span className="font-bold">{selectedDebaterForViolation?.user.username}</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</label>
                                    <select 
                                        value={violationForm.type}
                                        onChange={(e) => setViolationForm({...violationForm, type: e.target.value})}
                                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 outline-none font-bold text-xs"
                                    >
                                        <option value="LOGICAL_FALLACY">LOGICAL FALLACY</option>
                                        <option value="TOXICITY">TOXICITY</option>
                                        <option value="OFF_TOPIC">OFF TOPIC</option>
                                        <option value="LACK_OF_EVIDENCE">LACK OF EVIDENCE</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Severity</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['MILD', 'MODERATE', 'SEVERE'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => setViolationForm({...violationForm, severity: s})}
                                                className={`h-10 rounded-xl border text-[10px] font-black transition-all ${violationForm.severity === s ? 'bg-red-500 border-red-500 text-white' : 'border-white/10 text-zinc-500'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Arbiter Comment</label>
                                    <textarea 
                                        value={violationForm.comment}
                                        onChange={(e) => setViolationForm({...violationForm, comment: e.target.value})}
                                        placeholder="Reason for violation..."
                                        className="w-full h-24 bg-black border border-white/10 rounded-xl p-4 outline-none text-sm resize-none"
                                    />
                                </div>

                                <button 
                                    onClick={handleIssueViolation}
                                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all"
                                >
                                    STRIKE COMBATANT
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <UserSearchModal 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)}
                onSelect={(u: any) => {
                    socket?.emit('set-judge', { arenaId: arena.id, judgeUserId: u.id, hostId: user?.id });
                    setIsSearchOpen(false);
                }}
            />
        </div>
    );
};
