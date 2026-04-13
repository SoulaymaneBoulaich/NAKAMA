import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Input } from '../components/common/Input.js';
import { useToast } from '../components/common/Toast.js';
import { Spinner } from '../components/common/Spinner.js';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(token ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (token) setStep(3);
  }, [token]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      addToast('success', 'Password updated! Please log in.');
      navigate('/login');
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-tighter">NAKAMA</Link>
          <h2 className="text-3xl font-bold">
            {step === 1 && 'Reset password'}
            {step === 2 && 'Check your email'}
            {step === 3 && 'New password'}
          </h2>
          <p className="text-white/40 text-sm">
            {step === 1 && 'Enter your email to receive a reset link.'}
            {step === 2 && 'We sent a link to your email if an account exists.'}
            {step === 3 && 'Choose a strong new password for your account.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <Input 
              label="Email" 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full h-12 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-all flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-white/40 hover:text-white transition-all">Back to login</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-white/5 rounded-lg border border-[var(--border-color)] italic text-white/60">
              Check the console if you are in development.
            </div>
            <Link to="/login" className="block w-full h-12 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-all leading-[3rem]">
              Back to login
            </Link>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <Input 
              label="New Password" 
              type="password" 
              placeholder="At least 8 characters"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              autoFocus
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="Repeat new password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <button 
              type="submit" 
              className="w-full h-12 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-all flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
