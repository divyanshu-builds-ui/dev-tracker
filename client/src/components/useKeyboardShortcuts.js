import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHORTCUTS = {
  '1': '/',
  '2': '/projects',
  '3': '/tasks',
  '4': '/skills',
  '5': '/logs',
  '6': '/goals',
  '7': '/roadmap',
  '8': '/resources',
  '9': '/analytics',
  '0': '/settings',
  'p': '/pomodoro',
  's': '/snippets',
  'g': '/github',
  'k': '/kanban',
  'n': '/notes',
  'd': '/dsa',
  'h': '/habits',
  'w': '/review',
  'c': '/certifications',
  'f': '/feedback',
};

export default function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      // Skip if typing in input/textarea/select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      // Skip if modifier keys (except Cmd/Ctrl+K for search which is handled separately)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (SHORTCUTS[key]) {
        e.preventDefault();
        navigate(SHORTCUTS[key]);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}
