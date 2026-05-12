import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, update, remove } from '../api';
import toast from 'react-hot-toast';
import { Bell, Target, Flame, Clock, Trash2, CheckCheck, Circle, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

const typeConfig = {
  danger: { bg: 'bg-[#f5576c]/10', border: 'border-[#f5576c]/20', color: '#f5576c', label: 'Overdue' },
  warning: { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', color: '#f59e0b', label: 'Warning' },
  info: { bg: 'bg-[#4facfe]/10', border: 'border-[#4facfe]/20', color: '#4facfe', label: 'Info' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const generateNotifications = async () => {
    // Fetch existing saved notifications
    const saved = await getAll('notifications', {}, 'createdAt', 100);

    // Generate fresh ones from goals + logs
    const [goals, logs] = await Promise.all([
      getAll('goals'), getAll('logs', {}, 'createdAt', 7)
    ]);

    const newNotifs = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Goal deadline checks
    goals.filter(g => g.status === 'active' && g.deadline).forEach(g => {
      const deadline = new Date(g.deadline);
      deadline.setHours(0, 0, 0, 0);
      const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      const key = `goal-${g.id}-${today.toDateString()}`;

      if (diff < 0 && !saved.find(s => s.key === key)) {
        newNotifs.push({ key, type: 'danger', icon: 'target', title: 'Goal overdue!', message: `"${g.title}" deadline passed (${Math.abs(diff)} days ago)`, read: false });
      } else if (diff === 0 && !saved.find(s => s.key === key)) {
        newNotifs.push({ key, type: 'warning', icon: 'clock', title: 'Deadline today!', message: `"${g.title}" is due today — get it done!`, read: false });
      } else if (diff > 0 && diff <= 3 && !saved.find(s => s.key === key)) {
        newNotifs.push({ key, type: 'info', icon: 'target', title: 'Deadline approaching', message: `"${g.title}" is due in ${diff} days`, read: false });
      }
    });

    // Streak reminder
    const todayStr = new Date().toDateString();
    const loggedToday = logs.some(l => new Date(l.date || l.createdAt).toDateString() === todayStr);
    const streakKey = `streak-${todayStr}`;
    if (!loggedToday && !saved.find(s => s.key === streakKey)) {
      newNotifs.push({ key: streakKey, type: 'warning', icon: 'flame', title: 'Streak in danger! 🔥', message: 'No daily log today — your streak will break!', read: false });
    }

    // Save new notifications to Firestore
    for (const n of newNotifs) {
      await create('notifications', n);
    }

    // Fetch all again
    const all = await getAll('notifications', {}, 'createdAt', 100);
    setNotifications(all);
  };

  useEffect(() => { generateNotifications(); }, []);

  const markRead = async (id) => {
    await update('notifications', id, { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markUnread = async (id) => {
    await update('notifications', id, { read: false });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await update('notifications', n.id, { read: true });
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read ✓');
  };

  const clearAll = async () => {
    for (const n of notifications) {
      await remove('notifications', n.id);
    }
    setNotifications([]);
    setConfirmClear(false);
    toast.success('All cleared 🗑️');
  };

  const deleteOne = async (id) => {
    await remove('notifications', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (icon) => {
    switch (icon) {
      case 'target': return <Target size={16} />;
      case 'flame': return <Flame size={16} />;
      case 'clock': return <Clock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  if (notifications === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl p-5"><div className="skeleton w-full h-12" /></div>)}</div>
    </div>
  );

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#f5576c] to-[#f59e0b] flex items-center justify-center">
              <Bell size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// notifications</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Notifi<span className="gradient-text">cations</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-variable">unread</span>: <span className="code-number">{unread.length}</span> |{' '}
            <span className="code-variable">total</span>: <span className="code-number">{notifications.length}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {unread.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={markAllRead}
              className="px-4 py-2.5 rounded-xl text-[11px] font-mono flex items-center gap-2 bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b] hover:bg-[#43e97b]/15 transition-all">
              <CheckCheck size={13} /> Mark all read
            </motion.button>
          )}
          {notifications.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setConfirmClear(true)}
              className="px-4 py-2.5 rounded-xl text-[11px] font-mono flex items-center gap-2 bg-[#f5576c]/10 border border-[#f5576c]/20 text-[#f5576c] hover:bg-[#f5576c]/15 transition-all">
              <Trash2 size={13} /> Clear all
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#f5576c] shadow-[0_0_8px_#f5576c50]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">unread ({unread.length})</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
            {unread.map(n => {
              const c = typeConfig[n.type] || typeConfig.info;
              return (
                <motion.div key={n.id} variants={item}
                  className={`glass rounded-xl p-4 flex items-start gap-3 group relative overflow-hidden`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: c.color }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}15`, color: c.color }}>
                    {getIcon(n.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-zinc-100">{n.title}</p>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full" style={{ color: c.color, background: `${c.color}15`, border: `1px solid ${c.color}20` }}>
                        {c.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-1">{n.message}</p>
                    <p className="text-[9px] font-mono text-zinc-600 mt-1.5">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => markRead(n.id)}
                      title="Mark as read"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-[#43e97b] hover:bg-[#43e97b]/10 transition-all">
                      <CheckCircle2 size={13} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => deleteOne(n.id)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose hover:bg-rose/10 transition-all">
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCheck size={12} className="text-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">read ({read.length})</span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-2" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
            {read.map(n => {
              const c = typeConfig[n.type] || typeConfig.info;
              return (
                <motion.div key={n.id} variants={item}
                  className="glass rounded-xl p-3.5 flex items-center gap-3 opacity-50 hover:opacity-80 transition-all group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c.color}10`, color: c.color }}>
                    {getIcon(n.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-400">{n.title}</p>
                    <p className="text-[9px] font-mono text-zinc-600 truncate">{n.message}</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => markUnread(n.id)}
                      title="Mark as unread"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-[#4facfe] hover:bg-[#4facfe]/10 transition-all">
                      <Circle size={12} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.15 }} onClick={() => deleteOne(n.id)}
                      title="Delete"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all">
                      <Trash2 size={11} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Empty */}
      {notifications.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🔔</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>no notifications
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            all clear! ✨
          </p>
        </motion.div>
      )}

      <ConfirmModal open={confirmClear} onConfirm={clearAll} onCancel={() => setConfirmClear(false)}
        title="Clear all notifications?" message="All notifications will be permanently deleted." confirmText="Clear All" />
    </div>
  );
}
