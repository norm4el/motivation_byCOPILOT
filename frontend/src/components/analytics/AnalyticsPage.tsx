import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { formatDuration } from '@/utils/formatting';
import { TrendingUp, Clock, Flame, Star } from 'lucide-react';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const tooltipStyle = {
  backgroundColor: '#0f0f1a',
  border: '1px solid #1a1a2e',
  borderRadius: '8px',
  color: '#e2e8f0',
};

export function AnalyticsPage() {
  const sessions = useAppStore((s) => s.sessions);
  const stats = useAppStore((s) => s.stats);

  // Last 14 days focus hours
  const dailyData = useMemo(() => {
    const days: { date: string; minutes: number; sessions: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const daySessions = sessions.filter((s) => new Date(s.endTime).toISOString().slice(0, 10) === dateStr);
      days.push({
        date: dayLabel,
        minutes: daySessions.reduce((a, b) => a + b.actualMinutes, 0),
        sessions: daySessions.length,
      });
    }
    return days;
  }, [sessions]);

  // Last 20 sessions focus score trend
  const scoreTrend = useMemo(() => {
    return sessions
      .slice(-20)
      .map((s, i) => ({
        n: i + 1,
        score: s.focusScore,
        mode: s.mode,
      }));
  }, [sessions]);

  // Session type breakdown
  const modeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.mode] = (counts[s.mode] || 0) + 1;
    }
    const modeLabels: Record<string, string> = {
      deep_focus: 'Deep Focus',
      study_sprint: 'Study Sprint',
      pomodoro: 'Pomodoro',
      strict_exam: 'Strict Exam',
      custom: 'Custom',
    };
    return Object.entries(counts).map(([mode, count]) => ({
      name: modeLabels[mode] || mode,
      value: count,
    }));
  }, [sessions]);

  // Productivity by hour
  const hourlyData = useMemo(() => {
    const hourScores: Record<number, { total: number; count: number }> = {};
    for (const s of sessions) {
      const hour = new Date(s.startTime).getHours();
      if (!hourScores[hour]) hourScores[hour] = { total: 0, count: 0 };
      hourScores[hour].total += s.focusScore;
      hourScores[hour].count++;
    }
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      avg: hourScores[h] ? Math.round(hourScores[h].total / hourScores[h].count) : 0,
    })).filter((d) => d.avg > 0);
  }, [sessions]);

  // Best productive day
  const dayStats = useMemo(() => {
    const days: Record<string, number> = {};
    for (const s of sessions) {
      const day = new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'long' });
      days[day] = (days[day] || 0) + s.actualMinutes;
    }
    const best = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : 'N/A';
  }, [sessions]);

  const totalHours = Math.round(stats.totalMinutes / 60);
  const avgSessionLength = sessions.length > 0
    ? Math.round(sessions.reduce((a, b) => a + b.actualMinutes, 0) / sessions.length)
    : 0;

  if (sessions.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <TrendingUp size={48} className="text-[#64748b] mx-auto" />
          <h2 className="text-xl font-bold text-[#e2e8f0]">No data yet</h2>
          <p className="text-[#64748b]">Complete focus sessions to see your analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <motion.h1 variants={item} className="text-3xl font-black text-[#e2e8f0]">Analytics</motion.h1>

      {/* Summary cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
          { label: 'Best Streak', value: `${stats.longestStreak}d`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-900/20' },
          { label: 'Best Day', value: dayStats, icon: Star, color: 'text-amber-400', bg: 'bg-amber-900/20' },
          { label: 'Avg Session', value: formatDuration(avgSessionLength), icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-900/20' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#64748b]">{stat.label}</p>
                <p className="text-2xl font-bold text-[#e2e8f0] mt-1 font-tabular">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Focus hours per day */}
      <motion.div variants={item}>
        <Card className="p-5">
          <h2 className="font-bold text-[#e2e8f0] mb-4">Focus Hours — Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} interval={1} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}m`, 'Minutes']}
              />
              <Bar dataKey="minutes" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Focus score trend + Mode breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-bold text-[#e2e8f0] mb-4">Focus Score Trend</h2>
            {scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="n" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Session #', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Focus Score']} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={{ fill: '#7c3aed', r: 3 }}
                    activeDot={{ r: 5, fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[#64748b] text-center py-8">Not enough data</p>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-5">
            <h2 className="font-bold text-[#e2e8f0] mb-4">Session Types</h2>
            {modeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={modeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {modeBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[#64748b] text-center py-8">No data</p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Productivity by hour */}
      {hourlyData.length > 0 && (
        <motion.div variants={item}>
          <Card className="p-5">
            <h2 className="font-bold text-[#e2e8f0] mb-4">Avg Focus Score by Hour</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Avg Score']} />
                <Bar dataKey="avg" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
