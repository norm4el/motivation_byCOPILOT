import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  color?: 'violet' | 'cyan' | 'green' | 'amber' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  color = 'gradient',
  size = 'md',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const trackColors = {
    violet: 'bg-violet-600',
    cyan: 'bg-cyan-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-violet-600 to-cyan-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-[#1a1a2e] rounded-full overflow-hidden',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2.5',
          size === 'lg' && 'h-4'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            trackColors[color],
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#64748b] mt-1">
          <span>{Math.round(pct)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
}
