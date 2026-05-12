import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, create, update } from '../api';
import toast from 'react-hot-toast';
import { User, Download, Moon, Sun, Save, Palette, LogOut, FileDown } from 'lucide-react';
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

  const exportPDF = async () => {
    try {
      const [projects, skills, logs, goals, tasks] = await Promise.all([
        getAll('projects'), getAll('skills'), getAll('logs', {}, 'createdAt', 100),
        getAll('goals'), getAll('tasks')
      ]);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const totalHours = logs.reduce((s, l) => s + (l.hoursWorked || 0), 0);
      const tasksDone = tasks.filter(t => t.status === 'done').length;
      const goalsCompleted = goals.filter(g => g.status === 'completed').length;

      // Dark background
      doc.setFillColor(8, 8, 14);
      doc.rect(0, 0, 210, 297, 'F');

      // Top accent line
      doc.setDrawColor(102, 126, 234);
      doc.setLineWidth(0.8);
      doc.line(20, 15, 190, 15);

      // Header
      doc.setTextColor(102, 126, 234);
      doc.setFontSize(28);
      doc.text('Dev Tracker', 20, 30);
      doc.setFontSize(12);
      doc.setTextColor(240, 147, 251);
      doc.text('Progress Report', 20, 38);

      // Date
      doc.setTextColor(120, 120, 130);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 46);
      doc.text(`User: ${user?.displayName || 'Developer'}`, 20, 52);

      // Divider
      doc.setDrawColor(40, 40, 60);
      doc.setLineWidth(0.3);
      doc.line(20, 57, 190, 57);

      // Summary stats
      let y = 67;
      doc.setFontSize(13);
      doc.setTextColor(102, 126, 234);
      doc.text('Overview', 20, y); y += 10;

      doc.setFontSize(10);
      doc.setTextColor(220, 220, 230);
      const summaryItems = [
        [`Projects: ${projects.length}`, `Skills: ${skills.length}`],
        [`Tasks: ${tasks.length} (Done: ${tasksDone})`, `Goals: ${goals.length} (Hit: ${goalsCompleted})`],
        [`Daily Logs: ${logs.length}`, `Total Hours: ${totalHours}h`],
      ];
      summaryItems.forEach(row => {
        doc.text(row[0], 24, y);
        doc.text(row[1], 110, y);
        y += 7;
      });

      // Projects section
      y += 8;
      doc.setDrawColor(40, 40, 60);
      doc.line(20, y - 4, 190, y - 4);
      doc.setTextColor(102, 126, 234);
      doc.setFontSize(13);
      doc.text('Projects', 20, y); y += 9;

      doc.setFontSize(9);
      doc.setTextColor(180, 180, 190);
      projects.slice(0, 8).forEach(p => {
        const status = p.status === 'deployed' ? '[DEPLOYED]' : p.status === 'completed' ? '[DONE]' : p.status === 'in-progress' ? '[WIP]' : '[PLAN]';
        doc.text(`${status} ${p.name} - ${p.progress}%`, 24, y);
        y += 6;
      });

      // Skills section
      y += 8;
      doc.setDrawColor(40, 40, 60);
      doc.line(20, y - 4, 190, y - 4);
      doc.setTextColor(67, 233, 123);
      doc.setFontSize(13);
      doc.text('Skills', 20, y); y += 9;

      doc.setFontSize(9);
      doc.setTextColor(180, 180, 190);
      skills.slice(0, 8).forEach(s => {
        doc.text(`${s.name} - ${s.level} (${s.progress}%)`, 24, y);
        y += 6;
      });

      // Footer
      doc.setDrawColor(102, 126, 234);
      doc.setLineWidth(0.5);
      doc.line(20, 280, 190, 280);
      doc.setTextColor(80, 80, 100);
      doc.setFontSize(8);
      doc.text('Generated by Dev Tracker | devtracker.app', 20, 287);
      doc.text('Premium Developer Progress Tracking', 140, 287);

      doc.save(`dev-tracker-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported!');
    } catch { toast.error('PDF export failed'); }
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
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">theme</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'dark', label: 'Default Dark', colors: ['#667eea', '#764ba2', '#050508'] },
                { key: 'cyberpunk', label: 'Cyberpunk', colors: ['#ff00ff', '#00ffff', '#0a0014'] },
                { key: 'dracula', label: 'Dracula', colors: ['#bd93f9', '#ff79c6', '#282a36'] },
                { key: 'nord', label: 'Nord', colors: ['#88c0d0', '#81a1c1', '#2e3440'] },
                { key: 'emerald', label: 'Emerald', colors: ['#10b981', '#34d399', '#022c22'] },
                { key: 'light', label: 'Light', colors: ['#667eea', '#f093fb', '#f8f9fc'] },
              ].map(t => (
                <motion.button key={t.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setTheme(t.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${theme === t.key ? 'border-opacity-60' : 'bg-surface-3 border-border-subtle hover:border-white/[0.1]'}`}
                  style={theme === t.key ? { background: `${t.colors[0]}12`, borderColor: `${t.colors[0]}50` } : {}}>
                  <div className="flex gap-1">
                    {t.colors.map((c, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                  </div>
                  <span className={`text-[10px] font-mono ${theme === t.key ? 'text-zinc-200' : 'text-zinc-500'}`}>{t.label}</span>
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

            <div className="space-y-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setConfirmExport(true)} disabled={exporting}
                className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b] hover:bg-[#43e97b]/15 transition-all disabled:opacity-50">
                <Download size={14} /> {exporting ? 'Exporting...' : 'Export JSON'}
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={exportPDF}
                className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#667eea]/10 border border-[#667eea]/20 text-[#667eea] hover:bg-[#667eea]/15 transition-all">
                <FileDown size={14} /> Export PDF Report
              </motion.button>
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6">
            <div className="text-[10px] font-mono text-zinc-600 space-y-1.5 mb-4">
              <p><span className="text-zinc-400">app</span>: Dev Tracker v1.0.0</p>
              <p><span className="text-zinc-400">stack</span>: React + Firebase + Tailwind</p>
              <p><span className="text-zinc-400">logged in as</span>: <span className="text-primary">{user?.email}</span></p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => window.__openOnboarding?.()}
              className="w-full py-2.5 rounded-xl text-[11px] font-mono flex items-center justify-center gap-2 bg-white/[0.04] border border-border-subtle text-zinc-400 hover:text-zinc-200 hover:border-primary/20 transition-all">
              🚀 Take a Tour
            </motion.button>
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
