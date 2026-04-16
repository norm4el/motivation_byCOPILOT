import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  SessionConfig,
  SessionEvent,
  DailyQuest,
  AppSettings,
  CompletedSession,
  UserStats,
  Achievement,
} from '@/types';
import {
  getLevelFromTotalXP,
  getXPWithinLevel,
  getXPToNextLevel,
  getRankTier,
} from '@/utils/xp';
import { getTodayISODate } from '@/utils/formatting';

// ─── Achievements ──────────────────────────────────────────────────────────
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🌱',
    xpReward: 50,
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: 'hour_power',
    title: 'Hour Power',
    description: 'Accumulate 60 minutes of focused work',
    icon: '⏰',
    xpReward: 75,
    condition: (s) => s.totalMinutes >= 60,
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Complete a Deep Focus session',
    icon: '🌊',
    xpReward: 100,
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day focus streak',
    icon: '🔥',
    xpReward: 100,
    condition: (s) => s.longestStreak >= 3,
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day focus streak',
    icon: '⚔️',
    xpReward: 250,
    condition: (s) => s.longestStreak >= 7,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 focus sessions',
    icon: '💯',
    xpReward: 500,
    condition: (s) => s.totalSessions >= 100,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve a perfect 100 focus score',
    icon: '💎',
    xpReward: 200,
    condition: (s) => s.bestFocusScore >= 100,
  },
  {
    id: 'scholar_rank',
    title: 'Scholar',
    description: 'Reach Scholar rank (Level 10)',
    icon: '📚',
    xpReward: 300,
    condition: (s) => s.currentLevel >= 10,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: '🦉',
    xpReward: 75,
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: '🌅',
    xpReward: 75,
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: 'marathon',
    title: 'Marathon',
    description: 'Complete a single session of 90+ minutes',
    icon: '🏃',
    xpReward: 200,
    condition: (s) => s.totalMinutes >= 90,
  },
  {
    id: 'strict_master',
    title: 'Strict Master',
    description: 'Complete 5 sessions in strict mode',
    icon: '🎯',
    xpReward: 150,
    condition: (s) => s.totalSessions >= 5,
  },
];

// ─── Default state ─────────────────────────────────────────────────────────
const defaultStats: UserStats = {
  totalSessions: 0,
  totalMinutes: 0,
  totalXP: 0,
  currentLevel: 1,
  currentXP: 0,
  xpToNextLevel: 100,
  rankTier: 'Novice',
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: '',
  achievements: [],
  averageFocusScore: 0,
  bestFocusScore: 0,
  totalDistractions: 0,
};

const defaultSettings: AppSettings = {
  strictnessByDefault: 'balanced',
  defaultWorkMinutes: 25,
  defaultBreakMinutes: 5,
  defaultMode: 'pomodoro',
  cameraEnabled: false,
  soundAlerts: true,
  ambientSoundDefault: 'none',
  theme: 'dark',
  showCameraInSession: true,
  autoStartBreaks: false,
  autoStartNextSession: false,
};

const DEFAULT_QUESTS: Omit<DailyQuest, 'progress' | 'completed'>[] = [
  {
    id: 'daily_sessions',
    title: 'Session Duo',
    description: 'Complete 2 focus sessions today',
    xpReward: 50,
    target: 2,
    type: 'sessions',
  },
  {
    id: 'daily_minutes',
    title: 'Hour of Power',
    description: 'Focus for 60 minutes total today',
    xpReward: 80,
    target: 60,
    type: 'minutes',
  },
  {
    id: 'daily_score',
    title: 'Quality Focus',
    description: 'Achieve a focus score above 70',
    xpReward: 60,
    target: 70,
    type: 'score',
  },
  {
    id: 'daily_streak',
    title: 'Streak Keeper',
    description: 'Maintain a 3-day streak',
    xpReward: 100,
    target: 3,
    type: 'streak',
  },
];

// ─── XP Calculation ────────────────────────────────────────────────────────
function calculateXP(
  actualMinutes: number,
  mode: string,
  streak: number,
  focusScore: number,
  distractionCount: number
): number {
  const modeMultipliers: Record<string, number> = {
    deep_focus: 1.5,
    study_sprint: 1.2,
    pomodoro: 1.0,
    strict_exam: 2.0,
    custom: 1.0,
  };

  const base = actualMinutes * 2;
  const multiplier = modeMultipliers[mode] ?? 1.0;
  const streakBonus = 1 + Math.min(streak * 0.05, 1.0);
  const qualityMultiplier = focusScore / 100;
  const penalty = distractionCount * 5;

  return Math.max(10, Math.round(base * multiplier * streakBonus * qualityMultiplier) - penalty);
}

