import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Flame, 
    Calendar, 
    ChevronRight, 
    Trophy, 
    Clock, 
    CheckCircle2, 
    Brain,
    Loader2
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../common/Toast';

interface DailyData {
    id: string;
    question: {
        id: string;
        questionText: string;
        options: string[];
        type: string;
        difficulty: string;
        animeReference: string;
    };
    isAnswered: boolean;
    userAnswer?: { isCorrect: boolean };
    totalAttempts: number;
    correctAttempts: number;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
}

export default function DailyQuizWidget() {
    const [daily, setDaily] = useState<DailyData | null>(null);
    const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0 });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnswering, setIsAnswering] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dailyRes, streakRes] = await Promise.all([
                api.get('/quiz/daily'),
                api.get('/quiz/streak')
            ]);
            setDaily(dailyRes.data);
            setStreak(streakRes.data);
        } catch (err) {
            console.error('Failed to fetch daily data:', err);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAnswer || !daily) return;
        setIsSubmitting(true);
        try {
            const res = await api.post('/quiz/daily/submit', {
                dailyQuestionId: daily.id,
                answer: selectedAnswer
            });
            
            setDaily({
                ...daily,
                isAnswered: true,
                userAnswer: { isCorrect: res.data.isCorrect }
            });

            if (res.data.isCorrect) {
                addToast('Perfect Alignment!', 'You answered correctly. Streak updated!', 'success');
                setStreak(prev => ({ 
                    ...prev, 
                    currentStreak: prev.currentStreak + 1,
                    longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
                }));
            } else {
                addToast('System Mismatch', `Incorrect. The correct answer was ${res.data.correctAnswer}`, 'error');
                setStreak(prev => ({ ...prev, currentStreak: 0 }));
            }
        } catch (err) {
            addToast('Error', 'Failed to submit answer', 'error');
        } finally {
            setIsSubmitting(false);
            setIsAnswering(false);
        }
    };

    if (!daily) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl relative"
        >
            <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-600/10 border border-orange-600/20">
                    <Flame className={`w-3.5 h-3.5 ${streak.currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                    <span className={`text-[10px] font-bold ${streak.currentStreak > 0 ? 'text-orange-500' : 'text-zinc-600'}`}>
                        {streak.currentStreak} DAY STREAK
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Daily Manifestation</span>
                </div>

                {!isAnswering ? (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold italic tracking-tight mb-1">
                                    {daily.isAnswered ? 'DAILY COMPLETE' : 'TODAY\'S CHALLENGE'}
                                </h3>
                                <p className="text-zinc-500 text-xs">
                                    {daily.isAnswered 
                                        ? `You earned ${daily.userAnswer?.isCorrect ? '+' : '+0'} 500 points today.` 
                                        : `${daily.totalAttempts} Nakama already attempted this.`}
                                </p>
                            </div>
                        </div>

                        {daily.isAnswered ? (
                            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                                daily.userAnswer?.isCorrect 
                                ? 'bg-green-600/10 border-green-600/20 text-green-500' 
                                : 'bg-red-600/10 border-red-600/20 text-red-500'
                            }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    daily.userAnswer?.isCorrect ? 'bg-green-600/20' : 'bg-red-600/20'
                                }`}>
                                    {daily.userAnswer?.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <Trophy className="w-6 h-6 rotate-180 opacity-50" />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold uppercase">{daily.userAnswer?.isCorrect ? 'SYNCHRONIZED' : 'CONNECTION FAILED'}</div>
                                    <div className="text-[10px] opacity-70">Come back in {new Date(new Date().setHours(24,0,0,0)).getHours()}h {new Date(new Date().setHours(24,0,0,0)).getMinutes()}m</div>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsAnswering(true)}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transform active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                            >
                                <Brain className="w-4 h-4" />
                                Begin Daily Sync
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="text-[10px] font-bold text-red-500 uppercase mb-2 italic">{daily.question.animeReference}</div>
                            <h4 className="text-sm font-bold leading-relaxed italic">"{daily.question.questionText}"</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {daily.question.options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedAnswer(opt)}
                                    className={`p-3 rounded-lg text-xs font-bold border transition-all text-left ${
                                        selectedAnswer === opt 
                                        ? 'bg-red-600 border-red-600 text-white' 
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button 
                                onClick={() => setIsAnswering(false)}
                                className="flex-1 py-2 text-zinc-500 text-xs font-bold hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={!selectedAnswer || isSubmitting}
                                className={`flex-[2] py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 ${
                                    selectedAnswer && !isSubmitting 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Answer'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                        key={i}
                        className="text-[40px] font-bold whitespace-nowrap"
                        style={{ transform: `rotate(-15deg) translate(${i * 20}px, ${i * 50}px)` }}
                    >
                        NAKAMA QUIZ SYSTEM / PROTOCOL / {daily.id}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
