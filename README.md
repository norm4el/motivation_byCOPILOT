# FocusForge — AI-Powered Focus & Productivity App

A market-ready productivity/focus web app combining a deep work tracker, camera-based accountability, RPG gamification, behavioral analytics, and a rule-based AI coach.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (dark theme) + Framer Motion |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Flask + SQLite |
| Camera | Browser `getUserMedia` API + canvas heuristics |

## Features

- **7 Pages**: Dashboard, Focus Room, Character/Progress, Missions, Analytics, AI Coach, Settings
- **Focus Modes**: Deep Focus, Study Sprint, Pomodoro, Strict Exam, Custom
- **Camera Accountability**: Presence detection, distraction tracking, configurable strictness
- **Gamification**: XP system, 8 rank tiers, 12 achievements, daily quests, streaks
- **Character Evolution**: SVG character that visually evolves across 7 stages (Novice → Legend)
- **Analytics**: Session history charts, focus score trends, productivity heatmap
- **AI Coach**: Rule-based session insights, behavioral patterns, daily recommendations
- **Privacy-first**: All camera processing is local — never sent to any server

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2. Build the frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run the app

```bash
python app.py
# open http://127.0.0.1:5000
```

### Development (frontend hot-reload)

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## Gamification Formulas

```
XP per session = max(10, round(base × mode_mult × streak_bonus × quality_mult) − penalty)

base_xp         = actualMinutes × 2
mode_multiplier = { deep_focus: 1.5, study_sprint: 1.2, pomodoro: 1.0, strict_exam: 2.0 }
streak_bonus    = 1 + min(streak_days × 0.05, 1.0)
quality_mult    = focusScore / 100
penalty         = distractionCount × 5

Level threshold = Math.floor(100 × 1.5^(level−1))   XP required per level
```

## Future Roadmap

- Real LLM integration for AI coach
- Supabase backend for cloud sync
- Social features: study squads, leaderboards
- MediaPipe Face Mesh for precise gaze/posture
- PWA install + offline mode
- Export stats as CSV/JSON
