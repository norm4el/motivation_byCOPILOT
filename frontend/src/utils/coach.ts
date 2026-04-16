import type { CompletedSession, UserStats, CoachReport } from '@/types';
import { getHourFromTimestamp } from './formatting';

export function getDailyRecommendation(sessions: CompletedSession[], stats: UserStats): string {
  if (sessions.length === 0) {
    return "Start your first focus session today! Even 25 minutes of deep work can build powerful momentum. What will you conquer first?";
  }

  const recent = sessions.slice(-10);
  const avgScore = recent.reduce((a, b) => a + b.focusScore, 0) / recent.length;
  const avgMinutes = recent.reduce((a, b) => a + b.actualMinutes, 0) / recent.length;

  if (stats.currentStreak === 0) {
    return "Your streak was broken — but every master has failed. Today is the perfect day to start fresh. One session is all it takes to reignite.";
  }

  if (avgScore < 50) {
    return `Your average focus score is ${Math.round(avgScore)}. Try shorter ${Math.round(avgMinutes * 0.7)}-minute sessions to build concentration before attempting longer ones.`;
  }

  if (avgScore < 70) {
    return "You're building focus muscles! Minimize distractions before starting — phone on silent, notifications off, and a clear intention set.";
  }

  const bestHour = analyzeBestTimeOfDay(sessions);
  if (bestHour) {
    return `${bestHour} Keep scheduling sessions during this peak window for maximum output.`;
  }

  if (stats.currentStreak >= 7) {
    return `🔥 ${stats.currentStreak}-day streak! You're in the elite tier. Push for a personal best session today — your momentum is unstoppable.`;
  }

  return `You're performing well with an average focus score of ${Math.round(avgScore)}. Challenge yourself with a longer session or strict mode today.`;
}

export function getSessionInsight(session: CompletedSession): string {
  const { focusScore, distractionCount, actualMinutes, mode, completed } = session;

  if (!completed) {
    return "Session abandoned early. That's okay — even partial focus builds the habit. Try setting a smaller goal next time.";
  }

  if (focusScore >= 90) {
    return `Excellent session! ${actualMinutes} minutes of near-perfect focus. You're firing on all cylinders.`;
  }

  if (focusScore >= 70) {
    return `Solid ${actualMinutes}-minute session. ${distractionCount > 0 ? `${distractionCount} distraction${distractionCount !== 1 ? 's' : ''} noted — aim to halve that next time.` : 'Clean focus with no distractions detected.'}`;
  }

  if (distractionCount > 5) {
    return `High distraction count (${distractionCount}). Consider using strict mode or eliminating environmental distractions before your next session.`;
  }

  if (mode === 'deep_focus' && actualMinutes < 30) {
    return "Deep focus sessions are most effective at 45+ minutes. Build up gradually if the duration feels challenging.";
  }

  return `${Math.round(focusScore)}% focus quality. Consistency matters more than perfection — keep showing up.`;
}

export function analyzeBestTimeOfDay(sessions: CompletedSession[]): string {
  if (sessions.length < 5) return '';

  const hourScores: Record<number, { total: number; count: number }> = {};

  for (const session of sessions) {
    const hour = getHourFromTimestamp(session.startTime);
    if (!hourScores[hour]) hourScores[hour] = { total: 0, count: 0 };
    hourScores[hour].total += session.focusScore;
    hourScores[hour].count++;
  }

  let bestHour = -1;
  let bestAvg = 0;

  for (const [hourStr, data] of Object.entries(hourScores)) {
    if (data.count >= 2) {
      const avg = data.total / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestHour = parseInt(hourStr);
      }
    }
  }

  if (bestHour === -1) return '';

  const timeLabel = bestHour < 12
    ? `${bestHour === 0 ? 12 : bestHour}am`
    : `${bestHour === 12 ? 12 : bestHour - 12}pm`;

  if (bestHour < 12) {
    return `You're a morning person — your best focus happens around ${timeLabel}.`;
  } else if (bestHour < 17) {
    return `Your peak performance window is around ${timeLabel} in the afternoon.`;
  } else {
    return `You thrive in the evening — your focus peaks around ${timeLabel}.`;
  }
}

export function getWeeklyReport(sessions: CompletedSession[]): CoachReport {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = sessions.filter(s => s.startTime > oneWeekAgo);

  if (weekSessions.length === 0) {
    return {
      summary: "No sessions recorded this week.",
      improvements: ["Start with just one 25-minute session per day"],
      suggestions: ["Try the Pomodoro technique to build the habit"],
      motivationalMessage: "Every expert was once a beginner. Start today.",
    };
  }

  const totalMinutes = weekSessions.reduce((a, b) => a + b.actualMinutes, 0);
  const avgScore = weekSessions.reduce((a, b) => a + b.focusScore, 0) / weekSessions.length;
  const completed = weekSessions.filter(s => s.completed).length;
  const completionRate = Math.round((completed / weekSessions.length) * 100);
  const totalXP = weekSessions.reduce((a, b) => a + b.xpEarned, 0);

  const improvements: string[] = [];
  const suggestions: string[] = [];

  if (avgScore < 70) {
    improvements.push("Focus quality needs work — aim for fewer distractions");
  }
  if (completionRate < 70) {
    improvements.push("Session completion rate is low — set more realistic durations");
  }
  if (weekSessions.length < 5) {
    improvements.push("Consistency is key — try for at least one session per day");
  }

  if (avgScore >= 70) {
    suggestions.push("Your focus quality is strong — try incrementally longer sessions");
  }
  if (weekSessions.some(s => s.mode === 'pomodoro')) {
    suggestions.push("Try Deep Focus mode for your most important tasks");
  }
  if (totalMinutes > 300) {
    suggestions.push("Excellent volume this week! Consider a rest day to avoid burnout");
  } else {
    suggestions.push("Increase weekly focus time gradually — add 20 minutes per week");
  }

  const summary = `This week: ${weekSessions.length} sessions, ${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m focused, ${Math.round(avgScore)}% avg score, +${totalXP} XP earned.`;

  const motivationalMessages = [
    "The compound effect of daily focus is extraordinary. Keep building.",
    "Champions aren't born in gyms — they're built in the quiet hours of focused work.",
    `${weekSessions.length} sessions closer to your best self this week.`,
    `${totalXP} XP earned this week. Your future self is grateful.`,
  ];

  return {
    summary,
    improvements: improvements.length > 0 ? improvements : ["Maintain your current momentum"],
    suggestions,
    motivationalMessage: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
  };
}
