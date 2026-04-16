import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { FocusRoom } from '@/components/focus/FocusRoom';
import { CharacterPage } from '@/components/character/CharacterPage';
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';
import { MissionsPage } from '@/components/missions/MissionsPage';
import { CoachPage } from '@/components/coach/CoachPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ToastContainer } from '@/components/ui/Toast';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/focus"
            element={
              <PageWrapper>
                <FocusRoom />
              </PageWrapper>
            }
          />
          <Route
            path="/character"
            element={
              <PageWrapper>
                <CharacterPage />
              </PageWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageWrapper>
                <AnalyticsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/missions"
            element={
              <PageWrapper>
                <MissionsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/coach"
            element={
              <PageWrapper>
                <CoachPage />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <SettingsPage />
              </PageWrapper>
            }
          />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
}
