import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  BookOpen,
  Timer,
  Shield,
  Sliders,
  Lock,
  Wind,
  Trees,
  Coffee,
  Music,
  Volume2,
  VolumeX,
  ChevronRight,
} from 'lucide-react';
import type { SessionConfig, SessionMode } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

interface SessionSetupProps {
  isOpen: boolean;
  onStart: (config: SessionConfig) => void;
  onClose: () => void;
  defaultSettings: {
    defaultMode: SessionMode;
    defaultWorkMinutes: number;
    defaultBreakMinutes: number;
    ambientSoundDefault: string;
  };
}

const MODES = [
  {
    id: 'deep_focus' as SessionMode,
    label: 'Deep Focus',
    icon: Zap,
    description: '90+ min of uninterrupted flow',
    color: 'from-violet-600 to-violet-800',
    border: 'border-violet-500',
    multiplier: '1.5×',
  },
  {
    id: 'study_sprint' as SessionMode,
    label: 'Study Sprint',
    icon: BookOpen,
    description: 'Timed study bursts with review',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500',
    multiplier: '1.2×',
  },
  {
    id: 'pomodoro' as SessionMode,
    label: 'Pomodoro',
    icon: Timer,
    description: '25/5 classic technique',
    color: 'from-emerald-600 to-emerald-800',
    border: 'border-emerald-500',
    multiplier: '1.0×',
  },
  {
    id: 'strict_exam' as SessionMode,
    label: 'Strict Exam',
    icon: Shield,
    description: 'Maximum intensity, no mercy',
    color: 'from-red-600 to-red-800',
    border: 'border-red-500',
    multiplier: '2.0×',
  },
  {
    id: 'custom' as SessionMode,
    label: 'Custom',
    icon: Sliders,
    description: 'Your own rules',
    color: 'from-slate-600 to-slate-800',
    border: 'border-slate-500',
    multiplier: '1.0×',
  },
];

const SOUNDS = [
  { id: 'none', label: 'None', icon: VolumeX },
  { id: 'rain', label: 'Rain', icon: Wind },
  { id: 'forest', label: 'Forest', icon: Trees },
  { id: 'cafe', label: 'Café', icon: Coffee },
  { id: 'lofi', label: 'Lo-fi', icon: Music },
];

const modeDefaults: Record<SessionMode, { work: number; break: number }> = {
  deep_focus: { work: 90, break: 20 },
  study_sprint: { work: 45, break: 10 },
  pomodoro: { work: 25, break: 5 },
  strict_exam: { work: 120, break: 15 },
  custom: { work: 25, break: 5 },
};

export function SessionSetup({ isOpen, onStart, onClose, defaultSettings }: SessionSetupProps) {
  const [mode, setMode] = useState<SessionMode>(defaultSettings.defaultMode);
  const [workMinutes, setWorkMinutes] = useState(defaultSettings.defaultWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(defaultSettings.defaultBreakMinutes);
  const [intention, setIntention] = useState('');
  const [ambientSound, setAmbientSound] = useState(defaultSettings.ambientSoundDefault);
  const [strictMode, setStrictMode] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleModeSelect = (m: SessionMode) => {
    setMode(m);
    const defaults = modeDefaults[m];
    setWorkMinutes(defaults.work);
    setBreakMinutes(defaults.break);
  };

  const handleLockIn = () => {
    setCountdown(3);
    const tick = (n: number) => {
      if (n <= 0) {
        setCountdown(null);
        onStart({
          mode,
          workMinutes,
          breakMinutes,
          intention: intention.trim() || 'Stay focused',
          strictMode,
          ambientSound,
        });
      } else {
        setTimeout(() => tick(n - 1), 1000);
        setCountdown(n);
      }
    };
    setTimeout(() => tick(2), 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Session Setup">
      <div className="space-y-6">
        {/* Mode selection */}
        <div>
          <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">Choose Mode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  mode === m.id
                    ? `bg-gradient-to-br ${m.color} ${m.border} shadow-lg`
                    : 'bg-[#080810] border-[#1a1a2e] hover:border-[#2a2a3e]'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <m.icon size={16} className={mode === m.id ? 'text-white' : 'text-[#64748b]'} />
                  <span className={cn('text-xs font-bold', mode === m.id ? 'text-white/80' : 'text-[#64748b]')}>
                    {m.multiplier}
                  </span>
                </div>
                <p className={cn('text-sm font-bold', mode === m.id ? 'text-white' : 'text-[#e2e8f0]')}>
                  {m.label}
                </p>
                <p className={cn('text-xs mt-0.5', mode === m.id ? 'text-white/70' : 'text-[#64748b]')}>
                  {m.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                Focus
              </label>
              <span className="text-sm font-bold text-violet-400">{workMinutes}m</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(parseInt(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-[#64748b] mt-1">
              <span>10m</span><span>120m</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                Break
              </label>
              <span className="text-sm font-bold text-cyan-400">{breakMinutes}m</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-[#64748b] mt-1">
              <span>5m</span><span>30m</span>
            </div>
          </div>
        </div>

        {/* Intention */}
        <div>
          <label className="text-sm font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
            What will you focus on?
          </label>
          <input
            type="text"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="e.g. Complete chapter 3, Write project proposal..."
            maxLength={100}
            className="w-full bg-[#080810] border border-[#1a1a2e] rounded-xl px-4 py-3 text-[#e2e8f0] 
                       placeholder-[#64748b] focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Ambient sound + strict mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
              Ambient Sound
            </label>
            <div className="flex gap-2 flex-wrap">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAmbientSound(s.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs',
                    ambientSound === s.id
                      ? 'bg-violet-900/40 border-violet-500 text-violet-300'
                      : 'bg-[#080810] border-[#1a1a2e] text-[#64748b] hover:border-[#2a2a3e]'
                  )}
                >
                  <s.icon size={16} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
              Strict Mode
            </label>
            <button
              onClick={() => setStrictMode((p) => !p)}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-xl border transition-all',
                strictMode
                  ? 'bg-red-900/30 border-red-500/50 text-red-300'
                  : 'bg-[#080810] border-[#1a1a2e] text-[#64748b]'
              )}
            >
              <Lock size={16} />
              <div className="text-left">
                <p className="text-sm font-medium">
                  {strictMode ? 'Strict Mode ON' : 'Enable Strict'}
                </p>
                <p className="text-xs opacity-70">No pausing allowed</p>
              </div>
            </button>
          </div>
        </div>

        {/* Lock In button */}
        <AnimatePresence mode="wait">
          {countdown !== null ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-black text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text"
                >
                  {countdown}
                </motion.div>
                <p className="text-[#64748b] text-sm mt-2">Get ready...</p>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleLockIn}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg
                         bg-gradient-to-r from-violet-600 to-cyan-500 text-white
                         hover:from-violet-500 hover:to-cyan-400 transition-all duration-200
                         shadow-lg shadow-violet-900/40"
            >
              Lock In
              <ChevronRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
