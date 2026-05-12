import { motion } from 'framer-motion';
import { Heart, Code2, GitBranch, Coffee } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
      className="mt-12 lg:mt-16 relative">

      {/* Top gradient divider */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="h-[1px] mb-8"
        style={{ background: 'linear-gradient(90deg, transparent, #667eea40, #764ba240, #f093fb40, #4facfe40, transparent)', backgroundSize: '200% 100%' }}
      />

      {/* Terminal block */}
      <div className="terminal-block p-4 md:p-5 mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="text-[8px] font-mono text-zinc-700 ml-2">~/dev-tracker</span>
        </div>
        <p className="text-[11px] font-mono text-zinc-500">
          <span className="code-keyword">❯</span>{' '}
          <span className="text-zinc-600">divyanshu</span>{' '}
          <span className="text-zinc-700">$</span>{' '}
          <span className="text-zinc-400 cursor-blink">{`while(alive) { code(); learn(); repeat(); }`}</span>
        </p>
      </div>

      {/* Footer content */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        {/* Left - branding */}
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg shadow-[#667eea]/10">
            <Code2 size={14} className="text-white" />
          </motion.div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-300">Dev Tracker</p>
            <p className="text-[9px] text-zinc-600 font-mono">Built by Divyanshu Gupta</p>
          </div>
        </div>

        {/* Center - made with */}
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span>Made with</span>
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Heart size={12} className="text-[#f5576c]" fill="#f5576c" />
          </motion.span>
          <span>&</span>
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Coffee size={12} className="text-[#fa709a]" />
          </motion.span>
        </motion.div>

        {/* Right - tech + year */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-600">
            <GitBranch size={10} className="text-primary/50" />
            <span>React + Firebase</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-700">© {year}</span>
        </div>
      </div>

      {/* Bottom gradient */}
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="h-[1px] mt-8"
        style={{ background: 'linear-gradient(90deg, transparent, #667eea20, #764ba220, transparent)', backgroundSize: '200% 100%' }}
      />
    </motion.footer>
  );
}
