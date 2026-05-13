import { NavLink, useNavigate } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { Home, FolderKanban, Code2, Target, BarChart3, MoreHorizontal, ListTodo, BookOpen, Map, Bookmark, Settings, Bell, LogOut, Timer, FileCode2, FolderGit2, Columns3, StickyNote, Brain, Repeat, Calendar, Award, MessageSquare, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { useAuth } from './AuthContext';
import NotificationPanel from './NotificationPanel';
import ConfirmModal from './ConfirmModal';

const mainLinks = [
  { to: '/', icon: <Home size={18} />, label: 'Home', color: '#4facfe' },
  { to: '/projects', icon: <FolderKanban size={18} />, label: 'Projects', color: '#fa709a' },
  { to: '/tasks', icon: <ListTodo size={18} />, label: 'Tasks', color: '#fee140' },
  { to: '/goals', icon: <Target size={18} />, label: 'Goals', color: '#f093fb' },
];

const moreLinks = [
  { to: '/skills', icon: <Code2 size={16} />, label: 'Skills', color: '#43e97b' },
  { to: '/logs', icon: <BookOpen size={16} />, label: 'Daily Log', color: '#4facfe' },
  { to: '/roadmap', icon: <Map size={16} />, label: 'Roadmap', color: '#00f2fe' },
  { to: '/resources', icon: <Bookmark size={16} />, label: 'Resources', color: '#a78bfa' },
  { to: '/analytics', icon: <BarChart3 size={16} />, label: 'Analytics', color: '#f59e0b' },
  { to: '/pomodoro', icon: <Timer size={16} />, label: 'Pomodoro', color: '#ef4444' },
  { to: '/snippets', icon: <FileCode2 size={16} />, label: 'Snippets', color: '#43e97b' },
  { to: '/github', icon: <FolderGit2 size={16} />, label: 'GitHub', color: '#a78bfa' },
  { to: '/kanban', icon: <Columns3 size={16} />, label: 'Kanban', color: '#f093fb' },
  { to: '/notes', icon: <StickyNote size={16} />, label: 'Notes', color: '#f59e0b' },
  { to: '/dsa', icon: <Brain size={16} />, label: 'DSA Prep', color: '#06b6d4' },
  { to: '/habits', icon: <Repeat size={16} />, label: 'Habits', color: '#43e97b' },
  { to: '/review', icon: <Calendar size={16} />, label: 'Review', color: '#f59e0b' },
  { to: '/certifications', icon: <Award size={16} />, label: 'Certs', color: '#f59e0b' },
  { to: '/feedback', icon: <MessageSquare size={16} />, label: 'Feedback', color: '#4facfe' },
  { to: '/guide', icon: <HelpCircle size={16} />, label: 'Guide', color: '#71717a' },
  { to: '/notifications', icon: <Bell size={16} />, label: 'Notifications', color: '#f5576c' },
  { to: '/settings', icon: <Settings size={16} />, label: 'Settings', color: '#71717a' },
];

export default function MobileNav() {
  const [hidden, setHidden] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { scrollY } = useScroll();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 80) setHidden(true);
    else setHidden(false);
  });

  return (
    <>
      {/* ===== PREMIUM HEADER ===== */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-3 left-3 right-3 z-50"
      >
        <div className="relative bg-[#0c0c14]/80 backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-[1.5px]"
            style={{ background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe, #43e97b, #667eea)', backgroundSize: '200% 100%' }}
          />

          <div className="px-4 py-3 flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2.5">
              <motion.div whileTap={{ scale: 0.85, rotate: -15 }} className="relative">
                <Logo size={32} />
              </motion.div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-[13px] font-bold text-white tracking-tight">Dev Tracker</h1>
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-[#43e97b] shadow-[0_0_4px_#43e97b]" />
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  <span className="code-keyword">@</span>{user?.displayName?.toLowerCase().replace(' ', '.') || 'developer'}
                </p>
              </div>
            </NavLink>

            <div className="flex items-center gap-2">
              <NotificationPanel />
              <NavLink to="/settings">
                <motion.div whileTap={{ scale: 0.85 }}
                  className="relative w-8 h-8 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-[10px] font-bold text-white">
                      {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DV'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#43e97b] border-2 border-[#0c0c14]" />
                </motion.div>
              </NavLink>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ===== MORE MENU POPUP ===== */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 z-[60]" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-20 left-3 right-3 z-[70] rounded-2xl border border-white/[0.08] p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              style={{ background: 'rgba(10, 10, 18, 0.95)', backdropFilter: 'blur(24px)' }}>
              <div className="grid grid-cols-4 gap-2">
                {moreLinks.map(link => (
                  <NavLink key={link.to} to={link.to} onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/[0.04] transition-all">
                    {({ isActive }) => (
                      <>
                        <span style={{ color: isActive ? link.color : '#71717a' }}>{link.icon}</span>
                        <span className="text-[9px] font-mono" style={{ color: isActive ? link.color : '#71717a' }}>{link.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
                {/* Logout */}
                <button onClick={() => { setShowMore(false); setConfirmLogout(true); }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-[#f5576c]/10 transition-all">
                  <LogOut size={16} className="text-[#f5576c]" />
                  <span className="text-[9px] font-mono text-[#f5576c]">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== BOTTOM NAV (5 items) ===== */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: hidden ? 100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-3 left-3 right-3 z-50"
      >
        <div className="relative bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_-8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-[1.5px]"
            style={{ background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe, #43e97b, #667eea)', backgroundSize: '200% 100%' }}
          />

          {mainLinks.map(link => (
            <NavLink key={link.to} to={link.to} className="relative flex flex-col items-center flex-1">
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.8 }}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all w-full">
                  {isActive && (
                    <motion.div layoutId="mobileNavPill"
                      className="absolute inset-1 rounded-xl"
                      style={{ background: `${link.color}10`, boxShadow: `0 0 20px ${link.color}08` }}
                      transition={{ type: "spring", stiffness: 350, damping: 28 }} />
                  )}
                  <motion.span
                    animate={isActive ? { y: [0, -2, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10" style={{ color: isActive ? link.color : '#52525b' }}>
                    {link.icon}
                  </motion.span>
                  <span className="relative z-10 text-[9px] font-mono font-medium" style={{ color: isActive ? link.color : '#52525b' }}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                      className="absolute top-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: link.color, boxShadow: `0 0 8px ${link.color}` }} />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button onClick={() => setShowMore(!showMore)} className="relative flex flex-col items-center flex-1">
            <motion.div whileTap={{ scale: 0.8 }}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all w-full">
              <motion.span animate={showMore ? { rotate: 90 } : { rotate: 0 }}
                className="relative z-10" style={{ color: showMore ? '#667eea' : '#52525b' }}>
                <MoreHorizontal size={18} />
              </motion.span>
              <span className="relative z-10 text-[9px] font-mono font-medium" style={{ color: showMore ? '#667eea' : '#52525b' }}>
                More
              </span>
            </motion.div>
          </button>
        </div>
      </motion.nav>
      {/* Logout Confirmation */}
      <ConfirmModal open={confirmLogout} onConfirm={logout} onCancel={() => setConfirmLogout(false)}
        title="Logout?" message="Are you sure you want to logout?" confirmText="Logout" />
    </>
  );
}
