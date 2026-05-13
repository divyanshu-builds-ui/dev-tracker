import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Bookmark, ExternalLink, Search, Tag, Download } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { RESOURCES_STARTER_PACK } from '../utils/resourcesData';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } } };

const categoryConfig = {
  documentation: { icon: '📄', color: '#4facfe', label: 'Docs' },
  tutorial: { icon: '🎓', color: '#43e97b', label: 'Tutorial' },
  tool: { icon: '🛠️', color: '#f093fb', label: 'Tool' },
  article: { icon: '📰', color: '#fa709a', label: 'Article' },
  video: { icon: '🎬', color: '#fee140', label: 'Video' },
  github: { icon: '🐙', color: '#a78bfa', label: 'GitHub' },
  other: { icon: '🔗', color: '#667eea', label: 'Other' },
};

export default function Resources() {
  const [resources, setResources] = useState(null);
  const [form, setForm] = useState({ title: '', url: '', category: 'documentation', tags: '' });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loadingPack, setLoadingPack] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);

  const fetchResources = async () => {
    let all = await getAll('resources');
    if (filter) all = all.filter(r => r.category === filter);
    if (search) all = all.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || (r.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())));
    setResources(all);
  };

  useEffect(() => { fetchResources(); }, [filter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    await create('resources', { ...form, tags });
    toast.success('Saved! 🔖');
    setForm({ title: '', url: '', category: 'documentation', tags: '' });
    setShowForm(false);
    fetchResources();
  };

  const handleDelete = async () => {
    await remove('resources', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchResources();
  };

  const loadStarterPack = async () => {
    setConfirmLoad(false);
    setLoadingPack(true);
    const existing = resources.map(r => r.url.toLowerCase());
    let added = 0;
    for (const r of RESOURCES_STARTER_PACK) {
      if (!existing.includes(r.url.toLowerCase())) {
        await create('resources', r);
        added++;
      }
    }
    toast.success(`Loaded ${added} resources! 📚`);
    setLoadingPack(false);
    fetchResources();
  };

  const handleLoadClick = () => {
    if (resources.length > 0) setConfirmLoad(true);
    else loadStarterPack();
  };

  if (resources === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl p-5"><div className="skeleton w-full h-12" /></div>)}</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#f093fb] flex items-center justify-center">
              <Bookmark size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// resources</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Resource <span className="gradient-text">Vault</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-keyword">const</span> <span className="code-variable">saved</span> = <span className="code-number">{resources.length}</span>;
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={handleLoadClick} disabled={loadingPack}
            className="px-4 py-3.5 rounded-2xl flex items-center gap-2 text-[11px] font-mono bg-[#4facfe]/10 border border-[#4facfe]/20 text-[#4facfe] hover:bg-[#4facfe]/15 transition-all disabled:opacity-50">
            <Download size={14} /> {loadingPack ? 'Loading...' : 'Load Starter Pack'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
            <Plus size={16} /> Save Link
          </motion.button>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter('')}
            className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${!filter ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            All
          </motion.button>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(key)}
              className={`px-3.5 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${filter === key ? 'border' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}
              style={filter === key ? { background: `${cfg.color}15`, borderColor: `${cfg.color}40`, color: cfg.color } : {}}>
              {cfg.icon} {cfg.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-10">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#667eea]/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">vault.save</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="title: string" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <input placeholder="url: string" required type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
                <input placeholder="tags: string[] (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                🔖 vault.save()
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resources Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {resources.map(r => {
          const cfg = categoryConfig[r.category] || categoryConfig.other;
          return (
            <motion.div key={r.id} variants={item}>
              <div className="glass rounded-2xl p-5 group scan-line relative overflow-hidden hover:border-white/[0.08] transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: cfg.color }} />
                <div className="tilt-shine" />

                <div className="flex items-start gap-3 relative z-10">
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 cursor-default"
                    style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}20` }}>
                    {cfg.icon}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-100 truncate">{r.title}</span>
                      <span className="text-[8px] px-2 py-0.5 rounded-full font-mono" style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}20` }}>
                        {cfg.label}
                      </span>
                    </div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-mono text-zinc-500 hover:text-primary truncate block mt-1 transition-colors">
                      {r.url}
                    </a>
                    {r.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-surface-3 text-zinc-400 border border-border-subtle flex items-center gap-1">
                            <Tag size={7} />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                    <motion.a whileHover={{ scale: 1.15 }} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all">
                      <ExternalLink size={12} />
                    </motion.a>
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => setConfirmDelete(r.id)}
                      className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all">
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete resource?" message="This bookmark will be permanently deleted." confirmText="Delete" />
      <ConfirmModal open={confirmLoad} onConfirm={loadStarterPack} onCancel={() => setConfirmLoad(false)}
        title="Load Starter Pack?" message="This will add 50+ curated resources to your vault." confirmText="Load" variant="warning" />

      {/* Empty state */}
      {resources.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🔖</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>vault is empty
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">vault.save</span><span className="code-bracket">(</span><span className="code-string">"useful link"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
