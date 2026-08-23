import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Sparkles, Award, Target, AlertTriangle, FileCheck } from 'lucide-react';
import { analysisService } from '../services/api';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file && !textInput.trim()) {
      setError('Please upload a resume file or paste resume text.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', textInput);
      }

      const res = await analysisService.analyzeResume(formData);
      setReport(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" /> Resume NLP Analysis
          </h2>
          <p className="text-slate-400 text-sm">Extract skills, evaluate readability & calculate objective ATS scores.</p>
        </div>
      </div>

      {/* Upload & Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Option A: Upload File (PDF, DOCX, DOC, TXT, Image)</h3>
          <label 
            htmlFor="resume-upload-input"
            className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors group bg-slate-900/30 block"
          >
            {file ? (
              <div className="flex flex-col items-center">
                <FileCheck className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-sm font-semibold text-emerald-300 break-all">{file.name}</span>
                <span className="text-[10px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB • Tap to change file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300">Tap anywhere here to browse file / photo</span>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, DOC, TXT, PNG, JPG up to 10MB</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp,image/*" 
              onChange={handleFileChange} 
              className="hidden" 
              id="resume-upload-input" 
            />
          </label>
        </motion.div>


        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Option B: Paste Resume Text</h3>
          <textarea
            rows={5}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste raw resume plain text here..."
            className="w-full p-3 rounded-xl glass-input text-xs text-slate-200 resize-none"
          />
        </motion.div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Run Resume Analysis
            </>
          )}
        </button>
      </div>

      {/* Analysis Report Output */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Resume Analysis Report</h3>
              <p className="text-xs text-slate-400">File: {report.file_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-blue-400">{report.score}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">Detected Skills</div>
              <div className="text-lg font-semibold text-white">{report.skills.length} Technical Skills</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">Word Count</div>
              <div className="text-lg font-semibold text-white">{report.word_count} Words</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">ATS Readability</div>
              <div className="text-lg font-semibold text-emerald-400">Optimal</div>
            </div>
          </div>

          {/* Skill Badges */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Extracted Skills Profile</h4>
            <div className="flex flex-wrap gap-2">
              {report.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Optimization Insights</h4>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
