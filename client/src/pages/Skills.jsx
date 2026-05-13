import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create, remove } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Code2, Sparkles, Download } from 'lucide-react';
import { SkillsSkeleton } from '../components/Skeletons';
import ConfirmModal from '../components/ConfirmModal';
import { SKILL_PACKS } from '../utils/skillsData';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, x: -20, scale: 0.95 }, show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 14 } } };

function SkillRing({ progress, level }) {
  const gradients = {
    beginner: ['#fa709a', '#fee140'],
    intermediate: ['#4facfe', '#00f2fe'],
    advanced: ['#43e97b', '#38f9d7']
  };
  const [c1, c2] = gradients[level] || ['#667eea', '#764ba2'];
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const id = `ring-${level}-${progress}`;

  return (
    <motion.div whileHover={{ scale: 1.15, rotate: 10 }} className="relative w-12 h-12 flex-shrink-0 cursor-default">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(102,126,234,0.08)" strokeWidth="3.5" />
        <motion.circle cx="24" cy="24" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1] }} />
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-200">{progress}</span>
    </motion.div>
  );
}

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-2px)`;
  };
  const handleMouseLeave = () => { ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)'; };
  return <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`transition-transform duration-300 ease-out ${className}`}>{children}</div>;
}

export default function Skills() {
  const [skills, setSkills] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'frontend', level: 'beginner', progress: 0 });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPacks, setShowPacks] = useState(false);
  const [loadingPack, setLoadingPack] = useState(false);

  const fetchSkills = async () => setSkills(await getAll('skills'));
  useEffect(() => { fetchSkills(); }, []);

  if (skills === null) return <SkillsSkeleton />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await create('skills', { ...form, progress: Number(form.progress) });
    toast.success('Skill added! 💪');
    setForm({ name: '', category: 'frontend', level: 'beginner', progress: 0 });
    setShowForm(false);
    fetchSkills();
  };

  const loadSkillPack = async (packKey) => {
    setLoadingPack(true);
    const pack = SKILL_PACKS[packKey];
    const existing = skills.map(s => s.name.toLowerCase());
    let added = 0;
    for (const s of pack.skills) {
      if (!existing.includes(s.name.toLowerCase())) {
        await create('skills', s);
        added++;
      }
    }
    toast.success(`Added ${added} skills from ${pack.label}! 💪`);
    setLoadingPack(false);
    setShowPacks(false);
    fetchSkills();
  };

  const handleDelete = async () => { await remove('skills', confirmDelete); setConfirmDelete(null); toast.success('Deleted'); fetchSkills(); };

  const grouped = skills.reduce((acc, s) => { acc[s.category] = acc[s.category] || []; acc[s.category].push(s); return acc; }, {});

  const levelConfig = {
    beginner: { color: 'text-[#fa709a]', gradient: 'from-[#fa709a] to-[#fee140]', bg: 'bg-[#fa709a]/8', border: 'border-[#fa709a]/15' },
    intermediate: { color: 'text-[#4facfe]', gradient: 'from-[#4facfe] to-[#00f2fe]', bg: 'bg-[#4facfe]/8', border: 'border-[#4facfe]/15' },
    advanced: { color: 'text-[#43e97b]', gradient: 'from-[#43e97b] to-[#38f9d7]', bg: 'bg-[#43e97b]/8', border: 'border-[#43e97b]/15' }
  };

  const categoryConfig = {
    frontend: { icon: '🎨', gradient: 'from-[#f093fb] to-[#f5576c]', label: 'Frontend' },
    backend: { icon: '⚙️', gradient: 'from-[#667eea] to-[#764ba2]', label: 'Backend' },
    database: { icon: '🗄️', gradient: 'from-[#43e97b] to-[#38f9d7]', label: 'Database' },
    tools: { icon: '🛠️', gradient: 'from-[#fa709a] to-[#fee140]', label: 'Tools' },
    other: { icon: '📦', gradient: 'from-[#a18cd1] to-[#fbc2eb]', label: 'Other' }
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#43e97b] to-[#38f9d7] flex items-center justify-center">
              <Code2 size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// skills</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Tech <span className="gradient-text">Stack</span>
          </h2>
          <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
            <span className="code-keyword">const</span> <span className="code-variable">skills</span> = <span className="code-bracket">[</span><span className="code-number">{skills.length}</span><span className="code-bracket">]</span>;
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowPacks(!showPacks)} disabled={loadingPack}
            className="px-4 py-3.5 rounded-2xl flex items-center gap-2 text-[11px] font-mono bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b] hover:bg-[#43e97b]/15 transition-all disabled:opacity-50">
            <Download size={14} /> {loadingPack ? 'Loading...' : 'Skill Packs'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="btn-premium px-6 py-3.5 rounded-2xl flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Skill
          </motion.button>
        </div>
      </motion.div>

      {/* Skill Packs */}
      <AnimatePresence>
        {showPacks && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">choose your stack</span>
              <button onClick={() => setShowPacks(false)} className="text-zinc-600 hover:text-zinc-300 text-xs">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(SKILL_PACKS).map(([key, pack]) => (
                <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => loadSkillPack(key)}
                  className="glass rounded-xl p-4 text-left hover:border-primary/20 transition-all">
                  <span className="text-xl">{pack.icon}</span>
                  <p className="text-[11px] font-semibold text-zinc-200 mt-2">{pack.label}</p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{pack.skills.length} skills</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="code-function">skills.push</span>
                <span className="code-bracket">()</span>
                <span className="cursor-blink"></span>
              </h3>
              <div className="flex flex-wrap gap-3">
                <input placeholder="name: string" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm flex-1 min-w-[180px] placeholder:text-zinc-600 font-mono" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  <option value="frontend">Frontend</option><option value="backend">Backend</option><option value="database">Database</option><option value="tools">Tools</option><option value="other">Other</option>
                </select>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle text-sm">
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
                <input type="number" placeholder="%" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: +e.target.value })}
                  className="bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm w-20 placeholder:text-zinc-600 font-mono" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                  className="btn-premium px-6 py-3.5 rounded-xl text-sm">
                  <Sparkles size={14} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills by Category */}
      {Object.entries(grouped).map(([cat, items], catIdx) => (
        <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + catIdx * 0.1 }} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${categoryConfig[cat]?.gradient} flex items-center justify-center text-base shadow-lg cursor-default`}
              style={{ boxShadow: `0 4px 15px ${cat === 'frontend' ? 'rgba(240,147,251,0.2)' : cat === 'backend' ? 'rgba(102,126,234,0.2)' : 'rgba(67,233,123,0.2)'}` }}>
              {categoryConfig[cat]?.icon}
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 font-heading">{categoryConfig[cat]?.label || cat}</h3>
              <p className="text-[9px] font-mono text-zinc-600">
                <span className="code-comment">// </span>{items.length} {items.length === 1 ? 'skill' : 'skills'}
              </p>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-border-subtle to-transparent ml-3" />
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(s => (
              <motion.div key={s.id} variants={item}>
                <TiltCard>
                  <div className="glass rounded-2xl p-5 flex items-center gap-4 group scan-line relative overflow-hidden">
                    {/* Left gradient accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b ${levelConfig[s.level].gradient}`} />
                    <div className="tilt-shine" />

                    <SkillRing progress={s.progress} level={s.level} />

                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-[13px] text-zinc-100 truncate">{s.name}</span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-mono font-bold ${levelConfig[s.level].color} ${levelConfig[s.level].bg} border ${levelConfig[s.level].border}`}>
                          {s.level}
                        </span>
                      </div>
                      <div className="w-full bg-surface-3 rounded-full h-[6px] overflow-hidden border border-border-subtle">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.progress}%` }}
                          transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
                          className={`h-full rounded-full bg-gradient-to-r ${levelConfig[s.level].gradient} progress-animated`} />
                      </div>
                      <p className="text-[8px] font-mono text-zinc-600 mt-1.5">
                        <span className="code-variable">proficiency</span>: <span className="code-number">{s.progress}%</span>
                      </p>
                    </div>

                    <motion.button whileHover={{ scale: 1.2 }} onClick={() => setConfirmDelete(s.id)}
                      className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-zinc-600 hover:text-rose hover:bg-rose/10 transition-all opacity-0 group-hover:opacity-100 relative z-10">
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ))}

      <ConfirmModal open={!!confirmDelete} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}
        title="Delete skill?" message="This skill will be permanently deleted." confirmText="Delete" />

      {/* Empty state */}
      {skills.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">💻</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>empty tech stack
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            <span className="code-keyword">await</span> <span className="code-function">skills.push</span><span className="code-bracket">(</span><span className="code-string">"React"</span><span className="code-bracket">)</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
