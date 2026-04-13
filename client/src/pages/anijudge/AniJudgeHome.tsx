import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sword, Trophy, Play, Search, Hash } from 'lucide-react';
import { CreateArenaModal } from '../../components/anijudge/CreateArenaModal';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AniJudgeHome = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hallOfFame, setHallOfFame] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHallOfFame();
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

  const handleJoin = () => {
    if (joinCode.length === 6) {
      navigate(`/anijudge/arena/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 pt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card p-8 rounded-2xl border border-red-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sword size={120} className="text-red-600 rotate-12" />
            </div>
            
            <h1 className="text-4xl font-[var(--font-syne)] font-bold mb-4 bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
              AniJudge Arena
            </h1>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">
              The ultimate proving ground for anime takes. Debate your favorites, judge the masters, and claim your place in the Hall of Fame.
            </p>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-red-900/20"
            >
              <Play size={20} fill="white" />
              START A DEBATE
            </button>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-[var(--border-color)]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Hash size={20} className="text-red-500" />
              Join Active Arena
            </h2>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="6-CHAR CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 font-mono text-center text-xl tracking-widest focus:border-red-500 outline-none transition-colors"
              />
              <button 
                onClick={handleJoin}
                disabled={joinCode.length < 6}
                className="bg-[var(--bg-tertiary)] hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-[var(--bg-tertiary)] text-white px-6 rounded-xl transition-all"
              >
                <Search size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Hall of Fame */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-[var(--font-syne)] font-bold flex items-center gap-3">
              <Trophy className="text-yellow-500" />
              Hall of Fame
            </h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--bg-secondary)] animate-pulse rounded-2xl" />)
            ) : hallOfFame.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-[var(--border-color)]">
                <p className="text-[var(--text-secondary)]">No legendary debates recorded yet.</p>
              </div>
            ) : (
              hallOfFame.map((arena: any) => (
                <div key={arena.id} className="glass-card p-6 rounded-2xl border border-[var(--border-color)] hover:border-red-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold group-hover:text-red-500 transition-colors line-clamp-1">{arena.topic}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Judged by {arena.judge?.username || 'the community'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-red-950/30 px-3 py-1 rounded-full border border-red-900/30">
                      <Trophy size={14} className="text-yellow-500" />
                      <span className="text-xs font-bold text-red-500">{arena._count.fameVotes}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="p-2 rounded-lg bg-blue-900/10 border border-blue-900/20 text-center">
                      <p className="text-[var(--text-secondary)] text-xs mb-1">TEAM A</p>
                      <p className="font-bold truncate">{arena.participants.filter((p: any) => p.team === 'TEAM_A').map((p: any) => p.user.username).join(', ')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-900/10 border border-red-900/20 text-center">
                      <p className="text-[var(--text-secondary)] text-xs mb-1">TEAM B</p>
                      <p className="font-bold truncate">{arena.participants.filter((p: any) => p.team === 'TEAM_B').map((p: any) => p.user.username).join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm italic text-[var(--text-secondary)] opacity-80 line-clamp-1">"{arena.verdictText}"</p>
                    <button 
                      onClick={() => navigate(`/anijudge/hall-of-fame/${arena.id}`)}
                      className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors ml-4 whitespace-nowrap"
                    >
                      VIEW FULL DEBATE <Play size={10} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateArenaModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
