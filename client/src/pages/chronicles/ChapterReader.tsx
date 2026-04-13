import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Settings, MessageSquare, ChevronLeft, ChevronRight, Loader2, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export const ChronicleChapterReaderPage: React.FC = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const [chapter, setChapter] = useState<any>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [maxWidth, setMaxWidth] = useState(800);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [chapterRes, allChaptersRes] = await Promise.all([
          api.get(`/stories/${id}/chapters/${chapterId}`),
          api.get(`/stories/${id}/chapters`)
        ]);
        setChapter(chapterRes.data);
        setAllChapters(allChaptersRes.data);
      } catch (error) {
        console.error('Failed to fetch chapter', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id, chapterId]);

  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  if (loading) return (
    <div className="flex justify-center py-64">
      <Loader2 className="text-red-500 animate-spin" size={48} />
    </div>
  );

  if (!chapter) return <div className="text-center py-32 text-zinc-500 uppercase font-black">Chapter not found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 z-40 px-4">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to={`/chronicles/${id}`} 
              className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-2xl transition-all hover:bg-zinc-800"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="hidden md:block">
               <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest block mb-0.5">{chapter.story?.title || 'Chronicle'}</span>
               <h1 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Chapter {chapter.chapterNumber}: {chapter.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSettingsOpen(!isSettingsOpen)}
               className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-2xl transition-all"
               title="Reader Settings"
             >
                <Settings size={20} />
             </button>
             <div className="h-8 w-px bg-zinc-900 mx-2" />
             <div className="flex items-center gap-2">
                <button 
                  disabled={!prevChapter}
                  onClick={() => navigate(`/stories/${id}/chapters/${prevChapter.id}`)}
                  className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-2xl transition-all disabled:opacity-30 disabled:hover:bg-zinc-900"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="bg-zinc-900 px-4 py-3 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-[var(--border-color)]">
                   {currentIndex + 1} / {allChapters.length}
                </div>
                <button 
                  disabled={!nextChapter}
                  onClick={() => navigate(`/stories/${id}/chapters/${nextChapter.id}`)}
                  className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-2xl transition-all disabled:opacity-30 disabled:hover:bg-zinc-900"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Reader Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSettingsOpen(false)}
               className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-[var(--border-color)] z-50 p-8 shadow-2xl"
            >
               <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-8">Typography Settings</h3>
               
               <div className="space-y-10">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Font Size: {fontSize}px</label>
                    <input 
                      type="range" min="14" max="32" step="1" 
                      value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Line Height: {lineHeight}</label>
                    <input 
                      type="range" min="1.4" max="2.4" step="0.1" 
                      value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Max Width: {maxWidth}px</label>
                    <input 
                      type="range" min="600" max="1200" step="50" 
                      value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Immersive content */}
      <main className="pt-40 pb-32 px-4 transition-all duration-300" style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
        <header className="mb-20 text-center">
           <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] block mb-4">Chapter {chapter.chapterNumber}</span>
           <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">{chapter.title}</h2>
           <div className="flex items-center justify-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><User size={12} strokeWidth={3} /> {chapter.author?.username}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} strokeWidth={3} /> {new Date(chapter.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><BookOpen size={12} strokeWidth={3} /> {chapter.wordCount} words</span>
           </div>
           <div className="w-20 h-1 bg-red-600 mx-auto mt-12 rounded-full" />
        </header>

        <article 
          className="text-white/90 font-medium selection:bg-red-500 selection:text-white"
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
        >
          {chapter.content.split(/\n\n+/).map((para: string, i: number) => (
            <p 
              key={i} 
              className={`mb-8 ${i === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:text-red-600 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-2' : ''}`}
            >
              {para.split('\n').map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < para.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          ))}
        </article>

        {/* Footer Navigation */}
        <div className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-stretch justify-between gap-6">
            <div className="flex-1">
              {prevChapter && (
                <Link 
                  to={`/chronicles/${id}/chapters/${prevChapter.id}`}
                  className="group block p-8 bg-zinc-900/30 border border-[var(--border-color)] rounded-3xl hover:border-[var(--accent-primary)]/50 transition-all text-left"
                >
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2 transition-colors group-hover:text-[var(--accent-primary)]">Previous Discovery</span>
                   <div className="flex items-center gap-4">
                     <ArrowLeft className="text-zinc-500 group-hover:-translate-x-2 transition-transform" />
                     <span className="text-xl font-black text-white uppercase italic tracking-tighter">{prevChapter.title}</span>
                   </div>
                </Link>
              )}
            </div>

            <div className="flex-1">
              {nextChapter && (
                <Link 
                  to={`/chronicles/${id}/chapters/${nextChapter.id}`}
                  className="group block p-8 bg-zinc-900/30 border border-[var(--border-color)] rounded-3xl hover:border-[var(--accent-primary)]/50 transition-all text-right"
                >
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2 transition-colors group-hover:text-[var(--accent-primary)]">Next Destination</span>
                   <div className="flex items-center justify-end gap-4">
                     <span className="text-xl font-black text-white uppercase italic tracking-tighter">{nextChapter.title}</span>
                     <ArrowRight className="text-zinc-500 group-hover:translate-x-2 transition-transform" />
                   </div>
                </Link>
              )}
            </div>
        </div>
      </main>

      {/* Floating Action Button for Comments */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-900/50 flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all active:scale-95 z-40">
        <MessageSquare size={24} fill="currentColor" />
      </button>
    </div>
  );
};
