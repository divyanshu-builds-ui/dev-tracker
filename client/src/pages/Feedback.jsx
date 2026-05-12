import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAll, create } from '../api';
import { useAuth } from '../components/AuthContext';
import toast from 'react-hot-toast';
import { MessageSquare, Bug, Lightbulb, Send, CheckCircle2 } from 'lucide-react';

const TYPES = [
  { id: 'bug', label: 'Bug Report', icon: <Bug size={14} />, color: '#f5576c', emoji: '🐛' },
  { id: 'feature', label: 'Feature Request', icon: <Lightbulb size={14} />, color: '#f59e0b', emoji: '💡' },
  { id: 'feedback', label: 'General Feedback', icon: <MessageSquare size={14} />, color: '#4facfe', emoji: '💬' },
];

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ type: 'feedback', title: '', description: '' });
  const [submissions, setSubmissions] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => setSubmissions(await getAll('feedback', {}, 'createdAt', 50)))();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      // Save to Firestore
      await create('feedback', { ...form, status: 'open' });

      // Send email via serverless function
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userEmail: user?.email, userName: user?.displayName }),
      });

      toast.success('Submitted! Thanks for the feedback 🙏');
      setForm({ type: 'feedback', title: '', description: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setSubmissions(await getAll('feedback', {}, 'createdAt', 50));
    } catch {
      toast.error('Failed to submit');
    }
    setSending(false);
  };

  if (submissions === null) return (
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
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4facfe] to-[#f5576c] flex items-center justify-center">
            <MessageSquare size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// feedback</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Feed<span className="gradient-text">back</span>
        </h2>
        <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
          Report bugs, request features, or share your thoughts
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Send size={13} className="text-primary" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">submit</span>
            </div>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              {TYPES.map(t => (
                <motion.button key={t.id} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-mono transition-all border ${form.type === t.id ? '' : 'bg-surface-3 border-border-subtle text-zinc-500'}`}
                  style={form.type === t.id ? { background: `${t.color}15`, borderColor: `${t.color}40`, color: t.color } : {}}>
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </div>

            {/* Title */}
            <input placeholder="Title / Summary" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono mb-3" />

            {/* Description */}
            <textarea placeholder="Describe in detail..." required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
              className="w-full bg-surface-3 px-4 py-3.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm placeholder:text-zinc-600 font-mono mb-4 leading-relaxed" />

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={sending}
              className="btn-premium w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70">
              <Send size={14} /> {sending ? 'Sending...' : 'Submit'}
            </motion.button>
          </form>

          {/* Success animation */}
          <AnimatePresence>
            {submitted && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 glass rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#43e97b]" />
                <span className="text-[11px] font-mono text-zinc-300">Thanks! Your feedback has been recorded.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Previous submissions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={13} className="text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">your submissions ({submissions.length})</span>
          </div>

          {submissions.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-zinc-600 font-mono text-[11px]">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {submissions.map(s => {
                const typeInfo = TYPES.find(t => t.id === s.type) || TYPES[2];
                return (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: typeInfo.color }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{typeInfo.emoji}</span>
                      <span className="text-[12px] font-semibold text-zinc-200">{s.title}</span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full" style={{ color: typeInfo.color, background: `${typeInfo.color}12`, border: `1px solid ${typeInfo.color}20` }}>
                        {typeInfo.label}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-600">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
