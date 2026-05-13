import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderKanban, Code2, BookOpen, Target, GitBranch, Activity, Cpu, Command, Star, Terminal, ListTodo, Map, Bookmark, BarChart3, Settings, LogOut, Timer, FileCode2, FolderGit2, Columns3, StickyNote, Brain, Repeat, Calendar, Award, MessageSquare, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { useAuth } from './AuthContext';
import NotificationPanel from './NotificationPanel';
import ConfirmModal from './ConfirmModal';
import SearchModal from './SearchModal';

const links = [
  { to: '/', icon: <Home size={15} />, label: 'Dashboard', color: '#667eea', hotkey: '1' },
  { to: '/projects', icon: <FolderKanban size={15} />, label: 'Projects', color: '#f5576c', hotkey: '2' },
  { to: '/tasks', icon: <ListTodo size={15} />, label: 'Tasks', color: '#fee140', hotkey: '3' },
  { to: '/skills', icon: <Code2 size={15} />, label: 'Skills', color: '#43e97b', hotkey: '4' },
  { to: '/logs', icon: <BookOpen size={15} />, label: 'Daily Log', color: '#4facfe', hotkey: '5' },
  { to: '/goals', icon: <Target size={15} />, label: 'Goals', color: '#f093fb', hotkey: '6' },
  { to: '/roadmap', icon: <Map size={15} />, label: 'Roadmap', color: '#00f2fe', hotkey: '7' },
  { to: '/resources', icon: <Bookmark size={15} />, label: 'Resources', color: '#a78bfa', hotkey: '8' },
  { to: '/analytics', icon: <BarChart3 size={15} />, label: 'Analytics', color: '#f59e0b', hotkey: '9' },
  { to: '/pomodoro', icon: <Timer size={15} />, label: 'Pomodoro', color: '#ef4444', hotkey: 'P' },
  { to: '/snippets', icon: <FileCode2 size={15} />, label: 'Snippets', color: '#43e97b', hotkey: 'S' },
  { to: '/github', icon: <FolderGit2 size={15} />, label: 'GitHub', color: '#a78bfa', hotkey: 'G' },
  { to: '/kanban', icon: <Columns3 size={15} />, label: 'Kanban', color: '#f093fb', hotkey: 'K' },
  { to: '/notes', icon: <StickyNote size={15} />, label: 'Notes', color: '#f59e0b', hotkey: 'N' },
  { to: '/dsa', icon: <Brain size={15} />, label: 'DSA Prep', color: '#06b6d4', hotkey: 'D' },
  { to: '/habits', icon: <Repeat size={15} />, label: 'Habits', color: '#43e97b', hotkey: 'H' },
  { to: '/review', icon: <Calendar size={15} />, label: 'Review', color: '#f59e0b', hotkey: 'W' },
  { to: '/certifications', icon: <Award size={15} />, label: 'Certs', color: '#f59e0b', hotkey: 'C' },
  { to: '/feedback', icon: <MessageSquare size={15} />, label: 'Feedback', color: '#4facfe', hotkey: 'F' },
  { to: '/guide', icon: <HelpCircle size={15} />, label: 'Guide', color: '#71717a', hotkey: '?' },
  { to: '/settings', icon: <Settings size={15} />, label: 'Settings', color: '#71717a', hotkey: '0' },
];

