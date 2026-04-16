import { motion } from 'framer-motion';
import { Bot, TrendingUp, Calendar, Lightbulb, BarChart2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import {
  getDailyRecommendation,
  getSessionInsight,
  analyzeBestTimeOfDay,
  getWeeklyReport,
} from '@/utils/coach';
import { getRelativeTime, formatDuration } from '@/utils/formatting';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const TIPS = [
  "Break large tasks into 25-minute chunks to maintain momentum.",
  "Remove your phone from sight before starting a session — even face-down reduces focus.",
  "The first 5 minutes are hardest. Once you begin, the resistance fades.",
  "Match session mode to task type: Deep Focus for creative work, Pomodoro for repetitive tasks.",
  "Hydrate before sessions. Mild dehydration reduces cognitive performance by 10-15%.",
  "Review your intention before starting — written goals outperform vague ones by 42%.",
  "Nature sounds and lo-fi music can improve focus for analytical tasks.",
];

export function CoachPage() {
  const sessions = useAppStore((s) => s.sessions);
  const stats = useAppStore((s) => s.stats);

  const recommendation = getDailyRecommendation(sessions, stats);
  const bestTime = analyzeBestTimeOfDay(sessions);
  const weeklyReport = getWeeklyReport(sessions);
  const recentSessions = sessions.slice(-3).reverse();
  const MILLISECONDS_PER_DAY = 86_400_000;
  const randomTip = TIPS[Math.floor((Date.now() / MILLISECONDS_PER_DAY) % TIPS.length)];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="p-2.5 bg-violet-900/30 rounded-xl border border-violet-700/30">
          <Bot size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#e2e8f0]">AI Coach</h1>
          <p className="text-[#64748b] text-sm">Personalized insights from your focus data</p>
        </div>
      </motion.div>

      {/* Daily recommendation */}
      <motion.div variants={item}>
        <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-[#0f0f1a] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-violet-400" />
              <p className="text-sm font-bold text-violet-400 uppercase tracking-wider">Today's Recommendation</p>
            </div>
            <p className="text-[#e2e8f0] leading-relaxed text-lg">{recommendation}</p>
          </div>
        </Card>
      </motion.div>

      {/* Session insights */}
      {recentSessions.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-lg font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Recent Session Insights
          </h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{session.intention || 'Untitled session'}</p>
                    <p className="text-xs text-[#64748b]">{getRelativeTime(session.endTime)} · {formatDuration(session.actualMinutes)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${session.focusScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {session.focusScore}%
                    </p>
                    <p className="text-xs text-[#64748b]">focus</p>
                  </div>
                </div>
                <p className="text-sm text-[#64748b] italic">"{getSessionInsight(session)}"</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Behavioral patterns */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
          <BarChart2 size={18} className="text-emerald-400" />
          Behavioral Patterns
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Peak Performance',
              content: bestTime || (sessions.length < 5 ? 'Complete 5+ sessions to discover your peak time.' : 'No clear pattern yet.'),
              icon: '🎯',
            },
            {
              title: 'Streak Momentum',
              content: stats.currentStreak > 0
                ? `${stats.currentStreak}-day active streak. Your longest is ${stats.longestStreak} days.`
                : `Your best streak was ${stats.longestStreak} days. Build back momentum!`,
              icon: '🔥',
            },
            {
              title: 'Focus Quality',
              content: stats.averageFocusScore > 0
                ? `Average focus score: ${stats.averageFocusScore}%. ${stats.averageFocusScore >= 70 ? 'Excellent concentration.' : 'Room for improvement.'}`
                : 'No sessions yet. Start focusing to track quality.',
              icon: '🧠',
            },
            {
              title: 'Distraction Pattern',
              content: stats.totalSessions > 0
                ? `${(stats.totalDistractions / stats.totalSessions).toFixed(1)} avg distractions/session. ${stats.totalDistractions / stats.totalSessions < 2 ? 'Great focus control!' : 'Try enabling strict mode.'}`
                : 'No data yet.',
              icon: '⚡',
            },
          ].map((pattern) => (
            <Card key={pattern.title} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{pattern.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#e2e8f0] mb-1">{pattern.title}</p>
                  <p className="text-xs text-[#64748b] leading-relaxed">{pattern.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Weekly report */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold text-[#e2e8f0] mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-amber-400" />
          Weekly Report
        </h2>
        <Card className="p-5 space-y-4">
          <p className="text-sm text-[#e2e8f0]">{weeklyReport.summary}</p>

          {weeklyReport.improvements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-2">Areas to Improve</p>
              <ul className="space-y-1">
                {weeklyReport.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-[#64748b] flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span> {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weeklyReport.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-cyan-400 mb-2">Suggestions</p>
              <ul className="space-y-1">
                {weeklyReport.suggestions.map((sug, i) => (
                  <li key={i} className="text-sm text-[#64748b] flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">→</span> {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 bg-violet-900/20 border border-violet-700/30 rounded-xl">
            <p className="text-sm text-violet-300 italic">"{weeklyReport.motivationalMessage}"</p>
          </div>
        </Card>
      </motion.div>

      {/* Daily tip */}
      <motion.div variants={item}>
        <Card className="p-4 border-cyan-500/20 bg-gradient-to-br from-cyan-900/10 to-[#0f0f1a]">
          <div className="flex items-start gap-3">
            <Lightbulb size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-cyan-400 mb-1">Performance Tip</p>
              <p className="text-sm text-[#e2e8f0] leading-relaxed">{randomTip}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
