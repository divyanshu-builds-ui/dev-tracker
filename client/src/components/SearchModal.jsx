import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Home, FolderKanban, Code2, BookOpen, Target, ListTodo, Map, Bookmark, BarChart3, Settings, Timer, FileCode2, FolderGit2, Columns3, StickyNote, Brain, Repeat, Calendar, Bell } from 'lucide-react';

const PAGES = [
  { path: '/', label: 'Dashboard', icon: <Home size={14} />, keywords: 'home dashboard xp', key: '1' },
  { path: '/projects', label: 'Projects', icon: <FolderKanban size={14} />, keywords: 'projects build', key: '2' },
  { path: '/tasks', label: 'Tasks', icon: <ListTodo size={14} />, keywords: 'tasks todo', key: '3' },
  { path: '/skills', label: 'Skills', icon: <Code2 size={14} />, keywords: 'skills tech stack', key: '4' },
  { path: '/logs', label: 'Daily Log', icon: <BookOpen size={14} />, keywords: 'logs journal daily', key: '5' },
  { path: '/goals', label: 'Goals', icon: <Target size={14} />, keywords: 'goals weekly monthly', key: '6' },
  { path: '/roadmap', label: 'Roadmap', icon: <Map size={14} />, keywords: 'roadmap learning', key: '7' },
  { path: '/resources', label: 'Resources', icon: <Bookmark size={14} />, keywords: 'resources links bookmarks', key: '8' },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={14} />, keywords: 'analytics charts stats', key: '9' },
  { path: '/pomodoro', label: 'Pomodoro', icon: <Timer size={14} />, keywords: 'pomodoro timer focus', key: 'P' },
  { path: '/snippets', label: 'Snippets', icon: <FileCode2 size={14} />, keywords: 'snippets code vault', key: 'S' },
  { path: '/github', label: 'GitHub', icon: <FolderGit2 size={14} />, keywords: 'github repos commits', key: 'G' },
  { path: '/kanban', label: 'Kanban', icon: <Columns3 size={14} />, keywords: 'kanban board drag', key: 'K' },
  { path: '/notes', label: 'Notes', icon: <StickyNote size={14} />, keywords: 'notes quick scratchpad', key: 'N' },
  { path: '/dsa', label: 'DSA Prep', icon: <Brain size={14} />, keywords: 'dsa interview prep leetcode', key: 'D' },
  { path: '/habits', label: 'Habits', icon: <Repeat size={14} />, keywords: 'habits tracker daily', key: 'H' },
  { path: '/review', label: 'Weekly Review', icon: <Calendar size={14} />, keywords: 'review weekly summary', key: 'W' },
  { path: '/notifications', label: 'Notifications', icon: <Bell size={14} />, keywords: 'notifications alerts', key: '' },
  { path: '/settings', label: 'Settings', icon: <Settings size={14} />, keywords: 'settings profile theme', key: '0' },
];

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = query
    ? PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase()) || p.keywords.includes(query.toLowerCase()))
    : PAGES;

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selected]) { navigate(filtered[selected].path); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose(); } };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-[9999] rounded-2xl border border-white/[0.08] overflow-hidden"
            style={{ background: 'rgba(10,10,18,0.97)', backdropFilter: 'blur(24px)' }}>

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.04]">
              <Search size={16} className="text-zinc-500" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Search pages or press shortcut key..." autoFocus
                className="flex-1 bg-transparent outline-none text-sm font-mono text-zinc-200 placeholder:text-zinc-600" />
              <span className="text-[8px] font-mono text-zinc-700 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">ESC</span>
            </div>

            {/* Hint */}
            <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-3">
              <span className="text-[8px] font-mono text-zinc-600">Tip: Press shortcut key directly (without ⌘K) to navigate instantly</span>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {filtered.map((page, i) => (
                <motion.button key={page.path}
                  onClick={() => { navigate(page.path); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${i === selected ? 'bg-primary/10 text-white' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'}`}>
                  <span className={i === selected ? 'text-primary' : 'text-zinc-600'}>{page.icon}</span>
                  <span className="text-[12px] font-mono">{page.label}</span>
                  {page.key && <span className="ml-auto text-[8px] font-mono text-zinc-700 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">{page.key}</span>}
                  {i === selected && <span className="text-[8px] font-mono text-primary/60">↵</span>}
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-[11px] font-mono text-zinc-600 py-6">No results found</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
