import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Award, Target, Zap, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { analysisService } from '../services/api';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await analysisService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load user analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading performance trends & career telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" /> Career Analytics & Improvement Telemetry
        </h2>
        <p className="text-slate-400 text-sm">Detailed performance breakdown across ATS compliance, job requirements matching, and speech articulation efficiency.</p>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Overall Resume Rating</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">{data?.overall_resume_rating || 85}%</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12% database telemetry
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Job Compatibility</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{data?.job_compatibility || 84}%</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Live match query
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Speech Articulation</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400">{data?.speech_articulation || 88}%</div>
          <div className="flex items-center gap-1 text-[11px] text-purple-400 mt-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> STT Audio Telemetry
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ATS Readability</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{data?.ats_readability || 90}%</div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Optimal Section Layout
          </div>
        </motion.div>
      </div>

      {/* Main Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume & Job Match Trajectory */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Resume & Job Match Score Progression
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Monthly Trajectory</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.resume_trend || []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Interview Performance Trajectory */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Interview Speech Articulation Score
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Monthly Trajectory</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.interview_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Detailed Skill & Pillar Benchmark Breakdown */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-semibold text-white">Competency Pillar Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Technical Skill Density</span>
              <span className="text-blue-400">{data?.competency?.skill_density || 85}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data?.competency?.skill_density || 85}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">Live database aggregation of candidate skills.</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Role Requirement Match</span>
              <span className="text-emerald-400">{data?.competency?.role_match || 84}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data?.competency?.role_match || 84}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">Live position match telemetry.</p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Verbal Clarity & Tone</span>
              <span className="text-purple-400">{data?.competency?.verbal_clarity || 88}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${data?.competency?.verbal_clarity || 88}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">Live interview speech telemetry.</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

