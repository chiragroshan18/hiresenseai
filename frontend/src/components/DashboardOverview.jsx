import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Mic, History, TrendingUp, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { analysisService } from '../services/api';

export default function DashboardOverview({ user, onNavigate }) {
  const isAdmin = user?.role === 'admin';
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    async function loadTelemetry() {
      if (!isAdmin) {
        try {
          const res = await analysisService.getCareerInsights();
          setTelemetry(res);
        } catch (err) {
          console.error("Failed to load telemetry overview", err);
        }
      }
    }
    loadTelemetry();
  }, [isAdmin]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden bg-gradient-to-r from-blue-900/30 via-slate-900/60 to-purple-900/30"
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-white">
            Welcome back, {user?.name || (isAdmin ? "Chirag Roshan" : "User")}! 👋
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            {isAdmin
              ? "HireSense AI Administrator Control Room active. Monitoring platform usage telemetry, user metrics & database sync."
              : "Analyze your resume against ATS standards, measure job description compatibility, and practice AI interview speech articulation."}
          </p>
        </div>
      </motion.div>

      {/* Quick Action Cards Grid (User Mode) */}
      {!isAdmin && (
        <>
          {/* Live Dynamic Telemetry Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="text-slate-400 text-xs mb-1">Completed Analyses</div>
              <div className="text-3xl font-extrabold text-blue-400">{telemetry ? (telemetry.total_analyses ?? 0) : "..."}</div>
              <div className="text-[11px] text-emerald-400 mt-2 font-medium">Active Record Sync</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="text-slate-400 text-xs mb-1">Latest ATS Score</div>
              <div className="text-3xl font-extrabold text-emerald-400">{telemetry ? `${telemetry.ats_score}%` : "..."}</div>
              <div className="text-[11px] text-emerald-400 mt-2 font-medium">Target Benchmark Achieved</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="text-slate-400 text-xs mb-1">Target Job Match</div>
              <div className="text-3xl font-extrabold text-purple-400">{telemetry ? `${telemetry.job_match_score}%` : "..."}</div>
              <div className="text-[11px] text-purple-400 mt-2 font-medium">High Match Alignment</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="text-slate-400 text-xs mb-1">Interview Speech Score</div>
              <div className="text-3xl font-extrabold text-amber-400">{telemetry ? `${telemetry.interview_score}%` : "..."}</div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">Optimal Velocity</div>
            </motion.div>
          </div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => onNavigate('resume')}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Resume Analysis</h3>
              <p className="text-xs text-slate-400 mb-4">Extract technical skills, assess ATS compliance, and receive improvement scores.</p>
              <div className="flex items-center text-xs font-semibold text-blue-400 gap-1">
                Start Analysis <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate('job')}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Job Description Match</h3>
              <p className="text-xs text-slate-400 mb-4">Compare your profile against target roles and discover missing required skills.</p>
              <div className="flex items-center text-xs font-semibold text-emerald-400 gap-1">
                Match Position <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => onNavigate('speech')}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Speech & Interview STT</h3>
              <p className="text-xs text-slate-400 mb-4">Record spoken interview answers to track clarity, WPM, and filler words.</p>
              <div className="flex items-center text-xs font-semibold text-purple-400 gap-1">
                Record Speech <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>
        </>
      )}


      {/* Admin Redirect Shortcut */}
      {isAdmin && (
        <div className="glass-card rounded-2xl p-8 border border-purple-500/30 text-center">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Administrator Privilege Activated</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">Access platform metrics, user directory search, and database monitoring tools.</p>
          <button
            onClick={() => onNavigate('admin')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-purple-500/25"
          >
            Open Admin Control Room
          </button>
        </div>
      )}
    </div>
  );
}
