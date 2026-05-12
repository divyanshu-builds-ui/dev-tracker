import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, onConfirm, onCancel, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', variant = 'danger' }) {
  const colors = {
    danger: { btn: 'bg-[#f5576c] hover:bg-[#f5576c]/80', icon: 'text-[#f5576c]', border: 'border-[#f5576c]/20' },
    warning: { btn: 'bg-[#fa709a] hover:bg-[#fa709a]/80', icon: 'text-[#fa709a]', border: 'border-[#fa709a]/20' },
  };
  const c = colors[variant] || colors.danger;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onClick={onCancel}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className={`relative glass rounded-2xl p-6 w-full max-w-sm border ${c.border}`}>
            <div className="flex items-start gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center ${c.icon} flex-shrink-0`}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
                <p className="text-[11px] text-zinc-500 font-mono mt-1">{message}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-[11px] font-mono bg-surface-3 text-zinc-400 hover:text-zinc-200 border border-border-subtle transition-all">
                Cancel
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-mono text-white ${c.btn} transition-all`}>
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
