import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, SkipForward, Square, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useTimer } from '@/hooks/useTimer';
import { useCameraMonitor } from '@/hooks/useCameraMonitor';
import { TimerDisplay } from './TimerDisplay';
import { CameraPreview } from './CameraPreview';
import { SessionSetup } from './SessionSetup';
import { SessionComplete } from './SessionComplete';
import type { CompletedSession, SessionConfig } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { showToast } from '@/components/ui/Toast';

const modeLabels: Record<string, string> = {
  deep_focus: 'Deep Focus',
  study_sprint: 'Study Sprint',
  pomodoro: 'Pomodoro',
  strict_exam: 'Strict Exam',
  custom: 'Custom',
};

const modeBackgrounds: Record<string, string> = {
  deep_focus: 'from-violet-950/50 via-[#080810] to-indigo-950/30',
  study_sprint: 'from-blue-950/50 via-[#080810] to-cyan-950/30',
  pomodoro: 'from-emerald-950/50 via-[#080810] to-teal-950/30',
  strict_exam: 'from-red-950/50 via-[#080810] to-orange-950/30',
  custom: 'from-[#0f0f1a] via-[#080810] to-[#0f0f1a]',
};

export function FocusRoom() {
  const { activeSession, startSession, pauseSession, resumeSession, completeSession, abandonSession, addSessionEvent, settings } = useAppStore();
  const [showSetup, setShowSetup] = useState(!activeSession);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const camera = useCameraMonitor();

  const handlePhaseComplete = useCallback(() => {
    showToast('Phase complete! Taking a break.', 'success');
  }, []);

  const timer = useTimer(activeSession?.config ?? null, handlePhaseComplete);

  // Sync timer state with store
  useEffect(() => {
    if (!activeSession) return;
    if (timer.isPaused && !activeSession.isPaused) {
      pauseSession();
    } else if (!timer.isPaused && activeSession.isPaused) {
      resumeSession();
    }
  }, [timer.isPaused]);

  // Camera events → session events
  useEffect(() => {
    camera.onEvent((event) => {
      if (!activeSession) return;

      if (event === 'PRESENCE_LOST' || event === 'FACE_NOT_VISIBLE') {
        addSessionEvent({ type: event, timestamp: Date.now() });
        setWarningMessage('⚠️ Please return to your workspace');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
      } else if (event === 'FOCUS_RECOVERED') {
        addSessionEvent({ type: 'FOCUS_RECOVERED', timestamp: Date.now() });
        setShowWarning(false);
      }
    });
  }, [activeSession, camera, addSessionEvent]);

  const handleStart = (config: SessionConfig) => {
    startSession(config);
    setShowSetup(false);
    timer.start();
    if (settings.cameraEnabled) {
      camera.startMonitoring();
    }
  };

  const handleComplete = () => {
    timer.stop();
    camera.stopMonitoring();

    // Get pre-completion state
    const prevAchs = useAppStore.getState().stats.achievements;
    completeSession();
    const newStats = useAppStore.getState().stats;
    const newAchs = newStats.achievements.filter((id) => !prevAchs.includes(id));
    setNewAchievements(newAchs);

    const session = useAppStore.getState().sessions.slice(-1)[0];
    setCompletedSession(session);
  };

  const handleAbandon = () => {
    timer.stop();
    camera.stopMonitoring();
    abandonSession();
    setShowSetup(true);
    showToast('Session abandoned. Better luck next time!', 'warning');
  };

  const handlePauseResume = () => {
    if (timer.isPaused) {
      timer.resume();
      resumeSession();
    } else {
      timer.pause();
      pauseSession();
    }
  };

  // If session was completed elsewhere
  if (completedSession) {
    return <SessionComplete session={completedSession} newAchievements={newAchievements} />;
  }

  const bgGradient = activeSession ? modeBackgrounds[activeSession.config.mode] : 'from-[#080810]';

  return (
    <div className={cn('min-h-screen bg-gradient-to-br', bgGradient, 'relative flex flex-col')}>
      {/* Warning overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-amber-500/5 border-2 border-amber-500/20 pointer-events-none z-40"
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-amber-900/80 border border-amber-500/50 rounded-xl px-4 py-3 backdrop-blur-sm">
                <AlertTriangle size={18} className="text-amber-400" />
                <span className="text-amber-300 font-medium text-sm">{warningMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Setup Modal */}
      {showSetup && (
        <SessionSetup
          isOpen={showSetup}
          onStart={handleStart}
          onClose={() => setShowSetup(false)}
          defaultSettings={{
            defaultMode: settings.defaultMode,
            defaultWorkMinutes: settings.defaultWorkMinutes,
            defaultBreakMinutes: settings.defaultBreakMinutes,
            ambientSoundDefault: settings.ambientSoundDefault,
          }}
        />
      )}

      {/* No active session - prompt */}
      {!activeSession && !showSetup && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-[#64748b]">No active session.</p>
            <button
              onClick={() => setShowSetup(true)}
              className="btn-primary px-6 py-3"
            >
              Start a Session
            </button>
          </div>
        </div>
      )}

      {/* Active session UI */}
      {activeSession && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="primary" size="md">
              {modeLabels[activeSession.config.mode]}
            </Badge>
            <p className="text-[#64748b] text-sm max-w-xs mx-auto truncate">
              {activeSession.config.intention}
            </p>
          </div>

          {/* Timer */}
          <TimerDisplay
            timeLeft={timer.timeLeft}
            progress={timer.progress}
            phase={timer.phase}
            sessionCount={timer.sessionCount}
            size={300}
          />

          {/* HUD */}
          <div className="flex items-center gap-6 bg-[#0f0f1a]/80 backdrop-blur-sm border border-[#1a1a2e] rounded-2xl px-6 py-4">
            {[
              {
                label: 'Focus Score',
                value: `${Math.max(0, 100 - activeSession.distractionCount * 10)}%`,
                color: activeSession.distractionCount > 5 ? 'text-red-400' : 'text-emerald-400',
              },
              {
                label: 'Distractions',
                value: activeSession.distractionCount.toString(),
                color: activeSession.distractionCount > 0 ? 'text-amber-400' : 'text-emerald-400',
              },
              {
                label: 'XP Preview',
                value: `~${Math.max(10, Math.round((timer.totalDuration - timer.timeLeft) / 30))}`,
                color: 'text-violet-400',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-xl font-bold font-tabular ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[#64748b]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!activeSession.config.strictMode && (
              <button
                onClick={handlePauseResume}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1a1a2e] 
                           border border-[#2a2a3e] hover:border-violet-500/50 transition-colors text-[#e2e8f0]"
              >
                {timer.isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} />}
              </button>
            )}

            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                         bg-gradient-to-r from-violet-600 to-cyan-500 text-white
                         hover:from-violet-500 hover:to-cyan-400 transition-all shadow-lg shadow-violet-900/30"
            >
              Complete Session
            </button>

            <button
              onClick={timer.skip}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1a1a2e]
                         border border-[#2a2a3e] hover:border-cyan-500/50 transition-colors text-[#64748b] hover:text-[#e2e8f0]"
              title="Skip phase"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={handleAbandon}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1a1a2e]
                         border border-[#2a2a3e] hover:border-red-500/50 transition-colors text-[#64748b] hover:text-red-400"
              title="Abandon session"
            >
              <Square size={20} />
            </button>
          </div>

          {/* Camera preview (top right) */}
          {settings.showCameraInSession && (
            <div className="fixed top-4 right-4 w-44">
              <CameraPreview cameraMonitor={camera} compact />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
