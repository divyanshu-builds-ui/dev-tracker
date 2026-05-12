import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, ExternalLink, X, FolderKanban, Search, Rocket, Zap, Code2, Globe, GitFork } from 'lucide-react';
import { ProjectsSkeleton } from '../components/Skeletons';
import ConfirmModal from '../components/ConfirmModal';

const emptyProject = { name: '', description: '', category: 'real-world', techStack: '', status: 'planning', progress: 0, liveLink: '', githubLink: '', challenges: '', learnings: '' };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 90, damping: 15 } } };

function SpotlightCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };
  return <div ref={ref} onMouseMove={handleMouseMove} className={`spotlight ${className}`}>{children}</div>;
}

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
  };
  const handleMouseLeave = () => { ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)'; };
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>;
}

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchProjects = async () => {
    let all = await getAll('projects');
    if (filter) all = all.filter(p => p.category === filter);
    if (search) all = all.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setProjects(all);
  };

  useEffect(() => { fetchProjects(); }, [filter, search]);

  if (projects === null) return <ProjectsSkeleton />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, techStack: typeof form.techStack === 'string' ? form.techStack.split(',').map(s => s.trim()).filter(Boolean) : form.techStack, progress: Number(form.progress) };
    try {
      if (editing) { await update('projects', editing, data); toast.success('Updated! ⚡'); }
      else { await create('projects', data); toast.success('Created! 🚀'); }
      setForm(emptyProject); setEditing(null); setShowForm(false); fetchProjects();
    } catch { toast.error('Error'); }
  };

  const handleEdit = (p) => { setForm({ ...p, techStack: p.techStack?.join(', ') || '' }); setEditing(p.id); setShowForm(true); };
  const handleDelete = async () => { await remove('projects', confirmDelete); setConfirmDelete(null); toast.success('Deleted'); fetchProjects(); };

  const statusConfig = {
    planning: { gradient: 'from-[#fa709a] to-[#fee140]', icon: '📋', label: 'Planning' },
    'in-progress': { gradient: 'from-[#4facfe] to-[#00f2fe]', icon: '⚡', label: 'In Progress' },
    completed: { gradient: 'from-[#43e97b] to-[#38f9d7]', icon: '✅', label: 'Completed' },
    deployed: { gradient: 'from-[#667eea] to-[#764ba2]', icon: '🚀', label: 'Deployed' }
  };

  const categoryColors = { '': '#667eea', portfolio: '#f093fb', 'real-world': '#4facfe', tool: '#43e97b', practice: '#fa709a' };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <FolderKanban size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// projects</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            My <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-keyword">const</span> <span className="code-variable">count</span> = <span className="code-number">{projects.length}</span>;
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyProject); }}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Project
        </motion.button>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
        <div className="flex gap-1.5">
          {[{ val: '', label: 'All' }, { val: 'portfolio', label: 'Portfolio' }, { val: 'real-world', label: 'Real World' }, { val: 'tool', label: 'Tools' }, { val: 'practice', label: 'Practice' }].map(cat => (
            <motion.button key={cat.val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(cat.val)}
              className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${filter === cat.val ? 'text-white border' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200 hover:border-border-medium'}`}
              style={filter === cat.val ? { background: `${categoryColors[cat.val]}20`, borderColor: `${categoryColors[cat.val]}40`, color: categoryColors[cat.val] } : {}}>
              {cat.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-10">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-primary/5 to-pink/5 rounded-full blur-[60px]" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-6 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">{editing ? 'updateProject' : 'createProject'}</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="name: string" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  <option value="portfolio">Portfolio</option><option value="real-world">Real World</option><option value="tool">Tool</option><option value="practice">Practice</option>
                </select>
                <input placeholder="techStack: string[]" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  <option value="planning">Planning</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="deployed">Deployed</option>
                </select>
                <input type="number" placeholder="progress: number" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <input placeholder="liveUrl: string" value={form.liveLink} onChange={e => setForm({ ...form, liveLink: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <input placeholder="githubUrl: string" value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <textarea placeholder="description: string" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm md:col-span-2 placeholder:text-zinc-600 font-mono" rows={2} />
                <textarea placeholder="challenges: string" value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" rows={2} />
                <textarea placeholder="learnings: string" value={form.learnings} onChange={e => setForm({ ...form, learnings: e.target.value })} className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" rows={2} />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-6 w-full py-3.5 rounded-xl text-sm">
                {editing ? '⚡ project.update()' : '🚀 project.create()'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {projects.map(p => (
          <motion.div key={p.id} variants={item}>
            <TiltCard>
              <SpotlightCard className="h-full">
                <div className="glass rounded-2xl p-6 flex flex-col h-full group scan-line border-rotate relative">
                  {/* Top gradient accent */}
                  <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r ${statusConfig[p.status].gradient} opacity-60 rounded-full`} />
                  <div className="tilt-shine" />

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <motion.span whileHover={{ scale: 1.3, rotate: 10 }} className="text-xl cursor-default">{statusConfig[p.status].icon}</motion.span>
                      <h3 className="font-bold text-[15px] text-zinc-100 group-hover:gradient-text transition-all duration-500">{p.name}</h3>
                    </div>
                    <span className={`text-[8px] px-2.5 py-1 rounded-full font-mono font-bold bg-gradient-to-r ${statusConfig[p.status].gradient} text-white shadow-sm`}>
                      {statusConfig[p.status].label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-500 text-[11px] mb-4 flex-1 line-clamp-2 leading-relaxed relative z-10 font-mono">
                    <span className="code-comment">// </span>{p.description || 'no description'}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
                    {(p.techStack || []).slice(0, 4).map(t => (
                      <motion.span key={t} whileHover={{ scale: 1.1, y: -2 }}
                        className="bg-primary/8 text-zinc-300 text-[9px] px-2 py-0.5 rounded-md font-mono border border-border-subtle hover:border-primary/25 transition-all cursor-default">
                        {t}
                      </motion.span>
                    ))}
                    {(p.techStack || []).length > 4 && <span className="text-[9px] text-zinc-600 font-mono self-center">+{p.techStack.length - 4}</span>}
                  </div>

                  {/* Progress */}
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-[9px] mb-1.5 font-mono">
                      <span className="text-zinc-600">progress</span>
                      <span className="font-bold" style={{ color: p.progress >= 80 ? '#43e97b' : p.progress >= 50 ? '#4facfe' : '#fa709a' }}>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2 overflow-hidden border border-border-subtle">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${statusConfig[p.status].gradient} progress-animated`} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-white/[0.04] relative z-10">
                    <div className="flex gap-2">
                      {p.githubLink && (
                        <motion.a whileHover={{ scale: 1.15, y: -2 }} href={p.githubLink} target="_blank"
                          className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
                          <GitFork size={13} />
                        </motion.a>
                      )}
                      {p.liveLink && (
                        <motion.a whileHover={{ scale: 1.15, y: -2 }} href={p.liveLink} target="_blank"
                          className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-[#4facfe] hover:bg-[#4facfe]/10 transition-all">
                          <Globe size={13} />
                        </motion.a>
                      )}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleEdit(p)}
                        className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all">
                        <Pencil size={12} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(p.id)}
                        className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all">
                        <Trash2 size={12} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete project?" message="This project will be permanently deleted." confirmText="Delete" />

      {/* Empty state */}
      {projects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🚀</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no projects found
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">createProject</span><span className="code-bracket">()</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
