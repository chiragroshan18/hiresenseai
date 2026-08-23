import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, Activity, Search, Database, Cpu } from 'lucide-react';
import { adminService } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [dashData, userData] = await Promise.all([
          adminService.getDashboard(),
          adminService.getUsers()
        ]);
        setStats(dashData);
        setUsers(userData);
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading administrator control room...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" /> Platform Admin Control Center
          </h2>
          <p className="text-slate-400 text-sm">Monitor user activity, system evaluation usage, and aggregate platform telemetry.</p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.total_users || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Analyses Executed</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">{stats?.total_analyses || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Avg Resume Score</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{stats?.avg_resume_score}%</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Avg Interview Score</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{stats?.avg_interview_score}%</div>
        </motion.div>
      </div>

      {/* System Health & Skill Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> System Health Dashboard
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">FastAPI REST Service</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Operational</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Neon PostgreSQL DB</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Whisper STT Engine</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" /> Top Skills Detected across Candidates
          </h4>
          <div className="space-y-1.5 text-xs">
            {!stats?.most_common_skills || stats.most_common_skills.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2">No candidate skill data recorded yet.</p>
            ) : (
              stats.most_common_skills.map((skill, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-slate-200">{skill}</span>
                  <span className="text-blue-400 font-bold text-[10px]">High Demand</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" /> Top Missing Skill Gaps
          </h4>
          <div className="space-y-1.5 text-xs">
            {!stats?.most_missing_skills || stats.most_missing_skills.length === 0 ? (
              <p className="text-slate-500 text-[11px] py-2">No missing skill gap data recorded yet.</p>
            ) : (
              stats.most_missing_skills.map((skill, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-slate-200">{skill}</span>
                  <span className="text-amber-400 font-bold text-[10px]">Action Area</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* User Management Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> User Directory ({filteredUsers.length})
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user email or name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 font-semibold">User ID</th>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Account Created</th>
                <th className="p-3 font-semibold text-right">Analyses Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">No users found matching query.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="p-3 font-medium text-white">{u.name}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3 text-slate-400">{u.created_at}</td>
                    <td className="p-3 text-right font-bold text-purple-400">{u.analyses_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

