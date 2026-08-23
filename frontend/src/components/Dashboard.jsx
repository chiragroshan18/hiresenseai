import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, User, LogOut, LayoutDashboard, FileText, Briefcase, 
  Mic, History, TrendingUp, Menu, X, ChevronRight, Settings, Sparkles 
} from 'lucide-react';
import { authService } from '../services/api';
import DashboardOverview from '../components/DashboardOverview';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import JobMatcher from '../components/JobMatcher';
import SpeechAnalyzer from '../components/SpeechAnalyzer';
import HistoryList from '../components/HistoryList';
import AnalyticsView from '../components/AnalyticsView';
import CareerInsights from '../components/CareerInsights';
import Profile from '../components/Profile';
import AdminDashboard from '../components/AdminDashboard';

export default function Dashboard({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTabState] = useState(() => {
    const saved = sessionStorage.getItem('activeTab');
    if (saved) return saved;
    return isAdmin ? 'admin' : 'overview';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTabState(tabId);
    sessionStorage.setItem('activeTab', tabId);
    setMobileMenuOpen(false);
  };

  const navItems = isAdmin ? [
    { id: 'admin', label: 'Admin Control Center', icon: Shield },
    { id: 'profile', label: 'Admin Profile', icon: User },
  ] : [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Career Insights & PDF', icon: Sparkles },
    { id: 'resume', label: 'Resume Analysis', icon: FileText },
    { id: 'job', label: 'Job Matcher', icon: Briefcase },
    { id: 'speech', label: 'Speech & Interview STT', icon: Mic },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-nav border-r border-white/10 p-4 flex flex-col justify-between sticky top-0 z-30 md:h-screen">
        <div>
          {/* Brand Logo & Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 px-2 py-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-none">HireSense AI</h1>
                <span className="text-[10px] text-slate-400 font-medium">Recruitment Platform</span>
              </div>
            </div>
            {/* Mobile Hamburger Menu button */}
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop & Mobile Navigation Links */}
          <nav className={`space-y-1 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className={`pt-4 border-t border-white/10 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                isAdmin ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {isAdmin ? 'A' : (user?.name?.charAt(0) || 'U')}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user?.name || (isAdmin ? 'Chirag Roshan' : 'User')}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'user'}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dynamic Workspace Area */}
      <main className="flex-1 p-4 md:p-8 md:overflow-y-auto md:max-h-screen pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && <DashboardOverview user={user} onNavigate={handleTabChange} />}
            {activeTab === 'insights' && <CareerInsights />}
            {activeTab === 'resume' && <ResumeAnalyzer />}
            {activeTab === 'job' && <JobMatcher />}
            {activeTab === 'speech' && <SpeechAnalyzer />}
            {activeTab === 'history' && <HistoryList />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'profile' && <Profile user={user} />}
            {activeTab === 'admin' && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

