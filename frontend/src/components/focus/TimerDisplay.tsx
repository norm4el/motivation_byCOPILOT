import { formatTime } from '@/utils/formatting';
import { cn } from '@/utils/cn';

interface TimerDisplayProps {
  timeLeft: number;
  progress: number; // 0-1
  phase: 'work' | 'break';
  sessionCount: number;
  size?: number;
}

export function TimerDisplay({ timeLeft, progress, phase, sessionCount, size = 280 }: TimerDisplayProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="12"
          />
          {/* Outer subtle glow ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 8}
            fill="none"
            stroke="rgba(124, 58, 237, 0.08)"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={phase === 'work' ? '#7c3aed' : '#10b981'} />
              <stop offset="100%" stopColor={phase === 'work' ? '#06b6d4' : '#34d399'} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold text-[#e2e8f0] font-tabular"
            style={{ fontSize: size * 0.17 }}
          >
            {formatTime(timeLeft)}
          </span>
          <span
            className={cn(
              'font-semibold uppercase tracking-widest mt-1',
              phase === 'work' ? 'text-violet-400' : 'text-emerald-400'
            )}
            style={{ fontSize: size * 0.055 }}
          >
            {phase === 'work' ? 'FOCUS' : 'BREAK'}
          </span>
        </div>
      </div>

      {/* Session count dots */}
      {sessionCount > 0 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(sessionCount, 8) }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
            />
          ))}
          {sessionCount > 8 && (
            <span className="text-xs text-[#64748b]">+{sessionCount - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}
