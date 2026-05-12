import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Repeat, Flame, CheckCircle2, Circle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const COLORS = ['#667eea', '#43e97b', '#4facfe', '#f093fb', '#f59e0b', '#f5576c', '#a78bfa'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function getStreak(completedDates) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (completedDates.includes(getDateKey(d))) streak++;
    else break;
  }
  return streak;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#667eea' });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchHabits = async () => setHabits(await getAll('habits', {}, 'createdAt', 50));
  useEffect(() => { fetchHabits(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create('habits', { ...form, completedDates: [] });
    toast.success('Habit added! 🔥');
    setForm({ name: '', color: '#667eea' });
    setShowForm(false);
    fetchHabits();
  };

  const toggleDay = async (habit, dateKey) => {
    const dates = habit.completedDates || [];
    const next = dates.includes(dateKey) ? dates.filter(d => d !== dateKey) : [...dates, dateKey];
    await update('habits', habit.id, { completedDates: next });
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completedDates: next } : h));
    if (!dates.includes(dateKey)) toast.success('Done! ✓', { duration: 1000 });
  };

  const handleDelete = async () => {
    await remove('habits', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchHabits();
  };

  if (habits === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-20" />)}</div>
    </div>
  );

  const last7 = getLast7Days();
  const todayKey = getDateKey(new Date());
  const todayDone = habits.filter(h => (h.completedDates || []).includes(todayKey)).length;
  const totalHabits = habits.length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#43e97b] to-[#667eea] flex items-center justify-center">
              <Repeat size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// habits</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Habit <span className="gradient-text">Tracker</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">today</span>: <span className="code-number">{todayDone}</span>/<span className="code-number">{totalHabits}</span> done
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Habit
        </motion.button>
      </motion.div>

      {/* Today's progress */}
      {totalHabits > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">today's progress</span>
            <span className="text-sm font-mono font-bold" style={{ color: todayDone === totalHabits ? '#43e97b' : todayDone > 0 ? '#4facfe' : '#fa709a' }}>
              {totalHabits > 0 ? Math.round((todayDone / totalHabits) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden border border-border-subtle">
            <motion.div initial={{ width: 0 }} animate={{ width: `${totalHabits > 0 ? (todayDone / totalHabits) * 100 : 0}%` }}
              transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#667eea] via-[#43e97b] to-[#4facfe] progress-animated" />
          </div>
        </motion.div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-8">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#43e97b]/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">habits.add</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="flex gap-3 items-end flex-wrap">
                <input placeholder="e.g. LeetCode daily, Read docs..." required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="flex-1 min-w-[200px] bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-500">color:</span>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-[#050508] scale-110' : 'hover:scale-110'}`}
                      style={{ background: c, ringColor: c }} />
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                  className="btn-premium px-6 py-3.5 rounded-xl text-sm">
                  Add
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day headers */}
      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center mb-3 pl-[180px] md:pl-[220px]">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className={`text-[8px] font-mono ${getDateKey(d) === todayKey ? 'text-primary font-bold' : 'text-zinc-600'}`}>
                {DAYS[d.getDay()]}
              </span>
              <br />
              <span className={`text-[9px] font-mono ${getDateKey(d) === todayKey ? 'text-primary' : 'text-zinc-700'}`}>
                {d.getDate()}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Habits list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
        {habits.map(habit => {
          const dates = habit.completedDates || [];
          const streak = getStreak(dates);
          return (
            <motion.div key={habit.id} variants={item}
              className="glass rounded-xl p-4 flex items-center gap-3 group"
              style={{ borderLeftWidth: '3px', borderLeftColor: habit.color }}>
              {/* Name + streak */}
              <div className="w-[160px] md:w-[200px] flex-shrink-0">
                <p className="text-[12px] font-semibold text-zinc-200 truncate">{habit.name}</p>
                {streak > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame size={10} className="text-[#f59e0b]" />
                    <span className="text-[9px] font-mono text-[#f59e0b]">{streak} day streak</span>
                  </div>
                )}
              </div>

              {/* Week grid */}
              <div className="flex flex-1 items-center">
                {last7.map((d, i) => {
                  const key = getDateKey(d);
                  const done = dates.includes(key);
                  return (
                    <motion.button key={i} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.8 }}
                      onClick={() => toggleDay(habit, key)}
                      className="flex-1 flex justify-center">
                      {done
                        ? <CheckCircle2 size={20} style={{ color: habit.color }} />
                        : <Circle size={20} className="text-zinc-700 hover:text-zinc-400 transition-colors" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Delete */}
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(habit.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                <Trash2 size={12} />
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete habit?" message="This habit and all its history will be permanently deleted." confirmText="Delete" />

      {/* Empty */}
      {habits.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🔁</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no habits tracked
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">habits.add</span><span className="code-bracket">(</span><span className="code-string">"LeetCode daily"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
