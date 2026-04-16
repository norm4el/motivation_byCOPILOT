import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, gradient, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-4',
        gradient && 'bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]',
        glow && 'shadow-lg shadow-violet-900/20',
        onClick && 'cursor-pointer hover:border-violet-500/50 transition-colors duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
