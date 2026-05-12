import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, StickyNote, Search, Pin, PinOff, Pencil } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } } };

const NOTE_COLORS = [
  { id: 'purple', bg: 'rgba(102,126,234,0.08)', border: 'rgba(102,126,234,0.2)', accent: '#667eea' },
  { id: 'pink', bg: 'rgba(240,147,251,0.08)', border: 'rgba(240,147,251,0.2)', accent: '#f093fb' },
  { id: 'blue', bg: 'rgba(79,172,254,0.08)', border: 'rgba(79,172,254,0.2)', accent: '#4facfe' },
  { id: 'green', bg: 'rgba(67,233,123,0.08)', border: 'rgba(67,233,123,0.2)', accent: '#43e97b' },
  { id: 'amber', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', accent: '#f59e0b' },
  { id: 'red', bg: 'rgba(245,87,108,0.08)', border: 'rgba(245,87,108,0.2)', accent: '#f5576c' },
];

export default function Notes() {
  const [notes, setNotes] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', color: 'purple' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchNotes = async () => {
    let all = await getAll('notes', {}, 'createdAt', 100);
    if (search) all = all.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));
    // Pinned first
    all.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    setNotes(all);
  };

  useEffect(() => { fetchNotes(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await update('notes', editing, form);
      toast.success('Note updated! ✏️');
    } else {
      await create('notes', { ...form, pinned: false });
      toast.success('Note saved! 📝');
    }
    setForm({ title: '', content: '', color: 'purple' });
    setShowForm(false);
    setEditing(null);
    fetchNotes();
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content, color: note.color || 'purple' });
    setEditing(note.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await remove('notes', confirmDelete);
    setConfirmDelete(null);
    toast.success('Deleted');
    fetchNotes();
  };

  const togglePin = async (note) => {
    await update('notes', note.id, { pinned: !note.pinned });
    fetchNotes();
  };

  if (notes === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl p-5 h-36" />)}</div>
    </div>
  );

  const getColor = (id) => NOTE_COLORS.find(c => c.id === id) || NOTE_COLORS[0];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#f59e0b] to-[#f093fb] flex items-center justify-center">
              <StickyNote size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// notes</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Quick <span className="gradient-text">Notes</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">total</span>: <span className="code-number">{notes.length}</span>
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ title: '', content: '', color: 'purple' }); }}
          className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
          <Plus size={16} /> New Note
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input placeholder="search notes..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-3 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-[12px] placeholder:text-zinc-600 font-mono" />
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 120 }} className="mb-10">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b]/40 to-transparent" />
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-rose/20 transition-all">
                <X size={14} />
              </button>
              <h3 className="text-[12px] font-mono text-zinc-400 mb-5 flex items-center gap-2">
                <span className="code-keyword">{'>'}</span>
                <span className="code-function">{editing ? 'notes.update' : 'notes.create'}</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="space-y-4">
                <input placeholder="title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
                <textarea placeholder="write your note..." required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5}
                  className="w-full bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono leading-relaxed" />
                {/* Color picker */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-zinc-500">color:</span>
                  {NOTE_COLORS.map(c => (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, color: c.id })}
                      className={`w-6 h-6 rounded-full transition-all ${form.color === c.id ? 'ring-2 ring-offset-2 ring-offset-[#050508] scale-110' : 'hover:scale-110'}`}
                      style={{ background: c.accent, ringColor: c.accent }} />
                  ))}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                className="btn-premium mt-5 w-full py-3.5 rounded-xl text-sm">
                {editing ? '✏️ notes.update()' : '📝 notes.save()'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.map(note => {
          const color = getColor(note.color);
          return (
            <motion.div key={note.id} variants={item}
              className="rounded-2xl p-5 group relative overflow-hidden transition-all hover:translate-y-[-2px]"
              style={{ background: color.bg, border: `1px solid ${color.border}` }}>
              {/* Pin indicator */}
              {note.pinned && (
                <div className="absolute top-3 right-3">
                  <Pin size={10} style={{ color: color.accent }} />
                </div>
              )}

              {/* Title */}
              {note.title && (
                <h4 className="text-[13px] font-semibold text-zinc-100 mb-2 pr-6">{note.title}</h4>
              )}

              {/* Content */}
              <p className="text-[11px] text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap line-clamp-6">{note.content}</p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: color.border }}>
                <span className="text-[8px] font-mono text-zinc-600">
                  {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => togglePin(note)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-[#f59e0b] transition-all">
                    {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleEdit(note)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-primary transition-all">
                    <Pencil size={11} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(note.id)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-rose transition-all">
                    <Trash2 size={11} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete note?" message="This note will be permanently deleted." confirmText="Delete" />

      {/* Empty */}
      {notes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">📝</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no notes yet
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">notes.create</span><span className="code-bracket">(</span><span className="code-string">"quick thought"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
