import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, create, update } from '../api';
import toast from 'react-hot-toast';
import { Map, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { ROADMAPS } from '../utils/roadmapData';

export default function Roadmap() {
  const [completed, setCompleted] = useState(null);
  const [docId, setDocId] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [confirmUncheck, setConfirmUncheck] = useState(null);

  useEffect(() => {
    (async () => {
      const docs = await getAll('roadmap', {}, 'createdAt', 1);
      if (docs.length) {
        setDocId(docs[0].id);
        setCompleted(docs[0].completed || []);
        setSelectedPath(docs[0].path || 'full-stack');
      } else {
        setCompleted([]);
      }
    })();
  }, []);

  const selectPath = async (path) => {
    setSelectedPath(path);
    if (docId) {
      await update('roadmap', docId, { path });
    } else {
      const doc = await create('roadmap', { completed: [], path });
      setDocId(doc.id);
    }
    toast.success(`${ROADMAPS[path].label} roadmap loaded!`);
  };

  const toggle = async (topic) => {
    if (completed.includes(topic)) {
      setConfirmUncheck(topic);
      return;
    }
    const next = [...completed, topic];
    setCompleted(next);
    await update('roadmap', docId, { completed: next });
    toast.success('Progress! 🎉', { duration: 1500 });
  };

  const confirmUncheckTopic = async () => {
    const next = completed.filter(t => t !== confirmUncheck);
    setCompleted(next);
    await update('roadmap', docId, { completed: next });
    setConfirmUncheck(null);
  };

  const toggleSection = (section) => setExpanded(p => ({ ...p, [section]: !p[section] }));

  if (completed === null) return <div className="text-center py-20 text-zinc-500 font-mono text-sm">Loading roadmap...</div>;

  // Path not selected yet
  if (!selectedPath) {
    return (
      <div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4facfe] to-[#43e97b] flex items-center justify-center">
              <Map size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// roadmap</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Choose Your <span className="gradient-text">Path</span>
          </h2>
          <p className="text-zinc-500 font-mono text-[11px] mt-1">Select your developer track to get a personalized roadmap</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ROADMAPS).map(([key, rm], i) => (
            <motion.button key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => selectPath(key)}
              className="glass rounded-2xl p-6 text-left hover:translate-y-[-4px] transition-all group">
              <div className="text-3xl mb-3">{rm.icon}</div>
              <h3 className="text-[14px] font-semibold text-zinc-100 group-hover:text-white">{rm.label}</h3>
              <p className="text-[10px] font-mono text-zinc-500 mt-1">{rm.sections.length} sections • {rm.sections.reduce((a, s) => a + s.topics.length, 0)} topics</p>
              <div className="flex gap-1 mt-3">
                {rm.sections.slice(0, 4).map((s, j) => (
                  <div key={j} className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const roadmap = ROADMAPS[selectedPath];
  const totalTopics = roadmap.sections.reduce((a, s) => a + s.topics.length, 0);
  const totalDone = completed.filter(t => roadmap.sections.some(s => s.topics.includes(t))).length;
  const pct = totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4facfe] to-[#43e97b] flex items-center justify-center">
              <Map size={10} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// roadmap</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {roadmap.icon} <span className="gradient-text">{roadmap.label}</span>
          </h2>
          <p className="text-zinc-500 font-mono text-[11px] mt-1">
            <span className="code-number">{totalDone}</span>/<span className="code-number">{totalTopics}</span> topics completed
          </p>
        </div>
        <button onClick={() => setSelectedPath(null)}
          className="px-4 py-2.5 rounded-xl text-[11px] font-mono bg-surface-3 border border-border-subtle text-zinc-400 hover:text-zinc-200 transition-all">
          Change Path
        </button>
      </motion.div>

      {/* Overall progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">overall progress</span>
          <span className="text-sm font-mono font-bold" style={{ color: pct >= 70 ? '#43e97b' : pct >= 40 ? '#4facfe' : '#fa709a' }}>{pct}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden border border-border-subtle">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-[#667eea] via-[#f093fb] to-[#43e97b] progress-animated" />
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {roadmap.sections.map((section, i) => {
          const done = section.topics.filter(t => completed.includes(t)).length;
          const isOpen = expanded[section.section] !== false;
          const sectionPct = Math.round((done / section.topics.length) * 100);

          return (
            <motion.div key={section.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => toggleSection(section.section)}
                className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-all">
                <span className="text-xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{section.section}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ color: section.color, background: `${section.color}15`, border: `1px solid ${section.color}20` }}>
                      {done}/{section.topics.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-3 mt-2 overflow-hidden">
                    <motion.div animate={{ width: `${sectionPct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full" style={{ background: section.color }} />
                  </div>
                </div>
                {isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-1">
                  {section.topics.map(topic => {
                    const isDone = completed.includes(topic);
                    return (
                      <button key={topic} onClick={() => toggle(topic)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isDone ? 'bg-white/[0.02]' : 'hover:bg-white/[0.03]'} active:scale-[0.98]`}>
                        {isDone
                          ? <CheckCircle2 size={16} style={{ color: section.color }} />
                          : <Circle size={16} className="text-zinc-600" />}
                        <span className={`text-[12px] font-mono ${isDone ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <ConfirmModal open={!!confirmUncheck} onConfirm={confirmUncheckTopic} onCancel={() => setConfirmUncheck(null)}
        title="Uncheck topic?" message="Are you sure you want to unmark this topic?" confirmText="Uncheck" variant="warning" />
    </div>
  );
}
