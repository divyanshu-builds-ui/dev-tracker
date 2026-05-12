import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getAll } from '../api';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        const notifs = await getAll('notifications', {}, 'createdAt', 100);
        setUnread(notifs.filter(n => !n.read).length);
      } catch {}
    };
    check();
    const interval = setInterval(check, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button type="button" onClick={() => navigate('/notifications')}
      className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center cursor-pointer relative hover:bg-white/[0.08] transition-all">
      <Bell size={14} className="text-zinc-400" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f5576c] flex items-center justify-center animate-pulse">
          <span className="text-[8px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
        </span>
      )}
    </button>
  );
}
