import { motion } from 'framer-motion';
import { Settings, Camera, Bell, Palette, Database, Download, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Card } from '@/components/ui/Card';
import { showToast } from '@/components/ui/Toast';
import type { SessionMode } from '@/types';
import { cn } from '@/utils/cn';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const MODES: { value: SessionMode; label: string }[] = [
  { value: 'deep_focus', label: 'Deep Focus' },
  { value: 'study_sprint', label: 'Study Sprint' },
  { value: 'pomodoro', label: 'Pomodoro' },
  { value: 'strict_exam', label: 'Strict Exam' },
  { value: 'custom', label: 'Custom' },
];

const STRICTNESS = [
  { value: 'relaxed', label: 'Relaxed', desc: 'No camera, free pausing' },
  { value: 'balanced', label: 'Balanced', desc: 'Camera optional' },
  { value: 'strict', label: 'Strict', desc: 'Camera on, limited pauses' },
  { value: 'hardcore', label: 'Hardcore', desc: 'No pauses, full tracking' },
] as const;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-violet-600' : 'bg-[#1a1a2e]'
      )}
    >
      <div
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow',
          checked ? 'translate-x-7' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const sessions = useAppStore((s) => s.sessions);
  const stats = useAppStore((s) => s.stats);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const handleExport = () => {
    const data = { stats, sessions, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusforge-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      localStorage.removeItem('focusforge_v1');
      window.location.reload();
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="p-2 bg-[#1a1a2e] rounded-xl">
          <Settings size={22} className="text-[#64748b]" />
        </div>
        <h1 className="text-3xl font-black text-[#e2e8f0]">Settings</h1>
      </motion.div>

      {/* Session defaults */}
      <motion.div variants={item}>
        <Card className="p-5 space-y-5">
          <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
            <Settings size={16} className="text-violet-400" />
            Session Defaults
          </h2>

          <div>
            <label className="text-sm text-[#64748b] mb-2 block">Default Mode</label>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => updateSettings({ defaultMode: m.value })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                    settings.defaultMode === m.value
                      ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                      : 'bg-[#080810] border-[#1a1a2e] text-[#64748b] hover:border-[#2a2a3e]'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-[#64748b]">Default Focus</label>
                <span className="text-sm font-bold text-violet-400">{settings.defaultWorkMinutes}m</span>
              </div>
              <input
                type="range" min={10} max={120} step={5}
                value={settings.defaultWorkMinutes}
                onChange={(e) => updateSettings({ defaultWorkMinutes: parseInt(e.target.value) })}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-[#64748b]">Default Break</label>
                <span className="text-sm font-bold text-cyan-400">{settings.defaultBreakMinutes}m</span>
              </div>
              <input
                type="range" min={5} max={30} step={5}
                value={settings.defaultBreakMinutes}
                onChange={(e) => updateSettings({ defaultBreakMinutes: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {([
              ['autoStartBreaks', 'Auto-start breaks'],
              ['autoStartNextSession', 'Auto-start next session'],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-[#e2e8f0]">{label}</span>
                <Toggle
                  checked={settings[key]}
                  onChange={(v) => updateSettings({ [key]: v })}
                />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Camera & monitoring */}
      <motion.div variants={item}>
        <Card className="p-5 space-y-5">
          <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
            <Camera size={16} className="text-cyan-400" />
            Camera & Monitoring
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e2e8f0]">Enable Camera Monitoring</p>
              <p className="text-xs text-[#64748b]">Detects presence and focus. All processing is local.</p>
            </div>
            <Toggle
              checked={settings.cameraEnabled}
              onChange={(v) => updateSettings({ cameraEnabled: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e2e8f0]">Show Camera in Session</p>
              <p className="text-xs text-[#64748b]">Display small preview during focus sessions</p>
            </div>
            <Toggle
              checked={settings.showCameraInSession}
              onChange={(v) => updateSettings({ showCameraInSession: v })}
            />
          </div>

          <div>
            <label className="text-sm text-[#64748b] mb-2 block">Strictness Level</label>
            <div className="grid grid-cols-2 gap-2">
              {STRICTNESS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateSettings({ strictnessByDefault: s.value })}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-colors',
                    settings.strictnessByDefault === s.value
                      ? 'bg-violet-900/30 border-violet-500 text-violet-300'
                      : 'bg-[#080810] border-[#1a1a2e] text-[#64748b] hover:border-[#2a2a3e]'
                  )}
                >
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
            <Bell size={16} className="text-amber-400" />
            Notifications
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#e2e8f0]">Sound Alerts</p>
              <p className="text-xs text-[#64748b]">Play sounds for phase changes and warnings</p>
            </div>
            <Toggle
              checked={settings.soundAlerts}
              onChange={(v) => updateSettings({ soundAlerts: v })}
            />
          </div>

          <div>
            <label className="text-sm text-[#64748b] mb-2 block">Default Ambient Sound</label>
            <select
              value={settings.ambientSoundDefault}
              onChange={(e) => updateSettings({ ambientSoundDefault: e.target.value })}
              className="w-full bg-[#080810] border border-[#1a1a2e] rounded-lg px-3 py-2 text-[#e2e8f0] 
                         focus:outline-none focus:border-violet-500"
            >
              {['none', 'rain', 'forest', 'cafe', 'lofi'].map((s) => (
                <option key={s} value={s} className="bg-[#0f0f1a]">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item}>
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
            <Palette size={16} className="text-rose-400" />
            Appearance
          </h2>
          <div className="flex gap-3">
            {(['dark', 'darker'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => updateSettings({ theme })}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors',
                  settings.theme === theme
                    ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                    : 'bg-[#080810] border-[#1a1a2e] text-[#64748b]'
                )}
              >
                <div className={cn('w-4 h-4 rounded-full', theme === 'dark' ? 'bg-[#080810] border border-[#2a2a3e]' : 'bg-black border border-[#1a1a2e]')} />
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Data */}
      <motion.div variants={item}>
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-[#e2e8f0] flex items-center gap-2">
            <Database size={16} className="text-[#64748b]" />
            Data
          </h2>
          <p className="text-xs text-[#64748b]">
            {sessions.length} sessions stored · {Math.round(JSON.stringify({ sessions, stats }).length / 1024)}KB used
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] 
                         rounded-xl text-sm text-[#e2e8f0] hover:border-violet-500/50 transition-colors"
            >
              <Download size={14} />
              Export JSON
            </button>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-700/30 
                         rounded-xl text-sm text-red-400 hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={14} />
              Clear All Data
            </button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
