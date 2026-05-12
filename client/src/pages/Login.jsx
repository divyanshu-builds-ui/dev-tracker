import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';
import { Shield, Zap, Code2, Terminal, GitBranch, Cpu } from 'lucide-react';

// Typing effect
function TypeWriter({ texts }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length === current.length) setTimeout(() => setDeleting(true), 2000);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setIdx((idx + 1) % texts.length); }
      }
    }, deleting ? 30 : 70);
    return () => clearTimeout(timeout);
  }, [text, deleting, idx]);

  return <>{text}<span className="cursor-blink"></span></>;
}

// Floating code lines
function FloatingCode() {
  const lines = [
    { text: 'const dev = await grow();', x: '5%', y: '15%', delay: 0 },
    { text: 'git commit -m "ship it"', x: '65%', y: '12%', delay: 1.5 },
    { text: 'npm run build ✓', x: '75%', y: '75%', delay: 3 },
    { text: '// level up 🚀', x: '8%', y: '80%', delay: 2 },
    { text: 'export default Success;', x: '60%', y: '88%', delay: 4 },
    { text: 'while(alive) { code(); }', x: '3%', y: '50%', delay: 1 },
  ];

  return (
    <>
      {lines.map((line, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.3, 0.3, 0], y: [20, 0, 0, -20] }}
          transition={{ duration: 8, delay: line.delay, repeat: Infinity, repeatDelay: 4 }}
          className="absolute text-[10px] font-mono text-zinc-700 hidden md:block pointer-events-none"
          style={{ left: line.x, top: line.y }}>
          {line.text}
        </motion.div>
      ))}
    </>
  );
}

// Animated grid
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ opacity: [0.02, 0.05, 0.02] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(102,126,234,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
    </div>
  );
}

export default function Login() {
  const { loginGoogle, loginGithub } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try { await loginGoogle(); toast.success('Welcome! 🚀'); }
    catch { toast.error('Login failed'); }
    setLoading(false);
  };

  const handleGithub = async () => {
    setLoading(true);
    try { await loginGithub(); toast.success('Welcome! 🚀'); }
    catch { toast.error('Login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <GridBackground />
      <FloatingCode />

      {/* Animated orbs */}
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[20%] left-[15%] w-96 h-96 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-gradient-to-br from-[#4facfe]/15 to-[#43e97b]/8 rounded-full blur-[100px]" />
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#f093fb]/10 to-[#f5576c]/5 rounded-full blur-[150px]" />

      {/* Main card */}
      <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 15 }}
        className="relative z-10 w-full max-w-md">

        <div className="glass rounded-[36px] p-10 md:p-12 text-center relative">
          {/* Animated border */}
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[36px]"
            style={{ background: 'linear-gradient(90deg, transparent, #667eea, #f093fb, #4facfe, #43e97b, transparent)', backgroundSize: '200% 100%' }} />
          <motion.div
            animate={{ backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[36px]"
            style={{ background: 'linear-gradient(90deg, transparent, #43e97b, #4facfe, #f093fb, #667eea, transparent)', backgroundSize: '200% 100%' }} />

          {/* Corner accents */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#667eea]/8 to-transparent rounded-full blur-[50px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-[#4facfe]/6 to-transparent rounded-full blur-[50px]" />

          {/* Logo */}
          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.3 }}
            className="flex justify-center mb-8">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Logo size={80} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Dev <span className="gradient-text">Tracker</span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-[12px] font-mono text-zinc-500 mb-10 h-5">
            <span className="code-keyword">{'>'} </span>
            <TypeWriter texts={['track your developer journey', 'build projects, grow skills', 'level up every single day', 'ship code, earn XP']} />
          </motion.div>

          {/* Auth buttons */}
          <div className="space-y-3">
            {/* Google */}
            <motion.button initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.03, y: -3, boxShadow: '0 20px 50px rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogle} disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 bg-white text-[#1a1a2e] transition-all relative overflow-hidden disabled:opacity-70">
              <motion.div animate={{ x: ['-200%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12" />
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </motion.button>

            {/* GitHub */}
            <motion.button initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
              whileHover={{ scale: 1.03, y: -3, boxShadow: '0 20px 50px rgba(102,126,234,0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGithub} disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 bg-[#0d1117] text-white border border-white/[0.08] transition-all relative overflow-hidden disabled:opacity-70 hover:border-white/[0.15]">
              <motion.div animate={{ x: ['-200%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, delay: 1 }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with GitHub'}
            </motion.button>
          </div>

          {/* Features */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-5 mt-9">
            {[
              { icon: <Shield size={12} />, label: 'Secure' },
              { icon: <Zap size={12} />, label: 'Fast' },
              { icon: <Code2 size={12} />, label: 'Dev-first' },
              { icon: <Terminal size={12} />, label: 'Premium' },
            ].map(f => (
              <motion.div key={f.label} whileHover={{ y: -2, scale: 1.1 }}
                className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-600 cursor-default">
                <span className="text-primary/50">{f.icon}</span>
                {f.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="mt-8 pt-6 border-t border-white/[0.04]">
            <div className="flex items-center justify-center gap-4 text-[8px] font-mono text-zinc-700">
              <span className="flex items-center gap-1"><GitBranch size={8} className="text-primary/40" /> v1.0.0</span>
              <span className="flex items-center gap-1"><Cpu size={8} className="text-primary/40" /> Firebase</span>
              <span>your data stays yours</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
