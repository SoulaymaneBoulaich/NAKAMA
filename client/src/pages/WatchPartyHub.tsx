import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Lock, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import { useNavigate } from 'react-router-dom';

const WatchPartyHub: React.FC = () => {
    useAuth(); // Keeping the hook call if it provides context side effects (though safer to remove if unused)
    const navigate = useNavigate();
    const [parties, setParties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomCodeInput, setRoomCodeInput] = useState('');
    
    // Create Form State
    const [newParty, setNewParty] = useState({
        title: '',
        animeId: '',
        animeTitle: '',
        isPrivate: false
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
                        <h2 className="text-xl font-black italic uppercase tracking-tight">Active Rooms</h2>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{parties.length} ONLINE</span>
                     </div>

                     {parties.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center space-y-6 border border-dashed border-white/5 rounded-3xl">
                             <Users size={48} className="text-white/10" />
                             <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No active public rooms. Be the first to invoke.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {parties.map((party) => (
                                <motion.div 
                                    key={party.id}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/watchparty/${party.code}`)}
                                    className="group relative h-[320px] bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
                                    
                                    <div className="p-8 h-full flex flex-col justify-between relative z-20">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full">
                                                <Users size={12} className="text-[var(--accent-primary)]" />
                                                <span className="text-[10px] font-black">{party._count.members}</span>
                                            </div>
                                            {party.isPrivate && (
                                              <div className="w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
                                                  <Lock size={12} className="text-white/40" />
                                              </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest italic">{party.animeTitle}</span>
                                            <h3 className="text-xl font-black uppercase leading-tight group-hover:text-[var(--accent-primary)] transition-colors">{party.title}</h3>
                                            
                                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                                <img src={party.host.avatar || '/default-avatar.png'} className="w-6 h-6 rounded-full border border-white/10" alt="" />
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">BY {party.host.username}</span>
                                            </div>
                                        </div>
                                    </div>
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
                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Party Title</label>
                                     <input 
                                        required
                                        type="text"
                                        placeholder="EPIC WATCH PARTY..."
                                        value={newParty.title}
                                        onChange={(e) => setNewParty({...newParty, title: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                     />
                                 </div>

                                 <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Anime Destination</label>
                                     <input 
                                        required
                                        type="text"
                                        placeholder="MANUAL ANIME NAME..."
                                        value={newParty.animeTitle}
                                        onChange={(e) => setNewParty({...newParty, animeTitle: e.target.value, animeId: 'manual'})}
                                        className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                     />
                                     <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2 ml-2">Search integration coming soon. For now, name it.</p>
                                 </div>

                                 <div className="flex items-center gap-4">
                                     <input 
                                        type="checkbox"
                                        id="private"
                                        checked={newParty.isPrivate}
                                        onChange={(e) => setNewParty({...newParty, isPrivate: e.target.checked})}
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-[var(--accent-primary)] focus:ring-0"
                                     />
                                     <label htmlFor="private" className="text-xs font-black uppercase tracking-widest cursor-pointer select-none">Private Manifestation (Invite Only)</label>
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
