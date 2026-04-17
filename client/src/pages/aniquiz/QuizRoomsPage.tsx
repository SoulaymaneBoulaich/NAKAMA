import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Layers, 
    Zap, 
    Users, 
    ChevronRight, 
    Puzzle, 
    Loader2,
    Sparkles,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface QuizRoom {
    id: string;
    animeId: string;
    animeTitle: string;
    animeCover: string;
    totalAttempts: number;
    roomSlug: string;
    _count: {
        questions: number;
    };
}

export default function QuizRoomsPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<QuizRoom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/quiz/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter(room => 
        room.animeTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative">
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Puzzle className="w-5 h-5 text-red-500" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol / Rooms</span>
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tighter italic mb-4">
                                SELECT YOUR <span className="text-red-600">ARENA</span>
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-xl">
                                Enter specialized quiz domains dedicated to specific titles. Conquer themes, master arcs, and dominate the local leaderboards.
                            </p>
                        </div>

                        <div className="w-full md:w-96 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search specialized arenas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-red-600/50 transition-all backdrop-blur-xl"
                            />
                        </div>
                    </div>
                </div>

                {filteredRooms.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                        <Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-500">No Domains Found</h3>
                        <p className="text-zinc-600 text-sm">Synchronizing new dimensions... try a different search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredRooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => navigate(`/aniquiz/room/${room.roomSlug}`)}
                                    className="group cursor-pointer bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl hover:border-red-600/30 transition-all duration-500 relative"
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img 
                                            src={room.animeCover} 
                                            alt={room.animeTitle} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                                <Zap className="w-3 h-3 text-red-500" />
                                                <span className="text-[10px] font-bold text-zinc-300">{room._count.questions} QUESTIONS</span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-red-500 transition-colors uppercase italic truncate">
                                                {room.animeTitle}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-zinc-500">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Engagement</span>
                                                <span className="text-xs font-bold text-white tabular-nums flex items-center gap-1">
                                                    <Activity className="w-3 h-3 text-red-500" />
                                                    {room.totalAttempts}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-300">
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_0%,rgba(220,38,38,0.02)_50%,transparent_100%)] bg-[size:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
