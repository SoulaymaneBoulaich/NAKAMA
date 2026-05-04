import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Lock, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import { useNavigate } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { Avatar } from '../components/common/Avatar';

const WatchPartyHub: React.FC = () => {
    useAuth(); // Keeping the hook call if it provides context side effects (though safer to remove if unused)
    const navigate = useNavigate();
    const [parties, setParties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState('');
    
    // Create Form State
    const [newParty, setNewParty] = useState({
        animeId: '',
        animeTitle: '',
        animeCover: '',
        episodeNumber: '',
        isPrivate: false,
        maxParticipants: 10
    });

    useEffect(() => {
        fetchParties();
    }, []);

    const fetchParties = async () => {
        try {
            const { data } = await api.get('/api/watchparty/active');
            setParties(data);
        } catch (error) {
            console.error('Error fetching parties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateParty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/watchparty', newParty);
            navigate(`/watchparty/${data.code}`);
        } catch (error) {
            alert('Error creating room');
        }
    };

    const handleJoinByCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomCodeInput.length === 6) {
            navigate(`/watchparty/${roomCodeInput.toUpperCase()}`);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-40 px-6 sm:px-12">
            <div className="max-w-[1400px] mx-auto space-y-20">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[var(--border-color)] pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-primary)] italic">Live Resonance</span>
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
                            Watch <br /> <span className="text-[var(--accent-primary)]">Parties</span>
                        </h1>
                        <p className="text-white/40 max-w-md text-sm leading-relaxed">
                            Synchronized manifestations. Watch anime with the collective in real-time with zero-latency coordination.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleJoinByCode} className="relative group">
                            <input 
                                type="text"
                                placeholder="ENTER ROOM CODE"
                                value={roomCodeInput}
                                onChange={(e) => setRoomCodeInput(e.target.value)}
                                className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-xs font-black tracking-widest placeholder:text-white/20 focus:outline-none focus:border-[var(--accent-primary)] transition-all uppercase w-full sm:w-64"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[var(--accent-primary)] transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[var(--accent-primary)] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-black text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[var(--accent-primary)]/20 uppercase"
                        >
                            <Plus size={18} />
                            Invoke Room
                        </button>
                    </div>
                </div>

                 {/* Active Rooms Grid */}
                <div className="space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Active <span className="text-red-600">Projections</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">The collective is currently manifesting</p>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        <div className="flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{parties.length} CHANNELS</span>
                        </div>
                     </div>
 
                     {parties.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-8 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem] group">
                             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-600/50 transition-all duration-700">
                                 <Users size={32} className="text-white/10 group-hover:text-red-600 transition-colors" />
                             </div>
                             <div className="text-center space-y-2">
                                <p className="text-white text-sm font-black uppercase tracking-widest">No Active Frequencies</p>
                                <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">Be the catalyst of the first projection.</p>
                             </div>
                             <button 
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-2xl"
                             >
                                Start Manifesting
                             </button>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {parties.map((party) => (
                                <motion.div 
                                    key={party.id}
                                    whileHover={{ y: -12, scale: 1.02 }}
                                    onClick={() => navigate(`/watchparty/${party.code}`)}
                                    className="group relative h-[420px] bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:border-red-600/50 hover:shadow-red-600/10"
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black via-black/80 to-transparent z-10 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    
                                    <SafeImage 
                                        src={party.animeCover} 
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        alt="" 
                                    />

                                    <div className="p-8 h-full flex flex-col justify-between relative z-20">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                                <span className="text-[10px] font-black tracking-widest uppercase">{party._count.participants}/{party.maxParticipants}</span>
                                            </div>
                                            {party.isPrivate ? (
                                              <div className="w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                                                  <Lock size={14} className="text-red-500" />
                                              </div>
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center bg-red-600 backdrop-blur-xl border border-white/20 rounded-full shadow-lg shadow-red-600/20">
                                                  <Users size={14} className="text-white" />
                                              </div>
                                            )}
                                        </div>
 
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] italic">{party.code}</span>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-[0.9] group-hover:text-red-600 transition-colors">{party.animeTitle}</h3>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {party.episodeNumber && (
                                                    <span className="px-3 py-1 bg-white/10 rounded-md text-[9px] font-black text-white/60 uppercase tracking-widest">Ep {party.episodeNumber}</span>
                                                )}
                                                <span className={`text-[9px] font-black uppercase tracking-widest p-1 px-2 rounded-md ${party.status === 'WATCHING' ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-white/30'}`}>
                                                    {party.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                                                <Avatar 
                                                    src={party.host.avatar} 
                                                    username={party.host.username}
                                                    size="sm"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Conductor</span>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{party.host.username}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Participation Intent Indicator */}
                                    <div className="absolute inset-0 bg-red-600 opacity-0 group-active:opacity-10 transition-opacity" />
                                </motion.div>
                            ))}
                        </div>
                     )}
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                         <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                         />
                         
                         <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 p-12 rounded-[2.5rem] shadow-3xl"
                         >
                             <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Invoke <span className="text-[var(--accent-primary)]">Room</span></h2>
                             <form onSubmit={handleCreateParty} className="space-y-8">
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Anime ID (MAL)</label>
                                         <input 
                                            required
                                            type="text"
                                            placeholder="52991"
                                            value={newParty.animeId}
                                            onChange={(e) => setNewParty({...newParty, animeId: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                         />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Episode (Opt)</label>
                                         <input 
                                            type="number"
                                            placeholder="1"
                                            value={newParty.episodeNumber}
                                            onChange={(e) => setNewParty({...newParty, episodeNumber: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                         />
                                     </div>
                                 </div>

                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Anime Destination</label>
                                     <input 
                                        required
                                        type="text"
                                        placeholder="ANIME TITLE..."
                                        value={newParty.animeTitle}
                                        onChange={(e) => setNewParty({...newParty, animeTitle: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                     />
                                 </div>

                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Cover URL</label>
                                     <input 
                                        required
                                        type="text"
                                        placeholder="https://..."
                                        value={newParty.animeCover}
                                        onChange={(e) => setNewParty({...newParty, animeCover: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                     />
                                 </div>

                                 <div className="flex items-center justify-between gap-6">
                                     <div className="flex items-center gap-4">
                                         <input 
                                            type="checkbox"
                                            id="private"
                                            checked={newParty.isPrivate}
                                            onChange={(e) => setNewParty({...newParty, isPrivate: e.target.checked})}
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-[var(--accent-primary)] focus:ring-0"
                                         />
                                         <label htmlFor="private" className="text-xs font-black uppercase tracking-widest cursor-pointer select-none">Private</label>
                                     </div>

                                     <div className="flex items-center gap-3">
                                         <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Limit</label>
                                         <select 
                                            value={newParty.maxParticipants}
                                            onChange={(e) => setNewParty({...newParty, maxParticipants: Number(e.target.value)})}
                                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                                         >
                                             {[2, 5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                         </select>
                                     </div>
                                 </div>

                                 <div className="pt-4 flex gap-4">
                                     <button 
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-8 py-5 rounded-xl border border-white/10 font-black text-xs tracking-widest uppercase hover:bg-white/5 transition-all"
                                     >
                                        Abort
                                     </button>
                                     <button 
                                        type="submit"
                                        className="flex-1 bg-[var(--accent-primary)] text-white px-8 py-5 rounded-xl font-black text-xs tracking-widest shadow-xl shadow-[var(--accent-primary)]/20 uppercase hover:scale-[1.02] active:scale-95 transition-all"
                                     >
                                        Initialize
                                     </button>
                                 </div>
                             </form>
                         </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WatchPartyHub;
