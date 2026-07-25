import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/blog/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/blog/admin');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative px-4 py-12" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <SEO title="Admin Login" description="Sign in to the ZoServe Blog Management System to create and edit articles." />

      {/* Background radial effects for premium visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--color-primary-light)]/10 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[var(--color-accent)]/5 blur-[80px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-[var(--color-border-light)] rounded-2xl p-8 md:p-10 shadow-premium relative z-10"
      >
        {/* Header logo */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="loginBracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A3C6E" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
                <linearGradient id="loginRackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="50%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#1A3C6E" />
                </linearGradient>
                <linearGradient id="loginNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ED47A" />
                  <stop offset="100%" stopColor="#24508F" />
                </linearGradient>
              </defs>
              
              {/* Code Brackets */}
              <path d="M 36 24 L 18 50 L 36 76" stroke="url(#loginBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 64 24 L 82 50 L 64 76" stroke="url(#loginBracketGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Server lines */}
              <path d="M 32 37 H 68" stroke="url(#loginRackGrad)" strokeWidth="8" strokeLinecap="round" />
              <path d="M 32 63 H 68" stroke="url(#loginRackGrad)" strokeWidth="8" strokeLinecap="round" />
              
              {/* Database Core node */}
              <circle cx="50" cy="50" r="8.5" fill="url(#loginNodeGrad)" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">ZoServe Portal</h2>
          <p className="text-xs text-[var(--color-text-light)] mt-2 font-semibold">Sign in to manage the corporate blog</p>
        </div>

        {/* Error notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed"
            style={{ backgroundColor: 'var(--color-alert-bg)', borderColor: 'var(--color-alert-border)', color: 'var(--color-alert-text)' }}
          >
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-alert-text)' }} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@zoserve.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all duration-200 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-light)] focus:bg-white"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider">Password</label>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)] cursor-not-allowed"
                onClick={() => alert('Please contact the IT Administrator to reset your password.')}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--color-primary-light)] focus:ring-2 focus:ring-slate-100 transition-all duration-200 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-light)] focus:bg-white"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Extras */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-primary)] border-slate-300 focus:ring-[var(--color-primary)]"
              />
              <span className="text-xs font-medium text-[var(--color-text-light)] select-none">Remember this device</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-slate-400 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-[var(--color-primary)]/10 text-sm mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
