import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Film, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { SafeImage } from '../common/SafeImage';

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
  animeId?: string;
}

const PostCreationModal: React.FC<PostCreationModalProps> = ({ 
  isOpen, 
  onClose,
  communityId: initialCommunityId,
  animeId: initialAnimeId
}) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => api.postForm('/posts', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      resetAndClose();
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    if (initialCommunityId) formData.append('communityId', initialCommunityId);
    if (initialAnimeId) formData.append('animeId', initialAnimeId.toString());

    createPostMutation.mutate(formData);
  };

  const resetAndClose = () => {
    setContent('');
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-[var(--border-color)] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Create Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts on anime..."
            className="w-full bg-transparent border-none text-lg text-white placeholder-zinc-600 focus:ring-0 resize-none min-h-[150px]"
            autoFocus
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-black/20">
              <SafeImage src={imagePreview || ''} alt="Preview" className="w-full object-contain max-h-[300px]" />
              <button 
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-all"
                title="Add Image"
              >
                <ImageIcon size={22} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button type="button" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-all" title="Link Anime">
                <Film size={22} />
              </button>
              <button type="button" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-lg transition-all" title="Attach Community">
                <Users size={22} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(!content.trim() && !image) || createPostMutation.isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg transition-all transform active:scale-95"
              >
                {createPostMutation.isPending ? 'Posting...' : 'PUBLISH'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PostCreationModal;
