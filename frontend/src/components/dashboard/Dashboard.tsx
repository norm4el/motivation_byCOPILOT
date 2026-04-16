import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Clock,
  Target,
  BarChart2,
  Play,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { getDailyRecommendation } from '@/utils/coach';
import { formatDuration, getRelativeTime, getTimeOfDay } from '@/utils/formatting';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const modeColors: Record<string, string> = {
  deep_focus: 'bg-violet-900/50 text-violet-300 border-violet-700',
  study_sprint: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
  pomodoro: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  strict_exam: 'bg-red-900/50 text-red-300 border-red-700',
  custom: 'bg-slate-700/50 text-slate-300 border-slate-600',
};

const modeLabels: Record<string, string> = {
  deep_focus: 'Deep Focus',
  study_sprint: 'Study Sprint',
  pomodoro: 'Pomodoro',
  strict_exam: 'Strict Exam',
  custom: 'Custom',
};

export function Dashboard() {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.stats);
  const sessions = useAppStore((s) => s.sessions);
  const dailyQuests = useAppStore((s) => s.dailyQuests);

  const greeting = `Good ${getTimeOfDay()}`;
  const recentSessions = sessions.slice(-3).reverse();
  const topQuests = dailyQuests.slice(0, 3);
  const xpPct = stats.xpToNextLevel > 0 ? (stats.currentXP / stats.xpToNextLevel) * 100 : 0;
  const recommendation = getDailyRecommendation(sessions, stats);

  // Today's stats
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => new Date(s.endTime).toISOString().slice(0, 10) === today);
  const todayMinutes = todaySessions.reduce((a, b) => a + b.actualMinutes, 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Hero */}
      <motion.div variants={item}>
        <Card className="relative overflow-hidden p-6" gradient>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-cyan-900/10" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-[#e2e8f0]">{greeting} 👋</h1>
                {stats.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 bg-orange-900/40 border border-orange-700/50 rounded-full px-3 py-1">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-orange-300 text-sm font-bold">{stats.currentStreak} day streak</span>
                  </div>
                )}
              </div>
              <p className="text-[#64748b] max-w-md">
                {stats.totalSessions === 0
                  ? 'Ready to forge your focus? Start your first session.'
                  : `Level ${stats.currentLevel} ${stats.rankTier} · ${stats.totalSessions} sessions completed`}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748b]">Level {stats.currentLevel} → {stats.currentLevel + 1}</span>
                  <span className="text-violet-400 font-medium">{stats.currentXP}/{stats.xpToNextLevel} XP</span>
                </div>
                <ProgressBar value={xpPct} size="md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <CharacterSprite level={stats.currentLevel} size={100} />
              </div>
              <button
                onClick={() => navigate('/focus')}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 
                           text-white font-bold px-6 py-3 rounded-xl hover:from-violet-500 hover:to-cyan-400
                           transition-all duration-200 shadow-lg shadow-violet-900/40 text-lg whitespace-nowrap"
              >
                <Play size={20} fill="currentColor" />
                Start Focus
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Minutes",
            value: formatDuration(todayMinutes),
            icon: Clock,
            color: 'text-cyan-400',
            bg: 'bg-cyan-900/20',
          },
          {
            label: 'Current Streak',
            value: `${stats.currentStreak}d`,
            icon: Flame,
            color: 'text-orange-400',
            bg: 'bg-orange-900/20',
          },
          {
            label: 'Total Sessions',
            value: stats.totalSessions.toString(),
            icon: Target,
            color: 'text-violet-400',
            bg: 'bg-violet-900/20',
          },
          {
            label: 'Avg Focus Score',
            value: `${stats.averageFocusScore}%`,
            icon: BarChart2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-900/20',
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#64748b] font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-[#e2e8f0] mt-1 font-tabular">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quests */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" />
                Daily Quests
              </h2>
              <button
                onClick={() => navigate('/missions')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {topQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-colors ${
                    quest.completed
                      ? 'bg-emerald-900/10 border-emerald-700/30'
                      : 'bg-[#080810] border-[#1a1a2e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {quest.completed && <span className="text-emerald-400">✓</span>}
                      <span className={`text-sm font-medium ${quest.completed ? 'text-emerald-300 line-through' : 'text-[#e2e8f0]'}`}>
                        {quest.title}
                      </span>
                    </div>
                    <Badge variant="warning" size="sm">+{quest.xpReward} XP</Badge>
                  </div>
                  <ProgressBar
                    value={Math.min(quest.progress, quest.target)}
                    max={quest.target}
                    size="sm"
                    color={quest.completed ? 'green' : 'gradient'}
                  />
                  <p className="text-xs text-[#64748b] mt-1">
                    {quest.progress}/{quest.target} {quest.type}
                  </p>
                </div>
              ))}
              {topQuests.length === 0 && (
                <p className="text-[#64748b] text-sm text-center py-4">No quests yet. Start a session!</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Character + Coach */}
        <motion.div variants={item} className="space-y-4">
          {/* Character card */}
          <Card className="p-5 text-center space-y-3">
            <div className="flex justify-center">
              <CharacterSprite level={stats.currentLevel} size={120} />
            </div>
            <div>
              <Badge variant="rank" rank={stats.rankTier} size="md">
                {stats.rankTier}
              </Badge>
              <p className="text-[#64748b] text-xs mt-1">Level {stats.currentLevel}</p>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-[#e2e8f0]">{stats.achievements.length}</p>
                <p className="text-[#64748b] text-xs">Achievements</p>
              </div>
              <div className="h-8 w-px bg-[#1a1a2e]" />
              <div className="text-center">
                <p className="font-bold text-[#e2e8f0]">{stats.totalXP.toLocaleString()}</p>
                <p className="text-[#64748b] text-xs">Total XP</p>
              </div>
            </div>
          </Card>

          {/* Coach tip */}
          <Card className="p-4 border-violet-500/20 bg-gradient-to-br from-violet-900/10 to-[#0f0f1a]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-900/30 rounded-lg flex-shrink-0">
                <TrendingUp size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-violet-400 mb-1">Coach Tip</p>
                <p className="text-xs text-[#e2e8f0] leading-relaxed line-clamp-4">{recommendation}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                Recent Sessions
              </h2>
              <button
                onClick={() => navigate('/analytics')}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                View analytics →
              </button>
            </div>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-3 bg-[#080810] border border-[#1a1a2e] rounded-xl"
                >
                  <div className={`px-2 py-1 rounded-lg border text-xs font-semibold ${modeColors[session.mode]}`}>
                    {modeLabels[session.mode]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e2e8f0] truncate">
                      {session.intention || 'No intention set'}
                    </p>
                    <p className="text-xs text-[#64748b]">{getRelativeTime(session.endTime)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <div>
                      <p className="text-sm font-bold text-[#e2e8f0]">{formatDuration(session.actualMinutes)}</p>
                      <p className="text-xs text-[#64748b]">duration</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-violet-400">+{session.xpEarned}</p>
                      <p className="text-xs text-[#64748b]">XP</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${session.focusScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {session.focusScore}%
                      </p>
                      <p className="text-xs text-[#64748b]">score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
