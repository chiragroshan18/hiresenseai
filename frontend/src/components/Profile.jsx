import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function Profile({ user }) {
  const isAdmin = user?.role === 'admin';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (isAdmin) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
        throw new Error("New password must contain exactly 6 digits");
      }
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setMessage("Password updated successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
            isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
          }`}>
            {isAdmin ? <Shield className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {isAdmin ? "Chirag Roshan" : (user?.name || "HireSense User")}
              <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${
                isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {user?.role || 'user'}
              </span>
            </h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Password & Security Panel */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" /> Security & Credentials
        </h3>

        {/* PRD MANDATED STRICT RULE: ADMIN CANNOT UPDATE PASSWORD FROM PANEL */}
        {isAdmin ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
            <p className="font-semibold">Notice for Administrator:</p>
            <p className="mt-1 opacity-90">Admin password cannot be updated from this panel.</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <AnimatePresence>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {message}
                </div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current 6-Digit Password</label>
              <input
                type="password"
                required
                maxLength={6}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New 6-Digit Password</label>
              <input
                type="password"
                required
                maxLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                maxLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
