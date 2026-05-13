import confetti from 'canvas-confetti';

const MILESTONES = [10, 25, 50, 75, 100, 150, 200];

export function checkMilestone(count, type = 'default') {
  if (!MILESTONES.includes(count)) return false;

  // Fire confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#f59e0b'],
  });

  // Second burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#667eea', '#43e97b', '#f093fb'],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4facfe', '#764ba2', '#f59e0b'],
    });
  }, 200);

  return true;
}
