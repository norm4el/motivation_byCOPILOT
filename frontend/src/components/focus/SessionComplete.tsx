import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Trophy, Flame, ArrowRight, RotateCcw } from 'lucide-react';
import type { CompletedSession } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ACHIEVEMENTS } from '@/store/appStore';
import { formatDuration, formatTime } from '@/utils/formatting';
import { getSessionInsight } from '@/utils/coach';
import { useAppStore } from '@/store/appStore';

interface SessionCompleteProps {
  session: CompletedSession;
  newAchievements: string[];
}

export function SessionComplete({ session, newAchievements }: SessionCompleteProps) {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.stats);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Animate XP counter
  useEffect(() => {
    let start = 0;
    const target = session.xpEarned;
    const duration = 1500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayedXP(target);
        clearInterval(timer);
      } else {
        setDisplayedXP(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [session.xpEarned]);

  const scoreColor = session.focusScore >= 80 ? 'text-emerald-400' : session.focusScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const insight = getSessionInsight(session);

  const unlockedAchievements = newAchievements
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-[#080810] flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 mx-auto"
          >
            <Star size={36} className="text-white" fill="white" />
          </motion.div>
          <h1 className="text-3xl font-black text-[#e2e8f0]">Session Complete!</h1>
          <p className="text-[#64748b]">{session.intention}</p>
        </div>

        {/* XP + Score */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center border-violet-500/20 bg-violet-900/10">
            <div className="text-4xl font-black text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text font-tabular">
              +{displayedXP}
            </div>
            <p className="text-[#64748b] text-sm mt-1">XP Earned</p>
          </Card>

          <Card className="p-4 text-center">
            {/* Focus score ring */}
            <div className="relative inline-flex items-center justify-center">
              <svg width="80" height="80" className="-rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#1a1a2e" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke={session.focusScore >= 80 ? '#10b981' : session.focusScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - session.focusScore / 100)}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
              </svg>
              <span className={`absolute text-xl font-black ${scoreColor}`}>{session.focusScore}</span>
            </div>
            <p className="text-[#64748b] text-sm">Focus Score</p>
          </Card>
        </div>

        {/* Stats */}
        <Card className="p-4">
          <div className="grid grid-cols-3 divide-x divide-[#1a1a2e]">
            {[
              { label: 'Duration', value: formatDuration(session.actualMinutes) },
              { label: 'Distractions', value: session.distractionCount.toString() },
              { label: 'Streak', value: `${stats.currentStreak}d 🔥` },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-3">
                <p className="text-lg font-bold text-[#e2e8f0] font-tabular">{stat.value}</p>
                <p className="text-xs text-[#64748b]">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements unlocked */}
        {unlockedAchievements.length > 0 && (
          <Card className="p-4 border-amber-500/20 bg-amber-900/10">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-amber-400" />
              <p className="text-sm font-bold text-amber-400">Achievement Unlocked!</p>
            </div>
            <div className="space-y-2">
              {unlockedAchievements.map((ach) => ach && (
                <div key={ach.id} className="flex items-center gap-3">
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#e2e8f0]">{ach.title}</p>
                    <p className="text-xs text-[#64748b]">{ach.description}</p>
                  </div>
                  <Badge variant="warning" size="sm" className="ml-auto">+{ach.xpReward} XP</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Coach insight */}
        <Card className="p-4 border-violet-500/20">
          <p className="text-xs font-semibold text-violet-400 mb-1">Session Insight</p>
          <p className="text-sm text-[#e2e8f0]">{insight}</p>
        </Card>

        {/* Reflection */}
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-[#e2e8f0]">Session Reflection (optional)</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What went well? What would you improve next time?"
            rows={3}
            className="w-full bg-[#080810] border border-[#1a1a2e] rounded-lg px-3 py-2 text-sm 
                       text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-violet-500 resize-none"
          />
          {reflection && !reflectionSaved && (
            <button
              onClick={() => setReflectionSaved(true)}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              Save reflection
            </button>
          )}
        </Card>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1a1a2e] 
                       text-[#64748b] hover:text-[#e2e8f0] hover:border-[#2a2a3e] transition-colors font-medium"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/focus')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                       bg-gradient-to-r from-violet-600 to-cyan-500 text-white
                       hover:from-violet-500 hover:to-cyan-400 transition-all"
          >
            <RotateCcw size={16} />
            New Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}
