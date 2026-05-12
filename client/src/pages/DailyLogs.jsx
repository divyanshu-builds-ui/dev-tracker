import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, BookOpen, Clock, Flame, Sparkles } from 'lucide-react';
import { LogsSkeleton } from '../components/Skeletons';
import ConfirmModal from '../components/ConfirmModal';

const moods = ['low', 'okay', 'good', 'great', 'amazing'];
const moodConfig = {
  low: { emoji: '😞', gradient: 'from-[#f5576c] to-[#ff6b6b]', label: 'Rough', color: '#f5576c' },
  okay: { emoji: '😐', gradient: 'from-[#fa709a] to-[#fee140]', label: 'Okay', color: '#fa709a' },
  good: { emoji: '🙂', gradient: 'from-[#4facfe] to-[#00f2fe]', label: 'Good', color: '#4facfe' },
  great: { emoji: '😄', gradient: 'from-[#43e97b] to-[#38f9d7]', label: 'Great', color: '#43e97b' },
  amazing: { emoji: '🔥', gradient: 'from-[#667eea] to-[#764ba2]', label: 'On Fire', color: '#667eea' }
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, x: -20, scale: 0.97 }, show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 14 } } };

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
  };
  const handleMouseLeave = () => { ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)'; };
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>;
}

export default function DailyLogs() {
  const [logs, setLogs] = useState(null);
  const [form, setForm] = useState({ learned: '', hoursWorked: 0, mood: 'okay', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchLogs = async () => setLogs(await getAll('logs', {}, 'createdAt', 30));
  useEffect(() => { fetchLogs(); }, []);

  if (logs === null) return <LogsSkeleton />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create('logs', { ...form, hoursWorked: Number(form.hoursWorked), date: Date.now() });
    toast.success('Logged! 📝');
    setForm({ learned: '', hoursWorked: 0, mood: 'okay', notes: '' });
    setShowForm(false);
    fetchLogs();
  };

  const handleDelete = async () => { await remove('logs', confirmDelete); setConfirmDelete(null); toast.success('Deleted'); fetchLogs(); };

  const totalHours = logs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center">
              <BookOpen size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// daily-log</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Dev <span className="gradient-text">Journal</span>
          </h2>
          <div className="flex items-center gap-4 mt-1.5">
            <p className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
              <Clock size={10} className="text-[#4facfe]" />
              <span className="code-variable">totalHours</span>: <span className="code-number">{totalHours}h</span>
            </p>
            <p className="text-zinc-500 font-mono text-[11px]">
              <span className="code-variable">entries</span>: <span className="code-number">{logs.length}</span>
            </p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Entry
        </motion.button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-10">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4facfe]/40 to-transparent" />
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-[#4facfe]/5 to-[#00f2fe]/3 rounded-full blur-[60px]" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-6 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">log.create</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea placeholder="learned: string // what did you learn?" required value={form.learned} onChange={e => setForm({ ...form, learned: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-[#4facfe]/40 text-sm md:col-span-2 placeholder:text-zinc-600 font-mono min-h-[100px]" rows={3} />

                <div>
                  <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-2 block">hoursWorked: number</label>
                  <input type="number" min="0" max="24" step="0.5" value={form.hoursWorked} onChange={e => setForm({ ...form, hoursWorked: +e.target.value })}
                    className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-[#4facfe]/40 text-sm w-full font-mono" />
                </div>

                <div>
                  <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-2 block">mood: enum</label>
                  <div className="flex gap-2">
                    {moods.map(m => (
                      <motion.button key={m} type="button" whileHover={{ scale: 1.2, y: -4 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setForm({ ...form, mood: m })}
                        className={`text-xl p-2.5 rounded-xl transition-all duration-300 ${form.mood === m ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0f] scale-110' : 'hover:bg-white/[0.03]'}`}
                        style={form.mood === m ? { background: `${moodConfig[m].color}15`, ringColor: `${moodConfig[m].color}60` } : {}}>
                        {moodConfig[m].emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <textarea placeholder="notes?: string // optional" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-[#4facfe]/40 text-sm md:col-span-2 placeholder:text-zinc-600 font-mono" rows={2} />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-6 w-full py-3.5 rounded-xl text-sm">
                📝 log.save()
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <motion.div variants={container} initial="hidden" animate="show" className="relative">
        {/* Timeline line */}
        <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#667eea]/30 via-[#4facfe]/20 to-transparent rounded-full" />

        <div className="space-y-4">
          {logs.map((log, i) => (
            <motion.div key={log.id} variants={item} className="relative pl-14">
              {/* Timeline dot */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                className="absolute left-[16px] top-7 w-[14px] h-[14px] rounded-full border-[3px] border-[#0a0a0f] z-10"
                style={{ background: `linear-gradient(135deg, ${moodConfig[log.mood]?.color || '#667eea'}, ${moodConfig[log.mood]?.color || '#667eea'}80)`, boxShadow: `0 0 10px ${moodConfig[log.mood]?.color || '#667eea'}30` }} />

              <TiltCard>
                <div className="glass rounded-2xl p-6 group scan-line relative overflow-hidden">
                  {/* Left accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b ${moodConfig[log.mood]?.gradient || 'from-[#667eea] to-[#764ba2]'}`} />
                  <div className="tilt-shine" />

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-start gap-4">
                      {/* Mood emoji */}
                      <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 cursor-default"
                        style={{ background: `${moodConfig[log.mood]?.color || '#667eea'}10`, border: `1px solid ${moodConfig[log.mood]?.color || '#667eea'}20` }}>
                        {moodConfig[log.mood]?.emoji || '😐'}
                      </motion.div>

                      <div className="flex-1">
                        {/* Meta info */}
                        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-500 bg-surface-3 px-2 py-0.5 rounded-md border border-border-subtle">
                            {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-mono font-bold text-white bg-gradient-to-r ${moodConfig[log.mood]?.gradient}`}>
                            {log.hoursWorked}h
                          </span>
                          <span className="text-[8px] font-mono px-2 py-0.5 rounded-full"
                            style={{ color: moodConfig[log.mood]?.color, background: `${moodConfig[log.mood]?.color}10`, border: `1px solid ${moodConfig[log.mood]?.color}20` }}>
                            {moodConfig[log.mood]?.label}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-zinc-200 text-[13px] leading-relaxed">{log.learned}</p>

                        {/* Notes */}
                        {log.notes && (
                          <p className="text-zinc-500 text-[11px] mt-2.5 font-mono border-l-2 border-border-subtle pl-3 italic">
                            <span className="code-comment">// </span>{log.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(log.id)}
                      className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 relative z-10">
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete log entry?" message="This entry will be permanently deleted." confirmText="Delete" />

      {/* Empty state */}
      {logs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">📖</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no entries yet
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">journal.write</span><span className="code-bracket">(</span><span className="code-string">"today"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