// Live typing terminal
function LiveTerminal() {
  const commands = [
    { prompt: 'npm run dev', out: '✓ ready in 320ms' },
    { prompt: 'git push origin main', out: '✓ 3 files pushed' },
    { prompt: 'tsc --noEmit', out: '✓ 0 errors' },
  ];
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    const cmd = commands[idx];
    let i = 0;
    setTyped(''); setOutput('');
    const t = setInterval(() => {
      setTyped(cmd.prompt.slice(0, i + 1));
      i++;
      if (i >= cmd.prompt.length) {
        clearInterval(t);
        setTimeout(() => {
          setOutput(cmd.out);
          setTimeout(() => setIdx((idx + 1) % commands.length), 2500);
        }, 400);
      }
    }, 50);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <div className="terminal-block p-3 text-[9px]">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="text-[7px] text-zinc-600 ml-1.5">terminal</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="code-keyword">❯</span>
        <span className="text-zinc-200">{typed}</span>
        {!output && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-primary">▌</motion.span>}
      </div>
      <AnimatePresence>
        {output && (
          <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} className="code-string mt-1">{output}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Code block
function CodeBlock() {
  const { user } = useAuth();
  return (
    <div className="terminal-block p-3 text-[9px] leading-relaxed">
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/[0.04]">
        <Code2 size={9} className="text-primary/50" />
        <span className="text-[7px] text-zinc-600">status.ts</span>
      </div>
      <div><span className="code-keyword">const</span> <span className="code-variable">dev</span> <span className="code-bracket">=</span> <span className="code-bracket">{'{'}</span></div>
      <div className="pl-3"><span className="code-function">name</span>: <span className="code-string">"{user?.displayName?.split(' ')[0] || 'Dev'}"</span>,</div>
      <div className="pl-3"><span className="code-function">stack</span>: <span className="code-string">"Full-Stack"</span>,</div>
      <div className="pl-3"><span className="code-function">mode</span>: <span className="code-string">"building"</span> <span className="code-comment">// 🔥</span></div>
      <div><span className="code-bracket">{'}'}</span>;</div>
    </div>
  );
}

// 3D Orb
function AnimatedOrb() {
  return (
    <div className="w-full h-20 rounded-xl overflow-hidden bg-[#08080c] border border-white/[0.04] relative flex items-center justify-center">
      <div className="orb" />
      <div className="orb-ring" />
      <div className="orb-ring orb-ring-2" />
      <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-2 right-2 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[7px] font-mono text-zinc-600">live</span>
      </motion.div>
    </div>
  );
}

// CPU Stats
function LiveStats() {
  const [cpu, setCpu] = useState(12);
  useEffect(() => { const t = setInterval(() => setCpu(Math.floor(8 + Math.random() * 18)), 2500); return () => clearInterval(t); }, []);
  return (
    <div className="flex items-center gap-2 text-[8px] font-mono">
      <Cpu size={8} className="text-primary/50" />
      <span className="text-zinc-500">{cpu}%</span>
      <div className="w-8 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div animate={{ width: `${cpu}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-primary to-pink" />
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [time, setTime] = useState(new Date());
  const [hoveredLink, setHoveredLink] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[270px] bg-[#0a0a0f]/95 backdrop-blur-3xl border-r border-white/[0.04] flex flex-col z-50 select-none overflow-hidden">
      {/* Floating gradient orbs */}
      <motion.div animate={{ y: [0, -12, 0], x: [0, 4, 0] }} transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-16 right-2 w-28 h-28 bg-gradient-to-br from-primary/[0.05] to-pink/[0.03] rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }}
        className="absolute bottom-28 left-0 w-20 h-20 bg-gradient-to-br from-blue/[0.04] to-emerald/[0.02] rounded-full blur-2xl pointer-events-none" />

      {/* Top gradient line */}
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 pb-4 relative z-10">
        <NavLink to="/" className="flex items-center gap-3 cursor-pointer">
          <Logo size={36} />
          <div className="flex-1">
            <h1 className="text-[13px] font-bold text-white tracking-tight hover:text-primary transition-colors">Dev Tracker</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-[5px] h-[5px] rounded-full bg-[#43e97b] shadow-[0_0_6px_#43e97b]" />
              <span className="text-[8px] text-zinc-500 font-mono">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </NavLink>
      </motion.div>

      {/* Command bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-4 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-primary/20 transition-all cursor-pointer group flex-1">
            <Command size={11} className="text-zinc-600 group-hover:text-primary transition-colors" />
            <span className="text-[10px] text-zinc-600 flex-1 font-mono">search...</span>
            <span className="text-[8px] text-zinc-700 bg-white/[0.04] px-1.5 py-0.5 rounded font-mono border border-white/[0.04]">⌘K</span>
          </div>
          <NotificationPanel />
        </div>
      </motion.div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Navigation */}
      <nav className="flex-1 px-3 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="flex items-center gap-2 px-3 mb-2">
          <Terminal size={9} className="text-zinc-600" />
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.15em]">workspace</span>
        </div>
        <div className="space-y-[2px]">
          {links.map((link, i) => (
            <motion.div key={link.to} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 120, damping: 15 }}>
              <NavLink to={link.to}
                data-tour={link.to.replace('/', '') || 'dashboard'}
                onMouseEnter={() => setHoveredLink(link.to)}
                onMouseLeave={() => setHoveredLink(null)}
                className={({ isActive }) => `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div layoutId="navPill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{ background: `linear-gradient(180deg, ${link.color}, ${link.color}80)`, boxShadow: `0 0 10px ${link.color}40` }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                    )}
                    <motion.div whileHover={{ scale: 1.15, rotate: 5 }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive ? '' : 'bg-white/[0.02] group-hover:bg-white/[0.04]'}`}
                      style={isActive ? { background: `${link.color}15`, color: link.color, boxShadow: `0 0 12px ${link.color}15` } : {}}>
                      <span className={isActive ? '' : 'text-zinc-500 group-hover:text-zinc-300'}>{link.icon}</span>
                    </motion.div>
                    <span className={`text-[12px] font-medium font-mono ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{link.label}</span>
                    <motion.span animate={{ opacity: hoveredLink === link.to || isActive ? 1 : 0 }}
                      className="ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]"
                      style={{ color: isActive ? link.color : '#52525b' }}>⌘{link.hotkey}</motion.span>
                    {isActive && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                        className="w-1.5 h-1.5 rounded-full" style={{ background: link.color, boxShadow: `0 0 6px ${link.color}` }} />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Git + Stats */}
      <div className="border-t border-white/[0.03] relative z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <GitBranch size={10} className="text-primary/50" />
            <span className="text-zinc-400">main</span>
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[8px] text-[#43e97b]">●</motion.span>
          </div>
          <LiveStats />
        </div>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="px-4 py-3 border-t border-white/[0.03] relative z-10">
        <div className="flex items-center gap-2.5">
          <NavLink to="/settings">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-lg object-cover hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DV'}
              </div>
            )}
          </NavLink>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-zinc-200 truncate">{user?.displayName || 'Developer'}</p>
            <p className="text-[8px] text-zinc-600 font-mono truncate">{user?.email}</p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setConfirmLogout(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all border border-border-subtle">
            <LogOut size={11} />
          </motion.button>
        </div>
      </motion.div>

      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue/15 to-transparent origin-right" />

      <ConfirmModal open={confirmLogout} onConfirm={logout} onCancel={() => setConfirmLogout(false)}
        title="Logout?" message="Are you sure you want to logout?" confirmText="Logout" />
    </aside>
  );
}
