import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Check, Trash2, X, Target, Award, Zap, Trophy, Sparkles } from 'lucide-react';
import { GoalsSkeleton } from '../components/Skeletons';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } } };

const typeConfig = {
  weekly: { gradient: 'from-[#4facfe] to-[#00f2fe]', color: '#4facfe', icon: '⚡', label: 'Weekly' },
  monthly: { gradient: 'from-[#fa709a] to-[#fee140]', color: '#fa709a', icon: '🎯', label: 'Monthly' },
  yearly: { gradient: 'from-[#667eea] to-[#764ba2]', color: '#667eea', icon: '🏆', label: 'Yearly' }
};

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(700px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-2px)`;
  };
  const handleMouseLeave = () => { ref.current.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)'; };
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>;
}

export default function Goals() {
  const [goals, setGoals] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'weekly', deadline: '' });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);

  const fetchGoals = async () => setGoals(await getAll('goals'));
  useEffect(() => { fetchGoals(); }, []);

  if (goals === null) return <GoalsSkeleton />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create('goals', { ...form, status: 'active' });
    toast.success('Goal set! 🎯');
    setForm({ title: '', type: 'weekly', deadline: '' });
    setShowForm(false);
    fetchGoals();
  };

  const markComplete = async () => { await update('goals', confirmComplete, { status: 'completed', completedAt: Date.now() }); setConfirmComplete(null); toast.success('Crushed it! 🎉'); fetchGoals(); };
  const handleDelete = async () => { await remove('goals', confirmDelete); setConfirmDelete(null); fetchGoals(); };

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const completionRate = goals.length ? Math.round((completed.length / goals.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#f093fb] to-[#f5576c] flex items-center justify-center">
              <Target size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// goals</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            My <span className="gradient-text">Goals</span>
          </h2>
          <div className="flex items-center gap-4 mt-1.5">
            <p className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
              <Zap size={10} className="text-[#4facfe]" />
              <span className="code-variable">active</span>: <span className="code-number">{active.length}</span>
            </p>
            <p className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
              <Trophy size={10} className="text-[#43e97b]" />
              <span className="code-variable">completed</span>: <span className="code-number">{completed.length}</span>
            </p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Set Goal
        </motion.button>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#667eea]/5 to-[#f093fb]/3 rounded-full blur-[40px]" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Award size={13} className="text-[#fa709a]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">completion rate</span>
          </div>
          <span className="text-sm font-mono font-bold" style={{ color: completionRate >= 70 ? '#43e97b' : completionRate >= 40 ? '#4facfe' : '#fa709a' }}>{completionRate}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden border border-border-subtle relative z-10">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
            transition={{ duration: 2, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#667eea] via-[#f093fb] to-[#43e97b] progress-animated" />
        </div>
        <div className="flex justify-between mt-2 relative z-10">
          <span className="text-[8px] font-mono text-zinc-600">0%</span>
          <span className="text-[8px] font-mono text-zinc-600">100%</span>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-10">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f093fb]/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">goals.set</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="flex flex-wrap gap-3">
                <input placeholder="title: string" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-[#f093fb]/40 text-sm flex-1 min-w-[220px] placeholder:text-zinc-600 font-mono" />

                {/* Type selector */}
                <div className="flex gap-1.5">
                  {['weekly', 'monthly', 'yearly'].map(t => (
                    <motion.button key={t} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`px-4 py-3.5 rounded-xl text-[11px] font-mono capitalize transition-all flex items-center gap-1.5 ${form.type === t ? 'text-white border shadow-lg' : 'bg-surface-3 border border-border-subtle text-zinc-500 hover:text-zinc-200'}`}
                      style={form.type === t ? { background: `${typeConfig[t].color}15`, borderColor: `${typeConfig[t].color}40`, color: typeConfig[t].color, boxShadow: `0 4px 15px ${typeConfig[t].color}15` } : {}}>
                      <span>{typeConfig[t].icon}</span> {t}
                    </motion.button>
                  ))}
                </div>

                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm text-zinc-400 font-mono" />

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                  className="btn-premium px-6 py-3.5 rounded-xl text-sm flex items-center gap-1.5">
                  <Sparkles size={14} /> Set
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {active.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#4facfe] shadow-[0_0_8px_#4facfe50]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">active goals</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {active.map(g => (
              <motion.div key={g.id} variants={item}>
                <TiltCard>
                  <div className="glass rounded-2xl p-5 flex items-center justify-between group scan-line relative overflow-hidden"
                    style={{ borderLeftWidth: '3px', borderLeftColor: typeConfig[g.type]?.color }}>
                    <div className="tilt-shine" />
                    {/* Background glow */}
                    <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full blur-[50px] opacity-[0.03]"
                      style={{ background: `linear-gradient(135deg, ${typeConfig[g.type]?.color}, transparent)` }} />

                    <div className="flex items-center gap-4 relative z-10">
                      <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl cursor-default"
                        style={{ background: `${typeConfig[g.type]?.color}10`, border: `1px solid ${typeConfig[g.type]?.color}20` }}>
                        {typeConfig[g.type]?.icon}
                      </motion.div>
                      <div>
                        <p className="font-semibold text-[14px] text-zinc-100">{g.title}</p>
                        <div className="flex gap-2.5 mt-1.5">
                          <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-mono font-bold text-white bg-gradient-to-r ${typeConfig[g.type]?.gradient}`}>
                            {typeConfig[g.type]?.label}
                          </span>
                          {g.deadline && (
                            <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                              📅 {new Date(g.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10">
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmComplete(g.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#43e97b] hover:bg-[#43e97b]/10 border border-[#43e97b]/20 transition-all"
                        style={{ boxShadow: '0 0 10px rgba(67,233,123,0.1)' }}>
                        <Check size={15} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmDelete(g.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 border border-border-subtle transition-all">
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Award size={12} className="text-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">completed</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completed.map(g => (
              <motion.div key={g.id} variants={item}
                className="glass rounded-xl p-4 flex items-center justify-between opacity-60 hover:opacity-90 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#43e97b]/10 border border-[#43e97b]/15 flex items-center justify-center">
                    <Check size={12} className="text-[#43e97b]" />
                  </div>
                  <div>
                    <p className="text-[12px] line-through text-zinc-400">{g.title}</p>
                    <span className="text-[8px] font-mono text-zinc-600">{typeConfig[g.type]?.label}</span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(g.id)}
                  className="text-zinc-700 hover:text-rose opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={11} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete goal?" message="This goal will be permanently deleted." confirmText="Delete" />
      <ConfirmModal open={!!confirmComplete} onConfirm={markComplete} onCancel={() => setConfirmComplete(null)}
        title="Mark as complete?" message="Are you sure you want to mark this goal as completed?" confirmText="Complete" variant="warning" />

      {/* Empty state */}
      {goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🎯</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no goals set
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">goals.set</span><span className="code-bracket">(</span><span className="code-string">"build something"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
