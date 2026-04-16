import { motion } from 'framer-motion';
import { useAppStore, ACHIEVEMENTS } from '@/store/appStore';
import { CharacterSprite } from './CharacterSprite';
import { AchievementCard } from './AchievementCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getRankTier, getRankGradient } from '@/utils/xp';
import { formatDuration } from '@/utils/formatting';

const ALL_RANKS = [
  { tier: 'Novice', levels: '1–4', minLevel: 1 },
  { tier: 'Apprentice', levels: '5–9', minLevel: 5 },
  { tier: 'Scholar', levels: '10–14', minLevel: 10 },
  { tier: 'Adept', levels: '15–19', minLevel: 15 },
  { tier: 'Expert', levels: '20–29', minLevel: 20 },
  { tier: 'Master', levels: '30–49', minLevel: 30 },
  { tier: 'Grandmaster', levels: '50–74', minLevel: 50 },
  { tier: 'Legend', levels: '75+', minLevel: 75 },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function CharacterPage() {
  const stats = useAppStore((s) => s.stats);
  const xpPct = stats.xpToNextLevel > 0 ? (stats.currentXP / stats.xpToNextLevel) * 100 : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-5xl mx-auto space-y-8"
    >
      <motion.h1 variants={item} className="text-3xl font-black text-[#e2e8f0]">Character</motion.h1>

      {/* Character hero */}
      <motion.div variants={item}>
        <Card className="p-8 text-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-cyan-900/5" />
          <div className="relative space-y-6">
            <div className="flex justify-center">
              <CharacterSprite level={stats.currentLevel} size={160} animated />
            </div>

            <div className="space-y-2">
              <Badge variant="rank" rank={stats.rankTier} size="lg">
                {stats.rankTier}
              </Badge>
              <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text">
                Level {stats.currentLevel}
              </h2>
            </div>

            <div className="max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">XP Progress</span>
                <span className="font-bold text-violet-400">{stats.currentXP} / {stats.xpToNextLevel}</span>
              </div>
              <ProgressBar value={xpPct} size="lg" animated />
              <p className="text-xs text-[#64748b]">{stats.xpToNextLevel - stats.currentXP} XP to Level {stats.currentLevel + 1}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {[
                { label: 'Sessions', value: stats.totalSessions },
                { label: 'Hours', value: Math.round(stats.totalMinutes / 60) },
                { label: 'Best Score', value: `${stats.bestFocusScore}%` },
                { label: 'Total XP', value: stats.totalXP.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-[#e2e8f0] font-tabular">{s.value}</p>
                  <p className="text-xs text-[#64748b]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Rank progression */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold text-[#e2e8f0] mb-4">Rank Progression</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_RANKS.map(({ tier, levels, minLevel }) => {
            const isUnlocked = stats.currentLevel >= minLevel;
            const isCurrent = stats.rankTier === tier;
            return (
              <div
                key={tier}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? `bg-gradient-to-br ${getRankGradient(tier)} border-transparent shadow-lg`
                    : isUnlocked
                    ? 'bg-[#0f0f1a] border-[#2a2a3e]'
                    : 'bg-[#0a0a12] border-[#1a1a2e] opacity-40'
                }`}
              >
                <p className={`font-bold text-sm ${isCurrent ? 'text-white' : isUnlocked ? 'text-[#e2e8f0]' : 'text-[#64748b]'}`}>
                  {tier}
                </p>
                <p className={`text-xs mt-0.5 ${isCurrent ? 'text-white/70' : 'text-[#64748b]'}`}>Lv {levels}</p>
                {isCurrent && <p className="text-xs text-white/90 mt-1 font-semibold">◆ Current</p>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#e2e8f0]">Achievements</h2>
          <span className="text-sm text-[#64748b]">{stats.achievements.length}/{ACHIEVEMENTS.length} unlocked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((ach) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              unlocked={stats.achievements.includes(ach.id)}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
