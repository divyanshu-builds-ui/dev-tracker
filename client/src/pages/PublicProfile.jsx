import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Code2, Target, Clock, Flame, Brain, FolderKanban, MapPin, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';

export default function PublicProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'publicProfiles', uid));
        if (snap.exists()) setProfile(snap.data());
      } catch {}
      setLoading(false);
    })();
  }, [uid]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-5xl mb-4">👻</div>
      <p className="text-zinc-400 font-mono text-sm">Profile not found or not public</p>
    </div>
  );

  const stats = [
    { icon: <FolderKanban size={16} />, label: 'Projects', value: profile.projects || 0, color: '#f5576c' },
    { icon: <Code2 size={16} />, label: 'Skills', value: profile.skills || 0, color: '#43e97b' },
    { icon: <Clock size={16} />, label: 'Hours', value: profile.hours || 0, color: '#4facfe' },
    { icon: <Target size={16} />, label: 'Goals', value: profile.goals || 0, color: '#f093fb' },
    { icon: <Brain size={16} />, label: 'DSA Solved', value: profile.dsa || 0, color: '#06b6d4' },
    { icon: <Flame size={16} />, label: 'Streak', value: profile.streak || 0, color: '#f59e0b' },
  ];

  const techTags = profile.techStack ? profile.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          {/* Top accent */}
          <motion.div animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, #667eea, #f093fb, #4facfe, #43e97b, #667eea)', backgroundSize: '200% 100%' }} />

          {/* Header */}
          <div className="text-center">
            {/* Avatar */}
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white/[0.06]" />
            ) : (
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DV'}
              </div>
            )}

            {/* Name + Role */}
            <h1 className="text-xl font-extrabold text-zinc-100">{profile.name || 'Developer'}</h1>
            {profile.role && <p className="text-[11px] font-mono text-zinc-500 mt-1">{profile.role}</p>}

            {/* Location + Experience */}
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              {profile.location && (
                <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                  <MapPin size={9} /> {profile.location}
                </span>
              )}
              {profile.experience && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {profile.experience}
                </span>
              )}
              {profile.availableForHire && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#43e97b]/10 border border-[#43e97b]/20 text-[#43e97b]">
                  ✓ Open to work
                </span>
              )}
            </div>

            {/* Level */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-mono text-primary font-bold">Level {profile.level || 1}</span>
              <span className="text-[10px] font-mono text-zinc-500">{profile.xp || 0} XP</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-[11px] font-mono text-zinc-400 text-center mt-4 leading-relaxed">{profile.bio}</p>
          )}

          {/* Tech Stack */}
          {techTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {techTags.map(tag => (
                <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-surface-3 text-zinc-400 border border-border-subtle">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-xl p-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                <p className="text-lg font-extrabold font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] font-mono text-zinc-600">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <p className="text-[9px] font-mono text-zinc-500 text-center mb-2">badges</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {profile.badges.map((b, i) => (
                  <span key={i} className="text-xl" title={b.title}>{b.icon}</span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.github || profile.linkedin || profile.portfolio || profile.twitter) && (
            <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-center gap-3">
              {profile.github && (
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-[#0077b5] hover:border-[#0077b5]/30 transition-all text-[11px] font-bold">
                  in
                </a>
              )}
              {profile.twitter && (
                <a href={`https://x.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.15] transition-all text-[11px] font-bold">
                  𝕏
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/30 transition-all">
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-center gap-2">
            <Logo size={18} />
            <span className="text-[9px] font-mono text-zinc-600">Dev Tracker</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
