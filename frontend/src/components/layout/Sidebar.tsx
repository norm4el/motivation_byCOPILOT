import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Timer,
  Sword,
  ClipboardList,
  BarChart2,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/utils/cn';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', end: true },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/character', icon: Sword, label: 'Character' },
  { to: '/missions', icon: ClipboardList, label: 'Missions' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/coach', icon: Bot, label: 'AI Coach' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const stats = useAppStore((s) => s.stats);
  const xpPct = stats.xpToNextLevel > 0 ? (stats.currentXP / stats.xpToNextLevel) * 100 : 0;

  return (
    <div className="h-full bg-[#0a0a14] border-r border-[#1a1a2e] flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a2e] h-16">
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              FocusForge
            </span>
          </motion.div>
        )}
        {!expanded && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto">
            <Zap size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1a2e] transition-colors',
            !expanded && 'hidden'
          )}
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1a2e]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-violet-400' : 'text-[#64748b] group-hover:text-[#e2e8f0]'
                  )}
                />
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* XP / Level bar */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-[#1a1a2e]"
        >
          <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{stats.currentLevel}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#e2e8f0]">{stats.rankTier}</p>
                  <p className="text-xs text-[#64748b]">Level {stats.currentLevel}</p>
                </div>
              </div>
              <span className="text-xs text-[#64748b]">{stats.currentXP}/{stats.xpToNextLevel} XP</span>
            </div>
            <ProgressBar value={xpPct} size="sm" />
          </div>
        </motion.div>
      )}

      {!expanded && (
        <div className="p-2 border-t border-[#1a1a2e]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-bold">{stats.currentLevel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
