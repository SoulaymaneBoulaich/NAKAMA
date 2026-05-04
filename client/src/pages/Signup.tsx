import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';
import { Spinner } from '../components/common/Spinner.js';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tosChecked, setTosChecked] = useState(false);

  const getFieldError = (name: string, value: string): string => {
    if (name === 'username') {
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores allowed';
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    if (name === 'password') {
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    }
    if (name === 'confirmPassword' && value !== formData.password) return 'Passwords do not match';
    return '';
  };

  const validateField = (name: string, value: string) => {
    const error = getFieldError(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error immediately if now valid
    if (errors[name]) {
      const error = getFieldError(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final synchronous validation check
    const currentErrors: Record<string, string> = {
      username: getFieldError('username', formData.username),
      email: getFieldError('email', formData.email),
      password: getFieldError('password', formData.password),
      confirmPassword: getFieldError('confirmPassword', formData.confirmPassword),
    };

    setErrors(currentErrors);

    if (Object.values(currentErrors).some(err => err)) {
      addToast('error', 'Please fix the errors in the form');
      return;
    }

    if (!tosChecked) {
      addToast('error', 'Please accept the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      addToast('success', 'Account created! Welcome to NAKAMA.');
      navigate('/home');
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        addToast('error', data.errors[0].message);
      } else {
        addToast('error', data?.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-bold tracking-tighter">NAKAMA</Link>
          <h2 className="text-3xl font-bold">Create an account</h2>
          <p className="text-white/40 text-sm">Join the community and start tracking your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Username" 
            name="username" 
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
          />
          <Input 
            label="Email" 
            type="email" 
            name="email" 
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
          />
          <Input 
            label="Password" 
            type="password" 
            name="password" 
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
          />
          <Input 
            label="Confirm Password" 
            type="password" 
            name="confirmPassword" 
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
          />

          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="tos" 
              checked={tosChecked}
              onChange={(e) => setTosChecked(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[var(--border-color)] bg-transparent checked:bg-white accent-white" 
            />
            <label htmlFor="tos" className="text-sm text-white/60 leading-tight">
              I agree to the <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-white text-black font-bold rounded-md hover:bg-white/90 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40">
          Already have an account? <Link to="/login" className="text-white font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};
