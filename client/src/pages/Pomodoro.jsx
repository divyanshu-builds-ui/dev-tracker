import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create } from '../api';
import toast from 'react-hot-toast';
import { Play, Pause, RotateCcw, Coffee, Zap, Clock, Flame } from 'lucide-react';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#667eea', icon: <Zap size={14} /> },
  short: { label: 'Short Break', duration: 5 * 60, color: '#43e97b', icon: <Coffee size={14} /> },
  long: { label: 'Long Break', duration: 15 * 60, color: '#4facfe', icon: <Coffee size={14} /> },
};

export default function Pomodoro() {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    (async () => {
      const all = await getAll('pomodoro', {}, 'createdAt', 50);
      setSessions(all);
      const today = new Date().toDateString();
      setTodayCount(all.filter(s => new Date(s.createdAt).toDateString() === today && s.type === 'focus').length);
    })();
  }, []);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    if (timeLeft === 0 && running) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [running, timeLeft]);

  const handleComplete = async () => {
    setRunning(false);
    if (mode === 'focus') {
      await create('pomodoro', { type: 'focus', duration: MODES.focus.duration });
      setTodayCount(c => c + 1);
      toast.success('Session complete! 🎉');
      // Auto switch to break
      const next = (todayCount + 1) % 4 === 0 ? 'long' : 'short';
      setMode(next);
      setTimeLeft(MODES[next].duration);
    } else {
      toast.success('Break over — back to work! 💪');
      setMode('focus');
      setTimeLeft(MODES.focus.duration);
    }
  };

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(MODES[m].duration);
  };

  const reset = () => {
    setRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - timeLeft / MODES[mode].duration;
  const cfg = MODES[mode];

  // Circle SVG
  const size = 260;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  // Weekly stats
  const thisWeek = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.type === 'focus' && new Date(s.createdAt) >= start).length;
  })();

  const totalHours = Math.round((sessions.filter(s => s.type === 'focus').length * 25) / 60 * 10) / 10;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#f093fb] flex items-center justify-center">
            <Clock size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// pomodoro</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Focus <span className="gradient-text">Timer</span>
        </h2>
        <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
          <span className="code-variable">today</span>: <span className="code-number">{todayCount}</span> sessions |{' '}
          <span className="code-variable">week</span>: <span className="code-number">{thisWeek}</span> |{' '}
          <span className="code-variable">total</span>: <span className="code-number">{totalHours}h</span>
        </p>
      </motion.div>

      <div className="flex flex-col items-center">
        {/* Mode selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2 mb-10">
          {Object.entries(MODES).map(([key, val]) => (
            <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => switchMode(key)}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-mono font-medium flex items-center gap-2 transition-all border ${mode === key ? '' : 'bg-surface-3 border-border-subtle text-zinc-500 hover:text-zinc-200'}`}
              style={mode === key ? { background: `${val.color}15`, borderColor: `${val.color}40`, color: val.color, boxShadow: `0 4px 20px ${val.color}15` } : {}}>
              {val.icon} {val.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Timer circle */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}
          className="relative mb-10">
          {/* Glow */}
          <motion.div animate={{ opacity: running ? [0.3, 0.6, 0.3] : 0.2, scale: running ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-[-20px] rounded-full blur-[40px]"
            style={{ background: `radial-gradient(circle, ${cfg.color}20, transparent)` }} />

          <svg width={size} height={size} className="-rotate-90 relative z-10">
            {/* Background circle */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(102,126,234,0.06)" strokeWidth={stroke} />
            {/* Progress circle */}
            <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={cfg.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              transition={{ duration: 0.5 }} />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-5xl md:text-6xl font-extrabold font-mono tracking-tight" style={{ color: cfg.color }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">{cfg.label}</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={reset}
            className="w-12 h-12 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all">
            <RotateCcw size={18} />
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setRunning(!running)}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, boxShadow: `0 8px 30px ${cfg.color}30` }}>
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { setRunning(false); handleComplete(); }}
            className="w-12 h-12 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all">
            <Zap size={18} />
          </motion.button>
        </motion.div>

        {/* Today's sessions */}
        {todayCount > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-10 flex items-center gap-2">
            <Flame size={14} className="text-[#fa709a]" />
            <div className="flex gap-1.5">
              {Array.from({ length: todayCount }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-3 h-3 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}80)`, boxShadow: `0 0 6px ${cfg.color}40` }} />
              ))}
            </div>
            <span className="text-[9px] font-mono text-zinc-500">{todayCount} × 25min = {todayCount * 25}min</span>
          </motion.div>
        )}

        {/* Stats cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 mt-10 w-full max-w-md">
          {[
            { label: 'Today', value: todayCount, unit: 'sessions', color: '#667eea' },
            { label: 'This Week', value: thisWeek, unit: 'sessions', color: '#43e97b' },
            { label: 'Total', value: totalHours, unit: 'hours', color: '#f093fb' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <p className="text-xl font-extrabold font-mono" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[8px] font-mono text-zinc-500 mt-1">{stat.unit}</p>
              <p className="text-[9px] font-mono text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
