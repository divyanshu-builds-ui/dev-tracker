const XP_VALUES = {
  projectCreated: 50,
  projectCompleted: 200,
  projectDeployed: 300,
  skillAdded: 30,
  logEntry: 20,
  goalCompleted: 100,
  goalSet: 10,
};

const LEVELS = [
  { level: 1, title: 'Noob', xpNeeded: 0 },
  { level: 2, title: 'Beginner', xpNeeded: 100 },
  { level: 3, title: 'Learner', xpNeeded: 300 },
  { level: 4, title: 'Coder', xpNeeded: 600 },
  { level: 5, title: 'Developer', xpNeeded: 1000 },
  { level: 6, title: 'Pro Dev', xpNeeded: 1500 },
  { level: 7, title: 'Senior Dev', xpNeeded: 2200 },
  { level: 8, title: 'Tech Lead', xpNeeded: 3000 },
  { level: 9, title: 'Architect', xpNeeded: 4000 },
  { level: 10, title: 'Legend', xpNeeded: 5500 },
];

export function calculateXP(stats) {
  let xp = 0;
  xp += (stats.totalProjects || 0) * XP_VALUES.projectCreated;
  xp += (stats.completed || 0) * XP_VALUES.projectCompleted;
  xp += (stats.deployed || 0) * XP_VALUES.projectDeployed;
  xp += (stats.totalSkills || 0) * XP_VALUES.skillAdded;
  xp += (stats.totalLogs || 0) * XP_VALUES.logEntry;
  xp += (stats.completedGoals || 0) * XP_VALUES.goalCompleted;
  xp += (stats.activeGoals || 0) * XP_VALUES.goalSet;
  return xp;
}

export function getLevel(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpNeeded) current = lvl;
    else break;
  }
  const nextLevel = LEVELS[current.level] || null;
  const xpForNext = nextLevel ? nextLevel.xpNeeded - current.xpNeeded : 0;
  const xpProgress = nextLevel ? xp - current.xpNeeded : xpForNext;
  const percent = xpForNext > 0 ? Math.min(Math.round((xpProgress / xpForNext) * 100), 100) : 100;
  return { ...current, xp, nextLevel, percent, xpProgress, xpForNext };
}

export function getStreak(logs) {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => b.date - a.date);
  let streak = 0;
  let freezeUsed = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const hasLog = sorted.some(l => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === checkDate.getTime();
    });
    if (hasLog) {
      streak++;
    } else if (i === 0) {
      // Today not logged yet — don't break, just skip
      continue;
    } else if (!freezeUsed) {
      // One free miss — streak freeze
      freezeUsed = true;
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const ACHIEVEMENTS = [
  { id: 'first_project', icon: '🚀', title: 'First Launch', desc: 'Create first project', check: s => s.totalProjects >= 1 },
  { id: 'five_projects', icon: '💎', title: 'Builder', desc: '5 projects', check: s => s.totalProjects >= 5 },
  { id: 'first_deploy', icon: '🌐', title: 'Live!', desc: 'First deploy', check: s => s.deployed >= 1 },
  { id: 'three_deploy', icon: '🏆', title: 'Ship It', desc: '3 deployed', check: s => s.deployed >= 3 },
  { id: 'five_skills', icon: '⚡', title: 'Skilled', desc: '5 skills', check: s => s.totalSkills >= 5 },
  { id: 'ten_skills', icon: '🧠', title: 'Big Brain', desc: '10 skills', check: s => s.totalSkills >= 10 },
  { id: 'week_streak', icon: '🔥', title: 'On Fire', desc: '7 day streak', check: s => s.streak >= 7 },
  { id: 'goal_crusher', icon: '🎯', title: 'Crusher', desc: '5 goals done', check: s => s.completedGoals >= 5 },
  { id: 'hundred_hours', icon: '⏰', title: 'Centurion', desc: '100h logged', check: s => s.totalHours >= 100 },
  { id: 'first_log', icon: '📝', title: 'Journalist', desc: 'First log', check: s => s.totalLogs >= 1 },
  { id: 'level_5', icon: '👑', title: 'Developer', desc: 'Reach Lvl 5', check: s => s.level >= 5 },
  { id: 'month_streak', icon: '💪', title: 'Unstoppable', desc: '30 day streak', check: s => s.streak >= 30 },
];
