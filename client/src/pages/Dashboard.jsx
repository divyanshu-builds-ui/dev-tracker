import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll } from '../api';
import { calculateXP, getLevel, getStreak, ACHIEVEMENTS } from '../utils/xp';
import { Rocket, Code2, Clock, Target, TrendingUp, Zap, GitCommit, Activity, Award, Star, Flame, Trophy, Sparkles, ChevronUp, Calendar, BarChart3, Layers } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeletons';
import { useAuth } from '../components/AuthContext';

const quotes = [
  "First, solve the problem. Then, write the code.",
  "Code is like humor. When you have to explain it, it's bad.",
  "Talk is cheap. Show me the code.",
  "Programming isn't about what you know; it's about what you can figure out.",
  "The best error message is the one that never shows up.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
];

// Animated number counter
function Counter({ value, className }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value) { setCount(0); return; }
    let start = 0;
    const step = value / 90;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span className={className}>{count}</span>;
}

// 3D Tilt card
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
  };
  const handleMouseLeave = () => { ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)'; };
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>;
}

// XP Progress bar
function XPBar({ levelData }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy size={18} className="text-amber-400" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-zinc-100">Level {levelData.level}</p>
            <p className="text-[11px] text-primary font-semibold">{levelData.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-zinc-300 font-bold">{levelData.xp} XP</p>
          {levelData.nextLevel && <p className="text-[9px] text-zinc-600 font-mono">{levelData.xpForNext - levelData.xpProgress} to lvl {levelData.nextLevel.level}</p>}
        </div>
      </div>
      <div className="w-full h-3.5 rounded-full bg-surface-3 overflow-hidden border border-white/[0.04] relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelData.percent}%` }}
          transition={{ duration: 2.5, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-blue to-cyan progress-animated relative"
        />
        {/* Sparkle at end of bar */}
        <motion.div animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
          style={{ left: `${levelData.percent}%`, marginLeft: -4 }} />
      </div>
      {levelData.nextLevel && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] font-mono text-zinc-600">{levelData.title}</span>
          <span className="text-[9px] font-mono text-zinc-600">{levelData.nextLevel.title}</span>
        </div>
      )}
    </div>
  );
}

// Circular progress
function CircleProgress({ value, size = 130 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="10" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#circGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }} />
        <defs>
          <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }}
          className="text-3xl font-extrabold font-mono text-white">{value}%</motion.span>
        <span className="text-[8px] text-zinc-500 font-mono mt-0.5">COMPLETE</span>
      </div>
    </div>
  );
}

