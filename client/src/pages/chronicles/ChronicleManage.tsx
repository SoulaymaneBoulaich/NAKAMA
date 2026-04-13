import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, Users, Image as ImageIcon, Check, Loader2, BookOpen, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ChronicleManagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [chronicle, setChronicle] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', coverUrl: '', tags: [] as string[], status: 'ONGOING', isPublished: false });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [storyRes, chaptersRes] = await Promise.all([
        api.get(`/stories/${id}`),
        api.get(`/stories/${id}/chapters`)
      ]);
      setChronicle(storyRes.data);
      setChapters(chaptersRes.data);
      setEditForm({
        title: storyRes.data.title,
        description: storyRes.data.description,
        coverUrl: storyRes.data.coverUrl || '',
        tags: storyRes.data.tags,
        status: storyRes.data.status,
        isPublished: storyRes.data.isPublished
      });
      setCoverPreview(storyRes.data.coverUrl || null);
      setCoverFile(null);
    } catch (error) {
      addToast('error', 'Failed to fetch archive data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('error', 'Image must be less than 5MB');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateChronicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('status', editForm.status);
      formData.append('isPublished', String(editForm.isPublished));
      formData.append('tags', JSON.stringify(editForm.tags));
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await api.put(`/stories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      addToast('success', 'Archive synchronized successfully');
      setIsEditingMetadata(false);
      fetchData();
    } catch (error) {
      addToast('error', (error as any).response?.data?.error || 'Synchronization failed');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm('Are you sure you want to purge this record? This action is irreversible.')) return;
    try {
      await api.delete(`/stories/${id}/chapters/${chapterId}`);
      addToast('success', 'Record purged');
      fetchData();
    } catch (error) {
      addToast('error', 'Purge failed');
    }
  };

  const handleCreateChapter = async () => {
    try {
      const { data } = await api.post(`/stories/${id}/chapters`, {
        title: `Chapter ${chapters.length + 1}`,
        content: '',
      });
      navigate(`/chronicles/${id}/chapters/${data.id}/edit`);
    } catch (error) {
      addToast('error', 'Failed to create record');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-64">
      <Loader2 className="text-[var(--accent-primary)] animate-spin" size={64} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-20">
        <div className="flex items-start gap-10">
           <div className="w-40 h-60 rounded-[2.5rem] bg-zinc-950 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[var(--border-color)] flex-shrink-0 relative group">
              {chronicle.coverUrl ? (
                <img src={chronicle.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <BookOpen size={48} className="text-zinc-800" />
                </div>
              )}
              <button 
                onClick={() => setIsEditingMetadata(true)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm"
              >
                 <ImageIcon size={32} />
              </button>
           </div>
           
           <div className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-1.5 bg-[var(--accent-primary)]/10 rounded-lg">
                    <Sparkles className="text-[var(--accent-primary)]" size={16} />
                 </div>
                 <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em]">Chronicle Management</span>
                 <StatusBadge status={chronicle.status} />
                 {!chronicle.isPublished && (
                   <span className="text-[9px] font-black text-zinc-500 border border-[var(--border-color)] px-3 py-1.5 rounded-lg uppercase tracking-widest bg-white/5">ARCHIVE DRAFT</span>
                 )}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4 leading-[0.85]">{chronicle.title}</h1>
              <p className="text-zinc-500 font-medium text-base line-clamp-2 max-w-2xl mb-10 italic leading-relaxed">{chronicle.description}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                 <button 
                   onClick={() => setIsEditingMetadata(true)}
                   className="px-8 py-4 bg-white/5 border border-[var(--border-color)] text-zinc-400 hover:text-white hover:border-[var(--accent-primary)]/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 group"
                 >
                    <Edit3 size={16} className="text-[var(--accent-primary)]" /> 
                    Synchronize Metadata
                 </button>
                 <Link 
                   to={`/chronicles/${id}`}
                   className="px-8 py-4 bg-white/5 border border-[var(--border-color)] text-zinc-400 hover:text-white hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                 >
                    <Eye size={16} />
                    Audit Feed
                 </Link>
                 <button className="px-8 py-4 bg-white/5 border border-[var(--border-color)] text-zinc-400 hover:text-white hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3">
                    <Users size={16} />
                    Collective
                 </button>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-[2.5rem] text-center md:text-right shadow-2xl">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-2">Resonance Score</span>
               <div className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                 {chronicle.totalViews.toLocaleString()} 
                 <span className="text-lg text-zinc-800 ml-2">Audit Views</span>
               </div>
            </div>
        </div>
      </div>

      {/* Chapters Management */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-10">
           <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Recorded Segments</h2>
           <button 
             onClick={handleCreateChapter}
             className="flex items-center gap-3 px-10 py-5 bg-[var(--accent-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all"
           >
              <Plus size={20} strokeWidth={4} />
              Forge Segment
           </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {chapters.map((chapter) => (
             <motion.div 
               key={chapter.id}
               layout
               className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/2 border border-[var(--border-color)] rounded-[2.5rem] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/2 transition-all"
             >
                <div className="flex items-center gap-10 mb-6 md:mb-0">
                   <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-black text-zinc-800 group-hover:text-[var(--accent-primary)] transition-colors italic border border-[var(--border-color)]">
                     {chapter.chapterNumber.toString().padStart(2, '0')}
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover:text-[var(--accent-primary)] transition-colors leading-none">{chapter.title}</h4>
                      <div className="flex items-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                         <span className={`flex items-center gap-2 ${chapter.isPublished ? 'text-[var(--accent-primary)]/60' : 'text-zinc-700'}`}>
                           {chapter.isPublished ? <Check size={14} strokeWidth={4} /> : <Clock size={14} strokeWidth={4} />}
                           {chapter.isPublished ? 'Archived' : 'Draft Entry'}
                         </span>
                         <span className="flex items-center gap-2"><BookOpen size={14} /> {chapter.wordCount} Lexicon</span>
                         {chapter.publishedAt && <span className="flex items-center gap-2"><Clock size={14} /> {new Date(chapter.publishedAt).toLocaleDateString()}</span>}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <Link 
                     to={`/chronicles/${id}/chapters/${chapter.id}/edit`}
                     className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-primary)] hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl"
                   >
                     Redact Entry
                   </Link>
                   <button 
                     onClick={() => handleDeleteChapter(chapter.id)}
                     className="p-5 bg-zinc-950 border border-[var(--border-color)] text-zinc-800 hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-2xl transition-all"
                   >
                      <Trash2 size={24} />
                   </button>
                </div>
             </motion.div>
           ))}

           {chapters.length === 0 && (
             <div className="py-32 text-center bg-white/2 border-2 border-dashed border-[var(--border-color)] rounded-[4rem]">
                <div className="w-24 h-24 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-10 text-zinc-800 border border-[var(--border-color)]">
                   <BookOpen size={48} strokeWidth={1} />
                </div>
                <h3 className="text-3xl font-black text-zinc-600 uppercase italic tracking-tighter mb-4">The Archives are Void.</h3>
                <p className="text-zinc-600 text-sm mt-2 mb-12 max-w-sm mx-auto font-medium">Your narrative awaits the first stroke. Initiate the recording sequence now.</p>
                <button onClick={handleCreateChapter} className="text-[var(--accent-primary)] text-[11px] font-black uppercase tracking-[0.4em] hover:text-[var(--accent-primary)]/80 transition-all">Establish First Record</button>
             </div>
           )}
        </div>
      </div>

      {/* Metadata Edit Modal Overlay */}
      <AnimatePresence>
        {isEditingMetadata && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingMetadata(false)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }} 
              className="relative w-full max-w-3xl bg-[var(--bg-primary)] rounded-[3.5rem] p-16 border border-[var(--border-color)] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               {/* Decorative background */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-[100px] pointer-events-none" />

               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg">
                      <ImageIcon className="text-[var(--accent-primary)]" size={20} />
                   </div>
                   <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Chronicle Specification</h2>
                 </div>
                 
                 <form onSubmit={handleUpdateChronicle} className="space-y-8 mt-12">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.3em] ml-2 block italic">Core Identifier (Title)</label>
                      <input className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl p-6 text-white text-lg font-black italic uppercase tracking-tighter outline-none focus:border-[var(--accent-primary)]/40 transition-all placeholder:text-zinc-800" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} placeholder="ENTRER TITRE..." />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block italic">Objective Manifest (Description)</label>
                      <textarea rows={4} className="w-full bg-white/5 border border-[var(--border-color)] rounded-3xl p-6 text-zinc-400 font-medium outline-none focus:border-[var(--accent-primary)]/40 transition-all resize-none leading-relaxed text-base italic" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} placeholder="DÉCRIRE LA MISSION..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block italic">Visual Encrypt (Cover)</label>
                        <div className="flex gap-6 items-center">
                          <div className="w-24 h-36 bg-zinc-950 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--border-color)] flex items-center justify-center relative group shadow-2xl">
                            {coverPreview ? (
                              <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="text-zinc-800" size={32} />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-sm">
                              <span className="text-[9px] font-black text-[var(--accent-primary)] uppercase italic tracking-widest">UPLOAD</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                              OPTIMAL RATIO: 2:3 (PORTRAIT)<br />
                              MAX AUDIT: 5MB.<br/>
                              FORMAT: PNG, JPG, WEBP.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block italic mb-2">Operational Status</label>
                          <select className="w-full bg-white/5 border border-[var(--border-color)] rounded-2xl p-5 text-white font-black italic uppercase tracking-widest outline-none focus:border-[var(--accent-primary)]/40 transition-all appearance-none cursor-pointer" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                            <option value="ONGOING" className="bg-zinc-900 font-black">ACTIVE RECORDING</option>
                            <option value="COMPLETED" className="bg-zinc-900 font-black">ARCHIVE SEALED</option>
                            <option value="HIATUS" className="bg-zinc-900 font-black">TEMPORARY SHUTDOWN</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block italic mb-2">Global Visibility</label>
                          <button type="button" onClick={() => setEditForm({...editForm, isPublished: !editForm.isPublished})} className={`w-full p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border shadow-lg ${editForm.isPublished ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50 text-[var(--accent-primary)] shadow-[var(--accent-primary)]/10' : 'bg-black border-[var(--border-color)] text-zinc-600 shadow-black'}`}>
                            {editForm.isPublished ? 'UNRESTRICTED ACCESS' : 'ENCRYPTED PHASE (DRAFT)'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-[var(--border-color)]">
                      <button type="submit" className="flex-1 bg-white text-black py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-[0_15px_40px_rgba(255,255,255,0.1)] hover:shadow-[var(--accent-primary)]/30">Synchronize Archives</button>
                      <button type="button" onClick={() => setIsEditingMetadata(false)} className="px-12 bg-white/5 text-zinc-600 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all">Abort</button>
                    </div>
                 </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
