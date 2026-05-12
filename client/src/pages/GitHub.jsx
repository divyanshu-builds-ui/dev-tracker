import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAll, create, update } from '../api';
import toast from 'react-hot-toast';
import { FolderGit2, GitCommit, Star, GitFork, ExternalLink, Save, RefreshCw } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

export default function GitHubPage() {
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState(null);
  const [docId, setDocId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const docs = await getAll('github', {}, 'createdAt', 1);
      if (docs.length) {
        setDocId(docs[0].id);
        setSavedUsername(docs[0].username);
        setUsername(docs[0].username);
        fetchGitHub(docs[0].username);
      }
    })();
  }, []);

  const fetchGitHub = async (user) => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=10`),
        fetch(`https://api.github.com/users/${user}/events?per_page=20`)
      ]);
      if (!profileRes.ok) throw new Error('User not found');
      setProfile(await profileRes.json());
      setRepos(await reposRes.json());
      const allEvents = await eventsRes.json();
      setEvents(allEvents.filter(e => e.type === 'PushEvent').slice(0, 10));
    } catch { toast.error('GitHub user not found'); }
    setLoading(false);
  };

  const saveUsername = async () => {
    if (!username.trim()) return;
    if (docId) await update('github', docId, { username });
    else { const doc = await create('github', { username }); setDocId(doc.id); }
    setSavedUsername(username);
    fetchGitHub(username);
    toast.success('GitHub connected! 🐙');
  };

  const langColors = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab', HTML: '#e34f26',
    CSS: '#1572b6', Java: '#b07219', Go: '#00add8', Rust: '#dea584', Ruby: '#cc342d',
    'C++': '#f34b7d', C: '#555555', Shell: '#43e97b', Dart: '#00b4ab'
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-md bg-gradient-to-br from-[#333] to-[#6e5494] flex items-center justify-center">
            <FolderGit2 size={10} className="text-white" />
          </motion.div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em]">// github</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
          GitHub <span className="gradient-text">Activity</span>
        </h2>
      </motion.div>

      {/* Username input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-8">
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">github.com/</span>
            <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUsername()}
              className="flex-1 bg-surface-3 px-4 py-2.5 rounded-xl outline-none border border-border-subtle focus:border-primary/40 text-sm font-mono" />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={saveUsername}
            className="btn-premium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Save size={14} /> Connect
          </motion.button>
          {savedUsername && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fetchGitHub(savedUsername)}
              className="w-10 h-10 rounded-xl bg-surface-3 border border-border-subtle flex items-center justify-center text-zinc-500 hover:text-primary transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {loading && (
        <div className="text-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent mx-auto" />
        </div>
      )}

      {profile && !loading && (
        <div className="space-y-6">
          {/* Profile card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 flex items-center gap-5">
            <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-100">{profile.name || profile.login}</h3>
                <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-primary transition-colors">
                  <ExternalLink size={13} />
                </a>
              </div>
              {profile.bio && <p className="text-[11px] text-zinc-500 font-mono mt-1">{profile.bio}</p>}
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Repos', value: profile.public_repos },
                { label: 'Followers', value: profile.followers },
                { label: 'Following', value: profile.following },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-extrabold font-mono text-primary">{s.value}</p>
                  <p className="text-[8px] font-mono text-zinc-600">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Repos + Commits grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Repos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <GitFork size={13} className="text-[#4facfe]" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">top repos</span>
              </div>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
                {repos.map(repo => (
                  <motion.a key={repo.id} variants={item} href={repo.html_url} target="_blank" rel="noopener noreferrer"
                    className="glass rounded-xl p-4 block hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-zinc-200 group-hover:text-primary transition-colors truncate">{repo.name}</span>
                      <div className="flex items-center gap-2">
                        {repo.stargazers_count > 0 && (
                          <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                            <Star size={9} className="text-[#f59e0b]" />{repo.stargazers_count}
                          </span>
                        )}
                      </div>
                    </div>
                    {repo.description && <p className="text-[10px] text-zinc-500 font-mono truncate">{repo.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {repo.language && (
                        <span className="text-[9px] font-mono flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: langColors[repo.language] || '#667eea' }} />
                          <span className="text-zinc-500">{repo.language}</span>
                        </span>
                      )}
                      {repo.forks_count > 0 && (
                        <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-1">
                          <GitFork size={8} />{repo.forks_count}
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Recent Commits */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-4">
                <GitCommit size={13} className="text-[#43e97b]" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">recent commits</span>
              </div>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                {events.map((event, i) => (
                  <motion.div key={i} variants={item} className="glass rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#43e97b] mt-1.5 flex-shrink-0 shadow-[0_0_6px_#43e97b40]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-zinc-300 truncate">
                        {event.payload?.commits?.[0]?.message || 'Push event'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-zinc-600 truncate">{event.repo?.name?.split('/')[1]}</span>
                        <span className="text-[8px] font-mono text-zinc-700">
                          {new Date(event.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {events.length === 0 && (
                  <p className="text-[11px] font-mono text-zinc-600 text-center py-8">No recent push events</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!profile && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="text-6xl mb-4 inline-block">🐙</motion.div>
          <p className="text-zinc-500 font-mono text-sm">
            <span className="code-comment">// </span>connect your GitHub
          </p>
          <p className="text-zinc-600 text-xs mt-2 font-mono">
            enter your username above to see activity
          </p>
        </motion.div>
      )}
    </div>
  );
}
