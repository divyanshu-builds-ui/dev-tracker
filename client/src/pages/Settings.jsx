import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, create, update } from '../api';
import { calculateXP, getLevel, getStreak, ACHIEVEMENTS } from '../utils/xp';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { User, Download, Moon, Sun, Save, Palette, LogOut, FileDown, Upload } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../components/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', initials: '', bio: '', github: '', linkedin: '', portfolio: '', twitter: '', location: '', techStack: '', experience: '', availableForHire: false });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [exporting, setExporting] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [confirmExport, setConfirmExport] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [importing, setImporting] = useState(false);
  const [badges, setBadges] = useState([]);
  const [profilePublished, setProfilePublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [referralStats, setReferralStats] = useState({ count: 0, xpBonus: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const docs = await getAll('profile', {}, 'createdAt', 1);
      if (docs.length) {
        setDocId(docs[0].id);
        setForm({
          name: docs[0].name || user.displayName || '',
          role: docs[0].role || '',
          initials: docs[0].initials || (user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : ''),
          bio: docs[0].bio || '',
          github: docs[0].github || '',
          linkedin: docs[0].linkedin || '',
          portfolio: docs[0].portfolio || '',
          twitter: docs[0].twitter || '',
          location: docs[0].location || '',
          techStack: docs[0].techStack || '',
          experience: docs[0].experience || '',
          availableForHire: docs[0].availableForHire || false,
        });
      } else {
        // First time — pre-fill from Google/GitHub auth
        setForm(prev => ({
          ...prev,
          name: user.displayName || '',
          initials: user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '',
        }));
      }
      setProfile(true);

      // Load badges
      const [projects, skills, logs, goals] = await Promise.all([
        getAll('projects'), getAll('skills'), getAll('logs', {}, 'createdAt', 60), getAll('goals')
      ]);
      const stats = {
        totalProjects: projects.length,
        completed: projects.filter(p => p.status === 'completed').length,
        deployed: projects.filter(p => p.status === 'deployed').length,
        totalSkills: skills.length,
        totalLogs: logs.length,
        totalHours: logs.reduce((s, l) => s + (l.hoursWorked || 0), 0),
        completedGoals: goals.filter(g => g.status === 'completed').length,
        streak: getStreak(logs),
        level: getLevel(calculateXP({ totalProjects: projects.length, completed: projects.filter(p => p.status === 'completed').length, deployed: projects.filter(p => p.status === 'deployed').length, totalSkills: skills.length, totalLogs: logs.length, completedGoals: goals.filter(g => g.status === 'completed').length, activeGoals: goals.filter(g => g.status === 'active').length })).level,
      };
      setBadges(ACHIEVEMENTS.filter(a => a.check(stats)));

      // Load referral stats
      const refSnap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'referralStats'));
      if (refSnap.exists()) setReferralStats(refSnap.data());
    })();
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const saveProfile = async () => {
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
    setPdfExporting(true);
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
    setPdfExporting(false);
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const collections = ['projects', 'skills', 'logs', 'goals', 'tasks', 'resources'];
      let total = 0;
      for (const col of collections) {
        if (data[col] && Array.isArray(data[col])) {
          for (const item of data[col]) {
            const { id, ...rest } = item;
            await create(col, rest);
            total++;
          }
        }
      }
      toast.success(`Imported ${total} items!`);
    } catch {
      toast.error('Invalid JSON file');
    }
    setImporting(false);
    e.target.value = '';
  };

  const publishProfile = async () => {
    setPublishing(true);
    try {
      const [projects, skills, logs, goals, dsa] = await Promise.all([
        getAll('projects'), getAll('skills'), getAll('logs', {}, 'createdAt', 60), getAll('goals'), getAll('dsa', {}, 'createdAt', 500)
      ]);
      const stats = {
        totalProjects: projects.length, completed: projects.filter(p => p.status === 'completed').length,
        deployed: projects.filter(p => p.status === 'deployed').length, totalSkills: skills.length,
        totalLogs: logs.length, completedGoals: goals.filter(g => g.status === 'completed').length,
        activeGoals: goals.filter(g => g.status === 'active').length,
      };
      const xp = calculateXP(stats);
      const level = getLevel(xp);
      const streak = getStreak(logs);
      const dsaSolved = dsa.filter(q => q.solved).length;
      const hours = logs.reduce((s, l) => s + (l.hoursWorked || 0), 0);
      const unlockedBadges = ACHIEVEMENTS.filter(a => a.check({ ...stats, streak, level: level.level, totalHours: hours })).map(a => ({ icon: a.icon, title: a.title }));

      await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
        name: user?.displayName || form.name,
        role: form.role,
        bio: form.bio,
        photoURL: user?.photoURL || null,
        github: form.github,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        twitter: form.twitter,
        location: form.location,
        experience: form.experience,
        techStack: form.techStack,
        availableForHire: form.availableForHire,
        projects: projects.length,
        skills: skills.length,
        hours: Math.round(hours),
        goals: stats.completedGoals,
        dsa: dsaSolved,
        streak,
        level: level.level,
        xp,
        badges: unlockedBadges,
        updatedAt: Date.now(),
      });
      setProfilePublished(true);
      toast.success('Profile published!');
    } catch { toast.error('Failed to publish'); }
    setPublishing(false);
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

          <form onSubmit={(e) => { e.preventDefault(); setConfirmSave(true); }} className="space-y-4">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/[0.06]" />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 8px 25px rgba(102,126,234,0.3)' }}>
                  {form.initials || user?.displayName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DV'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-zinc-200">{form.name || user?.displayName || 'Your Name'}</p>
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
            <textarea placeholder="Bio / About you" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2}
              className="w-full bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="GitHub username" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              <input placeholder="LinkedIn URL" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Portfolio URL" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              <input placeholder="Twitter / X handle" value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Location (e.g. India)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
              <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                className="bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle text-sm font-mono">
                <option value="">Experience level</option>
                <option value="student">Student</option>
                <option value="fresher">Fresher</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
            <input placeholder="Tech Stack (comma separated)" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })}
              className="w-full bg-surface-3 px-4 py-3 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono" />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.availableForHire} onChange={e => setForm({ ...form, availableForHire: e.target.checked })}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-[11px] font-mono text-zinc-400">Available for hire / open to opportunities</span>
            </label>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              className="btn-premium w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Save size={14} /> Save Profile
            </motion.button>
          </form>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">badges earned</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {badges.map(b => (
                  <motion.div key={b.id} whileHover={{ scale: 1.15, y: -2 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg cursor-default bg-white/[0.03] border border-white/[0.06]"
                    title={`${b.title} — ${b.desc}`}>
                    {b.icon}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {/* Public Profile */}
          <div className="mt-6 pt-5 border-t border-white/[0.04]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">public profile</span>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmPublish(true)} disabled={publishing}
              className="w-full mt-3 py-2.5 rounded-xl text-[11px] font-mono flex items-center justify-center gap-2 bg-[#f093fb]/10 border border-[#f093fb]/20 text-[#f093fb] hover:bg-[#f093fb]/15 transition-all disabled:opacity-50">
              {publishing ? "Publishing..." : profilePublished ? "✓ Published" : "🌐 Publish Profile"}
            </motion.button>
            {profilePublished && (
              <div className="mt-2 flex items-center gap-2">
                <input readOnly value={`${window.location.origin}/p/${auth.currentUser?.uid}`}
                  className="flex-1 bg-surface-3 px-3 py-2 rounded-lg text-[9px] font-mono text-zinc-400 border border-border-subtle" />
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/p/${auth.currentUser?.uid}`); toast.success("Link copied!"); }}
                  className="text-[9px] font-mono text-primary hover:text-white px-2 py-2 rounded-lg bg-primary/10 border border-primary/20">Copy</button>
              </div>
            )}
          </div>

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
                onClick={exportPDF} disabled={pdfExporting}
                className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#667eea]/10 border border-[#667eea]/20 text-[#667eea] hover:bg-[#667eea]/15 transition-all disabled:opacity-50">
                <FileDown size={14} /> {pdfExporting ? "Generating..." : "Export PDF Report"}
              </motion.button>

              <label className="w-full py-3 rounded-xl text-sm font-mono font-medium flex items-center justify-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/15 transition-all cursor-pointer">
                <Upload size={14} /> {importing ? 'Importing...' : 'Import JSON'}
                <input type="file" accept=".json" onChange={importData} className="hidden" disabled={importing} />
              </label>
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

          {/* Referral */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">🎁 referral program</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mb-3">Invite friends — you get 100 XP per signup!</p>
            <div className="flex items-center gap-2 mb-3">
              <input readOnly value={`${window.location.origin}?ref=${auth.currentUser?.uid}`}
                className="flex-1 bg-surface-3 px-3 py-2.5 rounded-lg text-[9px] font-mono text-zinc-400 border border-border-subtle" />
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?ref=${auth.currentUser?.uid}`); toast.success('Referral link copied!'); }}
                className="text-[9px] font-mono text-primary hover:text-white px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 transition-all">Copy</button>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-lg font-extrabold font-mono text-[#43e97b]">{referralStats.count}</p>
                <p className="text-[8px] font-mono text-zinc-600">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold font-mono text-[#f59e0b]">{referralStats.xpBonus}</p>
                <p className="text-[8px] font-mono text-zinc-600">XP Earned</p>
              </div>
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">⌨️ keyboard shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-mono">
              {[
                ['Ctrl+K', 'Search'],
                ['1', 'Dashboard'],
                ['2', 'Projects'],
                ['3', 'Tasks'],
                ['4', 'Skills'],
                ['5', 'Daily Log'],
                ['6', 'Goals'],
                ['7', 'Roadmap'],
                ['8', 'Resources'],
                ['9', 'Analytics'],
                ['0', 'Settings'],
                ['P', 'Pomodoro'],
                ['S', 'Snippets'],
                ['G', 'GitHub'],
                ['K', 'Kanban'],
                ['N', 'Notes'],
                ['D', 'DSA Prep'],
                ['H', 'Habits'],
                ['W', 'Review'],
                ['C', 'Certs'],
                ['F', 'Feedback'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-700 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">{key}</span>
                </div>
              ))}
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
      <ConfirmModal open={confirmPublish} onConfirm={() => { setConfirmPublish(false); publishProfile(); }} onCancel={() => setConfirmPublish(false)}
        title="Publish profile?" message="Your stats will be visible to anyone with the link." confirmText="Publish" variant="warning" />
      <ConfirmModal open={confirmSave} onConfirm={() => { setConfirmSave(false); saveProfile(); }} onCancel={() => setConfirmSave(false)}
        title="Save profile?" message="Your profile information will be updated." confirmText="Save" variant="warning" />
    </div>
  );
}
