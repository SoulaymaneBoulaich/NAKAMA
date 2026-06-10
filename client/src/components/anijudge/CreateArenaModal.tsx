import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Swords, Target, Clock, Trophy, Users, Shield, Zap, Sparkles, ChevronLeft, ChevronRight, ArrowRight, Lock, Eye, CreditCard, Vote, ListFilter } from 'lucide-react';
import { getTopAnime } from '../../api/jikan';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CreateArenaModalProps {
    onClose: () => void;
}

export const CreateArenaModal = ({ onClose }: CreateArenaModalProps) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [roundCount, setRoundCount] = useState(3);
    const [timeLimitPerRound, setTimeLimitPerRound] = useState(120);
    const [totalTimeLimit, setTotalTimeLimit] = useState(600);
    const [maxDebaters, setMaxDebaters] = useState(6);
    const [format, setFormat] = useState<'TEAMS' | 'INDIVIDUALS'>('TEAMS');
    const [isPublic, setIsPublic] = useState(true);
    const [cardsAllowed, setCardsAllowed] = useState(false);
    const [canPurchaseCards, setCanPurchaseCards] = useState(false);
    const [audienceVoting, setAudienceVoting] = useState(false);
    const [turnOrderMode, setTurnOrderMode] = useState<'SIMULTANEOUS' | 'TURN_BASED'>('TURN_BASED');
    const [bannedWords, setBannedWords] = useState('');
    const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(3);
    const [loading, setLoading] = useState(false);
    const [animeGallery, setAnimeGallery] = useState<any[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const data = await getTopAnime('bypopularity', 12);
                setAnimeGallery(data);
            } catch (err) {
                console.error('Error fetching anime for gallery:', err);
            }
        };
        fetchAnime();
    }, []);

    const handleCreate = async () => {
        if (!title || !topic) return;
        
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/anijudge`, {
                title,
                topic,
                roundCount,
                timeLimitPerRound,
                totalTimeLimit,
                maxDebaters,
                format,
                isPublic,
                cardsAllowed,
                canPurchaseCards,
                audienceVoting,
                turnOrderMode,
                bannedWords: bannedWords.split(',').map(w => w.trim()).filter(w => w)
            }, { withCredentials: true });
            
            navigate(`/anijudge/arena/${res.data.code}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
            <div className="w-full max-w-4xl bg-[#0d0d0f] rounded-[2.5rem] border border-white/10 overflow-hidden relative shadow-[0_0_100px_rgba(255,59,59,0.1)] flex flex-col my-auto">
                
                {/* Header Backdrop Image (Dynamic from Carousel selection?) */}
                <div className="h-48 bg-gradient-to-b from-red-500/20 to-[#0d0d0f] relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Swords size={120} className="text-white/5" />
                    </div>
                    <div className="absolute top-8 left-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                                <Swords size={24} className="text-black" />
                            </div>
                            <h2 className="text-4xl font-syne font-black tracking-tight text-white uppercase">Initialize Arena</h2>
                        </div>
                        <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Protocol V4.2 · Secure Connection Established</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="absolute top-8 right-8 w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-red-500 transition-all text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Left Side: Basic Info */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Shield size={12} className="text-red-500" />
                                Arena Designation
                            </label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., THE ULTIMATE SHONEN CLASH"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-bold tracking-tight outline-none focus:border-red-500/50 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Target size={12} className="text-red-500" />
                                The core topic / question
                            </label>
                            <textarea 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="State the question to be settled by the judge..."
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 font-medium leading-relaxed outline-none focus:border-red-500/50 transition-all text-white placeholder:text-zinc-600 resize-none"
                            />
                        </div>

                        {/* Jikan Carousel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <Sparkles size={12} className="text-yellow-500" />
                                    Visual Inspiration
                                </label>
                                <div className="flex gap-1">
                                    <button onClick={() => scroll('left')} className="p-1 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                                    <button onClick={() => scroll('right')} className="p-1 hover:text-white transition-colors"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            <div ref={carouselRef} className="flex gap-4 overflow-x-hidden pb-2 scroll-smooth">
                                {animeGallery.map((anime) => (
                                    <div key={anime.mal_id} className="w-24 h-36 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all cursor-pointer">
                                        <img src={anime.images.jpg.image_url} alt={anime.title} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {animeGallery.length === 0 && [1,2,3,4].map(i => <div key={i} className="w-24 h-36 flex-shrink-0 rounded-xl bg-white/5 animate-pulse" />)}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Configuration */}
                    <div className="space-y-8">
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <Trophy size={12} className="text-red-500" />
                                    Rounds
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[3, 4, 5].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setRoundCount(num)}
                                            className={`h-12 rounded-xl border transition-all font-black ${roundCount === num ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                    <Users size={12} className="text-red-500" />
                                    Format
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['TEAMS', 'INDIVIDUALS'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => setFormat(f as any)}
                                            className={`h-12 rounded-xl border transition-all font-black text-[10px] tracking-tighter ${format === f ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Clock size={12} className="text-red-500" />
                                Turn Time Limit (Seconds)
                            </label>
                            <input 
                                type="range" 
                                min="30" 
                                max="300" 
                                step="30"
                                value={timeLimitPerRound}
                                onChange={(e) => setTimeLimitPerRound(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <div className="flex justify-between font-mono text-xs text-zinc-500">
                                <span>30s</span>
                                <span className="text-white font-bold">{timeLimitPerRound}s</span>
                                <span>300s</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Zap size={12} className="text-red-500" />
                                Max Debaters
                            </label>
                            <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                                {[2, 4, 6, 8, 10, 12].map(num => (
                                    <button 
                                        key={num}
                                        onClick={() => setMaxDebaters(num)}
                                        className={`flex-1 h-10 rounded-xl transition-all font-bold text-sm ${maxDebaters === num ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rules Preview */}
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setIsPublic(true)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isPublic ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                            >
                                <Eye size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Public</span>
                            </button>
                            <button 
                                onClick={() => setIsPublic(false)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${!isPublic ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                            >
                                <Lock size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Private</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setTurnOrderMode('SIMULTANEOUS')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${turnOrderMode === 'SIMULTANEOUS' ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                            >
                                <Zap size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-left">Simultaneous<br/><span className="opacity-50 lowercase">Speed mode</span></span>
                            </button>
                            <button 
                                onClick={() => setTurnOrderMode('TURN_BASED')}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${turnOrderMode === 'TURN_BASED' ? 'bg-white border-white text-black' : 'border-white/10 text-zinc-500 hover:border-white/30'}`}
                            >
                                <ListFilter size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-left">Turn-Based<br/><span className="opacity-50 lowercase">Tactical mode</span></span>
                            </button>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6">
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                     <CreditCard size={14} className="text-red-500" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Rule Modifiers</span>
                                 </div>
                             </div>
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-bold text-zinc-400">Cards Enabled</span>
                                     <button onClick={() => setCardsAllowed(!cardsAllowed)} className={`w-12 h-6 rounded-full transition-all relative ${cardsAllowed ? 'bg-red-500' : 'bg-zinc-800'}`}>
                                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${cardsAllowed ? 'left-7' : 'left-1'}`} />
                                     </button>
                                 </div>
                                 {cardsAllowed && (
                                     <div className="flex items-center justify-between pl-4">
                                         <span className="text-[10px] font-bold text-zinc-400 italic">Allow purchasing cards?</span>
                                         <button onClick={() => setCanPurchaseCards(!canPurchaseCards)} className={`w-12 h-6 rounded-full transition-all relative ${canPurchaseCards ? 'bg-red-500' : 'bg-zinc-800'}`}>
                                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${canPurchaseCards ? 'left-7' : 'left-1'}`} />
                                         </button>
                                     </div>
                                 )}
                                 <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-bold text-zinc-400">Audience Voting</span>
                                     <button onClick={() => setAudienceVoting(!audienceVoting)} className={`w-12 h-6 rounded-full transition-all relative ${audienceVoting ? 'bg-red-500' : 'bg-zinc-800'}`}>
                                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${audienceVoting ? 'left-7' : 'left-1'}`} />
                                     </button>
                                 </div>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <Shield size={12} className="text-red-500" />
                                Banned Words (Comma separated)
                            </label>
                            <input 
                                type="text"
                                value={bannedWords}
                                onChange={(e) => setBannedWords(e.target.value)}
                                placeholder="e.g., mid, garbage, mid-diff"
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold outline-none focus:border-red-500/50 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <button 
                            onClick={handleCreate}
                            disabled={loading || !title || !topic}
                            className="w-full h-16 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-red-600 text-white font-black tracking-[0.2em] rounded-3xl transition-all shadow-[0_0_40px_rgba(255,59,59,0.2)] active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    OPENING FREQUENCY...
                                </>
                            ) : (
                                <>
                                    COMMENCE DEBATE
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
