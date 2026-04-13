import React from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'info';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[var(--bg-secondary)111] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
            {type === 'danger' ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/40">{message}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              type === 'danger' 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
