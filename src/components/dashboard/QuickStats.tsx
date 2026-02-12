import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileStack, GitBranch, FolderSearch, Clock, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/formatters';

/* ---------- Types ---------- */

interface StatCardData {
  icon: LucideIcon;
  label: string;
  value: number;
  displayValue?: string;
  color: string;
  iconBg: string;
  trend?: string;
}

interface QuickStatsProps {
  totalOrganized: number;
  activeRules: number;
  watchedFolders: number;
  lastRunDate: string | null;
  isLoading: boolean;
}

/* ---------- Animated Counter ---------- */

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString('pt-BR')}</>;
}

/* ---------- Skeleton Card ---------- */

function StatCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card padding="md" className="relative overflow-hidden">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------- Stat Card ---------- */

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card padding="md" className="relative overflow-hidden group">
        {/* Subtle gradient overlay on hover */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition-opacity duration-300 pointer-events-none
            bg-gradient-to-br ${stat.iconBg} to-transparent
          `}
          style={{ opacity: 0 }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div
              className={`
                flex items-center justify-center
                w-10 h-10 rounded-xl
                ${stat.iconBg}
                transition-transform duration-200
                group-hover:scale-110
              `}
            >
              <stat.icon size={20} className={stat.color} />
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {stat.label}
          </p>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.displayValue ? (
              stat.displayValue
            ) : (
              <AnimatedCounter value={stat.value} />
            )}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

/* ---------- Main Component ---------- */

/**
 * QuickStats displays a row of four animated stat cards at the top of the dashboard.
 * Each card shows a key metric with a count-up animation and icon.
 */
export function QuickStats({
  totalOrganized,
  activeRules,
  watchedFolders,
  lastRunDate,
  isLoading,
}: QuickStatsProps) {
  const stats: StatCardData[] = [
    {
      icon: FileStack,
      label: 'Arquivos organizados',
      value: totalOrganized,
      color: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: GitBranch,
      label: 'Regras ativas',
      value: activeRules,
      color: 'text-brand-600 dark:text-brand-400',
      iconBg: 'bg-brand-50 dark:bg-brand-500/10',
    },
    {
      icon: FolderSearch,
      label: 'Pastas monitoradas',
      value: watchedFolders,
      color: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      icon: Clock,
      label: 'Ultimo run',
      value: 0,
      displayValue: lastRunDate ? formatRelativeTime(lastRunDate) : 'Nunca',
      color: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
