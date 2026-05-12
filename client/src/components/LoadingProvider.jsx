import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { onLoadingChange } from '../api';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onLoadingChange(setLoading);
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[99999] h-[3px] overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
