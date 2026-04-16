import type { RankTier } from '@/types';

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(100 * Math.pow(1.5, i - 1));
  }
  return total;
}

export function getXPToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromTotalXP(totalXP: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = getXPToNextLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
    if (level > 200) break;
  }
  return level;
}

export function getXPWithinLevel(totalXP: number): number {
  const level = getLevelFromTotalXP(totalXP);
  const xpForLevel = getXPForLevel(level);
  return totalXP - xpForLevel;
}

export function getRankTier(level: number): RankTier {
  if (level >= 75) return 'Legend';
  if (level >= 50) return 'Grandmaster';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 15) return 'Adept';
  if (level >= 10) return 'Scholar';
  if (level >= 5) return 'Apprentice';
  return 'Novice';
}

export function getRankColor(rank: RankTier): string {
  const colors: Record<RankTier, string> = {
    Novice: 'text-slate-400',
    Apprentice: 'text-blue-400',
    Scholar: 'text-violet-400',
    Adept: 'text-purple-400',
    Expert: 'text-cyan-400',
    Master: 'text-amber-400',
    Grandmaster: 'text-orange-400',
    Legend: 'text-rose-400',
  };
  return colors[rank];
}

export function getRankGradient(rank: RankTier): string {
  const gradients: Record<RankTier, string> = {
    Novice: 'from-slate-500 to-slate-400',
    Apprentice: 'from-blue-600 to-blue-400',
    Scholar: 'from-violet-600 to-violet-400',
    Adept: 'from-purple-600 to-purple-400',
    Expert: 'from-cyan-600 to-cyan-400',
    Master: 'from-amber-600 to-amber-400',
    Grandmaster: 'from-orange-600 to-orange-400',
    Legend: 'from-rose-600 to-pink-400',
  };
  return gradients[rank];
}
