import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { BarChart3, TrendingUp, GitBranch, Clock } from 'lucide-react';

const COLORS = ['#667eea', '#4facfe', '#43e97b', '#f093fb', '#fa709a', '#fee140'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 border border-border-subtle text-[10px] font-mono">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#667eea' }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [logs, skills, projects] = await Promise.all([
        getAll('logs', {}, 'createdAt', 60),
        getAll('skills'),
        getAll('projects')
      ]);
      setData({ logs, skills, projects });
    })();
  }, []);

  if (!data) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl p-6 h-72" />)}</div>
    </div>
  );

  // Weekly hours data (last 8 weeks)
  const weeklyHours = (() => {
    const weeks = [];
    for (let w = 7; w >= 0; w--) {
      const start = new Date(); start.setDate(start.getDate() - (w + 1) * 7);
      const end = new Date(); end.setDate(end.getDate() - w * 7);
      const hours = data.logs
        .filter(l => { const d = new Date(l.date || l.createdAt); return d >= start && d < end; })
        .reduce((sum, l) => sum + (l.hoursWorked || 0), 0);
      const label = `W${8 - w}`;
      weeks.push({ week: label, hours: Math.round(hours * 10) / 10 });
    }
    return weeks;
  })();

  // Skills by category
  const skillsRadar = (() => {
    const cats = {};
    data.skills.forEach(s => {
      if (!cats[s.category]) cats[s.category] = { count: 0, totalProgress: 0 };
      cats[s.category].count++;
      cats[s.category].totalProgress += s.progress || 0;
    });
    return Object.entries(cats).map(([cat, v]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      avgProgress: Math.round(v.totalProgress / v.count),
      count: v.count
    }));
  })();

  // Project timeline
  const projectTimeline = data.projects.map(p => ({
    name: p.name,
    progress: p.progress || 0,
    status: p.status,
  }));

  const statusColors = { planning: '#fa709a', 'in-progress': '#4facfe', completed: '#43e97b', deployed: '#667eea' };
  const totalHours = weeklyHours.reduce((s, w) => s + w.hours, 0);
  const avgWeekly = Math.round((totalHours / 8) * 10) / 10;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#667eea] to-[#4facfe] flex items-center justify-center">
            <BarChart3 size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// analytics</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Dev <span className="gradient-text">Analytics</span>
        </h2>
        <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
          <span className="code-variable">avgWeekly</span>: <span className="code-number">{avgWeekly}h</span> |{' '}
          <span className="code-variable">skills</span>: <span className="code-number">{data.skills.length}</span> |{' '}
          <span className="code-variable">projects</span>: <span className="code-number">{data.projects.length}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Weekly Hours Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[#4facfe]" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">weekly hours (last 8 weeks)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">total: <span className="text-[#4facfe] font-bold">{totalHours}h</span></span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHours} barCategoryGap="20%">
                <XAxis dataKey="week" tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(102,126,234,0.05)', radius: 8 }} />
                <Bar dataKey="hours" name="Hours" radius={[6, 6, 0, 0]}>
                  {weeklyHours.map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4facfe" />
                    <stop offset="100%" stopColor="#667eea" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skills Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} className="text-[#43e97b]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">skills growth</span>
          </div>
          {skillsRadar.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsRadar} outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.04)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis tick={{ fill: '#3f3f46', fontSize: 8 }} axisLine={false} domain={[0, 100]} />
                  <Radar name="Avg Progress" dataKey="avgProgress" stroke="#43e97b" fill="#43e97b" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-zinc-600 font-mono text-xs text-center py-16">No skills data yet</p>
          )}
        </motion.div>

        {/* Project Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch size={13} className="text-[#f093fb]" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">project progress</span>
          </div>
          {projectTimeline.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {projectTimeline.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[p.status] || '#667eea', boxShadow: `0 0 6px ${statusColors[p.status] || '#667eea'}40` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-zinc-200 truncate">{p.name}</span>
                      <span className="text-[9px] font-mono font-bold ml-2 flex-shrink-0" style={{ color: statusColors[p.status] }}>{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                        className="h-full rounded-full" style={{ background: statusColors[p.status] }} />
                    </div>
                  </div>
                  <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{ color: statusColors[p.status], background: `${statusColors[p.status]}15`, border: `1px solid ${statusColors[p.status]}20` }}>
                    {p.status}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 font-mono text-xs text-center py-16">No projects yet</p>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border-subtle">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[8px] font-mono text-zinc-500">{status}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
