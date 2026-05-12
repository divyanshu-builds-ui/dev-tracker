import { motion } from 'framer-motion';

export default function Logo({ size = 40 }) {
  const s = size;
  const scale = s / 512;

  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
      transition={{ duration: 0.4 }}
      className="relative"
      style={{ width: s, height: s }}
    >
      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-cyan-500/20 rounded-[20%] blur-xl"
      />

      <svg width={s} height={s} viewBox="0 0 512 512" fill="none" className="relative z-10">
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="512" y2="512">
            <stop offset="0%" stopColor="#0f0f1a"/>
            <stop offset="50%" stopColor="#0a0a14"/>
            <stop offset="100%" stopColor="#06060e"/>
          </linearGradient>
          <linearGradient id="logoD" x1="80" y1="120" x2="280" y2="400">
            <stop offset="0%" stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          <linearGradient id="logoG" x1="250" y1="100" x2="450" y2="420">
            <stop offset="0%" stopColor="#22d3ee"/>
            <stop offset="50%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#0891b2"/>
          </linearGradient>
          <linearGradient id="logoBorder" x1="0" y1="0" x2="512" y2="512">
            <stop offset="0%" stopColor="rgba(167,139,250,0.3)"/>
            <stop offset="50%" stopColor="rgba(6,182,212,0.2)"/>
            <stop offset="100%" stopColor="rgba(139,92,246,0.1)"/>
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="logoGlowStrong">
            <feGaussianBlur stdDeviation="12" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="512" height="512" rx="100" fill="url(#logoBg)"/>
        <rect x="2" y="2" width="508" height="508" rx="98" fill="none" stroke="url(#logoBorder)" strokeWidth="2"/>

        {/* Curly brackets */}
        <path d="M90 180C90 180 70 180 70 200L70 240C70 256 55 256 55 256C55 256 70 256 70 272L70 312C70 332 90 332 90 332" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.25"/>
        <path d="M422 180C422 180 442 180 442 200L442 240C442 256 457 256 457 256C457 256 442 256 442 272L442 312C442 332 422 332 422 332" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.25"/>

        {/* D letter */}
        <g filter="url(#logoGlow)">
          <path d="M135 145L135 367" stroke="url(#logoD)" strokeWidth="38" strokeLinecap="round"/>
          <path d="M135 145H195C275 145 315 195 315 256C315 317 275 367 195 367H135" stroke="url(#logoD)" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>

        {/* G letter */}
        <g filter="url(#logoGlow)">
          <path d="M350 175C335 150 305 135 270 135" stroke="url(#logoG)" strokeWidth="34" strokeLinecap="round" fill="none"/>
          <path d="M380 195C395 225 400 260 390 295C375 340 340 370 295 378C260 384 230 374 210 355" stroke="url(#logoG)" strokeWidth="34" strokeLinecap="round" fill="none"/>
          <path d="M350 175C375 175 395 185 395 195" stroke="url(#logoG)" strokeWidth="34" strokeLinecap="round" fill="none"/>
          <path d="M305 270H385L385 330" stroke="url(#logoG)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>

        {/* Cursor */}
        <rect x="420" y="385" width="5" height="45" rx="2.5" fill="#22d3ee" filter="url(#logoGlowStrong)" opacity="0.9"/>

        {/* Semicolon */}
        <circle cx="440" cy="110" r="6" fill="#f472b6" opacity="0.5"/>
        <path d="M440 125L436 145" stroke="#f472b6" strokeWidth="5" strokeLinecap="round" opacity="0.5"/>

        {/* Line numbers */}
        <g opacity="0.12" fontFamily="monospace" fontSize="14" fill="#a78bfa">
          <text x="30" y="155">01</text>
          <text x="30" y="200">02</text>
          <text x="30" y="245">03</text>
          <text x="30" y="290">04</text>
          <text x="30" y="335">05</text>
          <text x="30" y="380">06</text>
        </g>

        {/* Dots */}
        <circle cx="256" cy="420" r="4" fill="#a78bfa" opacity="0.4"/>
        <circle cx="275" cy="420" r="4" fill="#7c3aed" opacity="0.3"/>
        <circle cx="294" cy="420" r="4" fill="#06b6d4" opacity="0.4"/>

        {/* Comment */}
        <text x="80" y="48" fontFamily="monospace" fontSize="11" fill="#64748b" opacity="0.2">{'// divyanshu.gupta'}</text>

        {/* Closing tag */}
        <text x="330" y="480" fontFamily="monospace" fontSize="10" fill="#94a3b8" opacity="0.15">{'</developer>'}</text>
      </svg>
    </motion.div>
  );
}
