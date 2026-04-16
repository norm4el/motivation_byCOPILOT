import { useState, useEffect, useRef, useCallback } from 'react';
import type { SessionConfig } from '@/types';

export type TimerPhase = 'work' | 'break';

export interface UseTimerResult {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  phase: TimerPhase;
  sessionCount: number;
  totalDuration: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => void;
}

export function useTimer(config: SessionConfig | null, onPhaseComplete?: (phase: TimerPhase) => void): UseTimerResult {
  const workSeconds = (config?.workMinutes ?? 25) * 60;
  const breakSeconds = (config?.breakMinutes ?? 5) * 60;

  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(workSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<TimerPhase>('work');
  const timeLeftRef = useRef(workSeconds);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Reset when config changes
  useEffect(() => {
    if (!config) return;
    setPhase('work');
    setTimeLeft(config.workMinutes * 60);
    setIsRunning(false);
    setIsPaused(false);
    setSessionCount(0);
  }, [config?.mode, config?.workMinutes, config?.breakMinutes]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          const currentPhase = phaseRef.current;
          const nextPhase: TimerPhase = currentPhase === 'work' ? 'break' : 'work';

          if (currentPhase === 'work') {
            setSessionCount((c) => c + 1);
          }

          onPhaseComplete?.(currentPhase);
          setPhase(nextPhase);
          const nextDuration = nextPhase === 'work' ? workSeconds : breakSeconds;
          setTimeLeft(nextDuration);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, workSeconds, breakSeconds, onPhaseComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startInterval();
  }, [startInterval]);

  const pause = useCallback(() => {
    setIsPaused(true);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
    startInterval();
  }, [startInterval]);

  const skip = useCallback(() => {
    clearTimer();
    const currentPhase = phaseRef.current;
    const nextPhase: TimerPhase = currentPhase === 'work' ? 'break' : 'work';

    if (currentPhase === 'work') {
      setSessionCount((c) => c + 1);
    }

    onPhaseComplete?.(currentPhase);
    setPhase(nextPhase);
    const nextDuration = nextPhase === 'work' ? workSeconds : breakSeconds;
    setTimeLeft(nextDuration);

    if (isRunning && !isPaused) {
      startInterval();
    }
  }, [clearTimer, workSeconds, breakSeconds, onPhaseComplete, isRunning, isPaused, startInterval]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setPhase('work');
    setTimeLeft(workSeconds);
    setSessionCount(0);
  }, [clearTimer, workSeconds]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const totalDuration = phase === 'work' ? workSeconds : breakSeconds;
  const progress = totalDuration > 0 ? 1 - timeLeft / totalDuration : 0;

  return {
    timeLeft,
    isRunning,
    isPaused,
    progress,
    phase,
    sessionCount,
    totalDuration,
    start,
    pause,
    resume,
    skip,
    stop,
  };
}
