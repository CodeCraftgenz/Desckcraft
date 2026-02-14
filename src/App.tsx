import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from '@/components/ui/Toast';
import { TourProvider } from '@/components/tour';
import { TipsProvider } from '@/components/tips';
import { MainLayout } from '@/components/layout';
import { LoginView } from '@/components/license';
import { HelpView } from '@/components/help';
import { DashboardView } from '@/components/dashboard';
import { RuleListView, RuleBuilder } from '@/components/rules';
import { ProfileListView } from '@/components/profiles';
import { SimulationView } from '@/components/simulation';
import { SchedulingView } from '@/components/scheduling';
import { HistoryView } from '@/components/history';
import { SettingsView } from '@/components/settings';
import {
  useAppStore,
  useSettingsStore,
  useProfileStore,
  useLicenseStore,
} from '@/stores';
import { VIEWS } from '@/lib/constants';

/* ---------- Content Router ---------- */

function ContentRouter() {
  const currentView = useAppStore((s) => s.currentView);

  const renderView = () => {
    switch (currentView) {
      case VIEWS.DASHBOARD:
        return <DashboardView />;
      case VIEWS.RULES:
        return <RuleListView />;
      case VIEWS.RULE_EDITOR: {
        const editingId = sessionStorage.getItem('editing_rule_id');
        return <RuleBuilder ruleId={editingId} />;
      }
      case VIEWS.PROFILES:
        return <ProfileListView />;
      case VIEWS.SIMULATION:
      case VIEWS.EXECUTION:
        return <SimulationView />;
      case VIEWS.SCHEDULING:
        return <SchedulingView />;
      case VIEWS.HISTORY:
      case VIEWS.HISTORY_DETAIL:
        return <HistoryView />;
      case VIEWS.SETTINGS:
        return <SettingsView />;
      case VIEWS.HELP:
      case VIEWS.HELP_ARTICLE:
        return <HelpView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Loading Screen ---------- */

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2
          size={32}
          className="animate-spin text-indigo-500 dark:text-indigo-400 mx-auto mb-4"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verificando licença...
        </p>
      </motion.div>
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const applyTheme = useSettingsStore((s) => s.applyTheme);
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);

  const isLicensed = useLicenseStore((s) => s.isLicensed);
  const isChecking = useLicenseStore((s) => s.isChecking);
  const checkLicense = useLicenseStore((s) => s.checkLicense);

  // Check license on startup
  useEffect(() => {
    checkLicense();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize app data after license is confirmed
  useEffect(() => {
    if (!isLicensed) return;

    async function init() {
      try {
        await fetchSettings();
        applyTheme();
        await fetchProfiles();
      } catch {
        // Initialization errors are captured in individual stores
      }
    }

    init();
  }, [isLicensed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading while checking license
  if (isChecking) {
    return <LoadingScreen />;
  }

  // Show login screen if not licensed
  if (!isLicensed) {
    return <LoginView />;
  }

  // Show main app
  return (
    <ToastProvider>
      <TourProvider>
        <TipsProvider>
          <MainLayout>
            <ContentRouter />
          </MainLayout>
        </TipsProvider>
      </TourProvider>
    </ToastProvider>
  );
}
