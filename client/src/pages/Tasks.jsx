import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, CheckCircle2, Circle, ChevronDown, ChevronRight, ListTodo, Clock, Flag, FolderKanban, CheckCheck } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { checkMilestone } from '../utils/confetti';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const priorityConfig = {
  low: { color: '#43e97b', label: 'Low', bg: 'bg-[#43e97b]/8', border: 'border-[#43e97b]/15' },
  medium: { color: '#4facfe', label: 'Medium', bg: 'bg-[#4facfe]/8', border: 'border-[#4facfe]/15' },
  high: { color: '#fa709a', label: 'High', bg: 'bg-[#fa709a]/8', border: 'border-[#fa709a]/15' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', projectId: '', priority: 'medium', deadline: '', subtasks: '' });
  const [showForm, setShowForm] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [confirmUndone, setConfirmUndone] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const fetchTasks = async () => {
    const all = await getAll('tasks');
    setTasks(filterProject ? all.filter(t => t.projectId === filterProject) : all);
  };

  const fetchProjects = async () => setProjects(await getAll('projects'));

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchTasks(); }, [filterProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subtasks = form.subtasks ? form.subtasks.split('\n').filter(Boolean).map(s => ({ title: s.trim(), done: false })) : [];
    await create('tasks', { ...form, subtasks, status: 'pending' });
    toast.success('Task added! ✅');
    setForm({ title: '', projectId: '', priority: 'medium', deadline: '', subtasks: '' });
    setShowForm(false);
    fetchTasks();
  };

  const toggleTask = async (task) => {
    if (task.status === 'done') { setConfirmUndone(task.id); return; }
    await update('tasks', task.id, { status: 'done' });
    const newCount = tasks.filter(t => t.status === 'done').length + 1;
    checkMilestone(newCount);
    fetchTasks();
  };

  const confirmMarkPending = async () => {
    await update('tasks', confirmUndone, { status: 'pending' });
    setConfirmUndone(null);
    fetchTasks();
  };

  const toggleSubtask = async (task, idx) => {
    const subtasks = [...task.subtasks];
    subtasks[idx].done = !subtasks[idx].done;
    await update('tasks', task.id, { subtasks });
    fetchTasks();
  };

  const handleDelete = async () => {
    await remove('tasks', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchTasks();
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(pending.map(t => t.id));
  const clearSelection = () => { setSelected([]); setBulkMode(false); };

  const bulkMarkDone = async () => {
    setBulkLoading(true);
    for (const id of selected) await update('tasks', id, { status: 'done' });
    toast.success(`${selected.length} tasks completed! 🎉`);
    clearSelection();
    setBulkLoading(false);
    fetchTasks();
  };

  const bulkDelete = async () => {
    setBulkLoading(true);
    for (const id of selected) await remove('tasks', id);
    toast.success(`${selected.length} tasks deleted`);
    clearSelection();
    setBulkLoading(false);
    fetchTasks();
  };

  const toggleExpand = (id) => setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));

  if (tasks === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass rounded-2xl p-5"><div className="skeleton w-full h-5" /></div>)}</div>
    </div>
  );

  const pending = tasks.filter(t => t.status !== 'done');
  const done = tasks.filter(t => t.status === 'done');
  const getProjectName = (id) => projects.find(p => p.id === id)?.name || '';

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <ListTodo size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// tasks</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Task <span className="gradient-text">Manager</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">pending</span>: <span className="code-number">{pending.length}</span> |{' '}
            <span className="code-variable">done</span>: <span className="code-number">{done.length}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-3.5 rounded-2xl flex items-center gap-2 text-[11px] font-mono transition-all ${bulkMode ? 'bg-[#4facfe]/15 text-[#4facfe] border border-[#4facfe]/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            <CheckCheck size={14} /> Bulk
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
            <Plus size={16} /> New Task
          </motion.button>
        </div>
      </motion.div>

      {/* Project filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 flex-wrap">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setFilterProject('')}
          className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${!filterProject ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
          All
        </motion.button>
        {projects.map(p => (
          <motion.button key={p.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilterProject(p.id)}
            className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${filterProject === p.id ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            {p.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-8">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">tasks.add</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="title: string" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono md:col-span-2" />
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  <option value="">No project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <motion.button key={p} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-3.5 rounded-xl text-[10px] font-mono capitalize transition-all border ${form.priority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].border}` : 'bg-surface-3 border-border-subtle text-zinc-500'}`}
                      style={form.priority === p ? { color: priorityConfig[p].color } : {}}>
                      <Flag size={10} className="inline mr-1" />{p}
                    </motion.button>
                  ))}
                </div>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().split('T')[0]}
                  onClick={e => e.target.showPicker()}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm text-zinc-400 font-mono cursor-pointer" />
                <textarea placeholder="subtasks (one per line)" value={form.subtasks} onChange={e => setForm({ ...form, subtasks: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono md:col-span-2" rows={3} />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                ✅ tasks.add()
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
            <button onClick={bulkMarkDone} disabled={bulkLoading} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#43e97b]/15 text-[#43e97b] border border-[#43e97b]/20 disabled:opacity-50">{bulkLoading ? "Processing..." : "Mark Done"}</button>
            <button onClick={() => setConfirmBulkDelete(true)} disabled={bulkLoading} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#f5576c]/15 text-[#f5576c] border border-[#f5576c]/20 disabled:opacity-50">{bulkLoading ? "Processing..." : "Delete"}</button>
            <button onClick={clearSelection} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Pending Tasks */}
      {pending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#4facfe] shadow-[0_0_8px_#4facfe50]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">pending</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
            {pending.map(task => (
              <motion.div key={task.id} variants={item} className="glass rounded-xl p-4 group scan-line relative overflow-hidden">
                <div className="tilt-shine" />
                {/* Priority left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: priorityConfig[task.priority]?.color }} />

                <div className="flex items-start gap-3 relative z-10">
                  {/* Bulk select or Toggle */}
                  {bulkMode ? (
                    <button onClick={() => toggleSelect(task.id)} className="mt-0.5">
                      {selected.includes(task.id)
                        ? <CheckCircle2 size={18} className="text-primary" />
                        : <Circle size={18} className="text-zinc-600" />}
                    </button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => toggleTask(task)} className="mt-0.5 text-zinc-500 hover:text-[#43e97b] transition-colors">
                      <Circle size={18} />
                    </motion.button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-zinc-200">{task.title}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-mono ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.border} border`}
                        style={{ color: priorityConfig[task.priority]?.color }}>
                        {task.priority}
                      </span>
                      {task.projectId && (
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-mono bg-primary/8 border border-primary/15 text-primary/70 flex items-center gap-1">
                          <FolderKanban size={8} />{getProjectName(task.projectId)}
                        </span>
                      )}
                      {task.deadline && (
                        <span className="text-[8px] text-zinc-500 font-mono flex items-center gap-1">
                          <Clock size={8} />{new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                      <div className="mt-2">
                        <button onClick={() => toggleExpand(task.id)} className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
                          {expandedTasks[task.id] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                        </button>
                        <AnimatePresence>
                          {expandedTasks[task.id] && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 space-y-1.5 pl-1">
                              {task.subtasks.map((sub, idx) => (
                                <motion.div key={idx} initial={{ x: -10 }} animate={{ x: 0 }} transition={{ delay: idx * 0.05 }}
                                  className="flex items-center gap-2 cursor-pointer group/sub" onClick={() => toggleSubtask(task, idx)}>
                                  <motion.div whileHover={{ scale: 1.2 }}>
                                    {sub.done ? <CheckCircle2 size={13} className="text-[#43e97b]" /> : <Circle size={13} className="text-zinc-600 group-hover/sub:text-zinc-400" />}
                                  </motion.div>
                                  <span className={`text-[11px] font-mono ${sub.done ? 'line-through text-zinc-600' : 'text-zinc-400'}`}>{sub.title}</span>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(task.id)}
                    className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Done Tasks */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={12} className="text-[#43e97b]" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">completed</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
            {done.map(task => (
              <motion.div key={task.id} variants={item} className="glass rounded-xl p-3.5 flex items-center gap-3 opacity-50 hover:opacity-80 transition-all group">
                <motion.button whileHover={{ scale: 1.2 }} onClick={() => toggleTask(task)} className="text-[#43e97b]">
                  <CheckCircle2 size={16} />
                </motion.button>
                <span className="text-[12px] font-mono text-zinc-500 line-through flex-1">{task.title}</span>
                {task.subtasks?.length > 0 && (
                  <span className="text-[8px] font-mono text-zinc-600">{task.subtasks.length} subtasks</span>
                )}
                <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(task.id)}
                  className="text-zinc-700 hover:text-rose opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={11} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete task?" message="This task will be permanently deleted." confirmText="Delete" />
      <ConfirmModal open={!!confirmUndone} onConfirm={confirmMarkPending} onCancel={() => setConfirmUndone(null)}
        title="Delete selected tasks?" message="All selected tasks will be permanently deleted." confirmText="Delete All" />
      <ConfirmModal open={confirmBulkDelete} onConfirm={() => { setConfirmBulkDelete(false); bulkDelete(); }} onCancel={() => setConfirmBulkDelete(false)}
        title="Mark as pending?" message="Are you sure you want to move this task back to pending?" confirmText="Undo" variant="warning" />

      {/* Empty */}
      {tasks.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">✅</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no tasks yet
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">tasks.add</span><span className="code-bracket">(</span><span className="code-string">"build something"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
