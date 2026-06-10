import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface PollOption {
    id: number;
    text: string;
    votes: string[];
}

interface PollData {
    question: string;
    options: PollOption[];
}

interface PollMessageProps {
    pollData: PollData;
    currentUserId?: string;
    onVote: (optionIndex: number) => void;
    isOwn: boolean;
}

export const PollMessage: React.FC<PollMessageProps> = ({ pollData, currentUserId, onVote, isOwn }) => {
    const totalVotes = pollData.options.reduce((acc, curr) => acc + curr.votes.length, 0);

    return (
        <div className={`w-64 md:w-80 p-4 rounded-2xl ${isOwn ? 'bg-red-600 text-white rounded-br-none' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-white rounded-bl-none'}`}>
            <div className="flex items-start gap-2 mb-4">
                <BarChart3 className="shrink-0 mt-0.5" size={18} />
                <h4 className="font-bold text-sm leading-tight">{pollData.question}</h4>
            </div>
            
            <div className="space-y-2">
                {pollData.options.map((option, index) => {
                    const voteCount = option.votes.length;
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const hasVoted = currentUserId && option.votes.includes(currentUserId);

                    return (
                        <div 
                            key={option.id}
                            onClick={() => onVote(index)}
                            className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all ${
                                hasVoted 
                                ? (isOwn ? 'border-white/50 bg-white/10' : 'border-red-500 bg-red-500/10') 
                                : (isOwn ? 'border-white/20 hover:bg-white/5' : 'border-[var(--border-color)] hover:bg-white/5')
                            } p-2.5`}
                        >
                            {/* Progress Bar Background */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`absolute left-0 top-0 bottom-0 ${isOwn ? 'bg-white/20' : 'bg-red-500/20'}`}
                            />
                            
                            <div className="relative z-10 flex items-center justify-between text-sm">
                                <span className={`font-medium ${hasVoted ? 'font-bold' : ''}`}>{option.text}</span>
                                <span className="text-xs font-mono opacity-80">{percentage}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 text-right text-[10px] opacity-70 font-medium">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
        </div>
    );
};
