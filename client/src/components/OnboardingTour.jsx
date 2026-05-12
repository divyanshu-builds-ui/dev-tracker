import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const STEPS = [
  { target: 'nav a[href="/"]', title: 'Dashboard', desc: 'XP, streak, heatmap, achievements', emoji: '📊' },
  { target: 'nav a[href="/projects"]', title: 'Projects', desc: 'Track projects with progress', emoji: '📁' },
  { target: 'nav a[href="/tasks"]', title: 'Tasks', desc: 'Manage tasks and subtasks', emoji: '✅' },
  { target: 'nav a[href="/pomodoro"]', title: 'Pomodoro', desc: 'Focus timer for deep work', emoji: '⏱️' },
  { target: 'nav a[href="/dsa"]', title: 'DSA Prep', desc: 'Interview question tracker', emoji: '🧠' },
  { target: 'nav a[href="/habits"]', title: 'Habits', desc: 'Daily consistency tracker', emoji: '🎯' },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const seen = localStorage.getItem('onboarding-done');
    if (!seen) setTimeout(() => setStep(0), 2000);
  }, []);

  useEffect(() => {
    window.__openOnboarding = () => { localStorage.removeItem('onboarding-done'); setStep(0); };
    return () => { delete window.__openOnboarding; };
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Measure target element (desktop only)
  const measure = useCallback(() => {
    if (step < 0 || step >= STEPS.length || isMobile) { setRect(null); return; }
    const el = document.querySelector(STEPS[step].target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom });
      }, 300);
    } else { setRect(null); }
  }, [step, isMobile]);

  useEffect(() => { measure(); }, [measure]);

  const next = () => { if (step < STEPS.length - 1) setStep(s => s + 1); else finish(); };
  const finish = () => { setStep(-1); localStorage.setItem('onboarding-done', 'true'); };

  if (step < 0) return null;

  // ===== MOBILE: Center card =====
  if (isMobile) {
    return createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={finish} />
        <motion.div key={step} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ position: 'relative', width: '100%', maxWidth: '280px', background: 'rgba(10,10,18,0.97)', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
          <motion.div key={`e-${step}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
            style={{ fontSize: '36px', marginBottom: '12px' }}>{STEPS[step].emoji}</motion.div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7' }}>{STEPS[step].title}</p>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#71717a', marginTop: '6px', lineHeight: 1.5 }}>{STEPS[step].desc}</p>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', margin: '14px 0 0' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === step ? '#667eea' : i < step ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={finish} style={{ fontSize: '10px', fontFamily: 'monospace', color: '#52525b', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
            <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#fff', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>
              {step === STEPS.length - 1 ? 'Done ✓' : 'Next'}{step < STEPS.length - 1 && <ChevronRight size={12} />}
            </button>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  }

  // ===== DESKTOP: Element-targeted tooltip =====
  let tooltipTop = '50%', tooltipLeft = '50%', transform = 'translate(-50%,-50%)';
  if (rect) {
    tooltipTop = `${rect.top + rect.height / 2}px`;
    tooltipLeft = `${rect.right + 14}px`;
    transform = 'translateY(-50%)';
  }

  return createPortal(
    <>
      {/* Overlay with spotlight hole */}
      <svg style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && <rect x={rect.left - 4} y={rect.top - 4} width={rect.width + 8} height={rect.height + 8} rx="12" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
      </svg>

      {/* Highlight */}
      {rect && <div style={{ position: 'fixed', top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8, borderRadius: '12px', border: '2px solid rgba(102,126,234,0.5)', boxShadow: '0 0 20px rgba(102,126,234,0.25)', zIndex: 99998, pointerEvents: 'none' }} />}

      {/* Click blocker */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={finish} />

      {/* Tooltip */}
      <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        style={{ position: 'fixed', top: tooltipTop, left: tooltipLeft, transform, zIndex: 99999, width: '240px' }}>
        <div style={{ background: 'rgba(10,10,18,0.97)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: '14px', padding: '14px', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', position: 'relative' }}>
          {/* Arrow pointing left */}
          {rect && <div style={{ position: 'absolute', left: '-6px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '10px', height: '10px', background: 'rgba(10,10,18,0.97)', borderLeft: '1px solid rgba(102,126,234,0.25)', borderBottom: '1px solid rgba(102,126,234,0.25)' }} />}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#667eea' }}>{STEPS[step].title}</span>
            <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#52525b' }}>{step + 1}/{STEPS.length}</span>
          </div>
          <p style={{ fontSize: '10px', fontFamily: 'monospace', color: '#a1a1aa', lineHeight: 1.5 }}>{STEPS[step].desc}</p>

          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '10px 0 0' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? '12px' : '4px', height: '4px', borderRadius: '2px', background: i === step ? '#667eea' : i < step ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <button onClick={finish} style={{ fontSize: '9px', fontFamily: 'monospace', color: '#52525b', background: 'none', border: 'none', cursor: 'pointer' }}>Skip</button>
            <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontFamily: 'monospace', color: '#fff', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}>
              {step === STEPS.length - 1 ? 'Done ✓' : 'Next'}{step < STEPS.length - 1 && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
