import React from 'react';
import { cn } from '@/utils/cn';
import type { RankTier } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'rank';
  rank?: RankTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const rankColors: Record<RankTier, string> = {
  Novice: 'bg-slate-700 text-slate-300 border-slate-600',
  Apprentice: 'bg-blue-900/50 text-blue-300 border-blue-700',
  Scholar: 'bg-violet-900/50 text-violet-300 border-violet-700',
  Adept: 'bg-purple-900/50 text-purple-300 border-purple-700',
  Expert: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
  Master: 'bg-amber-900/50 text-amber-300 border-amber-700',
  Grandmaster: 'bg-orange-900/50 text-orange-300 border-orange-700',
  Legend: 'bg-rose-900/50 text-rose-300 border-rose-700',
};

export function Badge({ children, variant = 'default', rank, size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        size === 'lg' && 'text-base px-4 py-1.5',
        variant === 'default' && 'bg-[#1a1a2e] text-[#e2e8f0] border-[#2a2a3e]',
        variant === 'primary' && 'bg-violet-900/50 text-violet-300 border-violet-700',
        variant === 'success' && 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
        variant === 'warning' && 'bg-amber-900/50 text-amber-300 border-amber-700',
        variant === 'danger' && 'bg-red-900/50 text-red-300 border-red-700',
        variant === 'rank' && rank && rankColors[rank],
        className
      )}
    >
      {children}
    </span>
  );
}
