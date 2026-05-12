import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, update } from '../api';
import toast from 'react-hot-toast';
import { Columns3, Circle, Loader, CheckCircle2, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'pending', label: 'Todo', color: '#fa709a', icon: <Circle size={12} /> },
  { id: 'in-progress', label: 'In Progress', color: '#4facfe', icon: <Loader size={12} /> },
  { id: 'done', label: 'Done', color: '#43e97b', icon: <CheckCircle2 size={12} /> },
];

export default function Kanban() {
  const [tasks, setTasks] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    (async () => setTasks(await getAll('tasks', {}, 'createdAt', 100)))();
  }, []);

  const moveTask = async (taskId, newStatus) => {
    await update('tasks', taskId, { status: newStatus });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast.success('Moved!', { duration: 1000 });
  };

  const handleDragStart = (e, taskId) => {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOver(colId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (dragging) moveTask(dragging, colId);
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  // Mobile: tap to move
  const cycleStatus = async (task) => {
    const order = ['pending', 'in-progress', 'done'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    await moveTask(task.id, next);
  };

  if (tasks === null) return (
    <div className="animate-pulse">
      <div className="mb-8"><div className="skeleton w-40 h-10 mb-2" /><div className="skeleton w-28 h-3" /></div>
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl p-4 h-64" />)}</div>
    </div>
  );

  const getColumnTasks = (colId) => tasks.filter(t => t.status === colId);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#4facfe] to-[#f093fb] flex items-center justify-center">
            <Columns3 size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// kanban</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Kanban <span className="gradient-text">Board</span>
        </h2>
        <p className="text-zinc-500 mt-1.5 font-mono text-[11px]">
          drag tasks between columns or tap to cycle status
        </p>
      </motion.div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragLeave={() => setDragOver(null)}
            className={`glass rounded-2xl p-4 min-h-[300px] transition-all ${dragOver === col.id ? 'border-2' : ''}`}
            style={dragOver === col.id ? { borderColor: `${col.color}50`, boxShadow: `0 0 30px ${col.color}15` } : {}}>

            {/* Column header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span style={{ color: col.color }}>{col.icon}</span>
                <span className="text-[12px] font-mono font-semibold text-zinc-200">{col.label}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ color: col.color, background: `${col.color}15`, border: `1px solid ${col.color}20` }}>
                {getColumnTasks(col.id).length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-2.5">
              {getColumnTasks(col.id).map(task => (
                <motion.div key={task.id} layout
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => cycleStatus(task)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all border border-white/[0.04] hover:border-white/[0.1] ${dragging === task.id ? 'opacity-40' : ''}`}
                  style={{ background: 'rgba(10,10,18,0.6)' }}>
                  <div className="flex items-start gap-2.5">
                    <GripVertical size={12} className="text-zinc-700 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-zinc-200 truncate">{task.title}</p>
                      {task.priority && (
                        <span className={`text-[8px] font-mono mt-1.5 inline-block px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-[#fa709a]/10 text-[#fa709a] border border-[#fa709a]/20' :
                          task.priority === 'medium' ? 'bg-[#4facfe]/10 text-[#4facfe] border border-[#4facfe]/20' :
                          'bg-[#43e97b]/10 text-[#43e97b] border border-[#43e97b]/20'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {getColumnTasks(col.id).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[10px] font-mono text-zinc-700">drop tasks here</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-[9px] font-mono text-zinc-600 mt-6">
        <span className="code-comment">// </span>tasks are synced from your Task Manager — drag to move, tap to cycle
      </motion.p>
    </div>
  );
}
