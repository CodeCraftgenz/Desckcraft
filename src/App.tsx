import { useEffect, Component, type ReactNode, type ErrorInfo } from 'react';
import { motion } from 'framer-motion';
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

  return <div key={currentView}>{renderView()}</div>;
}

/* ---------- Error Boundary ---------- */

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string | number;
  inline?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DeskCraft] Render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const containerClass = this.props.inline
        ? 'p-6'
        : 'min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950';
      return (
        <div className={containerClass}>
          <div className="max-w-2xl w-full rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <h1 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
              Algo deu errado
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ocorreu um erro inesperado na interface. Detalhes técnicos abaixo.
            </p>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-64 text-gray-800 dark:text-gray-200">
              {this.state.error.stack || this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Routed Content with granular boundary ---------- */

function RoutedContent() {
  const currentView = useAppStore((s) => s.currentView);
  return (
    <ErrorBoundary inline resetKey={currentView}>
      <ContentRouter />
    </ErrorBoundary>
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
    return (
      <ErrorBoundary>
        <LoginView />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <TourProvider>
          <TipsProvider>
            <MainLayout>
              <RoutedContent />
            </MainLayout>
          </TipsProvider>
        </TourProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
