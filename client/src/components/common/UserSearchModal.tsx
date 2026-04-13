import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: any) => void;
  title?: string;
}

export const UserSearchModal = ({ isOpen, onClose, onSelect, title = 'Search Users' }: UserSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/search`, {
        params: { q: query },
        withCredentials: true
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-xl font-bold font-[var(--font-syne)] uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full outline-none">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
            <input 
              autoFocus
              type="text"
              placeholder="Type username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-red-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)] animate-pulse uppercase tracking-widest font-bold">Seeking Nakamas...</div>
          ) : results.length > 0 ? (
            results.map((u: any) => (
              <button 
                key={u.id}
                onClick={() => onSelect(u)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-red-500/20"
              >
                <img src={u.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-full border border-[var(--border-color)]" alt="" />
                <div className="text-left">
                  <p className="font-bold group-hover:text-red-500 transition-colors uppercase tracking-tight">{u.username}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase">Ready for connection</p>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="p-12 text-center opacity-30 italic text-sm">No users found with that name</div>
          ) : (
             <div className="p-12 text-center flex flex-col items-center gap-4 opacity-20">
                <User size={48} />
                <p className="text-sm font-bold uppercase tracking-widest">Type to search the world of NAKAMA</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};
