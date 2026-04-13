import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Users, MessageSquare, Send, 
  Settings, Volume2, Maximize, ChevronRight
} from 'lucide-react';
import socket from '../api/socket';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';

const WatchPartyRoom: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Room State
    const [participants, setParticipants] = useState<any[]>([]);
    const [chat, setChat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [party, setParty] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [isReady, setIsReady] = useState(false);
    
    // Player State
    const [status, setStatus] = useState<any>('WAITING');
    const [currentTimestamp, setCurrentTimestamp] = useState(0);
    const [duration] = useState(1440); // 24 mins in seconds
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user || !code) return;

        const initRoom = async () => {
            try {
                const { data } = await api.get(`/api/watchparty/${code}`);
                setParty(data);
                if (data.messages) setChat(data.messages);
                
                // Socket connection
                socket.connect();
                socket.emit('wp:join', { code, userId: user.id });

                socket.on('wp:state-update', ({ participants, status, currentTimestamp }) => {
                    if (participants) setParticipants(participants);
                    setStatus(status);
                    setCurrentTimestamp(currentTimestamp);
                });

                socket.on('wp:participants-update', (updatedParticipants) => {
                    setParticipants(updatedParticipants);
                });

                socket.on('wp:chat-message', (payload) => {
                    setChat(prev => [...prev, payload]);
                });

                socket.on('wp:reaction-broadcast', ({ userId, reaction }) => {
                    // Logic to show floating reaction or something
                    console.log(`Reaction from ${userId}: ${reaction}`);
                });

                socket.on('wp:member-left', ({ userId }) => {
                    setParticipants(prev => prev.filter(p => p.userId !== userId));
                });

                socket.on('wp:error', ({ message }) => {
                    alert(message);
                    navigate('/watchparties');
                });

                setLoading(false);
            } catch (error) {
                console.error('Room init error:', error);
                navigate('/watchparties');
            }
        };

        initRoom();

        return () => {
            socket.emit('wp:leave', { code, userId: user.id });
            socket.off('wp:member-joined');
            socket.off('wp:state-update');
            socket.off('wp:chat-message');
            socket.off('wp:member-left');
        };
    }, [code, user, navigate]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const handleToggleReady = () => {
        const nextReady = !isReady;
        setIsReady(nextReady);
        socket.emit('wp:ready', { code, userId: user?.id, isReady: nextReady });
    };

    const handleTogglePlay = () => {
        const nextStatus = status === 'WATCHING' ? 'PAUSED' : 'WATCHING';
        setStatus(nextStatus);
        socket.emit('wp:sync', { 
            code, 
            status: nextStatus, 
            currentTimestamp,
            episodeNumber: party?.episodeNumber
        });
    };

    const handleSendReaction = (reaction: string) => {
        socket.emit('wp:reaction', { code, userId: user?.id, reaction });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        socket.emit('wp:chat', { code, userId: user?.id, content: message });
        setMessage('');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col md:flex-row">
            
            {/* Main Stage: The Cinematic Player */}
            <div className="flex-1 relative flex flex-col group h-full">
                
                {/* Header Overlay */}
                <div className="absolute top-0 inset-x-0 p-8 z-30 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-6">
                         <button onClick={() => navigate('/watchparty')} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <ChevronRight className="rotate-180" />
                         </button>
                         <div>
                            <span className="text-[10px] font-black italic uppercase tracking-[0.4em] text-[var(--accent-primary)]">Sync Phase {party?.episodeNumber}</span>
                            <h1 className="text-2xl font-black uppercase tracking-tight italic">{party?.animeTitle}</h1>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <button 
                            onClick={handleToggleReady}
                            className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${isReady ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-white/40'}`}
                         >
                            {isReady ? 'READY FOR SIGNAL' : 'PREPARING'}
                         </button>
                         <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                             <Users size={14} className="text-[var(--accent-primary)]" />
                             <span className="text-xs font-black tracking-widest uppercase">{participants.length} PRESENCE</span>
                         </div>
                    </div>
                </div>

                {/* The Canvas (Metadata Sync Panel) */}
                <div className="flex-1 bg-[#050505] flex items-center justify-center relative">
                    <img 
                      src={party?.animeCover || "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2000&auto=format&fit=crop"} 
                      className="w-full h-full object-cover opacity-20 grayscale"
                      alt=""
                    />
                    <motion.div 
                      animate={{ scale: status === 'WATCHING' ? [1, 1.05, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="absolute flex flex-col items-center gap-8 text-center px-10"
                    >
                         <div className="relative">
                             <img 
                                src={party?.animeCover} 
                                className={`w-64 h-96 object-cover rounded-3xl shadow-2xl border transition-all duration-700 ${status === 'WATCHING' ? 'border-[var(--accent-primary)] scale-105 shadow-[var(--accent-primary)]/20' : 'border-white/10 grayscale'}`} 
                                alt="" 
                             />
                             {status === 'WATCHING' && (
                               <div className="absolute top-4 right-4 bg-[var(--accent-primary)] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce">
                                   Streaming
                               </div>
                             )}
                         </div>
                         <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${status === 'WATCHING' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">{status}</p>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic">{party?.animeTitle}</h2>
                            <p className="text-white/20 text-xs font-bold font-mono tracking-widest">
                                SYNC TARGET: {Math.floor(currentTimestamp / 60)}:{(currentTimestamp % 60).toString().padStart(2, '0')} / 24:00
                            </p>
                         </div>
                    </motion.div>

                    {/* Quick Reactions Overlay */}
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                        {['🔥', '❤️', '😂', '😮', '😢'].map(emoji => (
                            <button 
                                key={emoji}
                                onClick={() => handleSendReaction(emoji)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-xl hover:scale-125 transition-all"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Control Bar Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-8 z-30 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="max-w-6xl mx-auto space-y-6">
                        
                        {/* Progress Bar */}
                        <div className="relative h-1 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group/bar">
                            <div 
                              className="absolute inset-y-0 left-0 bg-[var(--accent-primary)] transition-all duration-300"
                              style={{ width: `${(currentTimestamp / duration) * 100}%` }}
                            />
                            <div className="absolute inset-y-0 left-0 w-full hover:bg-white/5 transition-opacity" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <button 
                                  onClick={handleTogglePlay}
                                  className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all"
                                >
                                    {status === 'WATCHING' ? <Pause fill="black" /> : <Play fill="black" />}
                                </button>

                                <div className="flex items-center gap-4">
                                    <Volume2 size={20} className="text-white/40" />
                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-white" />
                                    </div>
                                </div>

                                <div className="text-xs font-black tracking-widest text-white/40">
                                    {Math.floor(currentTimestamp / 60)}:{(currentTimestamp % 60).toString().padStart(2, '0')} / 24:00
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-white/40">
                                <button className="hover:text-white transition-colors"><Settings size={20} /></button>
                                <button className="hover:text-white transition-colors"><Maximize size={20} /></button>
                                <button 
                                  onClick={() => setSidebarOpen(!sidebarOpen)}
                                  className={`hover:text-white transition-all ${sidebarOpen ? 'text-[var(--accent-primary)]' : ''}`}
                                >
                                   <MessageSquare size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Collective Resonance (Chat) */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 400, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-[#0A0A0A] border-l border-white/5 flex flex-col h-full overflow-hidden"
                    >
                        {/* Participants Section */}
                        <div className="p-8 border-b border-white/5 space-y-6">
                             <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-white/40">The Collective</h3>
                                <div className="flex -space-x-2">
                                     {participants.slice(0, 5).map((p) => (
                                         <div key={p.id} className="relative">
                                             <img 
                                               src={p.user.avatar || '/default-avatar.png'} 
                                               className={`w-8 h-8 rounded-full border-2 border-[#0A0A0A] object-cover ${p.isReady ? 'ring-2 ring-green-500' : ''}`}
                                               alt="" 
                                             />
                                             {p.isReady && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black" />}
                                         </div>
                                     ))}
                                     {participants.length > 5 && (
                                         <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-black">
                                             +{participants.length - 5}
                                         </div>
                                     )}
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            {chat.map((msg, i) => (
                                <div key={msg.id || i} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-start gap-4">
                                        <img src={msg.user.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full border border-white/10 mt-1" alt="" />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black tracking-widest uppercase text-white/40 italic">{msg.user.username}</span>
                                                <span className="text-[8px] font-bold text-white/10 uppercase">
                                                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-medium leading-relaxed ${msg.messageType === 'SYSTEM' ? 'text-[var(--accent-primary)] italic' : 'text-white/80'}`}>
                                                {msg.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-8 pt-0">
                             <form onSubmit={handleSendMessage} className="relative">
                                 <input 
                                    type="text"
                                    placeholder="BROADCAST SIGNAL..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 px-6 py-5 pr-16 rounded-2xl text-xs font-bold tracking-widest focus:outline-none focus:border-[var(--accent-primary)] transition-all uppercase"
                                 />
                                 <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white hover:scale-105 active:scale-95 transition-all">
                                     <Send size={16} />
                                 </button>
                             </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WatchPartyRoom;
