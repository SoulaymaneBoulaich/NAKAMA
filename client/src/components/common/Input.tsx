import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      <input
        {...props}
        className={`w-full px-4 py-3 bg-[#0A0A0B] border rounded-md outline-none transition-all duration-200
          ${error ? 'border-red-500 text-red-500' : 'border-[var(--border-color)] text-white focus:border-white/40'}`}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      {helperText && !error && <span className="text-xs text-white/40 mt-1">{helperText}</span>}
    </div>
  );
};
