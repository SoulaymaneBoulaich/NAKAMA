import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ThumbsUp, 
    ThumbsDown, 
    Music, 
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { SafeImage } from '../../components/common/SafeImage';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

interface Submission {
    id: string;
    type: 'QA' | 'SCREENSHOT' | 'AUDIO' | 'QUOTE' | 'VOICE';
    difficulty: string;
    questionText: string;
    mediaUrl?: string;
    options: string[];
    correctAnswer: string;
    animeReference: string;
    approvalVotes: number;
    rejectionVotes: number;
    user: {
        username: string;
        avatar?: string;
    };
}

export default function ReviewSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [votingId, setVotingId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/quiz/submissions/pending');
            setSubmissions(res.data);
        } catch (err) {
            addToast('error', 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (submissionId: string, vote: 'APPROVE' | 'REJECT') => {
        setVotingId(submissionId);
        try {
            const res = await api.post(`/quiz/submissions/${submissionId}/vote`, { vote });
            
            if (res.data.status === 'APPROVED') {
                addToast('success', 'Question Manifested! This question has reached the threshold and is now official.');
            } else if (res.data.status === 'REJECTED') {
                addToast('info', 'Question Purged. This submission was rejected by the community.');
            } else {
                addToast('success', 'Vote Cast. Your judgment has been recorded.');
            }

            // Remove from list
            setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        } catch (err: any) {
            addToast('error', err.response?.data?.message || 'Failed to cast vote');
        } finally {
            setVotingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                            <ShieldCheck className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tighter italic">GATE OF <span className="text-red-600">JUDGMENT</span></h1>
                            <p className="text-zinc-500 text-sm">Review community submissions. Maintain the standard of excellence.</p>
                        </div>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-20 border border-dashed border-zinc-800 rounded-3xl text-center bg-zinc-900/10"
                    >
                        <Loader2 className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-500 italic">No pending submissions</h3>
                        <p className="text-zinc-600 text-sm">The pool is currently clear. Check back later.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        <AnimatePresence>
                            {submissions.map((sub) => (
                                <motion.div
                                    key={sub.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: 200 }}
                                    className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl group"
                                >
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar 
                                                    src={sub.user.avatar} 
                                                    username={sub.user.username} 
                                                    size="sm"
                                                    className="w-full h-full rounded-full"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold text-zinc-300">Submitter: <span className="text-white">@{sub.user.username}</span></h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{sub.type}</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                                            sub.difficulty === 'LEGENDARY' ? 'bg-orange-600/20 text-orange-400' :
                                                            sub.difficulty === 'KAGE' ? 'bg-red-600/20 text-red-400' :
                                                            'bg-zinc-800 text-zinc-400'
                                                        }`}>
                                                            {sub.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Source</div>
                                                <div className="text-sm text-red-500 font-bold italic">{sub.animeReference}</div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold leading-tight mb-6 italic group-hover:text-red-500 transition-colors">
                                                "{sub.questionText}"
                                            </h2>

                                            {sub.mediaUrl && (
                                                <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-800 aspect-video relative">
                                                    {sub.type === 'SCREENSHOT' ? (
                                                        <SafeImage src={sub.mediaUrl} alt="Submission" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <Music className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                                                                <p className="text-xs text-zinc-500 truncate max-w-[200px]">{sub.mediaUrl}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                {sub.options.map(opt => (
                                                    <div key={opt} className={`p-4 rounded-xl text-sm font-bold border ${
                                                        opt === sub.correctAnswer 
                                                        ? 'bg-green-600/5 border-green-500/20 text-green-500' 
                                                        : 'bg-black/20 border-zinc-800 text-zinc-500'
                                                    }`}>
                                                        {opt}
                                                        {opt === sub.correctAnswer && <span className="ml-2 text-[10px] uppercase opacity-70">(Answer)</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                    <span className="text-sm font-bold">{sub.approvalVotes} <span className="text-zinc-600">Approvals</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                                    <span className="text-sm font-bold">{sub.rejectionVotes} <span className="text-zinc-600">Purge</span></span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleVote(sub.id, 'REJECT')}
                                                    disabled={votingId === sub.id}
                                                    className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all text-zinc-500 hover:text-red-500 disabled:opacity-50"
                                                >
                                                    <ThumbsDown className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={() => handleVote(sub.id, 'APPROVE')}
                                                    disabled={votingId === sub.id}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 rounded-2xl px-8 flex items-center justify-center gap-2 font-bold shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all disabled:opacity-50"
                                                >
                                                    {votingId === sub.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ThumbsUp className="w-5 h-5" />
                                                            Approve Submission
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
