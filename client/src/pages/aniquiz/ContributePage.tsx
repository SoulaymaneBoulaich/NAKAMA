import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    ArrowRight, 
    ArrowLeft, 
    Image as ImageIcon, 
    Music, 
    MessageSquare, 
    Quote, 
    Mic,
    CheckCircle2,
    AlertTriangle,
    Plus,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STEPS = [
    { title: 'TYPE', icon: MessageSquare },
    { title: 'CONTENT', icon: Quote },
    { title: 'MEDIA', icon: Music },
    { title: 'OPTIONS', icon: CheckCircle2 },
    { title: 'REVIEW', icon: Send },
];

const QUIZ_TYPES = [
    { id: 'QA', label: 'Standard Q&A', icon: MessageSquare, description: 'Text-based questions' },
    { id: 'SCREENSHOT', label: 'Screenshot', icon: ImageIcon, description: 'Identify scenes or characters' },
    { id: 'AUDIO', label: 'Audio Clip', icon: Music, description: 'Ost or Voice actor recognition' },
    { id: 'QUOTE', label: 'Famous Quote', icon: Quote, description: 'Who said it?' },
    { id: 'VOICE', label: 'Voice Acting', icon: Mic, description: 'Character voice guessing' },
];

const DIFFICULTIES = ['GENIN', 'CHUNIN', 'JONIN', 'KAGE', 'LEGENDARY'];

export default function ContributePage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: 'QA',
        difficulty: 'GENIN',
        questionText: '',
        mediaUrl: '',
        mediaType: 'IMAGE',
        options: ['', '', '', ''],
        correctAnswer: '',
        animeReference: '',
        timeLimitSeconds: 15
    });

    const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post('/quiz/submissions', formData);
            navigate('/aniquiz?submitted=true');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit question');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        if (step === 0) return !!formData.type;
        if (step === 1) return formData.questionText.length > 5 && !!formData.animeReference;
        if (step === 2) return formData.type === 'QA' || !!formData.mediaUrl;
        if (step === 3) return formData.options.every(o => !!o) && !!formData.correctAnswer;
        return true;
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 mb-4"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Quiz Architect</span>
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tighter mb-4 italic">
                        CRAFT YOUR <span className="text-red-600">LEGACY</span>
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                        Submit a question to the global AniQuiz pool. 10 community approvals will make it official.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -z-10" />
                    {STEPS.map((s, i) => (
                        <div key={s.title} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                i <= step ? 'bg-red-600 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-zinc-900 border-zinc-800'
                            }`}>
                                <s.icon className={`w-5 h-5 ${i <= step ? 'text-white' : 'text-zinc-600'}`} />
                            </div>
                            <span className={`text-[10px] font-bold tracking-tighter transition-colors ${i <= step ? 'text-white' : 'text-zinc-600'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 min-h-[400px] backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* STEP 0: TYPE */}
                            {step === 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {QUIZ_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`p-6 rounded-xl border text-left transition-all group ${
                                                formData.type === type.id 
                                                ? 'bg-red-600/10 border-red-600' 
                                                : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                                            }`}
                                        >
                                            <type.icon className={`w-8 h-8 mb-4 ${formData.type === type.id ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                                            <h3 className="font-bold text-lg">{type.label}</h3>
                                            <p className="text-zinc-500 text-sm">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* STEP 1: CONTENT */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Question Text</label>
                                        <textarea
                                            value={formData.questionText}
                                            onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                                            placeholder="e.g. In which episode did Naruto first meet Jiraiya?"
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:ring-1 focus:ring-red-600 transition-all outline-none min-h-[120px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Anime Reference</label>
                                            <input
                                                type="text"
                                                value={formData.animeReference}
                                                onChange={e => setFormData({ ...formData, animeReference: e.target.value })}
                                                placeholder="Anime Title"
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Difficulty</label>
                                            <select
                                                value={formData.difficulty}
                                                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                                            >
                                                {DIFFICULTIES.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: MEDIA */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    {formData.type === 'QA' ? (
                                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                                            <MessageSquare className="w-12 h-12 text-zinc-700 mb-4" />
                                            <p className="text-zinc-500">Text questions don't require media.</p>
                                            <button onClick={handleNext} className="mt-4 text-red-500 font-bold hover:underline">Skip this step</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Media URL</label>
                                            <input
                                                type="text"
                                                value={formData.mediaUrl}
                                                onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                                                placeholder={formData.type === 'SCREENSHOT' ? "Direct image URL (JPG/PNG)" : "SoundCloud/YouTube URL"}
                                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                                            />
                                            {formData.mediaUrl && formData.type === 'SCREENSHOT' && (
                                                <div className="mt-6 aspect-video rounded-xl overflow-hidden border border-zinc-800">
                                                    <img src={formData.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {formData.mediaUrl && (formData.type === 'AUDIO' || formData.type === 'VOICE') && (
                                                <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center">
                                                        <Music className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <div className="flex-1 truncate text-xs text-zinc-400 italic">
                                                        {formData.mediaUrl}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: OPTIONS */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {formData.options.map((opt, i) => (
                                            <div key={i}>
                                                <label className="block text-[10px] font-bold text-zinc-600 uppercase mb-1">Option {i + 1}</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOpt = [...formData.options];
                                                            newOpt[i] = e.target.value;
                                                            setFormData({ ...formData, options: newOpt });
                                                        }}
                                                        className={`w-full bg-black border rounded-xl p-4 outline-none transition-all ${
                                                            formData.correctAnswer === opt ? 'border-green-500/50 ring-1 ring-green-500/50' : 'border-zinc-800 focus:border-red-600'
                                                        }`}
                                                    />
                                                    <button
                                                        onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                                                            formData.correctAnswer === opt ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!formData.correctAnswer && (
                                        <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold mt-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Select one option as the correct answer</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: REVIEW */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-2xl bg-zinc-800/20 border border-zinc-700/50">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-bold uppercase mr-2">{formData.difficulty}</span>
                                                <span className="text-zinc-500 text-[10px] font-bold uppercase">{formData.type}</span>
                                            </div>
                                            <span className="text-zinc-500 text-[10px] font-bold uppercase italic">{formData.animeReference}</span>
                                        </div>
                                        <h2 className="text-xl font-bold mb-8 leading-tight italic">"{formData.questionText}"</h2>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.options.map(o => (
                                                <div key={o} className={`p-4 rounded-xl text-sm font-bold border transition-all ${
                                                    o === formData.correctAnswer 
                                                    ? 'bg-red-600/10 border-red-600 text-red-500' 
                                                    : 'bg-black/50 border-zinc-800 text-zinc-500 opacity-50'
                                                }`}>
                                                    {o}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-12 flex justify-between gap-4">
                        <button
                            onClick={handleBack}
                            disabled={step === 0}
                            className={`px-6 py-3 rounded-xl border border-zinc-800 flex items-center gap-2 font-bold transition-all ${
                                step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800'
                            }`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        
                        {step === STEPS.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                            >
                                {isSubmitting ? 'Manifesting...' : 'Submit to Pool'}
                                <Send className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`px-10 py-3 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.2)] flex items-center gap-2 font-bold transition-all ${
                                    isStepValid() 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-sm flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
