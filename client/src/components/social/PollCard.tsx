import React, { useState } from 'react';
import api from '../../api/axios';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
  votes: { userId: string }[];
}

interface Poll {
  id: string;
  question: string;
  expiresAt: string | null;
  options: PollOption[];
}

interface Props {
  poll: Poll;
  onVoteSuccess?: (updatedPoll: Poll) => void;
}

const PollCard: React.FC<Props> = ({ poll, onVoteSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voteCount, 0);
  const userVote = poll.options.find(opt => opt.votes.some(v => v.userId === user?.id));
  const hasVoted = !!userVote;
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  const handleVote = async (optionId: string) => {
    if (!user || hasVoted || isExpired || loading) return;
    
    try {
      setLoading(optionId);
      const res = await api.post(`/polls/vote/${optionId}`, {});
      if (onVoteSuccess) onVoteSuccess(res.data);
    } catch (error) {
      console.error('Voting error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 mt-4 mb-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
        <h4 className="text-lg font-black text-zinc-100 tracking-tight italic uppercase">
          {poll.question}
        </h4>
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);
          const isSelected = userVote?.id === option.id;

          return (
            <button
              key={option.id}
              disabled={hasVoted || isExpired || !!loading}
              onClick={() => handleVote(option.id)}
              className={`relative w-full text-left rounded-xl border p-4 transition-all overflow-hidden group ${
                hasVoted 
                ? isSelected 
                  ? 'border-red-600/50 bg-red-600/5' 
                  : 'border-[var(--border-color)] bg-zinc-900/20' 
                : 'border-[var(--border-color)] bg-zinc-900/40 hover:border-zinc-700 active:scale-[0.99]'
              }`}
            >
              {/* Progress Background */}
              {hasVoted && (
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-red-600/10' : 'bg-zinc-800/30'}`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-bold transition-all ${isSelected ? 'text-red-500' : 'text-zinc-300'}`}>
                    {option.optionText}
                  </span>
                  {isSelected && <CheckCircle2 size={16} className="text-red-500 animate-in zoom-in-50 duration-300" />}
                </div>
                {hasVoted && (
                  <span className={`text-sm font-black ${isSelected ? 'text-red-500' : 'text-zinc-500'}`}>
                    {percentage}%
                  </span>
                )}
                {!hasVoted && !isExpired && (
                  <ChevronRight size={18} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-600 uppercase">
        <div className="flex items-center gap-4">
          <span>{totalVotes.toLocaleString()} VOTES</span>
          {hasVoted && <span className="text-red-600/80">SELECTION RECORDED</span>}
        </div>
        {isExpired ? (
          <span className="text-zinc-700 flex items-center gap-1">
            <Info size={12} /> POLL CLOSED
          </span>
        ) : poll.expiresAt && (
          <span>ENDS {new Date(poll.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default PollCard;
