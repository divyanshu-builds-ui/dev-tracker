import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Code2, Copy, Check, Tag, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const LANGUAGES = ['javascript', 'typescript', 'python', 'html', 'css', 'bash', 'json', 'sql', 'react', 'other'];

const langColors = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab', html: '#e34f26',
  css: '#1572b6', bash: '#43e97b', json: '#667eea', sql: '#f59e0b', react: '#61dafb', other: '#a78bfa'
};

export default function Snippets() {
  const [snippets, setSnippets] = useState(null);
  const [form, setForm] = useState({ title: '', code: '', language: 'javascript', tags: '' });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSnippets = async () => {
    let all = await getAll('snippets');
    if (filter) all = all.filter(s => s.language === filter);
    if (search) all = all.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || (s.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())));
    setSnippets(all);
  };

  useEffect(() => { fetchSnippets(); }, [filter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    await create('snippets', { ...form, tags });
    toast.success('Snippet saved! 💾');
    setForm({ title: '', code: '', language: 'javascript', tags: '' });
    setShowForm(false);
    fetchSnippets();
  };

  const handleDelete = async () => {
    await remove('snippets', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchSnippets();
  };

  const copyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  if (snippets === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-32" />)}</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#43e97b] to-[#4facfe] flex items-center justify-center">
              <Code2 size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// snippets</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Code <span className="gradient-text">Vault</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-keyword">const</span> <span className="code-variable">saved</span> = <span className="code-number">{snippets.length}</span>;
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Snippet
        </motion.button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter('')}
            className={`px-3 py-2 rounded-lg text-[10px] font-mono font-medium transition-all ${!filter ? 'bg-primary/15 text-primary border border-primary/25' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}>
            All
          </motion.button>
          {LANGUAGES.map(lang => (
            <motion.button key={lang} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(lang)}
              className={`px-3 py-2 rounded-lg text-[10px] font-mono font-medium transition-all capitalize ${filter === lang ? 'border' : 'bg-surface-3 text-zinc-500 border border-border-subtle hover:text-zinc-200'}`}
              style={filter === lang ? { background: `${langColors[lang]}15`, borderColor: `${langColors[lang]}40`, color: langColors[lang] } : {}}>
              {lang}
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
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#43e97b]/40 to-transparent" />
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">vault.save</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="title: string" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                  <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                    className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm capitalize">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <textarea placeholder="// paste your code here..." required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} rows={8}
                  className="w-full bg-[#0a0a12] px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono leading-relaxed" />
                <input placeholder="tags: string[] (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                💾 vault.save()
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snippets */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {snippets.map(s => {
          const color = langColors[s.language] || langColors.other;
          return (
            <motion.div key={s.id} variants={item} className="glass rounded-2xl overflow-hidden group">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-md capitalize"
                    style={{ color, background: `${color}15`, border: `1px solid ${color}20` }}>
                    {s.language}
                  </span>
                  <span className="text-[13px] font-semibold text-zinc-100">{s.title}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <motion.button whileHover={{ scale: 1.15 }} onClick={() => copyCode(s.id, s.code)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#43e97b] hover:bg-[#43e97b]/10 transition-all">
                    {copied === s.id ? <Check size={14} className="text-[#43e97b]" /> : <Copy size={14} />}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.15 }} onClick={() => setConfirmDelete(s.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all">
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </div>

              {/* Code block */}
              <div className="px-5 py-4 overflow-x-auto">
                <pre className="text-[12px] font-mono leading-relaxed text-zinc-300 whitespace-pre-wrap break-words">
                  <code>{s.code}</code>
                </pre>
              </div>

              {/* Tags */}
              {s.tags?.length > 0 && (
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-surface-3 text-zinc-400 border border-border-subtle flex items-center gap-1">
                      <Tag size={7} />{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete snippet?" message="This snippet will be permanently deleted." confirmText="Delete" />

      {/* Empty */}
      {snippets.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">💾</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no snippets saved
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">vault.save</span><span className="code-bracket">(</span><span className="code-string">"useful code"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
