
import { useNavigate } from 'react-router-dom';
import { Sword, Trophy, ShieldAlert, Award, Hash } from 'lucide-react';

interface ProfileDebatesProps {
  arenas: any[];
  stats: {
    wins: number;
    losses: number;
    draws: number;
    judgedCount: number;
  };
}

export const ProfileDebates = ({ arenas, stats }: ProfileDebatesProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Victories" value={stats.wins} icon={<Trophy size={18} className="text-yellow-500" />} color="border-yellow-500/20" bg="bg-yellow-500/5" />
        <StatCard label="Defeats" value={stats.losses} icon={<ShieldAlert size={18} className="text-red-500" />} color="border-red-500/20" bg="bg-red-500/5" />
        <StatCard label="Stalemates" value={stats.draws} icon={<Hash size={18} className="text-zinc-500" />} color="border-zinc-500/20" bg="bg-zinc-500/5" />
        <StatCard label="Arenas Judged" value={stats.judgedCount} icon={<Award size={18} className="text-blue-500" />} color="border-blue-500/20" bg="bg-blue-500/5" />
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Conflict History</h3>
        
        {arenas.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl border border-dashed border-white/10 opacity-30">
            <Sword size={48} className="mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">No prior battles recorded</p>
          </div>
        ) : (
          arenas.map((arena) => (
            <div 
              key={arena.id}
              onClick={() => navigate(`/anijudge/arena/${arena.code}`)}
              className="glass-card p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all group cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className={`p-3 rounded-xl ${arena.status === 'COMPLETED' ? 'bg-zinc-900 border border-white/10' : 'bg-red-600/20 border border-red-500/30 animate-pulse'}`}>
                  <Sword size={24} className={arena.status === 'COMPLETED' ? 'text-zinc-500' : 'text-red-500'} />
                </div>
                <div>
                  <h4 className="font-bold text-lg group-hover:text-red-500 transition-colors uppercase tracking-tight">{arena.topic}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Judged by {arena.judge?.username}</span>
                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                    <span className="text-[10px] font-black uppercase text-zinc-500">{new Date(arena.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                   arena.winnerTeam === 'DRAW' ? 'border-zinc-500 text-zinc-500 bg-zinc-500/5' :
                   'border-yellow-500 text-yellow-500 bg-yellow-500/5'
                 }`}>
                   {arena.winnerTeam === 'DRAW' ? 'STALEMATE' : 'RESOLVED'}
                 </div>
                 <p className="text-xs italic text-zinc-500 opacity-80 group-hover:opacity-100 transition-opacity truncate max-w-[200px]">
                   "{arena.verdictText || 'Conflict Ongoing...'}"
                 </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg }: any) => (
  <div className={`p-6 rounded-2xl border ${color} ${bg} backdrop-blur-sm flex flex-col gap-1 items-center md:items-start`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
    <span className="text-3xl font-black font-[var(--font-syne)] uppercase italic tracking-tighter">{value}</span>
  </div>
);
