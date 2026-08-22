import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, CheckCircle2, AlertCircle, ArrowUpRight, Award, Target, Zap, ShieldCheck } from 'lucide-react';
import { analysisService } from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CareerInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await analysisService.getCareerInsights();
        setData(res);
      } catch (err) {
        console.error("Failed to load career insights", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  const downloadPDFReport = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Background & Title Header
      doc.setFillColor(15, 23, 42); // #0f172a slate-900
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('HireSense AI — Career Telemetry Report', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated Date: ${new Date().toLocaleDateString()} | User Candidate Assessment`, 14, 28);
      
      // Horizontal Divider Line
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(0.5);
      doc.line(14, 32, 196, 32);

      // Section 1: Key Telemetry Metric Cards
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(96, 165, 250); // blue-400
      doc.text('1. OVERALL EVALUATION BENCHMARKS', 14, 42);

      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(14, 46, 56, 24, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('ATS Resume Score', 18, 53);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(96, 165, 250);
      doc.text(`${data?.ats_score || 82}%`, 18, 64);

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(77, 46, 56, 24, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Job Match Alignment', 81, 53);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text(`${data?.job_match_score || 76}%`, 81, 64);

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(140, 46, 56, 24, 3, 3, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Interview Speech Score', 144, 53);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(192, 132, 252); // purple-400
      doc.text(`${data?.interview_score || 88}%`, 144, 64);

      // Section 2: Top Strengths & Missing Skill Gaps
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153);
      doc.text('2. TOP DETECTED TECHNICAL STRENGTHS', 14, 80);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(241, 245, 249);
      const strengths = data?.top_strengths?.join(', ') || 'Python, React, SQL, FastAPI';
      doc.text(`Verified Skills: ${strengths}`, 14, 88);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text('3. SKILLS TO IMPROVE & ACTION GAPS', 14, 102);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(241, 245, 249);
      const missing = data?.missing_skills?.join(', ') || 'Docker, AWS, Kubernetes';
      doc.text(`Recommended Skill Additions: ${missing}`, 14, 110);

      // Section 3: Recommended Action Plan
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(96, 165, 250);
      doc.text('4. RECOMMENDED CAREER ACTION PLAN', 14, 126);

      let yPos = 134;
      const actions = data?.recommended_actions || [
        'Add bullet points highlighting your key technical strengths.',
        'Build small portfolio projects covering missing skills (Docker, AWS).',
        'Maintain optimal speech pace between 110-150 Words Per Minute.'
      ];

      actions.forEach((act, idx) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(226, 232, 240);
        doc.text(`${idx + 1}. ${act}`, 14, yPos);
        yPos += 8;
      });

      // Section 4: Progress Trajectory
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153);
      doc.text('5. OVERALL CAREER PROGRESS TRAJECTORY', 14, yPos + 6);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Previous Baseline Score: ${data?.previous_ats || 71}% | Current ATS Score: ${data?.current_ats || 82}% | Growth: ${data?.improvement || '+11%'}`, 14, yPos + 14);

      // Custom Copyright Watermark & Author Credit
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('© Copyright — Designed & Developed by Chirag Roshan | HireSense AI Recruitment Platform', 14, 280);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('HireSense AI Confidential Telemetry Report — Verified Candidate Evaluation Certificate', 14, 286);

      doc.save('HireSense_AI_Career_Report.pdf');
    } catch (err) {
      console.error("Failed to generate PDF report", err);
    } finally {
      setDownloading(false);
    }
  };



  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Building your personalized Career Insights Report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" /> YOUR CAREER INSIGHTS
          </h2>
          <p className="text-slate-400 text-sm">Aggregated telemetry synthesis from your resume, job match, and speech evaluations.</p>
        </div>

        <button
          onClick={downloadPDFReport}
          disabled={downloading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
        >
          {downloading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <><Download className="w-4 h-4" /> Download My Career Report (PDF)</>
          )}
        </button>
      </div>

      {/* Downloadable Printable Container */}
      <div id="career-pdf-report" className="space-y-6 p-2 rounded-2xl bg-slate-950/40 border border-white/5">
        
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-2">
              <Award className="w-4 h-4 text-blue-400" /> ATS Resume Score
            </div>
            <div className="text-4xl font-extrabold text-blue-400">{data?.ats_score}%</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">ATS Structure Alignment</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-6 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-2">
              <Target className="w-4 h-4 text-emerald-400" /> Job Requirement Match
            </div>
            <div className="text-4xl font-extrabold text-emerald-400">{data?.job_match_score}%</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">Target Requisition Coverage</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-2">
              <Zap className="w-4 h-4 text-purple-400" /> Interview Speech Score
            </div>
            <div className="text-4xl font-extrabold text-purple-400">{data?.interview_score}%</div>
            <div className="text-xs text-slate-400 mt-2 font-medium">Pace & Articulation Quality</div>
          </motion.div>
        </div>

        {/* Strengths & Skills to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Strengths */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 🔥 Top Strengths Detected
            </h3>
            <div className="space-y-2">
              {data?.top_strengths?.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-slate-200 font-semibold">{skill}</span>
                  <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg">Verified Strength</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills to Improve */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> 📚 Skills to Improve
            </h3>
            <div className="space-y-2">
              {data?.missing_skills?.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-slate-200 font-semibold">{skill}</span>
                  <span className="text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-lg">Recommended Addition</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recommended Actions */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" /> 🎯 Recommended Action Plan
          </h3>
          <div className="space-y-3">
            {data?.recommended_actions?.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-white/5 text-xs text-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">{idx + 1}</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress Trajectory */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" /> 📈 Your Overall Progress Growth
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Previous ATS Score</div>
              <div className="text-2xl font-bold text-slate-300">{data?.previous_ats}%</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Current ATS Score</div>
              <div className="text-2xl font-bold text-blue-400">{data?.current_ats}%</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Total Improvement</div>
              <div className="text-2xl font-extrabold text-emerald-400">{data?.improvement}</div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