function calculateFocusScore(distractionCount: number): number {
  return Math.max(0, 100 - distractionCount * 10);
}

// ─── Store ──────────────────────────────────────────────────────────────────
interface AppStore extends AppState {
  startSession: (config: SessionConfig) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  addSessionEvent: (event: SessionEvent) => void;
  completeSession: (reflection?: string) => void;
  abandonSession: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  refreshDailyQuests: () => void;
  updateQuestProgress: (type: DailyQuest['type'], amount: number, value?: number) => void;
  checkAchievements: (sessions: CompletedSession[], stats: UserStats) => string[];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      stats: defaultStats,
      sessions: [],
      dailyQuests: DEFAULT_QUESTS.map((q) => ({ ...q, progress: 0, completed: false })),
      lastQuestDate: '',
      settings: defaultSettings,
      activeSession: null,

      startSession: (config) => {
        const { refreshDailyQuests } = get();
        refreshDailyQuests();
        set({
          activeSession: {
            config,
            startTime: Date.now(),
            isPaused: false,
            events: [],
            distractionCount: 0,
          },
        });
      },

      pauseSession: () => {
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: true,
              pausedAt: Date.now(),
            },
          };
        });
      },

      resumeSession: () => {
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: false,
              pausedAt: undefined,
            },
          };
        });
      },

      addSessionEvent: (event) => {
        set((state) => {
          if (!state.activeSession) return state;
          const isDistraction = ['PRESENCE_LOST', 'FACE_NOT_VISIBLE', 'GAZE_AWAY'].includes(event.type);
          return {
            activeSession: {
              ...state.activeSession,
              events: [...state.activeSession.events, event],
              distractionCount: state.activeSession.distractionCount + (isDistraction ? 1 : 0),
            },
          };
        });
      },

      completeSession: (reflection) => {
        const state = get();
        if (!state.activeSession) return;

        const { config, startTime, distractionCount, events } = state.activeSession;
        const endTime = Date.now();
        const actualMinutes = Math.round((endTime - startTime) / 60000);
        const focusScore = calculateFocusScore(distractionCount);
        const today = getTodayISODate();
        const hour = new Date().getHours();

        // Streak logic
        let { currentStreak, longestStreak, lastSessionDate } = state.stats;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (lastSessionDate === today) {
          // Already sessioned today, keep streak
        } else if (lastSessionDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        const xpEarned = calculateXP(actualMinutes, config.mode, currentStreak, focusScore, distractionCount);

        const session: CompletedSession = {
          id: `session_${Date.now()}`,
          mode: config.mode,
          intention: config.intention,
          startTime,
          endTime,
          plannedMinutes: config.workMinutes,
          actualMinutes,
          xpEarned,
          focusScore,
          distractionCount,
          cameraEnabled: state.settings.cameraEnabled,
          strictMode: config.strictMode,
          completed: true,
          events,
          reflection,
        };

        const newTotalXP = state.stats.totalXP + xpEarned;
        const newLevel = getLevelFromTotalXP(newTotalXP);
        const newCurrentXP = getXPWithinLevel(newTotalXP);
        const newXPToNext = getXPToNextLevel(newLevel);
        const newRank = getRankTier(newLevel);
        const newTotalSessions = state.stats.totalSessions + 1;
        const newTotalMinutes = state.stats.totalMinutes + actualMinutes;
        const allSessions = [...state.sessions, session];
        const avgScore = allSessions.reduce((a, b) => a + b.focusScore, 0) / allSessions.length;

        const newStats: UserStats = {
          ...state.stats,
          totalSessions: newTotalSessions,
          totalMinutes: newTotalMinutes,
          totalXP: newTotalXP,
          currentLevel: newLevel,
          currentXP: newCurrentXP,
          xpToNextLevel: newXPToNext,
          rankTier: newRank,
          currentStreak,
          longestStreak,
          lastSessionDate: today,
          averageFocusScore: Math.round(avgScore),
          bestFocusScore: Math.max(state.stats.bestFocusScore, focusScore),
          totalDistractions: state.stats.totalDistractions + distractionCount,
        };

        // Check achievements
        const newAchievements = get().checkAchievements(allSessions, newStats);
        const bonusXP = newAchievements.reduce((acc, id) => {
          const ach = ACHIEVEMENTS.find((a) => a.id === id);
          return acc + (ach?.xpReward ?? 0);
        }, 0);

        // Night Owl / Early Bird
        const specialAchs: string[] = [];
        if (hour >= 22 && !newStats.achievements.includes('night_owl')) specialAchs.push('night_owl');
        if (hour < 8 && !newStats.achievements.includes('early_bird')) specialAchs.push('early_bird');
        if (config.mode === 'deep_focus' && !newStats.achievements.includes('deep_diver')) specialAchs.push('deep_diver');
        if (actualMinutes >= 90 && !newStats.achievements.includes('marathon')) specialAchs.push('marathon');

        const allNewAchs = [...new Set([...newAchievements, ...specialAchs])];
        const totalBonusXP = allNewAchs.reduce((acc, id) => {
          const ach = ACHIEVEMENTS.find((a) => a.id === id);
          return acc + (ach?.xpReward ?? 0);
        }, 0);
        if (totalBonusXP > 0) {
          const finalXP = newTotalXP + totalBonusXP;
          newStats.totalXP = finalXP;
          newStats.currentLevel = getLevelFromTotalXP(finalXP);
          newStats.currentXP = getXPWithinLevel(finalXP);
          newStats.xpToNextLevel = getXPToNextLevel(newStats.currentLevel);
          newStats.rankTier = getRankTier(newStats.currentLevel);
        }

        newStats.achievements = [...new Set([...newStats.achievements, ...allNewAchs])];

        set({
          activeSession: null,
          sessions: allSessions,
          stats: newStats,
        });

        // Update quest progress
        const store = get();
        store.updateQuestProgress('sessions', 1);
        store.updateQuestProgress('minutes', actualMinutes);
        if (focusScore > 70) store.updateQuestProgress('score', focusScore, focusScore);
        store.updateQuestProgress('streak', currentStreak, currentStreak);
      },

      abandonSession: () => {
        set((state) => {
          if (!state.activeSession) return state;
          const { config, startTime, distractionCount, events } = state.activeSession;
          const endTime = Date.now();
          const actualMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));
          const focusScore = calculateFocusScore(distractionCount);

          const session: CompletedSession = {
            id: `session_${Date.now()}`,
            mode: config.mode,
            intention: config.intention,
            startTime,
            endTime,
            plannedMinutes: config.workMinutes,
            actualMinutes,
            xpEarned: Math.max(5, Math.round(actualMinutes)),
            focusScore,
            distractionCount,
            cameraEnabled: state.settings.cameraEnabled,
            strictMode: config.strictMode,
            completed: false,
            events,
          };

          return {
            activeSession: null,
            sessions: [...state.sessions, session],
          };
        });
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      refreshDailyQuests: () => {
        const { lastQuestDate } = get();
        const today = getTodayISODate();
        if (lastQuestDate === today) return;
        set({
          dailyQuests: DEFAULT_QUESTS.map((q) => ({ ...q, progress: 0, completed: false })),
          lastQuestDate: today,
        });
      },

      updateQuestProgress: (type, amount, value) => {
        set((state) => {
          const updatedQuests = state.dailyQuests.map((quest) => {
            if (quest.completed || quest.type !== type) return quest;

            let newProgress = quest.progress;

            if (type === 'score' || type === 'streak') {
              // For score/streak, use the absolute value
              newProgress = Math.max(quest.progress, value ?? amount);
            } else {
              newProgress = quest.progress + amount;
            }

            const completed = newProgress >= quest.target;
            return { ...quest, progress: newProgress, completed };
          });

          return { dailyQuests: updatedQuests };
        });
      },

      checkAchievements: (sessions, stats) => {
        const currentAchievements = stats.achievements;
        const newUnlocked: string[] = [];

        for (const ach of ACHIEVEMENTS) {
          if (!currentAchievements.includes(ach.id) && ach.condition(stats)) {
            newUnlocked.push(ach.id);
          }
        }

        // Strict mode achievement
        const strictSessions = sessions.filter((s) => s.strictMode && s.completed).length;
        if (strictSessions >= 5 && !currentAchievements.includes('strict_master')) {
          newUnlocked.push('strict_master');
        }

        return newUnlocked;
      },
    }),
    {
      name: 'focusforge_v1',
      partialize: (state) => ({
        stats: state.stats,
        sessions: state.sessions,
        dailyQuests: state.dailyQuests,
        lastQuestDate: state.lastQuestDate,
        settings: state.settings,
      }),
    }
  )
);

export { ACHIEVEMENTS };
