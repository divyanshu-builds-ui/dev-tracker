import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthContext';
import Logo from '../components/Logo';
import { BarChart3, Target, Code2, Flame, Brain, Timer, FolderKanban, Repeat, Calendar, Bookmark, StickyNote, Award } from 'lucide-react';

const FEATURES = [
  { icon: <BarChart3 size={20} />, title: 'Dashboard & XP', desc: 'Level up with XP, streaks, heatmap, and achievements', color: '#667eea' },
  { icon: <FolderKanban size={20} />, title: 'Projects & Kanban', desc: 'Track projects with drag-and-drop task board', color: '#f5576c' },
  { icon: <Timer size={20} />, title: 'Pomodoro Timer', desc: '25-min focus sessions with break reminders', color: '#ef4444' },
  { icon: <Brain size={20} />, title: 'DSA Interview Prep', desc: 'Track questions by topic, difficulty, platform', color: '#06b6d4' },
  { icon: <Code2 size={20} />, title: 'Code Snippets', desc: 'Save reusable code with syntax highlighting', color: '#43e97b' },
  { icon: <Repeat size={20} />, title: 'Habit Tracker', desc: 'Build daily coding consistency', color: '#43e97b' },
  { icon: <Target size={20} />, title: 'Goals & Roadmap', desc: 'Set goals with deadlines, follow learning path', color: '#f093fb' },
  { icon: <Calendar size={20} />, title: 'Weekly Review', desc: 'Auto-generated progress summary with PDF export', color: '#f59e0b' },
  { icon: <Flame size={20} />, title: 'Streaks & Achievements', desc: 'Stay motivated with daily streaks and badges', color: '#f59e0b' },
  { icon: <StickyNote size={20} />, title: 'Quick Notes', desc: 'Capture ideas instantly with color-coded notes', color: '#a78bfa' },
  { icon: <Bookmark size={20} />, title: 'Resources Vault', desc: 'Save links, bookmarks, categorized by topic', color: '#4facfe' },
  { icon: <Award size={20} />, title: 'Certifications', desc: 'Track courses and certifications progress', color: '#f59e0b' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

export default function LandingPage() {
  const { loginGoogle, loginGithub } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Background orbs */}
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[20%] left-[10%] w-96 h-96 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-gradient-to-br from-[#4facfe]/15 to-[#43e97b]/8 rounded-full blur-[100px]" />

        {/* Logo */}
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Logo size={90} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-center mt-8">
          Dev <span className="gradient-text">Tracker</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-zinc-400 text-center mt-4 max-w-lg text-sm md:text-base font-mono">
          Premium developer progress tracking app. Track projects, level up skills, build streaks, and ship code faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 mt-10">
          <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={loginGoogle}
            className="px-8 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 bg-white text-[#1a1a2e] shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Get Started with Google
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={loginGithub}
            className="px-8 py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 bg-[#0d1117] text-white border border-white/[0.1] hover:border-white/[0.2]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="text-zinc-600 text-[10px] font-mono text-center">
            <p>scroll to explore</p>
            <p className="mt-1">↓</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Everything a <span className="gradient-text">developer</span> needs
          </h2>
          <p className="text-zinc-500 font-mono text-sm mt-3">20+ features to track, grow, and ship faster</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={item}
              className="glass rounded-2xl p-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
              <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-3xl p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Built for <span className="gradient-text">developers</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '20+', label: 'Features' },
              { value: '6', label: 'Themes' },
              { value: '∞', label: 'Projects' },
              { value: 'Free', label: 'Forever' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}>
                <p className="text-3xl font-extrabold font-mono gradient-text">{s.value}</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Ready to <span className="gradient-text">level up</span>?
          </h2>
          <p className="text-zinc-500 font-mono text-sm mb-8">Start tracking your developer journey today. It's free.</p>
          <motion.button whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
            onClick={loginGoogle}
            className="btn-premium px-10 py-4 rounded-2xl text-sm font-semibold inline-flex items-center gap-2">
            🚀 Get Started — Free
          </motion.button>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 text-[9px] font-mono text-zinc-700">
          <p>Built with React + Firebase + Tailwind + Framer Motion</p>
          <p className="mt-1">Dev Tracker v1.0.0</p>
        </div>
      </section>
    </div>
  );
}
