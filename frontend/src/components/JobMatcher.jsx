import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Target, CheckCircle2, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import { analysisService } from '../services/api';

export default function JobMatcher() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      setError('Please provide both Job Title and Job Description.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await analysisService.matchJob(jobTitle, jobDescription, resumeText);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Job matching failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-400" /> Resume vs Job Matching & Gap Analysis
        </h2>
        <p className="text-slate-400 text-sm">Compare resume against target role descriptions to uncover missing key competencies.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Job Description</label>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste requirement text, technical skill criteria and responsibilities..."
            className="w-full p-3 rounded-xl glass-input text-xs text-slate-200 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Resume Text (Optional - uses latest uploaded resume if blank)</label>
          <textarea
            rows={3}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Leave empty to use your primary stored resume..."
            className="w-full p-3 rounded-xl glass-input text-xs text-slate-200 resize-none"
          />
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleMatch}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Calculate Job Match</>}
          </button>
        </div>
      </motion.div>

      {/* Match Result Breakdown */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Matching Compatibility Report</h3>
              <p className="text-xs text-slate-400">Target Role: {jobTitle}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-400">{result.match_score}%</span>
              <div className="text-xs text-slate-400">Overall Alignment</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" /> Matched Required Skills ({result.matched_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills (PRD Requirement) */}
            <div className="bg-slate-900/40 p-5 rounded-xl border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" /> Missing / Unrepresented Skills ({result.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
