import React, { useState } from 'react';
import api from '../../api/axios';
import { Send, Image as ImageIcon, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface Props {
  communityId?: string;
  onPostCreated?: (post: any) => void;
}

const CreatePost: React.FC<Props> = ({ communityId, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !showPoll) return;

    try {
      setLoading(true);
      const res = await api.post('/posts', {
        content: content || (showPoll ? pollData.question : ''),
        communityId,
        poll: showPoll ? {
          question: pollData.question,
          options: pollData.options.filter(o => o.trim() !== '')
        } : undefined
      });

      setContent('');
      setShowPoll(false);
      setPollData({ question: '', options: ['', ''] });
      if (onPostCreated) onPostCreated(res.data);
    } catch (error) {
      console.error('Post creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-[var(--border-color)] rounded-2xl p-4 mb-6 shadow-xl shadow-black/20 overflow-hidden">
      <div className="flex gap-4">
        <img 
          src={user?.avatar || '/default-avatar.png'} 
          alt="" 
          className="w-10 h-10 rounded-full border border-[var(--border-color)] object-cover"
        />
        <div className="flex-1 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Transmit your message to the niche..."
            className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 focus:ring-0 resize-none py-2 font-medium"
            rows={2}
          />

          {showPoll && (
            <div className="bg-zinc-950 border border-[var(--border-color)] rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <input 
                type="text" 
                placeholder="Poll Question..."
                value={pollData.question}
                onChange={(e) => setPollData({...pollData, question: e.target.value})}
                className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-lg py-2 px-4 text-sm text-zinc-100 focus:border-red-600/50 outline-none"
              />
              {pollData.options.map((opt, i) => (
                <input 
                  key={i}
                  type="text" 
                  placeholder={`Option ${i+1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollData.options];
                    newOpts[i] = e.target.value;
                    setPollData({...pollData, options: newOpts});
                  }}
                  className="w-full bg-zinc-900 border border-[var(--border-color)] rounded-lg py-2 px-4 text-xs text-zinc-300 focus:border-red-600/50 outline-none"
                />
              ))}
              <button 
                type="button"
                onClick={() => setPollData({...pollData, options: [...pollData.options, '']})}
                className="text-[10px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-widest pl-2"
              >
                + Add Option
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <button 
                type="button"
                className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
              >
                <ImageIcon size={20} />
              </button>
              <button 
                type="button"
                onClick={() => setShowPoll(!showPoll)}
                className={`p-2 rounded-xl transition-all ${showPoll ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:text-red-500 hover:bg-red-500/10'}`}
              >
                <BarChart2 size={20} />
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || (!content.trim() && !showPoll)}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-900/20"
            >
              {loading ? 'TRANSMITTING...' : 'TRANSMIT'} <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
