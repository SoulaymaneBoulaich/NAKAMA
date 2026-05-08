import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swords, Trophy, Play, Search, Hash, History, Medal, Target, Shield, Info, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { CreateArenaModal } from '../../components/anijudge/CreateArenaModal';
import { useAuth } from '../../context/AuthContext';
import './AniJudge.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ParticleCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas!.width) this.x = 0;
                if (this.x < 0) this.x = canvas!.width;
                if (this.y > canvas!.height) this.y = 0;
                if (this.y < 0) this.y = canvas!.height;
            }
            draw() {
                ctx!.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
};

export const AniJudgeHome = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [joinCode, setJoinCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hallOfFame, setHallOfFame] = useState([]);
    const [myRecords, setMyRecords] = useState<any>(null);
    const [liveArenas, setLiveArenas] = useState([]);
    const [activeTab, setActiveTab] = useState<'fame' | 'records' | 'rules'>('fame');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHallOfFame();
        fetchMyRecords();
        fetchLiveArenas();
    }, []);

    const fetchHallOfFame = async () => {
        try {
            const res = await axios.get(`${API_URL}/anijudge/hall-of-fame`);
            setHallOfFame(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRecords = async () => {
        try {
            const res = await axios.get(`${API_URL}/anijudge/my-records`, { withCredentials: true });
            setMyRecords(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLiveArenas = async () => {
        try {
            const res = await axios.get(`${API_URL}/anijudge/live`);
            setLiveArenas(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = () => {
        if (joinCode.length === 8) {
            navigate(`/anijudge/arena/${joinCode.toUpperCase()}`);
        }
    };

    return (
        <div className="anijudge-root min-h-screen bg-[#0a0a0c] text-[#e1e1e6] font-dm-sans overflow-x-hidden relative">
            <ParticleCanvas />

            {/* Layout Wrapper */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
                
                {/* Hero Section */}
                <header className="mb-20">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Live Arena Access Granted
                        </div>
                        <h1 className="text-7xl md:text-9xl font-syne font-black tracking-tighter leading-[0.8] mb-8 bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                            ANI<br/>JUDGE
                        </h1>
                        <p className="max-w-xl text-lg text-zinc-400 font-medium leading-relaxed mb-12">
                            The terminal of absolute truth. Execute your arguments, withstand the judgment, and ascend to the legendary Hall of Fame.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto flex-1 bg-white text-black font-bold h-14 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95"
                            >
                                <Swords size={20} />
                                CREATE ARENA
                            </button>
                            <div className="relative w-full sm:w-auto flex-[1.5] group">
                                <input 
                                    type="text" 
                                    placeholder="8-CHARACTER CODE"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 font-mono text-lg tracking-[0.3em] outline-none focus:border-red-500/50 transition-all"
                                />
                                <button 
                                    onClick={handleJoin}
                                    className="absolute right-2 top-2 h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Stats & Nav */}
                    <div className="lg:col-span-4 space-y-12">
                        
                        {/* Profile Summary */}
                        {myRecords && (
                            <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10">
                                        <img src={user?.avatar || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold font-syne">{user?.username}</h3>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Level {Math.floor((myRecords.stats?.totalPoints || 0) / 100) + 1} Elite</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-black font-syne">{myRecords.stats?.wins || 0}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Wins</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black font-syne">{myRecords.stats?.totalPoints || 0}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Points</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black font-syne">{myRecords.stats?.winStreak || 0}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Streak</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-medium leading-relaxed italic text-red-200">
                                    <span className="font-bold uppercase not-italic block mb-1 tracking-tighter">AI COACH:</span>
                                    "{myRecords.recommendation}"
                                </div>
                            </section>
                        )}

                        {/* Navigation Tabs */}
                        <nav className="flex flex-col gap-2">
                            <button 
                                onClick={() => setActiveTab('fame')}
                                className={`h-16 px-8 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'fame' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <Trophy size={20} />
                                <span className="font-bold tracking-tight">Hall of Fame</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('records')}
                                className={`h-16 px-8 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'records' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <History size={20} />
                                <span className="font-bold tracking-tight">Personal Records</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('rules')}
                                className={`h-16 px-8 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'rules' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <Shield size={20} />
                                <span className="font-bold tracking-tight">The Code of Honor</span>
                            </button>
                        </nav>

                        {/* Live Now */}
                        {liveArenas.length > 0 && (
                            <section>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    Live Terminals
                                </h4>
                                <div className="space-y-3">
                                    {liveArenas.map((arena: any) => (
                                        <button 
                                            key={arena.id}
                                            onClick={() => navigate(`/anijudge/arena/${arena.code}`)}
                                            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all flex items-center justify-between group"
                                        >
                                            <div className="text-left">
                                                <div className="font-bold text-sm line-clamp-1">{arena.title}</div>
                                                <div className="text-[10px] font-mono text-zinc-500">{arena.code} · {arena._count.participants} Participating</div>
                                            </div>
                                            <Play size={16} className="text-zinc-600 group-hover:text-red-500 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Dynamic Content */}
                    <div className="lg:col-span-8">
                        {activeTab === 'fame' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-4xl font-syne font-black tracking-tight">THE HALL OF FAME</h2>
                                    <Star size={32} className="text-yellow-500 opacity-20" />
                                </div>
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />)}
                                    </div>
                                ) : hallOfFame.length === 0 ? (
                                    <div className="h-80 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-500">
                                        <Info size={40} className="mb-4 opacity-20" />
                                        <p className="font-medium tracking-tight">Legends haven't ascended yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {hallOfFame.map((user: any) => (
                                            <div key={user.id} className="relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/[0.07] transition-all group overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <Trophy size={120} />
                                                </div>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden">
                                                        <img src={user.user.avatar || '/default-avatar.png'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold font-syne">{user.user.username}</h3>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{user.user.equippedBackground || 'Rogue Debater'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <div className="text-3xl font-black font-syne text-white">{user.totalPoints}</div>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Global Score</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black font-syne text-red-500">{user.bestWinStreak}</div>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Peak Streak</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'records' && (
                            <section className="space-y-6">
                                <h2 className="text-4xl font-syne font-black tracking-tight mb-8">MY HISTORY</h2>
                                {myRecords?.records.length === 0 ? (
                                    <div className="h-80 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-500 text-center px-10">
                                        <History size={40} className="mb-4 opacity-20" />
                                        <p className="font-medium tracking-tight mb-4">No records found in the central repository.</p>
                                        <button onClick={() => setIsModalOpen(true)} className="text-red-500 font-bold text-xs uppercase tracking-widest">Initialize First Debate</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myRecords?.records.map((record: any) => (
                                            <div key={record.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${record.result === 'WIN' ? 'bg-green-500/20 text-green-500' : record.result === 'LOSS' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-500/20 text-zinc-400'}`}>
                                                        {record.result === 'WIN' ? <Medal size={24} /> : record.result === 'LOSS' ? <Target size={24} /> : <History size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold tracking-tight">{record.arena.title}</div>
                                                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{record.role} · {new Date(record.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xl font-black font-syne ${record.netPoints >= 0 ? 'text-white' : 'text-red-500'}`}>
                                                        {record.netPoints > 0 ? `+${record.netPoints}` : record.netPoints}
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Exp Earned</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'rules' && (
                            <section className="space-y-12">
                                <h2 className="text-4xl font-syne font-black tracking-tight mb-8">THE CODE OF HONOR</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                        <h3 className="text-lg font-bold mb-4 text-red-500">I. The Judge's Word</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">The judge is the absolute authority. Their verdicts are final and must be respected. Disputing a judge's decision in a toxic manner will lead to an immediate ban.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                        <h3 className="text-lg font-bold mb-4 text-red-500">II. Intellectual Integrity</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">Arguments must be backed by evidence (scans, timestamped clips, or official databooks). Circular reasoning and ad hominem attacks will result in point penalties.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                        <h3 className="text-lg font-bold mb-4 text-red-500">III. Time Discipline</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">Each turn is restricted by the terminal clock. Failure to submit within the time limit results in a forfeit of that round. Efficiency is key.</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                        <h3 className="text-lg font-bold mb-4 text-red-500">IV. Respect the Arena</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">We debate pixels, not people. Keep the competitive fire high but the personal respect higher. No slurs, no harassment, no exceptions.</p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {isModalOpen && (
                <CreateArenaModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};
