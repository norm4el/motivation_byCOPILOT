import type { Achievement } from '@/types';
import { cn } from '@/utils/cn';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
}

export function AchievementCard({ achievement, unlocked, unlockedAt }: AchievementCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        unlocked
          ? 'bg-gradient-to-br from-amber-900/20 to-[#0f0f1a] border-amber-700/40 hover:border-amber-600/60'
          : 'bg-[#0f0f1a] border-[#1a1a2e] opacity-50'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl',
            unlocked ? 'bg-amber-900/30' : 'bg-[#1a1a2e]'
          )}
        >
          {unlocked ? achievement.icon : <Lock size={20} className="text-[#64748b]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm', unlocked ? 'text-[#e2e8f0]' : 'text-[#64748b]')}>
            {achievement.title}
          </p>
          <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{achievement.description}</p>
          {unlocked && (
            <p className="text-xs text-amber-400 mt-1 font-medium">+{achievement.xpReward} XP</p>
          )}
          {!unlocked && (
            <p className="text-xs text-[#64748b] mt-1">+{achievement.xpReward} XP reward</p>
          )}
        </div>
      </div>
    </div>
  );
}
