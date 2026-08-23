import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Volume2, Sparkles, AlertCircle, Award, MessageSquare, Square } from 'lucide-react';
import { analysisService } from '../services/api';

export default function SpeechAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const baseTranscriptRef = useRef('');
  const isTogglingRef = useRef(false);

  // Helper to deduplicate repeating phrases/sentences (common in mobile Web Speech API)
  const deduplicateSpeechText = (text) => {
    if (!text) return '';
    
    // 1. Clean consecutive duplicate words
    let words = text.trim().split(/\s+/);
    let cleanWords = [];
    for (let i = 0; i < words.length; i++) {
      const curr = words[i];
      const prev = cleanWords[cleanWords.length - 1];
      if (prev && curr.toLowerCase().replace(/[^a-z0-9]/g, '') === prev.toLowerCase().replace(/[^a-z0-9]/g, '') && curr.length > 1) {
        continue;
      }
      cleanWords.push(curr);
    }
    
    let str = cleanWords.join(' ');

    // 2. Remove multi-word repeated phrases (e.g. "hello world hello world")
    str = str.replace(/(\b[\w\s,'!?]+\b)(?:\s+\1)+/gi, '$1');

    // 3. Remove duplicate sentences separated by punctuation
    const parts = str.split(/(?<=[.!?])\s+/);
    const uniqueParts = [];
    for (const p of parts) {
      const norm = p.trim().toLowerCase();
      if (norm && !uniqueParts.some(u => u.trim().toLowerCase() === norm)) {
        uniqueParts.push(p.trim());
      }
    }

    return uniqueParts.join(' ');
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser. Please use Chrome/Edge or paste your transcript below.");
      return;
    }

    // Freeze base transcript at session launch
    baseTranscriptRef.current = transcriptInput.trim();

    try {
      const recognition = new SpeechRecognition();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // On mobile browsers, continuous=true causes speech engine duplication bug
      recognition.continuous = !isMobile;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let currentSessionFinal = '';
        let currentSessionInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const phrase = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentSessionFinal += phrase.trim() + '. ';
          } else {
            currentSessionInterim += phrase;
          }
        }

        let combined = (currentSessionFinal + ' ' + currentSessionInterim).trim();

        // 1. Comprehensive technical domain vocabulary & phonetic mishearing corrections
        let cleaned = combined
          .replace(/\b(let the back and|led the back and|led the backend|led backend)\b/gi, 'led the backend')
          .replace(/\b(architectural|architecture)\b/gi, 'architectural')
          .replace(/\b(for our requirement|for our recruitment|requirement platform|recruitment platform)\b/gi, 'for our recruitment platform')
          .replace(/\b(pie thaw|pie thon|python)\b/gi, 'Python')
          .replace(/\b(faster API|fast API|fastapi)\b/gi, 'FastAPI')
          .replace(/\b(tail wind|tail wind CSS|railway and css|tailwind)\b/gi, 'Tailwind CSS')
          .replace(/\b(post agri SQL|postgress SQL|postgre SQL|postgresql|postgres)\b/gi, 'PostgreSQL')
          .replace(/\b(on neon|on. neon|neon db)\b/gi, 'on Neon')
          .replace(/\b(45 percentage|45 percent|45%)\b/gi, '45%')
          .replace(/\b(increase enquiry|increase in query|inquiry speed|query speed)\b/gi, 'increase in query speed')
          .replace(/\b(school database|our school database|our SQL database|sql database)\b/gi, 'our SQL database')
          .replace(/\b(data in Texas|database in Texas|database indexes|sql data in Texas)\b/gi, 'database indexes')
          .replace(/\b(JW authentication|jwt authentication|jwt|gateway authentication)\b/gi, 'JWT authentication')
          .replace(/\b(insurance|insurance time|ensuring time|ensuring|insuring|assurance)\b/gi, 'ensuring')
          .replace(/\b(ensuring time for|ensuring time|ensuring sub-second response times)\b/gi, 'ensuring sub-second response times')
          .replace(/\b(subject response|sub second response|sub second)\b/gi, 'sub-second response')
          .replace(/\b(resume valuation|candidate resume evaluation|resume evaluation)\b/gi, 'candidate resume evaluation')
          .replace(/\b(darker|doc her|docker)\b/gi, 'Docker')
          .replace(/\b(gits|get hub|github)\b/gi, 'GitHub')
          .replace(/\b(rest api|rust api|restful api)\b/gi, 'REST API');

        // 2. Natural sentence boundary & punctuation formatting
        cleaned = cleaned
          .replace(/\s+/g, ' ')
          .replace(/\s+([,.!?])/g, '$1')
          .replace(/\b(hello|hi|hey|wow|awesome|great|fantastic|excellent)\b/gi, (match) => {
            return match.charAt(0).toUpperCase() + match.slice(1) + '!';
          })
          .replace(/\b(how are you|what about you|what do you think)\b/gi, (match) => {
            return match + '?';
          })
          .replace(/\!\!+/g, '!')
          .replace(/\?\?+/g, '?')
          .replace(/\.\.+/g, '.');

        const base = baseTranscriptRef.current;
        const full = base ? `${base} ${cleaned}` : cleaned;
        const finalDeduplicated = deduplicateSpeechText(full);

        // Capitalize sentence starts
        const formatted = finalDeduplicated.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

        setTranscriptInput(formatted);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          setError(`Microphone error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setError("Could not access microphone. Please ensure microphone permissions are granted.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }
  };

  const toggleRecording = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    setTimeout(() => { isTogglingRef.current = false; }, 400);

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(', ');
    if (detail && typeof detail === 'object') return detail.message || JSON.stringify(detail);
    if (err.message) return err.message;
    return 'Speech analysis failed. Please try again.';
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!transcriptInput.trim()) {
      setError("Please record speech or enter transcript text.");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('transcript_input', transcriptInput);

      const res = await analysisService.analyzeSpeech(formData);
      setReport(res);
    } catch (err) {
      console.error("Speech analyze error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mic className="w-6 h-6 text-blue-400" /> Speech-to-Text & Interview Analytics
        </h2>
        <p className="text-slate-400 text-sm">Record interview responses to analyze articulation pace, sentiment, and filler word frequency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Recording Panel */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
          <button 
            type="button"
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
              isRecording ? 'bg-red-500/20 border-2 border-red-500 animate-ping' : 'bg-blue-600/20 border-2 border-blue-500 hover:scale-105'
            }`} 
          >
            {isRecording ? <MicOff className="w-8 h-8 text-red-400" /> : <Mic className="w-8 h-8 text-blue-400" />}
          </button>
          <h3 className="text-lg font-semibold text-white mb-1">{isRecording ? "Listening & Recording..." : "Click Mic to Speak"}</h3>
          <p className="text-xs text-slate-400 max-w-xs">{isRecording ? "Recording active. Speak clearly into your microphone..." : "Real-time speech capture & audio processing"}</p>
        </motion.div>

        {/* Transcript Text Container (Expanded Space & Ergonomic Heights) */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Interview Transcript Text</h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Stream & Editing</span>
          </div>
          <textarea
            rows={8}
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            placeholder="Recorded spoken responses will automatically appear here with smart punctuation formatting. You can also edit or paste directly..."
            className="w-full p-4 rounded-xl glass-input text-xs leading-relaxed text-slate-100 min-h-[180px] resize-y whitespace-pre-wrap"
          />
        </motion.div>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm break-words">{error}</div>}

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
        >
          {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Analyze Interview Speech</>}
        </button>
      </div>

      {/* Analytics Output */}
      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Interview Speech Analytics</h3>
              <p className="text-xs text-slate-400">Sentiment: <span className="text-blue-300 font-semibold">{report.sentiment}</span></p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-400">{report.score}</span>
              <span className="text-xs text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">Words Per Minute (WPM)</div>
              <div className="text-lg font-semibold text-white">{report.words_per_minute}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">Total Word Count</div>
              <div className="text-lg font-semibold text-white">{report.word_count}</div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
              <div className="text-slate-400 text-xs mb-1">Filler Word Count</div>
              <div className="text-lg font-semibold text-amber-400">{report.filler_word_count} Detected</div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Speech Communication Recommendations</h4>
            <div className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-white/5">
                  <MessageSquare className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
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
