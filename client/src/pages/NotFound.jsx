import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Glitch 404 */}
      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}>
        <h1 className="text-[120px] md:text-[180px] font-extrabold font-mono leading-none gradient-text select-none">
          404
        </h1>
      </motion.div>

      {/* Code block */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="terminal-block p-4 mt-4 text-[11px] text-left max-w-xs w-full">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <p><span className="code-keyword">const</span> <span className="code-variable">page</span> = <span className="code-function">find</span>(<span className="code-string">"{window.location.pathname}"</span>);</p>
        <p className="mt-1"><span className="code-comment">// Error: page not found</span></p>
        <p><span className="code-keyword">throw new</span> <span className="code-variable">Error</span>(<span className="code-string">"404"</span>);</p>
      </motion.div>

      {/* Message */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-zinc-500 font-mono text-[12px] mt-6">
        This route doesn't exist. Maybe a typo?
      </motion.p>

      {/* Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="flex gap-3 mt-6">
        <button onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl text-[11px] font-mono flex items-center gap-2 bg-surface-3 border border-border-subtle text-zinc-400 hover:text-zinc-200 transition-all active:scale-95">
          <ArrowLeft size={13} /> Go Back
        </button>
        <button onClick={() => navigate('/')}
          className="btn-premium px-5 py-2.5 rounded-xl text-[11px] font-mono flex items-center gap-2 active:scale-95">
          <Home size={13} /> Dashboard
        </button>
      </motion.div>
    </div>
  );
}
