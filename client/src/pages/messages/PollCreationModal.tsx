import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PollCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (pollData: { question: string, options: { id: number, text: string, votes: string[] }[] }) => void;
}

export const PollCreationModal: React.FC<PollCreationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([{ id: 1, text: '' }, { id: 2, text: '' }]);

    if (!isOpen) return null;

    const handleAddOption = () => {
        if (options.length >= 10) return;
        setOptions([...options, { id: Date.now(), text: '' }]);
    };

    const handleRemoveOption = (id: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter(o => o.id !== id));
    };

    const handleChangeOption = (id: number, text: string) => {
        setOptions(options.map(o => o.id === id ? { ...o, text } : o));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(o => o.text.trim().length > 0);
        if (question.trim() && validOptions.length >= 2) {
            onSubmit({
                question: question.trim(),
                options: validOptions.map((o, index) => ({ id: index, text: o.text.trim(), votes: [] }))
            });
            onClose();
        } else {
            alert('Please provide a question and at least 2 options.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create Poll</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--text-secondary)] hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Question</label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask your crew something..."
                            className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-white uppercase tracking-wide">Options</label>
                        {options.map((opt, index) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => handleChangeOption(opt.id, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                                {options.length > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveOption(opt.id)}
                                        className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {options.length < 10 && (
                        <button 
                            type="button" 
                            onClick={handleAddOption}
                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
                        >
                            <Plus size={16} /> Add Option
                        </button>
                    )}

                    <div className="pt-4 border-t border-[var(--border-color)] mt-6">
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95"
                        >
                            Send Poll
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
