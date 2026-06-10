import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Trophy, Check, Clock, Send, ShieldCheck, ArrowLeft, Hash, 
    AlertTriangle, Zap, MessageSquare, ShieldAlert, Award, 
    Play, Crown, Ghost, Sparkles, X, Plus, Timer, Swords
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
    const [verdict, setVerdict] = useState({ 
        winnerTeam: 'TEAM_A', 
        verdictText: '', 
        mvpUserId: '',
        bestEvidenceUserId: '',
        mostImprovedUserId: ''
    });
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [selectedDebaterForViolation, setSelectedDebaterForViolation] = useState<any>(null);
    const [violationForm, setViolationForm] = useState({ type: 'LOGICAL_FALLACY', severity: 'MILD', comment: '' });
    const [subtopic, setSubtopic] = useState('');
    const [roundScores, setRoundScores] = useState<any[]>([]);
    const [winnerTeamForRound, setWinnerTeamForRound] = useState<'TEAM_A' | 'TEAM_B' | 'DRAW'>('TEAM_A');
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [isHalftimeOverlayOpen, setIsHalftimeOverlayOpen] = useState(false);

    // Book Five
    const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [selectedUserForSignal, setSelectedUserForSignal] = useState<any>(null);
    const [signalForm, setSignalForm] = useState({ type: 'YELLOW' as 'YELLOW' | 'RED' | 'GREEN', reason: '' });
    const [bannedWordsInput, setBannedWordsInput] = useState('');

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
                scrollToBottom();
            });
            socket.on('violation-issued', (updatedArena: any) => setArena(updatedArena));
            socket.on('time-granted', (updatedArena: any) => setArena(updatedArena));
            socket.on('debate-ended', (updatedArena: any) => setArena(updatedArena));
            socket.on('debate-paused', (data: any) => {
                setTimer((prev: any) => ({ ...prev, isPaused: true }));
                // Show notification or update arena state
            });
            socket.on('debate-resumed', () => {
                setTimer((prev: any) => ({ ...prev, isPaused: false }));
            });
            socket.on('round-extended', () => {
                // Update local timer state if needed
            });
            socket.on('system-message', (data: any) => {
                // Handle system messages in chat or notification
            });
            socket.on('subtopic-announced', (data: any) => {
                setArena((prev: any) => ({
                    ...prev,
                    rounds: prev.rounds.map((r: any) => r.id === data.roundId ? { ...r, subtopic: data.subtopic, status: 'ACTIVE' } : r)
                }));
            });
            socket.on('round-completed', () => {
                // You could show a summary modal here
            });
            socket.on('round-timer-ended', () => {
                fetchArena();
            });
            socket.on('halftime-reached', () => {
                setIsHalftimeOverlayOpen(true);
            });
            socket.on('cards-activated', () => {
                // Card pool is active by default if mode is not NONE
                setIsHalftimeOverlayOpen(false);
            });
            socket.on('card-purchased', (data: any) => {
                // Optionally show a toast or notification
            });

            socket.on('sudden-death-triggered', () => {
                // Play sound or show big alert
                alert("SUDDEN DEATH ACTIVATED! 3 MINUTES REMAINING.");
            });

            socket.on('signal-issued', (data: any) => {
                // Show notification
                console.log('SIGNAL ISSUED:', data);
            });

            socket.on('user-ejected', (data: any) => {
                if (data.userId === user.id) {
                    alert(`You have been ejected: ${data.reason}`);
                    navigate('/anijudge');
                }
            });

            socket.on('error', (msg: any) => {
                alert(typeof msg === 'string' ? msg : msg.message);
            });

            return () => {
                socket.off('arena-updated');
                socket.off('debate-started');
                socket.off('timer-tick');
                socket.off('argument-submitted');
                socket.off('new-round-started');
                socket.off('violation-issued');
                socket.off('time-granted');
                socket.off('debate-ended');
                socket.off('debate-paused');
                socket.off('debate-resumed');
                socket.off('round-extended');
                socket.off('system-message');
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
            team: myParticipant.role 
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

    const handleSubmitVerdict = () => {
        if (!verdict.verdictText.trim()) return;
        socket?.emit('submit-verdict', { 
            arenaId: arena.id, 
            winnerTeam: verdict.winnerTeam, 
            verdictText: verdict.verdictText, 
            mvpUserId: verdict.mvpUserId,
            bestEvidenceUserId: verdict.bestEvidenceUserId,
            mostImprovedUserId: verdict.mostImprovedUserId,
            userId: user?.id 
        });
    };

    const handleAnnounceSubtopic = () => {
        if (!subtopic.trim()) return;
        socket?.emit('announce-subtopic', { arenaId: arena.id, subtopic, userId: user?.id });
        setSubtopic('');
    };

    const handleSubmitRoundScores = (roundId: string) => {
        socket?.emit('submit-round-scores', { 
            arenaId: arena.id, 
            roundId, 
            userId: user?.id, 
            scores: roundScores,
            winnerTeam: winnerTeamForRound 
        });
    };

    const handleAssignCaptain = (userId: string, team: string) => {
        socket?.emit('assign-captain', { arenaId: arena.id, userId, team });
    };

    const handleRequestPause = (reason: string) => {
        socket?.emit('request-pause', { arenaId: arena.id, userId: user?.id, reason });
    };

    const handleResumeDebate = () => {
        socket?.emit('resume-debate', { arenaId: arena.id, userId: user?.id });
    };

    const handleExtendRound = () => {
        socket?.emit('extend-round', { arenaId: arena.id, userId: user?.id });
    };

    const handleActivateCards = () => {
        socket?.emit('activate-cards', { arenaId: arena.id, judgeUserId: user?.id });
    };

    const handleBuyCard = (cardType: string, targetUserId?: string) => {
        socket?.emit('buy-card', { arenaId: arena.id, userId: user?.id, cardType, targetUserId });
        setIsCardModalOpen(false);
    };

    const handleActivateJudgeCard = (cardType: string) => {
        socket?.emit('activate-judge-card', { arenaId: arena.id, judgeUserId: user?.id, cardType });
    };

    const handleIssueSignal = () => {
        if (!signalForm.reason.trim()) return;
        socket?.emit('issue-signal', {
            arenaId: arena.id,
            userId: user?.id,
            targetUserId: selectedUserForSignal.userId,
            ...signalForm
        });
        setIsSignalModalOpen(false);
        setSignalForm({ type: 'YELLOW', reason: '' });
    };

    const handleLeaveDebate = () => {
        if (window.confirm("Are you sure you want to leave? This carries a point penalty and a quit strike.")) {
            socket?.emit('leave-debate', { arenaId: arena.id, userId: user?.id });
            navigate('/anijudge');
        }
    };

    const handleUpdateBannedWords = () => {
        const words = bannedWordsInput.split(',').map(w => w.trim()).filter(w => w.length > 0);
        // We'll need a new socket event or update the create-arena logic
        // For now, let's assume the Judge can update it
        socket?.emit('update-banned-words', { arenaId: arena.id, bannedWords: words });
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
    const isDebater = !!myParticipant && (myParticipant.role === 'TEAM_A' || myParticipant.role === 'TEAM_B');
    const isSuddenDeath = arena.rounds.some((r: any) => r.status === 'SUDDEN_DEATH');
    const isMyTurn = (arena.status === 'ACTIVE' && (timer?.activeTeam === myParticipant?.role || isSuddenDeath));
    const allRoundsCompleted = arena.rounds.length === arena.roundCount && arena.rounds.every((r: any) => r.status === 'COMPLETED');

    const getRankInfo = (points: number) => {
        if (points >= 1000) return { name: 'DIAMOND', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' };
        if (points >= 500) return { name: 'PLATINUM', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' };
        if (points >= 250) return { name: 'GOLD', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' };
        if (points >= 100) return { name: 'SILVER', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
        return { name: 'BRONZE', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' };
    };

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
                        <h1 className="text-lg font-bold font-syne truncate max-w-sm">{arena.title}</h1>
                    </div>
                </div>

                {arena.status === 'ACTIVE' && (
                    <div className="hidden lg:flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Current Subtopic</div>
                        <div className="text-sm font-black font-syne text-white tracking-tight italic bg-white/5 px-6 py-2 rounded-full border border-white/10">
                            {arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.subtopic || "Awaiting Arbiter Prompt..."}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-6">
                    {(arena.status === 'ACTIVE' || arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'SUDDEN_DEATH') && timer && (
                        <div className={`flex items-center gap-4 px-6 h-12 rounded-2xl border transition-all ${timer.secondsRemaining < 15 || arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'SUDDEN_DEATH' ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    {arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'SUDDEN_DEATH' ? 'SUDDEN DEATH' : 'Time Remaining'}
                                </span>
                                <span className={`font-mono text-xl font-black leading-none ${timer.secondsRemaining < 15 || arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'SUDDEN_DEATH' ? 'text-red-500' : 'text-white'}`}>
                                    {Math.floor(timer.secondsRemaining / 60)}:{(timer.secondsRemaining % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <Clock size={24} className={timer.secondsRemaining < 15 || arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'SUDDEN_DEATH' ? 'text-red-500' : 'text-zinc-500'} />
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
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden group relative">
                        <img src={user?.avatar || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                        {myParticipant && (
                            <button 
                                onClick={handleLeaveDebate}
                                className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                title="Leave Arena"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        )}
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
                                    {isJudge && !arena.coJudge && (
                                        <button onClick={() => setIsSearchOpen(true)} className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Nominate Co-Arbiter</button>
                                    )}
                                    {arena.coJudge && (
                                        <div className="mt-4 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                            <Avatar src={arena.coJudge.avatar} username={arena.coJudge.username} size="xs" />
                                            <span className="text-[10px] font-bold text-zinc-400">{arena.coJudge.username} (Co)</span>
                                        </div>
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
                                        {arena.participants.filter((p: any) => p.role === team).map((p: any) => (
                                            <div key={p.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Avatar src={p.user.avatar} username={p.user.username} size="sm" className="w-8 h-8 rounded-xl" />
                                                        {p.isCaptain && <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />}
                                                    </div>
                                                    <span className={`text-xs font-bold ${p.isCaptain ? 'text-yellow-500' : ''}`}>{p.user.username}</span>
                                                    <div className={`px-2 py-0.5 rounded-md text-[7px] font-black tracking-tighter border ${getRankInfo(p.user.debateStats?.seasonPoints || 0).bg} ${getRankInfo(p.user.debateStats?.seasonPoints || 0).color} ${getRankInfo(p.user.debateStats?.seasonPoints || 0).border}`}>
                                                        {getRankInfo(p.user.debateStats?.seasonPoints || 0).name}
                                                    </div>
                                                    {arena.participants.filter((m: any) => m.role === team).length === 1 && arena.participants.filter((m: any) => m.role !== team && m.role !== 'JUDGE').length >= 2 && (
                                                        <div className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[7px] font-black" title="Solo Debater Handicap Applied">
                                                            HANDICAP +2
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {isHost && arena.status === 'WAITING' && !p.isCaptain && (
                                                        <button 
                                                            onClick={() => handleAssignCaptain(p.userId, team)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 transition-all hover:text-white"
                                                            title="Assign Captain"
                                                        >
                                                            <Crown size={14} />
                                                        </button>
                                                    )}
                                                    
                                                    {isJudge && arena.status === 'ACTIVE' && (
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedUserForSignal(p);
                                                                    setIsSignalModalOpen(true);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 transition-all hover:text-white"
                                                                title="Issue Signal"
                                                            >
                                                                <AlertTriangle size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedDebaterForViolation(p);
                                                                    setIsViolationModalOpen(true);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 transition-all hover:text-white"
                                                                title="Issue Violation"
                                                            >
                                                                <Zap size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {arena.status === 'WAITING' && arena.participants.filter((p: any) => p.role === team).length < arena.maxDebaters / 2 && (
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
                                        onClick={handleExtendRound}
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all flex items-center gap-3 px-4"
                                    >
                                        <Plus size={16} className="text-yellow-500" />
                                        <span className="text-[10px] font-black uppercase text-zinc-300">Extend Round (3 max)</span>
                                    </button>
                                    <button 
                                        onClick={timer?.isPaused ? handleResumeDebate : () => handleRequestPause('Judge decision')}
                                        className={`w-full h-12 rounded-xl border transition-all flex items-center gap-3 px-4 ${timer?.isPaused ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-red-500/10 hover:border-red-500'}`}
                                    >
                                        {timer?.isPaused ? <Play size={16} /> : <X size={16} />}
                                        <span className="text-[10px] font-black uppercase">{timer?.isPaused ? 'Resume Debate' : 'Pause Debate'}</span>
                                    </button>
                                    <div className="h-[1px] bg-white/5 my-2" />
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
                                    <div className="h-[1px] bg-white/5 my-2" />
                                    <button 
                                        onClick={() => setIsCardModalOpen(true)}
                                        className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap size={18} fill="white" />
                                        Judge Strategic Cards
                                    </button>
                                    <div className="h-[1px] bg-white/5 my-2" />
                                    {arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.arguments?.length === 0 && (
                                        <div className="space-y-2 mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                            <label className="text-[8px] font-black uppercase text-red-500 tracking-widest block mb-2 text-center">Ghost Round Protocol</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['REPEAT', 'SKIP', 'END'].map(opt => (
                                                    <button 
                                                        key={opt}
                                                        onClick={() => socket.emit('declare-ghost-round', { arenaId: arena.id, option: opt })}
                                                        className="h-10 rounded-xl bg-red-500/20 border border-red-500/30 text-[8px] font-black uppercase hover:bg-red-500 transition-all text-red-500 hover:text-white"
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Lobby Banned Words (comma separated)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={bannedWordsInput}
                                                onChange={(e) => setBannedWordsInput(e.target.value)}
                                                placeholder="cursing, insults, etc..."
                                                className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-[10px] outline-none focus:border-red-500/50"
                                            />
                                            <button 
                                                onClick={handleUpdateBannedWords}
                                                className="px-4 h-10 bg-white/10 rounded-xl text-[8px] font-black uppercase hover:bg-white/20 transition-all"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Captain Controls */}
                        {myParticipant?.isCaptain && arena.status === 'ACTIVE' && (
                            <section className="p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/20 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Captain Command</h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleRequestPause('Captain Strategic Pause')}
                                        disabled={myParticipant.pauseRequestsUsed >= 2 || timer?.isPaused}
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-500/50 disabled:opacity-30 transition-all flex items-center gap-3 px-4"
                                    >
                                        <Timer size={16} className="text-yellow-500" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-black uppercase text-zinc-300">Request Pause</span>
                                            <span className="text-[8px] text-zinc-500 italic">{2 - myParticipant.pauseRequestsUsed} remaining</span>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        )}
                        {/* Argument Counter & Card Pool */}
                        {isDebater && arena.status === 'ACTIVE' && (
                            <div className="space-y-4">
                                <section className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Argument Minimum</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-black font-syne italic">
                                            {(timer?.teamArgumentCounts?.[myParticipant.team] || 0)} / 3
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${(timer?.teamArgumentCounts?.[myParticipant.team] || 0) >= 3 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                                    </div>
                                </section>
                                
                                {arena.cardsMode !== 'NONE' && (
                                    <button 
                                        onClick={() => setIsCardModalOpen(true)}
                                        className="w-full h-16 rounded-3xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] flex flex-col items-center justify-center group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap size={20} className="fill-white group-hover:scale-125 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Activate Strategic Card</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-white/60 uppercase mt-0.5">Use your earned points</span>
                                    </button>
                                )}
                            </div>
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
                                    <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center text-black ${isSuddenDeath ? 'bg-orange-600' : 'bg-red-500'}`}>
                                        <span className="text-[10px] font-black uppercase">{isSuddenDeath ? 'DEATH' : 'Round'}</span>
                                        <span className="text-2xl font-black leading-none">{isSuddenDeath ? '!' : arena.currentRound}</span>
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
                                ) : isJudge && arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'ANNOUNCING_SUBTOPIC' ? (
                                    <div className="max-w-3xl mx-auto space-y-6 text-center">
                                        <div className="inline-flex p-4 rounded-3xl bg-red-500/10 border border-red-500/20 mb-4">
                                            <MessageSquare size={32} className="text-red-500" />
                                        </div>
                                        <h3 className="text-2xl font-black font-syne uppercase italic tracking-tighter">Announce Round {arena.currentRound} Subtopic</h3>
                                        <div className="flex gap-4">
                                            <input 
                                                type="text"
                                                value={subtopic}
                                                onChange={(e) => setSubtopic(e.target.value)}
                                                placeholder="Enter a logical subset of the main theme..."
                                                className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-red-500/50 font-bold"
                                            />
                                            <button 
                                                onClick={handleAnnounceSubtopic}
                                                disabled={!subtopic.trim()}
                                                className="px-10 h-16 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                            >
                                                START ROUND
                                            </button>
                                        </div>
                                    </div>
                                ) : isJudge && arena.rounds.find((r: any) => r.roundNumber === arena.currentRound)?.status === 'EVALUATING' ? (
                                    <div className="max-w-5xl mx-auto space-y-8 bg-black/40 border border-white/10 rounded-[3rem] p-10 overflow-y-auto max-h-[60vh]">
                                        <div className="text-center space-y-2">
                                            <h3 className="text-3xl font-black font-syne uppercase tracking-tighter italic">Arbiter's Evaluation</h3>
                                            <p className="text-zinc-500 text-xs uppercase tracking-[0.3em]">Score each combatant based on Logic, Evidence, Counter-arguments, and Clarity.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {arena.participants.filter((p: any) => p.role === 'TEAM_A' || p.role === 'TEAM_B').map((p: any) => {
                                                const existingScore = roundScores.find(s => s.participantUserId === p.userId) || {
                                                    participantUserId: p.userId,
                                                    team: p.role,
                                                    logicScore: 0,
                                                    evidenceScore: 0,
                                                    counterScore: 0,
                                                    clarityScore: 0,
                                                    mediaBonusType: 'NONE'
                                                };

                                                const updateScore = (field: string, val: any) => {
                                                    const newScores = [...roundScores.filter(s => s.participantUserId !== p.userId), { ...existingScore, [field]: val }];
                                                    setRoundScores(newScores);
                                                };

                                                return (
                                                    <div key={p.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar src={p.user.avatar} username={p.user.username} size="sm" />
                                                            <span className="font-black italic text-sm">{p.user.username}</span>
                                                            <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest ${p.role === 'TEAM_A' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                                                                {p.role.replace('_', ' ')}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            {[
                                                                { label: 'Logic (+2/-2)', field: 'logicScore', min: -2, max: 2 },
                                                                { label: 'Evidence (+1/-1)', field: 'evidenceScore', min: -1, max: 1 },
                                                                { label: 'Counter (+1/-1)', field: 'counterScore', min: -1, max: 1 },
                                                                { label: 'Clarity (+1/-1)', field: 'clarityScore', min: -1, max: 1 },
                                                            ].map(item => (
                                                                <div key={item.field} className="space-y-2">
                                                                    <label className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{item.label}</label>
                                                                    <div className="flex gap-1">
                                                                        {Array.from({ length: item.max - item.min + 1 }, (_, i) => item.min + i).map(v => (
                                                                            <button 
                                                                                key={v}
                                                                                onClick={() => updateScore(item.field, v)}
                                                                                className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${existingScore[item.field] === v ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}
                                                                            >
                                                                                {v > 0 ? `+${v}` : v}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="pt-4 border-t border-white/5">
                                                            <label className="text-[8px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Media / Reference Bonus (Max 1)</label>
                                                            <div className="flex gap-2">
                                                                {[
                                                                    { label: 'None', val: 'NONE' },
                                                                    { label: 'Photo (+3)', val: 'PHOTO' },
                                                                    { label: 'Video (+4)', val: 'VIDEO' },
                                                                    { label: 'Ref (+5)', val: 'REFERENCE' },
                                                                ].map(btn => (
                                                                    <button 
                                                                        key={btn.val}
                                                                        onClick={() => updateScore('mediaBonusType', btn.val)}
                                                                        className={`flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border ${existingScore.mediaBonusType === btn.val ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/30'}`}
                                                                    >
                                                                        {btn.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col items-center gap-6 pt-6 border-t border-white/10">
                                            <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                                                Round {arena.currentRound} Point Cap: <span className="text-white">{[15, 20, 25, 30, 35][arena.currentRound - 1] || 35}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                {['TEAM_A', 'TEAM_B', 'DRAW'].map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => setWinnerTeamForRound(t as any)}
                                                        className={`px-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${winnerTeamForRound === t ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                                                    >
                                                        {t === 'DRAW' ? 'DECLARE TIE' : `WINNER: ${t.replace('_', ' ')}`}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => handleSubmitRoundScores(arena.rounds.find((r: any) => r.roundNumber === arena.currentRound).id)}
                                                className="w-full max-w-md h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                                            >
                                                BROADCAST ROUND RESULTS
                                            </button>
                                        </div>
                                    </div>
                                ) : isJudge && allRoundsCompleted ? (
                                    <div className="max-w-4xl mx-auto space-y-10 bg-black/60 border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                                        <div className="text-center space-y-4">
                                            <div className="inline-flex p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-2">
                                                <Award size={48} />
                                            </div>
                                            <h3 className="text-4xl font-black font-syne uppercase tracking-tighter italic">Final Judgement</h3>
                                            <p className="text-zinc-500 text-sm uppercase tracking-[0.3em]">The combat has concluded. Select the victors and render your final decree.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block">Declare Victor Team</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['TEAM_A', 'TEAM_B', 'DRAW'].map(t => (
                                                        <button 
                                                            key={t}
                                                            onClick={() => setVerdict({ ...verdict, winnerTeam: t as any })}
                                                            className={`h-20 rounded-[1.5rem] border font-black text-[10px] uppercase tracking-widest transition-all ${verdict.winnerTeam === t ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                                                        >
                                                            {t === 'DRAW' ? 'THE DEADLOCK' : t.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block">Arbiter's Rationale</label>
                                                    <textarea 
                                                        value={verdict.verdictText}
                                                        onChange={(e) => setVerdict({ ...verdict, verdictText: e.target.value })}
                                                        placeholder="Explain your decision and provide feedback to the combatants..."
                                                        className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm outline-none focus:border-yellow-500/50 transition-all resize-none italic leading-relaxed"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {/* MVP Award */}
                                                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.2em]">Select MVP</label>
                                                        <Trophy size={20} className="text-yellow-500" />
                                                    </div>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                        {arena.participants.filter((p: any) => p.role === 'TEAM_A' || p.role === 'TEAM_B').map((p: any) => (
                                                            <button 
                                                                key={p.userId}
                                                                onClick={() => setVerdict({ ...verdict, mvpUserId: p.userId })}
                                                                className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${verdict.mvpUserId === p.userId ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-white/5 border-white/10 text-white hover:border-white/30'}`}
                                                            >
                                                                <Avatar src={p.user.avatar} username={p.user.username} size="xs" />
                                                                <span className="font-black italic text-xs uppercase">{p.user.username}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Best Evidence (Chapter 28.3) */}
                                                <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Best Evidence (+3)</label>
                                                        <ShieldCheck size={18} className="text-blue-500" />
                                                    </div>
                                                    <select 
                                                        value={verdict.bestEvidenceUserId}
                                                        onChange={(e) => setVerdict({ ...verdict, bestEvidenceUserId: e.target.value })}
                                                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs font-bold"
                                                    >
                                                        <option value="">No Award This Debate</option>
                                                        {arena.participants.filter((p: any) => p.role === 'TEAM_A' || p.role === 'TEAM_B').map((p: any) => (
                                                            <option key={p.userId} value={p.userId}>{p.user.username}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Most Improved (Chapter 28.4) */}
                                                <div className="p-6 rounded-[2rem] bg-green-500/5 border border-green-500/10 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em]">Most Improved (+2)</label>
                                                        <Sparkles size={18} className="text-green-500" />
                                                    </div>
                                                    <select 
                                                        value={verdict.mostImprovedUserId}
                                                        onChange={(e) => setVerdict({ ...verdict, mostImprovedUserId: e.target.value })}
                                                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs font-bold"
                                                    >
                                                        <option value="">No Award This Debate</option>
                                                        {arena.participants.filter((p: any) => p.role === 'TEAM_A' || p.role === 'TEAM_B').map((p: any) => (
                                                            <option key={p.userId} value={p.userId}>{p.user.username}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleSubmitVerdict}
                                            disabled={!verdict.verdictText.trim()}
                                            className="w-full h-24 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-30 text-black font-black uppercase text-2xl tracking-tighter rounded-3xl transition-all shadow-[0_0_50px_rgba(234,179,8,0.3)] flex items-center justify-center gap-4"
                                        >
                                            REVEAL FINAL DECREE
                                            <Zap size={28} fill="black" />
                                        </button>
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

                                <div className="grid grid-cols-4 gap-4">
                                    {/* MVP */}
                                    <div className="p-6 rounded-[2rem] bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mb-2">Arena MVP (+5)</div>
                                        {arena.mvpUser ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar src={arena.mvpUser.avatar} username={arena.mvpUser.username} size="xs" />
                                                <div className="text-xs font-black text-white italic truncate w-full">{arena.mvpUser.username}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-zinc-600">UNASSIGNED</div>
                                        )}
                                    </div>

                                    {/* Best Evidence */}
                                    <div className="p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20">
                                        <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2">Evidence Award (+3)</div>
                                        {arena.participants.find((p: any) => p.userId === arena.bestEvidenceUserId) ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar src={arena.participants.find((p: any) => p.userId === arena.bestEvidenceUserId).user.avatar} username={arena.participants.find((p: any) => p.userId === arena.bestEvidenceUserId).user.username} size="xs" />
                                                <div className="text-xs font-black text-white italic truncate w-full">{arena.participants.find((p: any) => p.userId === arena.bestEvidenceUserId).user.username}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-zinc-600">UNASSIGNED</div>
                                        )}
                                    </div>

                                    {/* Most Improved */}
                                    <div className="p-6 rounded-[2rem] bg-green-500/10 border border-green-500/10">
                                        <div className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-2">Most Improved (+2)</div>
                                        {arena.participants.find((p: any) => p.userId === arena.mostImprovedUserId) ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar src={arena.participants.find((p: any) => p.userId === arena.mostImprovedUserId).user.avatar} username={arena.participants.find((p: any) => p.userId === arena.mostImprovedUserId).user.username} size="xs" />
                                                <div className="text-xs font-black text-white italic truncate w-full">{arena.participants.find((p: any) => p.userId === arena.mostImprovedUserId).user.username}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-zinc-600">UNASSIGNED</div>
                                        )}
                                    </div>

                                    {/* Lowest Performer */}
                                    <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20">
                                        <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-2">Lowest Rank (-5)</div>
                                        {arena.participants.find((p: any) => p.userId === arena.lowestPerformerUserId) ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar src={arena.participants.find((p: any) => p.userId === arena.lowestPerformerUserId).user.avatar} username={arena.participants.find((p: any) => p.userId === arena.lowestPerformerUserId).user.username} size="xs" />
                                                <div className="text-xs font-black text-white italic truncate w-full">{arena.participants.find((p: any) => p.userId === arena.lowestPerformerUserId).user.username}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-black text-zinc-600">UNASSIGNED</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-left space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Arena Individual Rankings</h4>
                                    <div className="space-y-3">
                                        {arena.participants.filter((p: any) => p.role === 'TEAM_A' || p.role === 'TEAM_B').sort((a: any, b: any) => {
                                            const aScore = arena.rounds.reduce((sum: number, r: any) => sum + (r.scores.find((s: any) => s.userId === a.userId)?.points || 0), 0);
                                            const bScore = arena.rounds.reduce((sum: number, r: any) => sum + (r.scores.find((s: any) => s.userId === b.userId)?.points || 0), 0);
                                            return bScore - aScore;
                                        }).map((p: any, idx: number) => {
                                            const score = arena.rounds.reduce((sum: number, r: any) => {
                                                const s = r.scores.find((s: any) => s.userId === p.userId);
                                                return sum + (s ? (s.logicScore + s.evidenceScore + s.counterScore + s.clarityScore + (s.mediaBonusPoints || 0)) : 0);
                                            }, 0);
                                            return (
                                                <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-lg font-black italic text-zinc-600 w-6">#{idx + 1}</span>
                                                        <Avatar src={p.user.avatar} username={p.user.username} size="xs" />
                                                        <span className="font-bold text-sm">{p.user.username}</span>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Base Points</div>
                                                            <div className="text-sm font-black text-white">{score}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Net Earned</div>
                                                            <div className="text-sm font-black text-yellow-500">
                                                                {score + (p.role === arena.winnerTeam ? 10 : (arena.winnerTeam === 'DRAW' ? 5 : 0)) + 
                                                                (arena.mvpUserId === p.userId ? 5 : 0) + 
                                                                (arena.bestEvidenceUserId === p.userId ? 3 : 0) + 
                                                                (arena.mostImprovedUserId === p.userId ? 2 : 0) - 
                                                                (arena.lowestPerformerUserId === p.userId ? 5 : 0)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setIsAppealModalOpen(true)}
                                        className="h-20 bg-zinc-800 text-white rounded-3xl font-black text-xl tracking-tighter hover:bg-zinc-700 transition-all active:scale-95 flex items-center justify-center gap-4"
                                    >
                                        FILE APPEAL
                                        <ShieldAlert size={24} className="text-red-500" />
                                    </button>
                                    <button 
                                        onClick={() => navigate('/anijudge')}
                                        className="h-20 bg-white text-black rounded-3xl font-black text-xl tracking-tighter hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-4"
                                    >
                                        EXIT TERMINAL
                                        <ArrowLeft size={24} />
                                    </button>
                                </div>
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

            <AnimatePresence>
                {timer?.isPaused && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                        <div className="flex flex-col items-center gap-8">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-32 h-32 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center shadow-[0_0_50px_rgba(255,59,59,0.3)]"
                            >
                                <X size={64} className="text-red-500" />
                            </motion.div>
                            <div className="text-center">
                                <h2 className="text-6xl font-syne font-black tracking-tight text-white uppercase mb-4 italic">Arena Suspended</h2>
                                <p className="text-zinc-500 font-bold uppercase tracking-[0.4em]">Protocol in progress · Waiting for Arbiter</p>
                            </div>
                            {isJudge && (
                                <button 
                                    onClick={handleResumeDebate}
                                    className="h-20 px-12 bg-white text-black font-black uppercase tracking-[0.3em] rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-4"
                                >
                                    <Play size={24} fill="currentColor" />
                                    Resume Combat
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Strategic Card Modal */}
            <AnimatePresence>
                {isCardModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="w-full max-w-4xl bg-[#0d0d0f] rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="p-10 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-600/10 to-transparent">
                                <div>
                                    <h3 className="text-3xl font-black font-syne uppercase italic tracking-tighter text-white">Strategic Card Pool</h3>
                                    <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-1">Cost is deducted from your individual arena points.</p>
                                </div>
                                <button onClick={() => setIsCardModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isDebater && [
                                    { type: 'FREEZE_DEBATERS', name: 'Freeze Debaters', cost: 10, desc: 'Block the opposing team from posting for 60 seconds.', icon: <Clock /> },
                                    { type: 'DOUBLE_POINTS', name: 'Double Points', cost: 15, desc: 'Double your points earned in the next round.', icon: <Trophy /> },
                                    { type: 'SKIP_SUBJECT', name: 'Skip Subject', cost: 8, desc: 'Force the Judge to pick a different subtopic.', icon: <X /> },
                                    { type: 'SHIELD', name: 'Shield', cost: 5, desc: 'Protects you from point deductions this round.', icon: <ShieldCheck /> },
                                    { type: 'STEAL', name: 'Steal', cost: 12, desc: 'Drain 2 points from an opponent to yourself.', icon: <Zap /> },
                                ].map(card => (
                                    <button 
                                        key={card.type}
                                        onClick={() => handleBuyCard(card.type)}
                                        disabled={(myParticipant?.pointsInArena || 0) < card.cost}
                                        className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-left space-y-6 hover:bg-white/[0.08] hover:border-white/20 transition-all group disabled:opacity-30 active:scale-95"
                                    >
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                            {card.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black font-syne text-white tracking-tight">{card.name}</h4>
                                            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{card.desc}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Cost</span>
                                            <span className="text-xl font-black font-syne text-red-500">{card.cost} PTS</span>
                                        </div>
                                    </button>
                                ))}

                                {isJudge && [
                                    { type: 'DOUBLE_ROUND', name: 'Double Round', cost: 10, desc: 'All points in this round are doubled (caps too).', icon: <Sparkles /> },
                                    { type: 'SILENCE_ROUND', name: 'Silence Round', cost: 12, desc: 'Disable all penalties for failure to meet minimums.', icon: <Ghost /> },
                                ].map(card => (
                                    <button 
                                        key={card.type}
                                        onClick={() => handleActivateJudgeCard(card.type)}
                                        className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 text-left space-y-6 hover:bg-red-500/10 transition-all group active:scale-95"
                                    >
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                            {card.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black font-syne text-white tracking-tight">{card.name}</h4>
                                            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{card.desc}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-red-500/10">
                                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Arbiter Cost</span>
                                            <span className="text-xl font-black font-syne text-red-500">{card.cost} PTS</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Halftime Card Activation Overlay */}
            <AnimatePresence>
                {isHalftimeOverlayOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
                    >
                        <div className="max-w-3xl w-full text-center space-y-12 p-12">
                            <motion.div 
                                animate={{ rotateY: [0, 360], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="w-40 h-40 mx-auto rounded-[2.5rem] bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-[0_0_100px_rgba(220,38,38,0.4)]"
                            >
                                <Zap size={80} fill="white" />
                            </motion.div>
                            
                            <div className="space-y-4">
                                <h2 className="text-6xl font-syne font-black tracking-tighter uppercase italic text-white leading-none">Halftime reached</h2>
                                <p className="text-zinc-500 text-xl font-medium tracking-tight">The Arbiter must now decide whether to activate the Strategic Card Pool.</p>
                                <p className="text-red-500 text-sm font-black uppercase tracking-[0.4em] animate-pulse">Activation Cost: 7 Judge Points</p>
                            </div>

                            {isJudge ? (
                                <div className="flex flex-col items-center gap-6">
                                    <button 
                                        onClick={handleActivateCards}
                                        className="h-24 px-16 bg-white text-black rounded-full font-black text-2xl tracking-tighter hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center gap-6"
                                    >
                                        ACTIVATE STRATEGIC LAYER
                                        <Plus size={32} />
                                    </button>
                                    <button 
                                        onClick={handleResumeDebate}
                                        className="text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Proceed Without Cards
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-1/2 animate-shimmer" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Awaiting Arbiter Sanction</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
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
            {/* Signal Modal (Book Five) */}
            <AnimatePresence>
                {isSignalModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSignalModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2.5rem] p-10 space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <div className="inline-flex p-4 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-2">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-2xl font-black font-syne uppercase italic tracking-tighter">Issue Behavioral Signal</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Issuing a signal to {selectedUserForSignal?.user?.username}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Signal Type</label>
                                    <div className="flex gap-2">
                                        {['YELLOW', 'RED', 'GREEN'].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => setSignalForm({ ...signalForm, type: t as any })}
                                                className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase transition-all border ${signalForm.type === t ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Reason / Violation Details</label>
                                    <textarea 
                                        value={signalForm.reason}
                                        onChange={(e) => setSignalForm({ ...signalForm, reason: e.target.value })}
                                        placeholder="Explain why this signal is being issued..."
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-yellow-500/50 resize-none"
                                    />
                                </div>

                                <button 
                                    onClick={handleIssueSignal}
                                    className="w-full h-16 bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                                >
                                    BROADCAST SIGNAL
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Appeal Modal (Book Eight) */}
            <AnimatePresence>
                {isAppealModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-2">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Official Decree Appeal</h2>
                                    <p className="text-zinc-500 text-sm font-medium">Citing Book Eight, Chapter 31. Appeals are monitored by NAKAMA High Command.</p>
                                </div>

                                <form className="space-y-6" onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    try {
                                        const response = await fetch(`${API_URL}/anijudge/appeals`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                            },
                                            body: JSON.stringify({
                                                arenaId: arena.id,
                                                reason: formData.get('reason'),
                                                ruleViolated: formData.get('ruleViolated'),
                                                description: formData.get('description'),
                                                desiredOutcome: formData.get('desiredOutcome'),
                                                evidenceUrls: [formData.get('evidenceUrl')].filter(Boolean)
                                            })
                                        });
                                        if (response.ok) {
                                            setIsAppealModalOpen(false);
                                            alert('Appeal transmitted. Review window: 72 hours.');
                                        } else {
                                            const err = await response.json();
                                            alert(err.message || 'Transmission failure');
                                        }
                                    } catch (err) {
                                        alert('Network error');
                                    }
                                }}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Reason Category</label>
                                            <select name="reason" required className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-colors appearance-none">
                                                <option value="INCORRECT_POINTS">Incorrect Points</option>
                                                <option value="BIAS">Judge Bias</option>
                                                <option value="IGNORED_EVIDENCE">Ignored Evidence</option>
                                                <option value="PROCEDURAL_ERROR">Procedural Error</option>
                                                <option value="FALSE_SIGNAL">False Signal</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Rule Citation</label>
                                            <input name="ruleViolated" required placeholder="e.g. Book 3, 8.3" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Incident Description</label>
                                        <textarea name="description" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-colors resize-none" placeholder="Provide precise context..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Desired Outcome</label>
                                        <input name="desiredOutcome" required placeholder="Desired adjustment..." className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-colors" />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setIsAppealModalOpen(false)} className="flex-1 h-16 rounded-2xl font-black text-sm uppercase tracking-widest bg-zinc-900 text-zinc-400 hover:text-white transition-colors">Abort</button>
                                        <button type="submit" className="flex-[2] h-16 rounded-2xl font-black text-sm uppercase tracking-widest bg-red-600 text-white hover:bg-red-500 shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all">Submit Appeal</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
