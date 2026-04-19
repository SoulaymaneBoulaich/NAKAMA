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
    <div className="w-full mt-4 mb-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-white rounded-full" />
        <h4 className="text-[0.875rem] font-bold text-[#f4f4f5] uppercase tracking-[0.05em] font-dm-sans">
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
              className={`relative w-full text-left rounded-[10px] border p-3.5 transition-all overflow-hidden group ${
                hasVoted 
                ? isSelected 
                  ? 'border-white/50 bg-white/5' 
                  : 'border-[#1a1a1a] bg-transparent' 
                : 'border-[#1a1a1a] bg-transparent hover:border-[#333] active:scale-[0.99]'
              }`}
            >
              {/* Progress Background */}
              {hasVoted && (
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-white/10' : 'bg-white/5'}`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between font-dm-sans">
                <div className="flex items-center gap-3">
                  <span className={`text-[0.85rem] font-medium transition-all ${isSelected ? 'text-white' : 'text-[#a1a1aa]'}`}>
                    {option.optionText}
                  </span>
                  {isSelected && <CheckCircle2 size={14} className="text-white animate-in zoom-in-50 duration-300" />}
                </div>
                {hasVoted && (
                  <span className={`text-[0.75rem] font-bold ${isSelected ? 'text-white' : 'text-[#71717a]'}`}>
                    {percentage}%
                  </span>
                )}
                {!hasVoted && !isExpired && (
                  <ChevronRight size={16} className="text-[#3a3a3a] group-hover:text-[#71717a] group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-[0.65rem] font-bold tracking-[0.1em] text-[#71717a] uppercase font-dm-sans">
        <div className="flex items-center gap-4">
          <span>{totalVotes.toLocaleString()} VOTES</span>
          {hasVoted && <span className="text-white/80">VOTED</span>}
        </div>
        {isExpired ? (
          <span className="text-[#3a3a3a] flex items-center gap-1">
            <Info size={12} /> CLOSED
          </span>
        ) : poll.expiresAt && (
          <span>ENDS {new Date(poll.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default PollCard;
