import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Award, ExternalLink, CheckCircle2, Clock, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const PLATFORMS = ['Udemy', 'Coursera', 'freeCodeCamp', 'Codecademy', 'YouTube', 'Pluralsight', 'LinkedIn Learning', 'Other'];
const STATUSES = ['in-progress', 'completed', 'planned'];

const statusConfig = {
  'in-progress': { color: '#4facfe', label: 'In Progress', icon: <Clock size={12} /> },
  completed: { color: '#43e97b', label: 'Completed', icon: <CheckCircle2 size={12} /> },
  planned: { color: '#f59e0b', label: 'Planned', icon: <Clock size={12} /> },
};

export default function Certifications() {
  const [certs, setCerts] = useState(null);
  const [form, setForm] = useState({ title: '', platform: 'Udemy', status: 'in-progress', progress: 0, link: '', completedDate: '' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCerts = async () => {
    let all = await getAll('certifications', {}, 'createdAt', 100);
    if (filter) all = all.filter(c => c.status === filter);
    if (search) all = all.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    setCerts(all);
  };

  useEffect(() => { fetchCerts(); }, [filter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, progress: Number(form.progress) };
    if (editing) {
      await update('certifications', editing, data);
      toast.success('Updated! ✏️');
    } else {
      await create('certifications', data);
      toast.success('Course added! 🎓');
    }
    setForm({ title: '', platform: 'Udemy', status: 'in-progress', progress: 0, link: '', completedDate: '' });
    setShowForm(false);
    setEditing(null);
    fetchCerts();
  };

  const handleEdit = (c) => {
    setForm({ title: c.title, platform: c.platform, status: c.status, progress: c.progress, link: c.link || '', completedDate: c.completedDate || '' });
    setEditing(c.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await remove('certifications', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchCerts();
  };

  const markComplete = async (c) => {
    await update('certifications', c.id, { status: 'completed', progress: 100, completedDate: new Date().toISOString().split('T')[0] });
    toast.success('Completed! 🎉');
    fetchCerts();
  };

  if (certs === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-24" />)}</div>
    </div>
  );

  const completed = certs.filter(c => c.status === 'completed').length;
  const inProgress = certs.filter(c => c.status === 'in-progress').length;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#f59e0b] to-[#f093fb] flex items-center justify-center">
              <Award size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// certifications</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Certi<span className="gradient-text">fications</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">completed</span>: <span className="code-number">{completed}</span> |{' '}
            <span className="code-variable">in-progress</span>: <span className="code-number">{inProgress}</span> |{' '}
            <span className="code-variable">total</span>: <span className="code-number">{certs.length}</span>
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', platform: 'Udemy', status: 'in-progress', progress: 0, link: '', completedDate: '' }); }}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Course
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
        <div className="flex gap-1.5">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter('')}
            className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${!filter ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            All
          </motion.button>
          {STATUSES.map(s => (
            <motion.button key={s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all capitalize ${filter === s ? 'border' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}
              style={filter === s ? { background: `${statusConfig[s].color}15`, borderColor: `${statusConfig[s].color}40`, color: statusConfig[s].color } : {}}>
              {statusConfig[s].label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-8">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b]/40 to-transparent" />
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">{editing ? 'certs.update' : 'certs.add'}</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Course / Certification title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono md:col-span-2" />
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <motion.button key={s} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-mono capitalize transition-all border ${form.status === s ? '' : 'bg-surface-3 border-border-subtle text-zinc-500'}`}
                      style={form.status === s ? { background: `${statusConfig[s].color}15`, borderColor: `${statusConfig[s].color}40`, color: statusConfig[s].color } : {}}>
                      {statusConfig[s].label}
                    </motion.button>
                  ))}
                </div>
                <input type="number" placeholder="Progress %" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <input placeholder="Link (optional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                {form.status === 'completed' && (
                  <input type="date" value={form.completedDate} onChange={e => setForm({ ...form, completedDate: e.target.value })}
                    className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm text-zinc-400 font-mono" />
                )}
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                {editing ? '✏️ certs.update()' : '🎓 certs.add()'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certifications list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {certs.map(c => {
          const sc = statusConfig[c.status];
          return (
            <motion.div key={c.id} variants={item}
              className="glass rounded-xl p-5 group relative overflow-hidden"
              style={{ borderLeftWidth: '3px', borderLeftColor: sc.color }}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 cursor-default"
                  style={{ background: `${sc.color}12`, border: `1px solid ${sc.color}20` }}>
                  🎓
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-semibold text-zinc-100">{c.title}</span>
                    {c.link && (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-primary transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15 text-primary/70">{c.platform}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ color: sc.color, background: `${sc.color}12`, border: `1px solid ${sc.color}20` }}>
                      {sc.icon} {sc.label}
                    </span>
                    {c.completedDate && (
                      <span className="text-[9px] font-mono text-zinc-600">
                        {new Date(c.completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] font-mono mb-1">
                      <span className="text-zinc-600">progress</span>
                      <span style={{ color: sc.color }} className="font-bold">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden border border-border-subtle">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        className="h-full rounded-full progress-animated" style={{ background: sc.color }} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                  {c.status !== 'completed' && (
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => markComplete(c)}
                      title="Mark complete"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#43e97b] hover:bg-[#43e97b]/10 transition-all">
                      <CheckCircle2 size={14} />
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.15 }} onClick={() => handleEdit(c)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all">
                    <Award size={13} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.15 }} onClick={() => setConfirmDelete(c.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all">
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete certification?" message="This course will be permanently deleted." confirmText="Delete" />

      {/* Empty */}
      {certs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🎓</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no courses tracked
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">certs.add</span><span className="code-bracket">(</span><span className="code-string">"React Masterclass"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
