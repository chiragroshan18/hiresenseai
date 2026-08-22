import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [isForgot, setIsForgot] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setIsForgot(false);
    setIsRegister(false);
    setError('');
    setSuccess('');
    setPassword('');
    setEmail(selectedRole === 'admin' ? 'chirag@hiresense.ai' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgot) {
        if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
          throw new Error("Password must contain exactly 6 digits");
        }
        await authService.forgotPassword(email, newPassword, confirmPassword);
        setSuccess('Password updated successfully! You can now log in.');
        setIsForgot(false);
        setPassword('');
      } else if (isRegister) {
        if (password.length !== 6 || !/^\d{6}$/.test(password)) {
          throw new Error("User password must contain exactly 6 digits");
        }
        const data = await authService.register(name, email, password);
        onLoginSuccess(data.user);
      } else {
        if (role === 'user' && (password.length !== 6 || !/^\d{6}$/.test(password))) {
          throw new Error("User password must contain exactly 6 digits");
        }
        const data = await authService.login(email, password);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = 'An authentication error occurred';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
      } else if (detail && typeof detail === 'object') {
        msg = detail.message || JSON.stringify(detail);
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 border border-white/10 shadow-2xl backdrop-blur-xl"
      >
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            HireSense AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">Intelligence-Driven Recruitment Analytics</p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSwitch('user')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'user'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" /> USER
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" /> ADMIN
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4">
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && role === 'user' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {role === 'admin' ? 'Admin Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'chirag@hiresense.ai' : 'user@example.com'}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {!isForgot ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {role === 'user' ? '6-Digit Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  maxLength={role === 'user' ? 6 : 50}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={role === 'user' ? '•••••• (6 Digits)' : '••••••••'}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New 6-Digit Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••••• (6 Digits)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="•••••• (Confirm)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* User Forgot Password trigger (STRICT RULE: NO FORGOT PASSWORD FOR ADMIN) */}
          {role === 'user' && !isRegister && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => { setIsForgot(!isForgot); setError(''); setSuccess(''); }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isForgot ? 'Back to Login' : 'Forgot Password?'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              role === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isForgot ? 'Update Password' : isRegister ? 'Create Account' : 'Login'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register / Sign in Toggle for User */}
        {role === 'user' && !isForgot && (
          <div className="mt-6 text-center text-xs text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-blue-400 font-semibold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
