import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { XCircle, CheckCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  avatar?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, avatar?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string, avatar?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, avatar }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgStyles = {
    success: 'bg-[var(--bg-secondary)111] border-green-500/20',
    error: 'bg-[var(--bg-secondary)111] border-red-500/20',
    info: 'bg-[var(--bg-secondary)111] border-blue-500/20',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right fade-in duration-300 ${bgStyles[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-sm text-white font-medium">{toast.message}</span>
      {toast.avatar && (
        <img src={toast.avatar} alt="icon" className="w-8 h-8 rounded-full ml-1 object-cover border border-[var(--border-color)]" />
      )}
      <button onClick={() => onRemove(toast.id)} className="ml-2 hover:opacity-70">
        <XCircle className="w-4 h-4 text-white/40" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
