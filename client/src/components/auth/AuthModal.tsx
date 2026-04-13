import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Spinner } from '../common/Spinner';
import { Input } from '../common/Input';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalView, login, signup } = useAuth();
  const { addToast } = useToast();
  
  const [view, setView] = useState<'login' | 'signup'>(authModalView);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setView(authModalView);
  }, [authModalView]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ 
        emailOrUsername: formData.emailOrUsername, 
        password: formData.password 
      });
      addToast('success', 'Welcome back to Nakama!');
      closeAuthModal();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      addToast('success', 'Welcome to the crew!');
      closeAuthModal();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[440px] bg-[var(--bg-secondary)114] border border-[#1e1e24] shadow-2xl rounded-[24px] overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={closeAuthModal}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-[#71717a] hover:text-[#f4f4f5] transition-all z-10"
          >
            <X size={20} />
          </button>

          {/* Top Branding / Tab Switch */}
          <div className="pt-10 px-8 pb-6 border-b border-[#1e1e24] flex flex-col items-center">
            <div className="w-12 h-12 bg-[var(--accent-primary)] rounded-xl flex items-center justify-center font-black text-white text-xl mb-4 shadow-[0_0_20px_rgba(220,38,38,0.3)]">N</div>
            <h2 className="font-outfit font-extrabold text-2xl text-[#f4f4f5] tracking-tight mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="font-dm-sans text-sm text-[#71717a]">
              {view === 'login' ? 'Sign in to continue your journey' : 'Join the ultimate anime community'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-5">
              {view === 'login' ? (
                <div className="space-y-4">
                  <Input 
                    label="Account" 
                    name="emailOrUsername" 
                    placeholder="Email or Username"
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    autoFocus
                  />
                  <div className="relative">
                    <Input 
                      label="Password" 
                      type={showPassword ? 'text' : 'password'} 
                      name="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-10 text-[#3f3f46] hover:text-[#71717a] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input 
                    label="Username" 
                    name="username" 
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <Input 
                    label="Email Address" 
                    type="email"
                    name="email" 
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <Input 
                        label="Password" 
                        type={showPassword ? 'text' : 'password'} 
                        name="password" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <Input 
                      label="Confirm Password" 
                      type={showPassword ? 'text' : 'password'} 
                      name="confirmPassword" 
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[var(--accent-primary)] text-white font-outfit font-bold rounded-xl hover:bg-red-700 hover:shadow-[0_8px_20px_rgba(220,38,38,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                {loading ? <Spinner size="sm" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#1e1e24] text-center">
              <p className="font-dm-sans text-sm text-[#71717a]">
                {view === 'login' ? "Don't have an account?" : "Already a member?"}
                <button 
                  onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                  className="ml-2 font-bold text-[#f4f4f5] hover:text-[var(--accent-primary)] transition-colors"
                >
                  {view === 'login' ? 'Sign up for free' : 'Log in here'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