// Heatmap
function Heatmap({ logs }) {
  const days = 35;
  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (days - 1 - i));
    const dayLogs = logs.filter(l => new Date(l.date).toDateString() === date.toDateString());
    const hours = dayLogs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);
    return hours === 0 ? 0 : hours <= 1 ? 1 : hours <= 3 ? 2 : hours <= 5 ? 3 : 4;
  });
  return (
    <div className="grid grid-cols-7 gap-[5px]">
      {cells.map((level, i) => (
        <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.02, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.5, zIndex: 10 }}
          className={`aspect-square rounded-[5px] heat-${level} cursor-default transition-shadow hover:shadow-lg hover:shadow-primary/10`} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [streak, setStreak] = useState(0);
  const [logs, setLogs] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex(i => (i + 1) % quotes.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const [projects, skills, allLogs, goals] = await Promise.all([
        getAll('projects'), getAll('skills'), getAll('logs', {}, 'createdAt', 60), getAll('goals')
      ]);
      setLogs(allLogs);
      setRecentProjects(projects.slice(0, 3));
      const s = {
        totalProjects: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        deployed: projects.filter(p => p.status === 'deployed').length,
        inProgress: projects.filter(p => p.status === 'in-progress').length,
        totalSkills: skills.length,
        totalLogs: allLogs.length,
        totalHours: allLogs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0),
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        overallProgress: projects.length ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0,
      };
      const xp = calculateXP(s);
      const lvl = getLevel(xp);
      const str = getStreak(allLogs);
      s.streak = str; s.level = lvl.level;
      setStats(s); setLevelData(lvl); setStreak(str);
    };
    fetch();
  }, []);

  if (!stats) return <DashboardSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : hour < 21 ? 'Good Evening' : 'Night Owl Mode';

  const statCards = [
    { label: 'Projects', value: stats.totalProjects, icon: <Layers size={20} />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Skills', value: stats.totalSkills, icon: <Code2 size={20} />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Hours', value: stats.totalHours, icon: <Clock size={20} />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Goals Done', value: stats.completedGoals, icon: <Target size={20} />, color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
  ];

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(stats)).length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-primary/60" />
          <span className="text-[10px] font-mono text-zinc-500">{greeting}</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-2 md:gap-3">
          <span className="text-zinc-300">Hey,</span>
          <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Developer'}</span>
          <motion.span animate={{ rotate: [0, 14, -8, 14, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
            <Zap size={28} className="text-amber-400" />
          </motion.span>
        </h2>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 md:gap-4">

        {/* XP Bar - Full width */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-4 md:col-span-8 lg:col-span-8 glass rounded-3xl p-5 md:p-6 scan-line">
          <div className="flex items-center gap-2 mb-4">
            <ChevronUp size={14} className="text-primary" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Level Progress</span>
          </div>
          {levelData && <XPBar levelData={levelData} />}
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="col-span-4 md:col-span-8 lg:col-span-4 glass rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-rose-500/[0.03]" />
          <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }} className="relative z-10 mb-1">
            <Flame size={40} className={streak >= 7 ? 'text-amber-400' : streak >= 3 ? 'text-orange-400' : 'text-zinc-500'} />
          </motion.div>
          <p className="text-4xl font-extrabold font-mono text-white relative z-10"><Counter value={streak} /></p>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1 relative z-10">Day Streak</p>
          {streak >= 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-amber-400 font-mono mt-2 relative z-10 flex items-center gap-1">
              <Flame size={10} /> On fire!
            </motion.p>
          )}
        </motion.div>

        {/* Stat Cards */}
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 100 }}
            className="col-span-2 md:col-span-4 lg:col-span-3">
            <TiltCard>
              <div className="glass rounded-2xl p-5 scan-line relative overflow-hidden group">
                <div className="tilt-shine" />
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-[0.06] blur-2xl group-hover:opacity-[0.12] transition-all duration-500`} />
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg ${card.shadow}`}>
                  <span className="text-white">{card.icon}</span>
                </motion.div>
                <p className="text-3xl font-extrabold font-mono text-white"><Counter value={card.value} /></p>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">{card.label}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}

        {/* Progress Circle */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="col-span-4 md:col-span-4 lg:col-span-3 glass rounded-3xl p-4 md:p-5 flex flex-col items-center justify-center">
          <CircleProgress value={stats.overallProgress} />
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="col-span-4 md:col-span-8 lg:col-span-5 glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-primary/60" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Activity</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600">5 weeks</span>
          </div>
          <Heatmap logs={logs} />
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[7px] text-zinc-600 font-mono">less</span>
            {[0,1,2,3,4].map(l => <div key={l} className={`w-3 h-3 rounded-[4px] heat-${l}`} />)}
            <span className="text-[7px] text-zinc-600 font-mono">more</span>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="col-span-4 md:col-span-4 lg:col-span-4 glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={13} className="text-primary/60" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Deployed', value: stats.deployed, icon: <Rocket size={12} />, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Completed', value: stats.completed, icon: <Star size={12} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
              { label: 'In Progress', value: stats.inProgress, icon: <Activity size={12} />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ x: 4 }} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
                  <span className="text-[11px] text-zinc-400">{s.label}</span>
                </div>
                <span className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="col-span-4 md:col-span-8 lg:col-span-8 glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award size={13} className="text-amber-400" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Achievements</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const unlocked = a.check(stats);
              return (
                <motion.div key={a.id} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.7 + i * 0.05, type: "spring", stiffness: 200 }}
                  whileHover={unlocked ? { scale: 1.2, rotate: 5, y: -5 } : {}}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-default transition-all ${unlocked ? 'opacity-100 hover:bg-white/[0.04]' : 'opacity-20 grayscale'}`}>
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[7px] font-mono text-zinc-500 text-center leading-tight">{a.title}</span>
                  {unlocked && <div className="w-1 h-1 rounded-full bg-primary" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="col-span-4 md:col-span-8 lg:col-span-4 glass rounded-3xl p-5 md:p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-blue to-cyan rounded-r-full" />
          <Sparkles size={14} className="text-primary/40 mb-3 ml-4" />
          <AnimatePresence mode="wait">
            <motion.p key={quoteIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="text-zinc-300 text-[13px] italic leading-relaxed pl-4">"{quotes[quoteIndex]}"</motion.p>
          </AnimatePresence>
          <p className="text-[9px] text-zinc-600 font-mono mt-3 pl-4">— dev wisdom</p>
        </motion.div>

        {/* Recent Projects */}
        {recentProjects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
            className="col-span-4 md:col-span-4 glass rounded-2xl p-4 md:p-5 scan-line group">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-zinc-200 truncate group-hover:text-primary transition-colors">{p.name}</h4>
              <span className={`text-[7px] px-2 py-0.5 rounded-full font-mono text-white status-${p.status}`}>{p.status}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(p.techStack || []).slice(0, 3).map(t => (
                <span key={t} className="text-[8px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono mb-1.5">
                <span className="text-zinc-500">progress</span>
                <span className="text-primary font-bold">{p.progress}%</span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 1.5, delay: 0.9 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-blue progress-animated" />
              </div>
            </div>
          </motion.div>
        ))}

      </div>


    </div>
  );
}
