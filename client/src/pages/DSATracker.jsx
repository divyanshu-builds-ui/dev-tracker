import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Brain, CheckCircle2, Circle, Search, Filter, ExternalLink, Download, CheckCheck } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { DSA_STARTER_PACK } from '../utils/dsaData';
import { checkMilestone } from '../utils/confetti';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const TOPICS = ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'DP', 'Recursion', 'Binary Search', 'Sorting', 'Hashing', 'Greedy', 'Backtracking', 'Bit Manipulation', 'Math', 'Other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const PLATFORMS = ['LeetCode', 'GFG', 'CodeForces', 'HackerRank', 'Neetcode', 'Other'];

const diffConfig = {
  easy: { color: '#43e97b', bg: 'bg-[#43e97b]/10', border: 'border-[#43e97b]/20' },
  medium: { color: '#f59e0b', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20' },
  hard: { color: '#f5576c', bg: 'bg-[#f5576c]/10', border: 'border-[#f5576c]/20' },
};

export default function DSATracker() {
  const [questions, setQuestions] = useState(null);
  const [form, setForm] = useState({ title: '', topic: 'Array', difficulty: 'medium', platform: 'LeetCode', link: '', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [confirmUndone, setConfirmUndone] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);

  const fetchQuestions = async () => {
    let all = await getAll('dsa', {}, 'createdAt', 500);
    if (filterTopic) all = all.filter(q => q.topic === filterTopic);
    if (filterDiff) all = all.filter(q => q.difficulty === filterDiff);
    if (filterStatus === 'solved') all = all.filter(q => q.solved);
    if (filterStatus === 'unsolved') all = all.filter(q => !q.solved);
    if (search) all = all.filter(q => q.title.toLowerCase().includes(search.toLowerCase()));
    setQuestions(all);
  };

  useEffect(() => { fetchQuestions(); }, [filterTopic, filterDiff, filterStatus, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create('dsa', { ...form, solved: false });
    toast.success('Question added! 🧠');
    setForm({ title: '', topic: 'Array', difficulty: 'medium', platform: 'LeetCode', link: '', notes: '' });
    setShowForm(false);
    fetchQuestions();
  };

  const toggleSolved = async (q) => {
    if (q.solved) { setConfirmUndone(q.id); return; }
    await update('dsa', q.id, { solved: true });
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, solved: true } : x));
    const newCount = questions.filter(x => x.solved).length + 1;
    if (checkMilestone(newCount)) {
      toast.success(`🎉 Milestone! ${newCount} questions solved!`, { duration: 4000 });
    } else {
      toast.success('Solved! 🎉');
    }
  };

  const confirmMarkUnsolved = async () => {
    await update('dsa', confirmUndone, { solved: false });
    setQuestions(prev => prev.map(x => x.id === confirmUndone ? { ...x, solved: false } : x));
    setConfirmUndone(null);
  };

  const handleDelete = async () => {
    await remove('dsa', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchQuestions();
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(questions.filter(q => !q.solved).map(q => q.id));
  const clearSelection = () => { setSelected([]); setBulkMode(false); };

  const bulkMarkSolved = async () => {
    setBulkLoading(true);
    for (const id of selected) await update('dsa', id, { solved: true });
    toast.success(`${selected.length} questions solved! 🎉`);
    clearSelection();
    setBulkLoading(false);
    fetchQuestions();
  };

  const bulkDelete = async () => {
    setBulkLoading(true);
    for (const id of selected) await remove('dsa', id);
    toast.success(`${selected.length} questions deleted`);
    clearSelection();
    setBulkLoading(false);
    fetchQuestions();
  };

  const loadStarterPack = async () => {
    setConfirmLoad(false);
    setLoading(true);
    const existing = questions.map(q => q.title.toLowerCase());
    let added = 0;
    for (const q of DSA_STARTER_PACK) {
      if (!existing.includes(q.title.toLowerCase())) {
        await create('dsa', { ...q, solved: false, notes: '' });
        added++;
      }
    }
    toast.success(`Loaded ${added} questions! 🧠`);
    setLoading(false);
    fetchQuestions();
  };

  const handleLoadClick = () => {
    if (questions.length > 0) setConfirmLoad(true);
    else loadStarterPack();
  };

  if (questions === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="glass rounded-xl p-4"><div className="skeleton w-full h-6" /></div>)}</div>
    </div>
  );

  const solved = questions.filter(q => q.solved).length;
  const total = questions.length;
  const easyCount = questions.filter(q => q.difficulty === 'easy').length;
  const medCount = questions.filter(q => q.difficulty === 'medium').length;
  const hardCount = questions.filter(q => q.difficulty === 'hard').length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#43e97b] flex items-center justify-center">
              <Brain size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// dsa tracker</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Interview <span className="gradient-text">Prep</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">solved</span>: <span className="code-number">{solved}</span>/<span className="code-number">{total}</span> |{' '}
            <span style={{ color: '#43e97b' }}>E:{easyCount}</span>{' '}
            <span style={{ color: '#f59e0b' }}>M:{medCount}</span>{' '}
            <span style={{ color: '#f5576c' }}>H:{hardCount}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-3.5 rounded-2xl flex items-center gap-2 text-[11px] font-mono transition-all ${bulkMode ? 'bg-[#4facfe]/15 text-[#4facfe] border border-[#4facfe]/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            <CheckCheck size={14} /> Bulk
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={handleLoadClick} disabled={loading}
            className="px-4 py-3.5 rounded-2xl flex items-center gap-2 text-[11px] font-mono bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b] hover:bg-[#43e97b]/15 transition-all disabled:opacity-50">
            <Download size={14} /> {loading ? 'Loading...' : 'Load Blind 75'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Question
          </motion.button>
        </div>
      </motion.div>

      {/* Stats bar */}
      {total > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">progress</span>
            <span className="text-sm font-mono font-bold" style={{ color: solved / total >= 0.7 ? '#43e97b' : solved / total >= 0.4 ? '#4facfe' : '#fa709a' }}>
              {Math.round((solved / total) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden border border-border-subtle">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(solved / total) * 100}%` }}
              transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#667eea] via-[#43e97b] to-[#4facfe] progress-animated" />
          </div>
          <div className="flex gap-4 mt-3">
            {DIFFICULTIES.map(d => {
              const count = questions.filter(q => q.difficulty === d && q.solved).length;
              const dTotal = questions.filter(q => q.difficulty === d).length;
              return (
                <span key={d} className="text-[9px] font-mono" style={{ color: diffConfig[d].color }}>
                  {d}: {count}/{dTotal}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="bg-surface-3 px-3 py-2.5 rounded-xl outline-none border border-border-subtle text-[11px] font-mono">
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}
          className="bg-surface-3 px-3 py-2.5 rounded-xl outline-none border border-border-subtle text-[11px] font-mono">
          <option value="">All Difficulty</option>
          {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-surface-3 px-3 py-2.5 rounded-xl outline-none border border-border-subtle text-[11px] font-mono">
          <option value="">All Status</option>
          <option value="solved">Solved</option>
          <option value="unsolved">Unsolved</option>
        </select>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-8">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#667eea]/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">dsa.add</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Question title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono md:col-span-2" />
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <motion.button key={d} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`flex-1 py-3.5 rounded-xl text-[11px] font-mono capitalize transition-all border ${form.difficulty === d ? `${diffConfig[d].bg} ${diffConfig[d].border}` : 'bg-surface-3 border-border-subtle text-zinc-500'}`}
                      style={form.difficulty === d ? { color: diffConfig[d].color } : {}}>
                      {d}
                    </motion.button>
                  ))}
                </div>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input placeholder="Link (optional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <textarea placeholder="Notes / approach (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono md:col-span-2" />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                🧠 dsa.add()
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk actions bar */}
      {bulkMode && selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-300">{selected.length} selected</span>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-[10px] font-mono text-primary hover:text-white transition-colors">Select All</button>
            <button onClick={bulkMarkSolved} disabled={bulkLoading} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#43e97b]/15 text-[#43e97b] border border-[#43e97b]/20 disabled:opacity-50">{bulkLoading ? "Processing..." : "Mark Solved"}</button>
            <button onClick={bulkDelete} disabled={bulkLoading} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#f5576c]/15 text-[#f5576c] border border-[#f5576c]/20 disabled:opacity-50">{bulkLoading ? "Processing..." : "Delete"}</button>
            <button onClick={clearSelection} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Questions list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
        {questions.map(q => {
          const dc = diffConfig[q.difficulty];
          return (
            <motion.div key={q.id} variants={item}
              className={`glass rounded-xl p-4 flex items-center gap-3 group transition-all ${q.solved ? 'opacity-60' : ''}`}
              style={{ borderLeftWidth: '3px', borderLeftColor: dc.color }}>
              {/* Toggle */}
              {bulkMode ? (
                <button onClick={() => toggleSelect(q.id)} className="flex-shrink-0">
                  {selected.includes(q.id)
                    ? <CheckCircle2 size={18} className="text-primary" />
                    : <Circle size={18} className="text-zinc-600" />}
                </button>
              ) : (
                <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => toggleSolved(q)}
                  className="flex-shrink-0">
                  {q.solved
                    ? <CheckCircle2 size={18} style={{ color: dc.color }} />
                    : <Circle size={18} className="text-zinc-600 hover:text-zinc-300 transition-colors" />}
                </motion.button>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[13px] font-medium ${q.solved ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>{q.title}</span>
                  {q.link && (
                    <a href={q.link} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-primary transition-colors">
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15 text-primary/70">{q.topic}</span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full capitalize ${dc.bg} ${dc.border} border`} style={{ color: dc.color }}>{q.difficulty}</span>
                  <span className="text-[8px] font-mono text-zinc-600">{q.platform}</span>
                </div>
                {q.notes && <p className="text-[10px] font-mono text-zinc-600 mt-1.5 truncate">{q.notes}</p>}
              </div>

              {/* Delete */}
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(q.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0">
                <Trash2 size={12} />
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete question?" message="This question will be permanently deleted." confirmText="Delete" />
      <ConfirmModal open={confirmLoad} onConfirm={loadStarterPack} onCancel={() => setConfirmLoad(false)}
        title="Load Blind 75?" message="This will add 60+ DSA questions to your list." confirmText="Load" variant="warning" />
      <ConfirmModal open={!!confirmUndone} onConfirm={confirmMarkUnsolved} onCancel={() => setConfirmUndone(null)}
        title="Mark as unsolved?" message="Are you sure you want to mark this question as unsolved?" confirmText="Unsolved" variant="warning" />

      {/* Empty */}
      {questions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🧠</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no questions tracked
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">dsa.add</span><span className="code-bracket">(</span><span className="code-string">"Two Sum"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
