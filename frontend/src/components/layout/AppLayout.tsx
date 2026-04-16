import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store/appStore';
import { CameraPreview } from '@/components/focus/CameraPreview';
import { useCameraMonitor } from '@/hooks/useCameraMonitor';
import { Menu } from 'lucide-react';

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeSession = useAppStore((s) => s.activeSession);
  const camera = useCameraMonitor();

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`
          hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidebarExpanded ? 'w-60' : 'w-16'}
        `}
      >
        <Sidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((p) => !p)}
        />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden"
          >
            <Sidebar
              expanded={true}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#1a1a2e] bg-[#0f0f1a]">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-[#64748b] hover:text-[#e2e8f0] rounded-lg"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            FocusForge
          </span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Page content */}
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>

          {/* Right panel (active session only) */}
          <AnimatePresence>
            {activeSession && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="hidden xl:flex flex-col flex-shrink-0 border-l border-[#1a1a2e] bg-[#0a0a14] overflow-hidden"
              >
                <div className="p-4 border-b border-[#1a1a2e]">
                  <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">Live Monitor</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <CameraPreview cameraMonitor={camera} compact />
                  <div className="space-y-2">
                    <p className="text-xs text-[#64748b] font-medium">Session Status</p>
                    <div className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748b]">Mode</span>
                        <span className="text-[#e2e8f0] font-medium capitalize">
                          {activeSession.config.mode.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748b]">Distractions</span>
                        <span className={`font-medium ${activeSession.distractionCount > 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {activeSession.distractionCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
