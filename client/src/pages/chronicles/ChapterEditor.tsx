import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Globe, Eye, Loader2, BookOpen, History, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';

export const ChronicleChapterEditorPage: React.FC = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const { data } = await api.get(`/stories/${id}/chapters/${chapterId}`);
        setChapter(data);
        setTitle(data.title);
        setContent(data.content || '');
        setIsPublished(data.isPublished);
        setWordCount(data.wordCount || 0);
      } catch (error) {
        addToast('error', 'Failed to load archive entry');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [id, chapterId]);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const handleSave = async (autoPublish = false) => {
    setSaving(true);
    try {
       const publishedState = autoPublish ? true : isPublished;
       await api.put(`/stories/${id}/chapters/${chapterId}`, {
         title,
         content,
         isPublished: publishedState
       });
       if (autoPublish) setIsPublished(true);
       addToast('success', 'Archive synchronized');
    } catch (error) {
       addToast('error', 'Synchronization failed');
    } finally {
       setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-64">
      <Loader2 className="text-[var(--accent-primary)] animate-spin" size={64} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col font-sans">
      {/* Editor Header */}
      <header className="h-24 bg-black/60 backdrop-blur-3xl border-b border-[var(--border-color)] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-10 flex-1">
           <button 
             onClick={() => navigate(`/chronicles/${id}/manage`)}
             className="p-4 bg-white/5 text-zinc-500 hover:text-white hover:bg-[var(--accent-primary)]/20 rounded-2xl transition-all group"
           >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </button>
           
           <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-1 bg-[var(--accent-primary)]/10 rounded">
                  <Sparkles className="text-[var(--accent-primary)]" size={12} />
                </div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Entry Record #{chapter?.chapterNumber}</span>
              </div>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none text-2xl font-black text-white uppercase italic tracking-tighter outline-none w-full placeholder:text-zinc-800"
                placeholder="PROJET-SPECIFICATION..."
              />
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end mr-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                 <History size={12} className="text-zinc-800" />
                 Last Sync: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1">
                 <BookOpen size={12} />
                 {wordCount} Lexicon Points
              </div>
           </div>

           <button 
             onClick={() => handleSave()}
             disabled={saving}
             className="px-8 py-4 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
           >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Archive Draft
           </button>
           <button 
             onClick={() => handleSave(true)}
             disabled={saving || (isPublished && !chapter.content)}
             className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-2xl ${
               isPublished 
                 ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/50 text-[var(--accent-primary)] shadow-[var(--accent-primary)]/10' 
                 : 'bg-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/30 hover:scale-105 active:scale-95'
             }`}
           >
              <Globe size={16} />
              {isPublished ? 'Broadcasting' : 'FORGE PUBLIC'}
           </button>
           
           <div className="h-10 w-px bg-white/5 mx-2" />
           
           <button 
             onClick={() => window.open(`/chronicles/${id}/chapters/${chapterId}`, '_blank')}
             className="p-4 bg-white/5 text-zinc-500 hover:text-[var(--accent-primary)] rounded-2xl transition-all border border-transparent hover:border-[var(--accent-primary)]/30"
           >
              <Eye size={24} />
           </button>
        </div>
      </header>

      {/* Editor Surface */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-12 py-20 flex flex-col">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full flex-1"
         >
           <textarea 
             value={content}
             onChange={(e) => setContent(e.target.value)}
             className="w-full bg-transparent border-none text-zinc-400 font-medium text-xl leading-relaxed outline-none resize-none placeholder:text-zinc-900 min-h-[70vh] italic selection:bg-[var(--accent-primary)] selection:text-white"
             placeholder="INITIATE NARRATIVE SEQUENCE..."
             spellCheck="false"
             autoFocus
           />
         </motion.div>
      </main>

      {/* Footer Info */}
      <footer className="h-14 bg-black border-t border-[var(--border-color)] px-8 flex items-center justify-between relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />
         
         <div className="flex items-center gap-10">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">Status: <span className="text-white">Active Resonance</span></span>
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">Encryption: <span className="text-white">Nakama-End-To-End</span></span>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
               <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] italic">Synchronized</span>
            </div>
         </div>
      </footer>
    </div>
  );
};
