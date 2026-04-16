import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { useAppStore, ACHIEVEMENTS } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AchievementCard } from '@/components/character/AchievementCard';

const QUEST_ICONS: Record<string, React.ReactNode> = {
  sessions: <Target size={20} className="text-violet-400" />,
  minutes: <Clock size={20} className="text-cyan-400" />,
  score: <TrendingUp size={20} className="text-emerald-400" />,
  streak: <Trophy size={20} className="text-amber-400" />,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export function MissionsPage() {
  const dailyQuests = useAppStore((s) => s.dailyQuests);
  const stats = useAppStore((s) => s.stats);
  const refreshDailyQuests = useAppStore((s) => s.refreshDailyQuests);

  useEffect(() => {
    refreshDailyQuests();
  }, [refreshDailyQuests]);

  const completedCount = dailyQuests.filter((q) => q.completed).length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-5xl mx-auto space-y-8"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#e2e8f0]">Missions</h1>
        <Badge variant="primary" size="md">{completedCount}/{dailyQuests.length} Daily</Badge>
      </motion.div>

      {/* Daily quests */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-amber-400" />
          <h2 className="text-lg font-bold text-[#e2e8f0]">Daily Quests</h2>
          <span className="text-xs text-[#64748b] ml-1">Resets at midnight</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'bg-emerald-900/10 border-emerald-700/40'
                  : 'bg-[#0f0f1a] border-[#1a1a2e] hover:border-[#2a2a3e]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${quest.completed ? 'bg-emerald-900/30' : 'bg-[#1a1a2e]'}`}>
                    {quest.completed
                      ? <CheckCircle size={20} className="text-emerald-400" />
                      : QUEST_ICONS[quest.type] ?? <Target size={20} className="text-violet-400" />
                    }
                  </div>
                  <div>
                    <p className={`font-semibold ${quest.completed ? 'text-emerald-300' : 'text-[#e2e8f0]'}`}>
                      {quest.title}
                    </p>
                    <p className="text-xs text-[#64748b]">{quest.description}</p>
                  </div>
                </div>
                <Badge variant={quest.completed ? 'success' : 'warning'} size="sm">
                  +{quest.xpReward} XP
                </Badge>
              </div>

              <ProgressBar
                value={Math.min(quest.progress, quest.target)}
                max={quest.target}
                size="md"
                color={quest.completed ? 'green' : 'gradient'}
                animated
              />
              <div className="flex justify-between mt-2 text-xs text-[#64748b]">
                <span>{quest.progress} / {quest.target} {quest.type}</span>
                {quest.completed && <span className="text-emerald-400 font-medium">✓ Complete</span>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            <h2 className="text-lg font-bold text-[#e2e8f0]">Achievements</h2>
          </div>
          <span className="text-sm text-[#64748b]">{stats.achievements.length}/{ACHIEVEMENTS.length}</span>
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
