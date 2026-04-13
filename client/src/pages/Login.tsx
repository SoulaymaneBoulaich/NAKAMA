import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/common/Input.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';
import { Spinner } from '../components/common/Spinner.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      addToast('success', 'Welcome back!');
      navigate('/home');
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-tighter">NAKAMA</Link>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-white/40 text-sm">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email or Username" 
            name="emailOrUsername" 
            placeholder="Username or your email"
            value={formData.emailOrUsername}
            onChange={handleChange}
            autoFocus
          />
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              name="password" 
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/reset-password" title="reset password" className="text-xs text-white/40 hover:text-white hover:underline transition-all">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Don't have an account? <Link to="/signup" className="text-white font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};
