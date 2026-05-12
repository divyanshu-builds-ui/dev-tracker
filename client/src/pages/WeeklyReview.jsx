import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll } from '../api';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle2, Target, Flame, Brain, Code2, TrendingUp, FileDown } from 'lucide-react';

export default function WeeklyReview() {
  const [data, setData] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    (async () => {
      const [logs, tasks, goals, dsa, habits, projects, pomodoro] = await Promise.all([
        getAll('logs', {}, 'createdAt', 100),
        getAll('tasks', {}, 'createdAt', 200),
        getAll('goals', {}, 'createdAt', 100),
        getAll('dsa', {}, 'createdAt', 500),
        getAll('habits', {}, 'createdAt', 50),
        getAll('projects', {}, 'createdAt', 50),
        getAll('pomodoro', {}, 'createdAt', 200),
      ]);
      setData({ logs, tasks, goals, dsa, habits, projects, pomodoro });
    })();
  }, []);

  if (!data) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-24" />)}</div>
    </div>
  );

  // Calculate week range
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() - (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const inWeek = (timestamp) => {
    const d = new Date(timestamp);
    return d >= weekStart && d < weekEnd;
  };

  const weekLabel = `${weekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} \u2014 ${new Date(weekEnd - 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  // Stats
  const weekLogs = data.logs.filter(l => inWeek(l.date || l.createdAt));
  const hoursWorked = Math.round(weekLogs.reduce((s, l) => s + (l.hoursWorked || 0), 0) * 10) / 10;
  const logDays = weekLogs.length;

  const tasksCompleted = data.tasks.filter(t => t.status === 'done' && inWeek(t.createdAt)).length;
  const goalsHit = data.goals.filter(g => g.status === 'completed' && inWeek(g.completedAt || g.createdAt)).length;
  const dsaSolved = data.dsa.filter(q => q.solved && inWeek(q.createdAt)).length;

  const weekPomodoro = data.pomodoro.filter(p => p.type === 'focus' && inWeek(p.createdAt));
  const focusSessions = weekPomodoro.length;
  const focusHours = Math.round((focusSessions * 25) / 60 * 10) / 10;

  const habitRate = (() => {
    if (!data.habits.length) return 0;
    let total = 0, done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = d.toISOString().split('T')[0];
      data.habits.forEach(h => { total++; if ((h.completedDates || []).includes(key)) done++; });
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  })();

  const projectsActive = data.projects.filter(p => p.status === 'in-progress').length;

  const score = Math.min(100, Math.round(
    (hoursWorked * 2) + (tasksCompleted * 5) + (goalsHit * 15) + (dsaSolved * 3) + (focusSessions * 2) + (habitRate * 0.3)
  ));
  const scoreColor = score >= 80 ? '#43e97b' : score >= 50 ? '#4facfe' : score >= 30 ? '#f59e0b' : '#f5576c';

  const stats = [
    { label: 'Hours Worked', value: hoursWorked, unit: 'h', icon: <Clock size={16} />, color: '#4facfe' },
    { label: 'Tasks Done', value: tasksCompleted, unit: '', icon: <CheckCircle2 size={16} />, color: '#43e97b' },
    { label: 'Goals Hit', value: goalsHit, unit: '', icon: <Target size={16} />, color: '#f093fb' },
    { label: 'DSA Solved', value: dsaSolved, unit: '', icon: <Brain size={16} />, color: '#06b6d4' },
    { label: 'Focus Sessions', value: focusSessions, unit: '', icon: <Flame size={16} />, color: '#ef4444' },
    { label: 'Focus Hours', value: focusHours, unit: 'h', icon: <Clock size={16} />, color: '#667eea' },
    { label: 'Habit Rate', value: habitRate, unit: '%', icon: <TrendingUp size={16} />, color: '#f59e0b' },
    { label: 'Active Projects', value: projectsActive, unit: '', icon: <Code2 size={16} />, color: '#a78bfa' },
  ];

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Dark background
    doc.setFillColor(8, 8, 14);
    doc.rect(0, 0, 210, 297, 'F');

    // Top accent line
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.8);
    doc.line(20, 15, 190, 15);

    // Header
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(26);
    doc.text('Dev Tracker', 20, 30);
    doc.setFontSize(11);
    doc.setTextColor(240, 147, 251);
    doc.text('Weekly Review', 20, 38);

    // Week info
    doc.setTextColor(120, 120, 130);
    doc.setFontSize(9);
    doc.text(weekLabel, 20, 47);

    // Divider
    doc.setDrawColor(40, 40, 60);
    doc.setLineWidth(0.3);
    doc.line(20, 52, 190, 52);

    // Week Score
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(40);
    doc.text(`${score}`, 85, 78);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 130);
    doc.text('/100  Week Score', 105, 78);
    doc.setFontSize(9);
    doc.text(score >= 80 ? 'Incredible week!' : score >= 50 ? 'Solid progress!' : score >= 30 ? 'Keep pushing!' : 'Room to grow!', 85, 86);

    // Divider
    doc.setDrawColor(40, 40, 60);
    doc.line(20, 92, 190, 92);

    // Stats in 2 columns
    let y = 102;
    doc.setTextColor(102, 126, 234);
    doc.setFontSize(13);
    doc.text('Stats', 20, y); y += 10;

    doc.setFontSize(10);
    doc.setTextColor(220, 220, 230);
    const leftStats = stats.slice(0, 4);
    const rightStats = stats.slice(4);
    leftStats.forEach((s, i) => {
      doc.text(`${s.label}:  ${s.value}${s.unit}`, 24, y + i * 8);
    });
    rightStats.forEach((s, i) => {
      doc.text(`${s.label}:  ${s.value}${s.unit}`, 110, y + i * 8);
    });
    y += 40;

    // Divider
    doc.setDrawColor(40, 40, 60);
    doc.line(20, y - 4, 190, y - 4);

    // Highlights
    doc.setTextColor(67, 233, 123);
    doc.setFontSize(13);
    doc.text('Highlights', 20, y + 4); y += 14;

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 190);
    if (hoursWorked > 0) { doc.text(`> Logged ${hoursWorked}h across ${logDays} days`, 24, y); y += 7; }
    if (tasksCompleted > 0) { doc.text(`> Completed ${tasksCompleted} tasks`, 24, y); y += 7; }
    if (goalsHit > 0) { doc.text(`> Crushed ${goalsHit} goals`, 24, y); y += 7; }
    if (dsaSolved > 0) { doc.text(`> Solved ${dsaSolved} DSA questions`, 24, y); y += 7; }
    if (focusSessions > 0) { doc.text(`> ${focusSessions} pomodoro sessions (${focusHours}h deep work)`, 24, y); y += 7; }
    if (habitRate > 0) { doc.text(`> Habit completion: ${habitRate}%`, 24, y); y += 7; }

    // Footer
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    doc.setTextColor(80, 80, 100);
    doc.setFontSize(8);
    doc.text('Generated by Dev Tracker | Premium Developer Progress Tracking', 20, 287);

    doc.save(`weekly-review-${weekStart.toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported!');
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#f59e0b] flex items-center justify-center">
              <Calendar size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// weekly review</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Weekly <span className="gradient-text">Review</span>
          </h2>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={exportPDF}
          className="px-5 py-3 rounded-xl text-sm font-mono flex items-center gap-2 bg-[#667eea]/10 border border-[#667eea]/20 text-[#667eea] hover:bg-[#667eea]/15 transition-all">
          <FileDown size={14} /> Export PDF
        </motion.button>
      </motion.div>

      {/* Week selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-8 flex items-center justify-between">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-9 h-9 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-zinc-400 hover:text-white transition-all">
          &larr;
        </motion.button>
        <div className="text-center">
          <p className="text-[12px] font-mono font-semibold text-zinc-200">{weekLabel}</p>
          <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{weekOffset === 0 ? 'This week' : weekOffset === 1 ? 'Last week' : `${weekOffset} weeks ago`}</p>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="w-9 h-9 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-zinc-400 hover:text-white transition-all disabled:opacity-30">
          &rarr;
        </motion.button>
      </motion.div>

      {/* Week Score */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${scoreColor}08, transparent 70%)` }} />
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 relative z-10">week score</p>
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
          className="text-5xl md:text-6xl font-extrabold font-mono relative z-10" style={{ color: scoreColor }}>
          {score}
        </motion.p>
        <p className="text-[10px] font-mono text-zinc-600 mt-2 relative z-10">
          {score >= 80 ? '🔥 Incredible week!' : score >= 50 ? '💪 Solid progress!' : score >= 30 ? '📈 Keep pushing!' : "🚀 Let's go harder next week!"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <p className="text-xl font-extrabold font-mono" style={{ color: stat.color }}>
              {stat.value}{stat.unit}
            </p>
            <p className="text-[8px] font-mono text-zinc-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Highlights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-6">
        <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-4">highlights</h3>
        <div className="space-y-2.5">
          {hoursWorked > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#4facfe]">&rarr;</span><span className="text-zinc-300">Logged <span className="text-[#4facfe] font-bold">{hoursWorked}h</span> across <span className="text-[#4facfe] font-bold">{logDays}</span> days</span></div>}
          {tasksCompleted > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#43e97b]">&rarr;</span><span className="text-zinc-300">Completed <span className="text-[#43e97b] font-bold">{tasksCompleted}</span> tasks</span></div>}
          {goalsHit > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#f093fb]">&rarr;</span><span className="text-zinc-300">Crushed <span className="text-[#f093fb] font-bold">{goalsHit}</span> goals</span></div>}
          {dsaSolved > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#06b6d4]">&rarr;</span><span className="text-zinc-300">Solved <span className="text-[#06b6d4] font-bold">{dsaSolved}</span> DSA questions</span></div>}
          {focusSessions > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#ef4444]">&rarr;</span><span className="text-zinc-300"><span className="text-[#ef4444] font-bold">{focusSessions}</span> pomodoro sessions ({focusHours}h deep work)</span></div>}
          {habitRate > 0 && <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-[#f59e0b]">&rarr;</span><span className="text-zinc-300">Habit completion: <span className="text-[#f59e0b] font-bold">{habitRate}%</span></span></div>}
          {hoursWorked === 0 && tasksCompleted === 0 && dsaSolved === 0 && focusSessions === 0 && (
            <p className="text-[11px] font-mono text-zinc-600">No activity recorded this week. Start tracking to see your review!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
