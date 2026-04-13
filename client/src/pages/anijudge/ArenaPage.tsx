import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trophy, Check, Clock, Send, 
  UserPlus, ShieldCheck, ArrowLeft, Hash
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import { UserSearchModal } from '../../components/common/UserSearchModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ArenaPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [arena, setArena] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [argument, setArgument] = useState('');
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [verdict, setVerdict] = useState({ winnerTeam: 'TEAM_A', verdictText: '' });
  const [judgeQuestion, setJudgeQuestion] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArena();
  }, [code]);

  useEffect(() => {
    if (socket && code && user) {
      socket.emit('join-arena', { code, userId: user.id, team: 'TEAM_A' }); // Default join as Team A slot if just opening

      socket.on('arena-updated', (updatedArena: any) => {
        setArena(updatedArena);
      });

      socket.on('debate-started', (updatedArena: any) => {
        setArena(updatedArena);
      });

      socket.on('timer-tick', (data: any) => {
        setTimer(data);
      });

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

      socket.on('debate-ended', (updatedArena: any) => {
          setArena(updatedArena);
      });

      return () => {
        socket.off('arena-updated');
        socket.off('debate-started');
        socket.off('timer-tick');
        socket.off('argument-submitted');
        socket.off('new-round-started');
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

  const copyCode = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinTeam = (team: string) => {
      socket?.emit('join-arena', { code, userId: user?.id, team });
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

  if (loading || !arena) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-red-500">IGNITING ARENA...</div>;

  const myParticipant = arena.participants.find((p: any) => p.userId === user?.id);
  const isHost = arena.hostId === user?.id;
  const isJudge = arena.judgeId === user?.id;
  const currentRound = arena.rounds?.find((r: any) => r.roundNumber === arena.currentRound) || arena.rounds?.[arena.rounds.length - 1];
  const isMyTurn = arena.status === 'ACTIVE' && timer?.activeTeam === myParticipant?.team;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between px-6 sticky top-0 z-50">
        <button onClick={() => navigate('/anijudge')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">BACK TO HUB</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-bold tracking-widest text-[var(--text-secondary)] opacity-50 uppercase">ARENA TOPIC</h2>
          <p className="text-sm font-bold truncate max-w-[400px]">{arena.topic}</p>
        </div>
        <div className="flex items-center gap-4">
           {arena.status === 'ACTIVE' && timer && (
               <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all ${timer.secondsRemaining < 10 ? 'bg-red-600/20 border-red-500 animate-pulse' : 'bg-black/20 border-[var(--border-color)]'}`}>
                    <Clock size={16} className={timer.secondsRemaining < 10 ? 'text-red-500' : 'text-blue-400'} />
                    <span className={`font-mono text-xl font-bold ${timer.secondsRemaining < 10 ? 'text-red-500' : 'text-white'}`}>
                        {Math.floor(timer.secondsRemaining / 60)}:{(timer.secondsRemaining % 60).toString().padStart(2, '0')}
                    </span>
               </div>
           )}
           <button onClick={copyCode} className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--border-secondary)] transition-all">
             {copied ? <Check size={16} className="text-green-500" /> : <Hash size={16} className="text-red-500" />}
             <span className="font-mono font-bold tracking-widest">{code}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto h-full">
            
            {/* LOBBY STATE */}
            {arena.status === 'WAITING' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 glass-card rounded-3xl border border-[var(--border-color)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
                    
                    {/* Team A */}
                    <TeamColumn 
                        title="Team Alpha" 
                        team="TEAM_A" 
                        participants={arena.participants.filter((p: any) => p.team === 'TEAM_A')}
                        onJoin={() => handleJoinTeam('TEAM_A')}
                        isMember={myParticipant?.team === 'TEAM_A'}
                    />

                    {/* Judge Center */}
                    <div className="flex flex-col items-center justify-center p-8 bg-red-950/10 rounded-2xl border border-red-900/10 gap-6">
                        <ShieldCheck size={48} className="text-red-500" />
                        <div className="text-center">
                            <h3 className="text-xl font-bold uppercase mb-2">Grand Arbiter</h3>
                            {arena.judge ? (
                                <div className="flex flex-col items-center gap-2">
                                    <img src={arena.judge.avatar || '/default-avatar.png'} className="w-16 h-16 rounded-full border-4 border-red-900/30" alt="" />
                                    <span className="font-bold">{arena.judge.username}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-secondary)] italic">Awaiting a judge...</p>
                            )}
                        </div>
                        
                        {isHost && !arena.judgeId && (
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                            >
                                ASSIGN JUDGE
                            </button>
                        )}

                        <div className="mt-8 w-full space-y-4">
                            <button 
                                onClick={handleStartDebate}
                                disabled={!isHost || !arena.judgeId || arena.participants.length < 3}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-900/20"
                            >
                                BEGIN CONFLICT
                            </button>
                            {!isHost && (
                                <p className="text-[10px] text-center uppercase tracking-widest opacity-50">Only the host can start the debate</p>
                            )}
                        </div>
                    </div>

                    {/* Team B */}
                    <TeamColumn 
                        title="Team Omega" 
                        team="TEAM_B" 
                        participants={arena.participants.filter((p: any) => p.team === 'TEAM_B')}
                        onJoin={() => handleJoinTeam('TEAM_B')}
                        isMember={myParticipant?.team === 'TEAM_B'}
                    />
                </div>
            )}

            {/* ACTIVE STATE */}
            {arena.status === 'ACTIVE' && (
                <div className="flex flex-col h-full gap-6">
                    {/* Round Header */}
                    <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-600 text-white font-bold py-1 px-4 rounded-lg text-lg">
                                ROUND {arena.currentRound} / {arena.roundCount}
                            </div>
                            <h3 className="text-xl font-bold italic opacity-90">
                                {currentRound?.judgeQuestion ? `"${currentRound.judgeQuestion}"` : "Awaiting judge's inquiry..."}
                            </h3>
                        </div>
                        <div className="flex -space-x-3">
                            {arena.participants.map((p: any) => (
                                <img key={p.id} src={p.user.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-full border-2 border-black" title={p.user.username} />
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
                        {/* Team A Arguments */}
                        <ArgumentColumn 
                            team="TEAM_A" 
                            isActive={timer?.activeTeam === 'TEAM_A'}
                            arguments={arena.rounds.flatMap((r: any) => r.arguments).filter((a: any) => a.team === 'TEAM_A')}
                        />
                        {/* Team B Arguments */}
                        <ArgumentColumn 
                            team="TEAM_B" 
                            isActive={timer?.activeTeam === 'TEAM_B'}
                            arguments={arena.rounds.flatMap((r: any) => r.arguments).filter((a: any) => a.team === 'TEAM_B')}
                        />
                         <div ref={scrollRef} />
                    </div>

                    {/* Control Input */}
                    <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-2xl shadow-black/50">
                        {isMyTurn ? (
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <textarea 
                                        value={argument}
                                        onChange={(e) => setArgument(e.target.value)}
                                        placeholder="Formulate your argument..."
                                        className="w-full bg-black/40 border-2 border-red-500/50 rounded-xl px-4 py-3 min-h-[100px] outline-none transition-all resize-none shadow-glow font-medium"
                                        maxLength={1000}
                                    />
                                    <div className={`absolute bottom-3 right-4 text-xs font-bold ${argument.length > 900 ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
                                        {argument.length}/1000
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSubmitArgument}
                                    disabled={!argument.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    SUBMIT
                                </button>
                            </div>
                        ) : isJudge && !timer?.activeTeam ? (
                            arena.currentRound < arena.roundCount ? (
                                <div className="flex gap-4">
                                    <input 
                                        type="text"
                                        value={judgeQuestion}
                                        onChange={(e) => setJudgeQuestion(e.target.value)}
                                        placeholder="Pose a question for the next round..."
                                        className="flex-1 bg-black/40 border-2 border-blue-500/50 rounded-xl px-6 py-4 outline-none font-bold"
                                    />
                                    <button 
                                        onClick={handleSubmitQuestion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 rounded-xl"
                                    > NEXT ROUND </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-center">
                                      <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-widest">Final Verdict Phase</h3>
                                      <p className="text-[var(--text-secondary)]">The debate has concluded. It is time to render your judgment.</p>
                                    </div>
                                    <div className="flex gap-4 w-full max-w-2xl">
                                        <select 
                                            value={verdict.winnerTeam}
                                            onChange={(e) => setVerdict({...verdict, winnerTeam: e.target.value})}
                                            className="bg-[var(--bg-tertiary)] text-white font-bold px-4 py-3 rounded-xl border border-[var(--border-color)] outline-none"
                                        >
                                            <option value="TEAM_A">TEAM ALPHA WON</option>
                                            <option value="TEAM_B">TEAM OMEGA WON</option>
                                            <option value="DRAW">IT IS A DRAW</option>
                                        </select>
                                        <input 
                                            type="text"
                                            value={verdict.verdictText}
                                            onChange={(e) => setVerdict({...verdict, verdictText: e.target.value})}
                                            placeholder="Explain your reasoning..."
                                            className="flex-1 bg-black/40 border-2 border-yellow-500/30 rounded-xl px-4 outline-none"
                                        />
                                        <button 
                                            onClick={handleSubmitVerdict}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 rounded-xl"
                                        > FINALIZE </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-4 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                    <Clock size={16} className="animate-spin" />
                                    <span className="font-bold tracking-widest italic opacity-50 uppercase">
                                        {timer?.activeTeam === 'TEAM_A' ? "Alpha is speaking..." : 
                                         timer?.activeTeam === 'TEAM_B' ? "Omega is speaking..." : 
                                         "Awaiting judge's interaction..."}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* COMPLETED STATE */}
            {arena.status === 'COMPLETED' && (
                <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="glass-card p-12 rounded-3xl border border-yellow-500/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-yellow-950/10 to-transparent">
                        <Trophy size={80} className="mx-auto text-yellow-500 animate-bounce" />
                        <div>
                            <h1 className="text-5xl font-black font-[var(--font-syne)] uppercase tracking-tighter mb-2">
                                {arena.winnerTeam === 'DRAW' ? "The Dust Settles: A Draw" : 
                                 arena.winnerTeam === 'TEAM_A' ? "Victory for Alpha" : "Victory for Omega"}
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)] font-bold">
                                <span>VERDICT RENDERED BY</span>
                                <span className="text-blue-400">{arena.judge?.username}</span>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto p-6 bg-black/40 rounded-2xl border border-yellow-500/20 italic text-xl leading-relaxed">
                            "{arena.verdictText}"
                        </div>

                        <div className="pt-8 flex justify-center gap-4">
                            <button 
                                onClick={() => navigate('/anijudge')}
                                className="bg-[var(--bg-tertiary)] hover:bg-white hover:text-black font-bold px-10 py-4 rounded-xl transition-all"
                            > RETURN TO HUB </button>
                        </div>
                    </div>

                    <div className="space-y-6 opacity-60">
                         <h3 className="text-center font-bold uppercase tracking-widest text-[var(--text-secondary)]">DEBATE ARCHIVE</h3>
                         {arena.rounds.map((round: any) => (
                             <div key={round.id} className="space-y-4">
                                 <div className="text-center py-2 bg-[var(--bg-secondary)] rounded-lg text-sm font-bold border border-[var(--border-color)]">
                                     ROUND {round.roundNumber} - "{round.judgeQuestion}"
                                 </div>
                                 <div className="grid grid-cols-2 gap-6">
                                     {round.arguments.map((arg: any) => (
                                         <div key={arg.id} className={`p-4 rounded-xl border ${arg.team === 'TEAM_A' ? 'bg-blue-900/10 border-blue-900/20 col-start-1' : 'bg-red-900/10 border-red-900/20 col-start-2'}`}>
                                            <p className="text-sm">{arg.content}</p>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>
            )}

        </div>
      </div>

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

const TeamColumn = ({ title, team, participants, onJoin, isMember }: any) => {
    const slots = [0, 1, 2];
    return (
        <div className="flex flex-col gap-6">
            <h3 className={`text-xl font-bold uppercase ${team === 'TEAM_A' ? 'text-blue-500 text-left' : 'text-red-500 text-right'}`}>{title}</h3>
            <div className="space-y-4">
                {slots.map(i => {
                    const p = participants[i];
                    return (
                        <div key={i} className={`h-20 rounded-2xl border-2 border-dashed flex items-center px-4 gap-4 transition-all ${p ? 'bg-black/40 border-transparent shadow-inner' : 'border-[var(--border-color)]'}`}>
                            {p ? (
                                <>
                                    <img src={p.user.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-xl" alt="" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm truncate">{p.user.username}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase">CONTRIBUTOR</p>
                                    </div>
                                </>
                            ) : (
                                !isMember && (
                                    <button 
                                        onClick={onJoin}
                                        className="w-full h-full flex items-center justify-center gap-2 text-xs font-bold opacity-30 hover:opacity-100 hover:text-red-500 transition-all uppercase tracking-widest"
                                    >
                                        <UserPlus size={16} /> CLOUD SLOT {i+1}
                                    </button>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ArgumentColumn = ({ team, isActive, arguments: args }: any) => (
    <div className={`flex flex-col gap-4 rounded-2xl p-4 transition-all border-2 ${
        isActive ? 'bg-red-950/20 border-red-500/50' : 'bg-black/10 border-transparent'
    }`}>
        <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${team === 'TEAM_A' ? 'text-blue-500' : 'text-red-500'}`}>
                {team === 'TEAM_A' ? 'ALPHA CHANNEL' : 'OMEGA CHANNEL'}
            </span>
            {isActive && <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping" /><span className="text-[10px] font-black uppercase text-red-500">LIVE</span></div>}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {args.map((a: any) => (
                <div key={a.id} className={`p-4 rounded-2xl ${team === 'TEAM_A' ? 'bg-blue-600/10 border border-blue-600/20 text-blue-100' : 'bg-red-600/10 border border-red-600/20 text-red-100'} animate-in fade-in slide-in-from-bottom-2`}>
                   <div className="flex items-center gap-2 mb-2">
                        <img src={a.user.avatar || '/default-avatar.png'} className="w-5 h-5 rounded-full" />
                        <span className="text-[10px] font-bold opacity-60 uppercase">{a.user.username}</span>
                   </div>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{a.content}</p>
                </div>
            ))}
        </div>
    </div>
);
