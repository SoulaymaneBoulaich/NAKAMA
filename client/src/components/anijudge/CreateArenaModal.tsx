import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Sword, Target, Clock, Trophy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CreateArenaModalProps {
  onClose: () => void;
}

export const CreateArenaModal = ({ onClose }: CreateArenaModalProps) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [roundCount, setRoundCount] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!topic || topic.length > 200) return;
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/anijudge`, {
        topic,
        roundCount,
        timerSeconds
      }, { withCredentials: true });
      
      navigate(`/anijudge/arena/${res.data.code}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-xl rounded-3xl border border-[var(--border-color)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-r from-red-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Sword size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-[var(--font-syne)] uppercase tracking-tight">Create Arena</h2>
              <p className="text-xs text-[var(--text-secondary)]">Setup your debate parameters</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          
          {/* Topic Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <Target size={14} className="text-red-500" />
              Debate Topic
            </label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Luffy vs Naruto: Who has better character development?"
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl px-4 py-4 min-h-[100px] focus:border-red-500 outline-none transition-all resize-none text-lg"
              maxLength={200}
            />
            <div className="text-right text-xs text-[var(--text-secondary)]">
              {topic.length}/200
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Round Count */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                <Trophy size={14} className="text-red-500" />
                Rounds
              </label>
              <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
                {[3, 5, 7].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRoundCount(val)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      roundCount === val ? 'bg-red-600 text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                <Clock size={14} className="text-red-500" />
                Time Per Turn
              </label>
              <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
                {[60, 120, 180].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTimerSeconds(val)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      timerSeconds === val ? 'bg-red-600 text-white shadow-md' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {val}s
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex gap-4">
           <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-bold bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-all"
          >
            CANCEL
          </button>
          <button 
            onClick={handleCreate}
            disabled={!topic || loading}
            className="flex-[2] py-4 rounded-xl font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white transition-all shadow-lg shadow-red-900/10"
          >
            {loading ? 'OPENING ARENA...' : 'COMMENCE DEBATE'}
          </button>
        </div>

      </div>
    </div>
  );
};
