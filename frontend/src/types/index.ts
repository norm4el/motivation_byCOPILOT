export type SessionMode = 'deep_focus' | 'study_sprint' | 'pomodoro' | 'strict_exam' | 'custom';

export type RankTier = 'Novice' | 'Apprentice' | 'Scholar' | 'Adept' | 'Expert' | 'Master' | 'Grandmaster' | 'Legend';

export interface SessionConfig {
  mode: SessionMode;
  workMinutes: number;
  breakMinutes: number;
  intention: string;
  strictMode: boolean;
  ambientSound: string;
}

export interface SessionEvent {
  type: 'PRESENCE_LOST' | 'FACE_NOT_VISIBLE' | 'GAZE_AWAY' | 'POSTURE_BAD' | 'FOCUS_RECOVERED' | 'WARNING' | 'PENALTY';
  timestamp: number;
  details?: string;
}

export interface CompletedSession {
  id: string;
  mode: SessionMode;
  intention: string;
  startTime: number;
  endTime: number;
  plannedMinutes: number;
  actualMinutes: number;
  xpEarned: number;
  focusScore: number;
  distractionCount: number;
  cameraEnabled: boolean;
  strictMode: boolean;
  completed: boolean;
  events: SessionEvent[];
  reflection?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: number;
  condition: (stats: UserStats) => boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  target: number;
  progress: number;
  completed: boolean;
  type: 'sessions' | 'minutes' | 'streak' | 'score';
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  rankTier: RankTier;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  achievements: string[];
  averageFocusScore: number;
  bestFocusScore: number;
  totalDistractions: number;
}

export interface AppSettings {
  strictnessByDefault: 'relaxed' | 'balanced' | 'strict' | 'hardcore';
  defaultWorkMinutes: number;
  defaultBreakMinutes: number;
  defaultMode: SessionMode;
  cameraEnabled: boolean;
  soundAlerts: boolean;
  ambientSoundDefault: string;
  theme: 'dark' | 'darker';
  showCameraInSession: boolean;
  autoStartBreaks: boolean;
  autoStartNextSession: boolean;
}

export interface ActiveSession {
  config: SessionConfig;
  startTime: number;
  isPaused: boolean;
  pausedAt?: number;
  events: SessionEvent[];
  distractionCount: number;
}

export interface AppState {
  stats: UserStats;
  sessions: CompletedSession[];
  dailyQuests: DailyQuest[];
  lastQuestDate: string;
  settings: AppSettings;
  activeSession: ActiveSession | null;
}

export interface CoachReport {
  summary: string;
  improvements: string[];
  suggestions: string[];
  motivationalMessage: string;
}
