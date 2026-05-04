import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  Search, 
  Users, 
  Lock, 
  Globe, 
  Plus,
  Trash2,
  Share2,
  UserPlus
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { SafeImage } from '../common/SafeImage';
import { Spinner } from '../common/Spinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SHARED'>('PUBLIC');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedAnimes, setSelectedAnimes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/search/anime?q=${query}`);
      setSearchResults(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const addAnime = (anime: any) => {
    if (selectedAnimes.some(a => a.mal_id === anime.mal_id)) return;
    setSelectedAnimes([...selectedAnimes, anime]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeAnime = (id: number) => {
    setSelectedAnimes(selectedAnimes.filter(a => a.mal_id !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      addToast('error', 'Please give your playlist a name');
      return;
    }
    setIsSubmitting(true);
    try {
      let finalCoverUrl = '';
      if (coverImage) {
        const formData = new FormData();
        formData.append('file', coverImage);
        const uploadRes = await api.post('/upload/image', formData);
        finalCoverUrl = uploadRes.data.url;
      }

      await api.post('/playlists', {
        title,
        description,
        visibility,
        isCollaborative,
        coverUrl: finalCoverUrl,
        animeIds: selectedAnimes.map(a => a.mal_id.toString())
      });

      addToast('success', 'Playlist curated successfully');
      onClose();
    } catch (err) {
      addToast('error', 'Failed to create playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]"
        >
          {/* Left Side: Meta & Info */}
          <div className="w-full md:w-80 bg-[#161618] p-8 flex flex-col gap-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
            {/* Cover Preview */}
            <div className="aspect-square relative group">
              <div className="w-full h-full bg-[#272727] rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative">
                {coverPreview ? (
                  <img src={coverPreview} className="w-full h-full object-cover" alt="Playlist Cover" />
                ) : selectedAnimes.length >= 4 ? (
                  <div className="grid grid-cols-2 grid-rows-2 h-full">
                    {selectedAnimes.slice(0, 4).map((a, i) => (
                      <SafeImage key={i} src={a.images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                    ))}
                  </div>
                ) : selectedAnimes.length > 0 ? (
                    <SafeImage src={selectedAnimes[0].images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-600">
                      <ImageIcon size={32} />
                    </div>
                  </div>
                )}
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="text-white" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Custom Cover</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Playlist Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Epic Anime Mix"
                  className="w-full bg-[#272727] border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#1DB954]/50 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional context..."
                  className="w-full bg-[#272727] border border-white/5 rounded-2xl p-4 text-sm text-zinc-400 outline-none h-24 resize-none focus:border-[#1DB954]/50 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-zinc-500" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Collaborative</span>
                </div>
                <button 
                  onClick={() => setIsCollaborative(!isCollaborative)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isCollaborative ? 'bg-[#1DB954]' : 'bg-[#3e3e3e]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isCollaborative ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Anime Curation */}
          <div className="flex-1 p-8 flex flex-col bg-[#0f0f0f]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Curation Core</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setVisibility('PUBLIC')}
                  className={`p-3 rounded-xl transition-all ${visibility === 'PUBLIC' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                >
                  <Globe size={18} />
                </button>
                <button 
                  onClick={() => setVisibility('PRIVATE')}
                  className={`p-3 rounded-xl transition-all ${visibility === 'PRIVATE' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                >
                  <Lock size={18} />
                </button>
                <button 
                  onClick={() => setVisibility('SHARED')}
                  className={`p-3 rounded-xl transition-all ${visibility === 'SHARED' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search animes to add..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:bg-white/10 transition-all placeholder:text-zinc-700"
              />
              
              {/* Dropdown Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1c] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    {searchResults.map((a) => (
                      <button
                        key={a.mal_id}
                        onClick={() => addAnime(a)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-white/5 text-left transition-all group"
                      >
                        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <SafeImage src={a.images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors truncate">{a.title}</div>
                          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{a.year || 'N/A'} • {a.type || 'TV'}</div>
                        </div>
                        <Plus size={16} className="text-zinc-700 group-hover:text-white mr-2" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Animes List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {selectedAnimes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <div className="w-20 h-20 border-2 border-dashed border-white rounded-3xl flex items-center justify-center mb-4">
                    <Plus size={32} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]">Manifest Your Selections</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {selectedAnimes.map((a, idx) => (
                    <div 
                      key={a.mal_id}
                      className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all"
                    >
                      <span className="w-6 text-center text-xs font-black text-zinc-700 group-hover:text-zinc-500">{idx + 1}</span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                        <SafeImage src={a.images?.jpg?.large_image_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate font-dm-sans">{a.title}</div>
                      </div>
                      <button 
                        onClick={() => removeAnime(a.mal_id)}
                        className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 p-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all bg-white/5 border border-white/5">
                  <UserPlus size={14} /> Invite People
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedAnimes.length === 0}
                className="px-12 py-4 bg-[#1DB954] text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_40px_rgba(29,185,84,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all text-xs"
              >
                {isSubmitting ? <Spinner size="sm" color="black" /> : 'Finalize Curation'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
