import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Award, CheckCircle2, Search, X, FileText, Briefcase, Mic, Sparkles } from 'lucide-react';
import { analysisService } from '../services/api';

export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await analysisService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load analysis history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(filter.toLowerCase()) ||
    item.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" /> Historical Analysis Records
          </h2>
          <p className="text-slate-400 text-sm">Click any record to open full evaluation report breakdown.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading historical evaluations...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Evaluation Records Found</h3>
          <p className="text-xs text-slate-400">Run a resume, job match, or speech evaluation to populate your personal history log.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="glass-card rounded-xl p-4 border border-white/10 flex items-center justify-between hover:border-blue-500/50 cursor-pointer transition-all hover:bg-slate-800/40 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  {item.type.includes("Resume") ? <FileText className="w-5 h-5" /> : item.type.includes("Job") ? <Briefcase className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="text-blue-400 font-medium">{item.type}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-400">{item.score}%</span>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Score</div>
                </div>
                <span className="text-xs text-blue-400 font-semibold underline opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Inspection Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 border border-white/10 max-w-lg w-full space-y-6 relative shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedItem.title}</h3>
                    <p className="text-xs text-slate-400">{selectedItem.type} • {selectedItem.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-slate-400 mb-1">Overall Evaluation Score</div>
                  <div className="text-3xl font-extrabold text-emerald-400">{selectedItem.score}%</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-slate-400 mb-1">Status Standard</div>
                  <div className="text-lg font-bold text-blue-400 mt-1">Verified & Active</div>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3 text-xs">
                <div className="font-semibold text-slate-300 uppercase tracking-wider mb-1">Evaluation Summary & Unique Insights</div>
                
                <div className="text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-white/5 font-mono text-[11px] leading-relaxed">
                  {selectedItem.details?.summary || `Evaluation criteria successfully met system benchmarks for ${selectedItem.type}.`}
                </div>

                {selectedItem.details?.skills && (
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Extracted Technical Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.details.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.details?.missing_skills && selectedItem.details.missing_skills.length > 0 && (
                  <div>
                    <div className="text-[10px] text-amber-400 font-semibold mb-1 uppercase">Identified Skill Gaps</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.details.missing_skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 text-slate-300 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{selectedItem.details?.recommendation || "Keyword coverage and technical alignment stored permanently in Neon PostgreSQL database."}</span>
                </div>
              </div>


              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

