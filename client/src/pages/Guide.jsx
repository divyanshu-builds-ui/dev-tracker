import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      'Sign in with Google or GitHub',
      'Install as app: Chrome menu → "Install App"',
      'Press Ctrl+K to search any page quickly',
    ]
  },
  {
    title: 'Dashboard',
    items: ['XP system with levels', 'Daily streak counter', 'Activity heatmap', 'Achievements & badges']
  },
  {
    title: 'Projects & Tasks',
    items: ['Add projects with tech stack & progress', 'Create tasks with priorities & deadlines', 'Kanban board for drag-and-drop workflow', 'Bulk select to mark done or delete multiple']
  },
  {
    title: 'Skills & Roadmap',
    items: ['Load skill packs per developer type', 'Choose roadmap: Frontend/Backend/Full-Stack/Mobile/DevOps/ML', 'Check off topics as you learn']
  },
  {
    title: 'Daily Logs & Goals',
    items: ['Log hours, learnings, and mood daily', 'Set weekly/monthly/yearly goals with deadlines', 'Streak freeze: 1 missed day allowed']
  },
  {
    title: 'Pomodoro & Habits',
    items: ['25-min focus timer with break reminders', 'Track daily coding habits', 'Click "⚡ Suggestions" for recommended habits', 'Streak per habit']
  },
  {
    title: 'DSA Interview Prep',
    items: ['Click "Load Blind 75" for 63 questions with LeetCode links', 'Filter by topic, difficulty, status', 'Bulk mode for batch actions', 'Confetti at milestones (10/25/50/100 solved)']
  },
  {
    title: 'Code Snippets & Notes',
    items: ['Save code with language & tags', 'One-click copy button', 'Quick notes with 6 color options', 'Pin important notes']
  },
  {
    title: 'Analytics & Weekly Review',
    items: ['Charts: weekly hours, skills radar, project timeline', 'Auto-generated weekly summary with score', '"Share Card" downloads image for social media', '"Export PDF" for branded reports']
  },
  {
    title: 'Resources & GitHub',
    items: ['Click "Load Starter Pack" for 50 curated links', 'Connect GitHub to see repos & commits', 'Save bookmarks with categories & tags']
  },
  {
    title: 'Settings & Profile',
    items: ['Edit profile: name, bio, social links, tech stack', '6 themes: Dark, Cyberpunk, Dracula, Nord, Emerald, Light', 'Export JSON / PDF / Import JSON', 'Publish public profile & share link', 'Referral: invite friends, earn 100 XP each']
  },
  {
    title: 'Tips & Tricks',
    items: [
      'Keyboard shortcuts: press 1-9, P, S, G, K, N, D, H, W, C, F to navigate',
      'Ctrl+K opens command palette',
      'Streak freeze allows 1 missed day',
      'Bulk mode in Tasks & DSA for batch actions',
      'Date fields open calendar on click (future dates only)',
      'Offline banner shows when internet is gone',
    ]
  },
];

export default function Guide() {
  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#4facfe] flex items-center justify-center">
            <BookOpen size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// guide</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          User <span className="gradient-text">Guide</span>
        </h2>
        <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">Everything you need to know about Dev Tracker</p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5">
            <h3 className="text-[13px] font-semibold text-zinc-100 mb-3">{section.title}</h3>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-[11px] font-mono text-zinc-400">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
