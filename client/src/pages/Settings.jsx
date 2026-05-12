import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, create, update } from '../api';
import toast from 'react-hot-toast';
import { User, Download, Moon, Sun, Save, Palette, LogOut } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../components/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', initials: '', bio: '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [exporting, setExporting] = useState(false);
  const [confirmExport, setConfirmExport] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    (async () => {
      const docs = await getAll('profile', {}, 'createdAt', 1);
      if (docs.length) {
        setDocId(docs[0].id);
        setForm({ name: docs[0].name || '', role: docs[0].role || '', initials: docs[0].initials || '', bio: docs[0].bio || '' });
      }
      setProfile(true);
    })();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (docId) {
      await update('profile', docId, form);
    } else {
      const doc = await create('profile', form);
      setDocId(doc.id);
    }
    toast.success('Profile saved! ✨');
  };

  const exportData = async () => {
    setExporting(true);
    setConfirmExport(false);
    try {
      const [projects, skills, logs, goals, tasks, resources] = await Promise.all([
        getAll('projects'), getAll('skills'), getAll('logs', {}, 'createdAt', 500),
        getAll('goals'), getAll('tasks'), getAll('resources')
      ]);
      const data = { projects, skills, logs, goals, tasks, resources, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dev-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported! 📦');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  };

  if (!profile) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="glass rounded-2xl p-6 h-64" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
            <User size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// settings</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Profile & <span className="gradient-text">Settings</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Edit Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={13} className="text-[#667eea]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">edit profile</span>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 8px 25px rgba(102,126,234,0.3)' }}>
                {form.initials || 'DG'}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{form.name || 'Your Name'}</p>
                <p className="text-[10px] font-mono text-zinc-500">{form.role || 'Developer'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              <input placeholder="Initials (2 chars)" maxLength={2} value={form.initials} onChange={e => setForm({ ...form, initials: e.target.value.toUpperCase() })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            </div>
            <input placeholder="Role (e.g. Full-Stack Developer)" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            <textarea placeholder="Bio (optional)" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2}
              className="w-full bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              className="btn-premium w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Save size={14} /> Save Profile
            </motion.button>
          </form>
        </motion.div>

        {/* Theme + Export */}
        <div className="space-y-4">
          {/* Theme Toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette size={13} className="text-[#f093fb]" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">appearance</span>
            </div>

            <div className="flex gap-3">
              {[
                { key: 'dark', icon: <Moon size={16} />, label: 'Dark', color: '#667eea' },
                { key: 'light', icon: <Sun size={16} />, label: 'Light', color: '#f59e0b' },
              ].map(t => (
                <motion.button key={t.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setTheme(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border transition-all ${theme === t.key ? 'border-opacity-40' : 'bg-surface-3 border-border-subtle text-zinc-500 hover:text-zinc-200'}`}
                  style={theme === t.key ? { background: `${t.color}15`, borderColor: `${t.color}40`, color: t.color, boxShadow: `0 4px 20px ${t.color}15` } : {}}>
                  {t.icon}
                  <span className="text-[11px] font-mono font-medium">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Export Data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Download size={13} className="text-[#43e97b]" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">export data</span>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono mb-4">
              Download all your data (projects, skills, logs, goals, tasks, resources) as a JSON file.
            </p>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmExport(true)} disabled={exporting}
              className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b] hover:bg-[#43e97b]/15 transition-all disabled:opacity-50">
              <Download size={14} /> {exporting ? 'Exporting...' : 'Export All Data'}
            </motion.button>
          </motion.div>

          {/* App Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6">
            <div className="text-[10px] font-mono text-zinc-600 space-y-1.5">
              <p><span className="text-zinc-400">app</span>: Dev Tracker v1.0.0</p>
              <p><span className="text-zinc-400">stack</span>: React + Firebase + Tailwind</p>
              <p><span className="text-zinc-400">logged in as</span>: <span className="text-primary">{user?.email}</span></p>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmLogout(true)}
              className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#f5576c]/10 border border-[#f5576c]/20 text-[#f5576c] hover:bg-[#f5576c]/15 transition-all">
              <LogOut size={14} /> Logout
            </motion.button>
          </motion.div>
        </div>

      </div>

      <ConfirmModal open={confirmExport} onConfirm={exportData} onCancel={() => setConfirmExport(false)}
        title="Export all data?" message="All your data will be downloaded as a JSON file." confirmText="Export" variant="warning" />
      <ConfirmModal open={confirmLogout} onConfirm={logout} onCancel={() => setConfirmLogout(false)}
        title="Logout?" message="Are you sure you want to logout?" confirmText="Logout" />
    </div>
  );
}
