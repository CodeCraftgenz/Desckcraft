import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppStore, useHistoryStore, useProfileStore, useRuleStore } from '@/stores';
import { useTipsContext } from '@/components/tips';
import { TipCard } from '@/components/tips';
import { APP_NAME } from '@/lib/constants';
import { QuickStats } from './QuickStats';
import { QuickActions } from './QuickActions';
import { RecentRuns } from './RecentRuns';
import { FolderOverview } from './FolderOverview';

/* ---------- Greeting Helper ---------- */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/* ---------- Welcome Section ---------- */

function WelcomeSection() {
  const activeProfile = useProfileStore((s) => s.activeProfile);
  const greeting = getGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-3"
    >
      <div
        className="
          flex items-center justify-center
          w-10 h-10 rounded-xl
          bg-gradient-to-br from-brand-500 to-brand-700
          dark:from-brand-400 dark:to-brand-600
          shadow-md shadow-brand-500/20 dark:shadow-brand-500/10
        "
      >
        <Sparkles size={20} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {greeting}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bem-vindo ao {APP_NAME}
          {activeProfile ? (
            <span className="ml-1">
              &mdash; perfil{' '}
              <span className="font-medium text-brand-600 dark:text-brand-400">
                {activeProfile.icon} {activeProfile.name}
              </span>
            </span>
          ) : null}
        </p>
      </div>
    </motion.div>
  );
}

/* ---------- Sidebar Tip ---------- */

function SidebarTip() {
  const { tips, isEnabled, acceptTip, dismissTip } = useTipsContext();

  if (!isEnabled || tips.length === 0) return null;

  // Show the first available tip in inline variant
  const tip = tips[0];

  return (
    <div className="mt-4">
      <TipCard
        tip={tip}
        variant="inline"
        onAccept={acceptTip}
        onDismiss={dismissTip}
      />
    </div>
  );
}

/* ---------- Main Dashboard ---------- */

/**
 * DashboardView is the main screen users see when they open DeskCraft.
 * It provides an overview of the app status with stats, quick actions,
 * recent activity, and monitored folders.
 */
export function DashboardView() {
  const isLoading = useAppStore((s) => s.isLoading);

  // History
  const runs = useHistoryStore((s) => s.runs);
  const fetchRuns = useHistoryStore((s) => s.fetchRuns);
  const historyLoading = useHistoryStore((s) => s.isLoading);

  // Profiles
  const fetchProfiles = useProfileStore((s) => s.fetchProfiles);
  const profilesLoading = useProfileStore((s) => s.isLoading);

  // Rules
  const rules = useRuleStore((s) => s.rules);
  const fetchRules = useRuleStore((s) => s.fetchRules);
  const rulesLoading = useRuleStore((s) => s.isLoading);

  // Fetch data on mount
  useEffect(() => {
    fetchRuns(5, 0);
    fetchProfiles();
    fetchRules();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute stats
  const stats = useMemo(() => {
    const totalOrganized = runs.reduce((sum, run) => {
      if (run.status === 'completed') return sum + run.moved_files;
      return sum;
    }, 0);

    const activeRules = rules.filter((r) => r.is_enabled).length;

    // Mock watched folders count (Desktop + Downloads)
    const watchedFolders = 2;

    const completedRuns = runs.filter((r) => r.status === 'completed' || r.status === 'failed');
    const lastRunDate =
      completedRuns.length > 0 ? completedRuns[0].started_at : null;

    return { totalOrganized, activeRules, watchedFolders, lastRunDate };
  }, [runs, rules]);

  const statsLoading = isLoading || historyLoading || rulesLoading || profilesLoading;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <WelcomeSection />

      {/* Quick Stats */}
      <QuickStats
        totalOrganized={stats.totalOrganized}
        activeRules={stats.activeRules}
        watchedFolders={stats.watchedFolders}
        lastRunDate={stats.lastRunDate}
        isLoading={statsLoading}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Two-column layout: Recent Runs + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Runs (2/3 width) */}
        <div className="lg:col-span-2">
          <RecentRuns runs={runs} isLoading={historyLoading} />
        </div>

        {/* Right: Folder Overview + Tip (1/3 width) */}
        <div className="space-y-4">
          <FolderOverview />
          <SidebarTip />
        </div>
      </div>
    </div>
  );
}
