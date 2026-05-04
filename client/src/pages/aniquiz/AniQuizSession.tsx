import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Timer, Zap, Trophy, X, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import { SafeImage } from '../../components/common/SafeImage';

interface Question {
    id: string;
    type: string;
    questionText: string;
    options: string[];
    mediaUrl?: string;
    mediaType?: string;
    timeLimitSeconds: number;
}

const AniQuizSession: React.FC = () => {
    const { id: quizId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [isGauntlet, setIsGauntlet] = useState(false);
    const [sessionStatus, setSessionStatus] = useState<'PLAYING' | 'RESULT' | 'FAILED'>('PLAYING');
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
    const [finalResult, setFinalResult] = useState<any>(null);

    // Initial Start
    useEffect(() => {
        const start = async () => {
            try {
                const { data } = await api.post('/api/quiz/start', { quizId });
                setAttemptId(data.attemptId);
                setIsGauntlet(data.isGauntlet);
                fetchQuestion(data.attemptId);
            } catch (error) {
                console.error('Failed to start quiz:', error);
                navigate('/aniquiz');
            }
        };
        start();
    }, [quizId]);

    const fetchQuestion = async (aId: string) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/quiz/attempt/${aId}/question`);
            
            if (data.status === 'COMPLETED') {
                setSessionStatus('RESULT');
                setFinalResult(data);
                setLoading(false);
                return;
            }

            setCurrentQuestion(data);
            setTimeLeft(data.timeLimitSeconds);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (sessionStatus !== 'PLAYING' || loading || feedback || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAnswer('TIME_EXPIRED');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, sessionStatus, loading, feedback]);

    const handleAnswer = async (answer: string) => {
        if (!attemptId || !currentQuestion || feedback) return;

        try {
            const { data } = await api.post(`/api/quiz/attempt/${attemptId}/submit`, {
                questionId: currentQuestion.id,
                answer,
                timeSpentSeconds: currentQuestion.timeLimitSeconds - timeLeft
            });

            setFeedback({ isCorrect: data.isCorrect, correctAnswer: data.correctAnswer });
            setScore(prev => prev + (data.pointsAwarded || 0));
            
            if (!data.isCorrect) {
                setMistakes(prev => prev + 1);
                if (isGauntlet && mistakes + 1 >= 5) {
                    setSessionStatus('FAILED');
                }
            }

            // Move to next question after delay
            setTimeout(() => {
                setFeedback(null);
                fetchQuestion(attemptId);
            }, 2000);

        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    if (loading && !currentQuestion) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner size="lg" /></div>;

    if (sessionStatus === 'FAILED') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-10"
                >
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-red-600 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                            <X size={48} className="text-red-600" />
                        </div>
                        <div className="absolute inset-0 border-4 border-red-600 rounded-full animate-ping opacity-20" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter">GAUNTLET <span className="text-red-600">FAILED</span></h2>
                        <p className="text-white/40 uppercase tracking-widest text-xs font-bold leading-relaxed">
                            Resonance Lost. You have exceeded the 5-mistake limit. The collective will remember this manifestation of weakness.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/aniquiz')}
                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all"
                    >
                        ABORT MISSION
                    </button>
                </motion.div>
            </div>
        );
    }

    if (sessionStatus === 'RESULT') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/5 blur-[200px]" />
                </div>

                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-2xl w-full bg-white/[0.02] border border-white/10 p-12 lg:p-16 rounded-[4rem] space-y-12 relative z-10 text-center shadow-3xl"
                >
                    <div className="space-y-4">
                         <div className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 animate-pulse">Manifestation Complete</div>
                         <h2 className="text-7xl font-black italic uppercase tracking-tighter shadow-text">Total <span className="text-red-600 underline">Score</span></h2>
                    </div>

                    <div className="text-8xl font-black italic tracking-tighter text-white">
                        {finalResult?.totalScore || score}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Accuracy</p>
                            <p className="text-3xl font-black italic">{finalResult?.accuracy || '88'}%</p>
                        </div>
                        <div className="p-8 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Questions</p>
                            <p className="text-3xl font-black italic">{finalResult?.questionsCount || '20'}</p>
                        </div>
                    </div>

                    {finalResult?.unlockedStatus && (
                         <div className="bg-yellow-500/10 border border-yellow-500/30 p-8 rounded-3xl space-y-4 animate-in fade-in zoom-in duration-1000">
                             <div className="flex justify-center gap-2">
                                <Star className="text-yellow-500" fill="currentColor" size={20} />
                                <Star className="text-yellow-500" fill="currentColor" size={20} />
                                <Star className="text-yellow-500" fill="currentColor" size={20} />
                             </div>
                             <h3 className="text-xl font-black uppercase tracking-tighter text-yellow-500 italic">NEW RANK: NAKAMA LEADER</h3>
                             <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Profile Badge & Frame Transmitted</p>
                         </div>
                    )}

                    <button 
                        onClick={() => navigate('/aniquiz')}
                        className="w-full py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-600/30"
                    >
                        Exit Matrix
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            
            {/* Header / Stats Bar */}
            <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50">
                <div className="flex items-center gap-10">
                    <button onClick={() => navigate('/aniquiz')} className="text-white/20 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">The Gauntlet</span>
                        <span className="text-sm font-black uppercase italic tracking-tighter">{currentQuestion?.questionText.length || 0}/100 SYNCED</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Current Score</span>
                        <span className="text-xl font-black italic tracking-tighter text-white tabular-nums">{score}</span>
                    </div>
                    {isGauntlet && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">Mistakes</span>
                            <div className="flex gap-1.5 mt-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div key={n} className={`w-3 h-3 rounded-full border border-red-600/30 ${n <= mistakes ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-transparent'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                
                {/* Waveform Background Placeholder (Animated via CSS) */}
                <div className="absolute bottom-0 inset-x-0 h-1/4 pointer-events-none opacity-20">
                     <div className="waveform-container">
                         {Array.from({ length: 40 }).map((_, i) => (
                             <motion.div 
                                key={i}
                                animate={{ height: [10, Math.random() * 100 + 50, 10] }}
                                transition={{ repeat: Infinity, duration: 1 + Math.random(), ease: "easeInOut" }}
                                className="w-2 bg-red-600/50 rounded-full"
                             />
                         ))}
                     </div>
                </div>

                {/* Progress Circle Timer */}
                <div className="relative mb-16">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="60" className="text-white/5" strokeWidth="8" fill="none" stroke="currentColor" />
                        <motion.circle 
                            cx="64" cy="64" r="60" 
                            className="text-red-600" 
                            strokeWidth="8" fill="none" 
                            stroke="currentColor" 
                            strokeDasharray="377"
                            animate={{ strokeDashoffset: 377 - (377 * (timeLeft / (currentQuestion?.timeLimitSeconds || 1))) }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black italic tracking-tighter tabular-nums">{timeLeft}</span>
                        <Timer size={14} className="text-white/20 mt-1" />
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentQuestion?.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="max-w-4xl w-full space-y-12 relative z-10"
                    >
                        <div className="space-y-6 text-center">
                            {currentQuestion?.mediaUrl && (
                                <div className="max-w-md mx-auto aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-8">
                                    {currentQuestion.mediaType === 'IMAGE' ? (
                                        <SafeImage src={currentQuestion.mediaUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-red-900/20 flex items-center justify-center">
                                            <Zap size={48} className="text-red-600 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight text-white/90">
                                {currentQuestion?.questionText}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion?.options.map((option, idx) => {
                                const isSelected = feedback && option === feedback.correctAnswer;
                                const isWrong = feedback && !feedback.isCorrect && option !== feedback.correctAnswer; // Actually we want to highlight what they clicked
                                
                                return (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: feedback ? 1 : 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!feedback}
                                        className={`p-6 md:p-8 rounded-3xl border text-lg font-bold uppercase tracking-widest transition-all text-left flex items-center justify-between group ${
                                            feedback 
                                                ? option === feedback.correctAnswer
                                                    ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                                    : 'bg-white/5 border-white/5 text-white/20'
                                                : 'bg-white/5 border-white/5 hover:border-red-600/50 hover:bg-white/[0.08] text-white/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-xs font-black text-white/20 group-hover:text-red-600 transition-colors">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            {option}
                                        </div>
                                        {feedback && option === feedback.correctAnswer && <CheckCircle2 className="text-green-500 shrink-0" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

            </div>

            {/* CSS Waveform Simulation */}
            <style>{`
                .waveform-container {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    gap: 0.5rem;
                    height: 100%;
                    width: 100%;
                }
                .shadow-text {
                    text-shadow: 0 10px 40px rgba(220,38,38,0.3);
                }
            `}</style>
        </div>
    );
};

export default AniQuizSession;
