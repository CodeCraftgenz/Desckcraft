import { motion } from 'framer-motion';
import { Lightbulb, X, ChevronRight } from 'lucide-react';
import type { TipSuggestion } from '@/types/tips';

/* ---------- Types ---------- */

type TipCardVariant = 'banner' | 'inline' | 'minimal';

interface TipCardProps {
  tip: TipSuggestion;
  variant?: TipCardVariant;
  onAccept: (tipId: string) => void;
  onDismiss: (tipId: string) => void;
}

/* ---------- Banner Variant ---------- */

function BannerVariant({ tip, onAccept, onDismiss }: Omit<TipCardProps, 'variant'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.25 }}
      className="
        relative overflow-hidden rounded-xl
        bg-white dark:bg-gray-900
        border border-amber-200/60 dark:border-amber-500/20
        shadow-md shadow-amber-100/30 dark:shadow-amber-900/10
      "
    >
      {/* Left accent bar */}
      <div
        className="
          absolute left-0 top-0 bottom-0 w-1
          bg-gradient-to-b from-amber-400 via-yellow-400 to-orange-400
          dark:from-amber-500 dark:via-yellow-500 dark:to-orange-500
        "
      />

      {/* Close button */}
      <button
        type="button"
        onClick={() => onDismiss(tip.id)}
        className="
          absolute top-2.5 right-2.5 p-1 rounded-md
          text-gray-400 hover:text-gray-600
          dark:text-gray-500 dark:hover:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-amber-400
        "
        aria-label="Fechar dica"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3 pl-5 pr-10 py-3.5">
        <div
          className="
            flex items-center justify-center shrink-0
            w-8 h-8 rounded-lg
            bg-amber-50 dark:bg-amber-500/10
          "
        >
          <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
            {tip.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
            {tip.message}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAccept(tip.id)}
              className="
                px-3 py-1 rounded-md text-xs font-semibold
                bg-amber-500 hover:bg-amber-600
                dark:bg-amber-500 dark:hover:bg-amber-400
                text-white dark:text-gray-900
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-amber-400
              "
            >
              {tip.action_label}
            </button>
            <button
              type="button"
              onClick={() => onDismiss(tip.id)}
              className="
                px-2 py-1 rounded-md text-xs font-medium
                text-gray-500 hover:text-gray-700
                dark:text-gray-400 dark:hover:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors duration-150
              "
            >
              Dispensar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Inline Variant ---------- */

function InlineVariant({ tip, onAccept, onDismiss }: Omit<TipCardProps, 'variant'>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
      className="
        group relative flex items-center gap-3
        px-4 py-3 rounded-lg
        bg-amber-50/60 dark:bg-amber-500/5
        border border-amber-200/40 dark:border-amber-500/15
        hover:border-amber-300/60 dark:hover:border-amber-500/25
        transition-colors duration-150
      "
    >
      <Lightbulb
        size={16}
        className="shrink-0 text-amber-500 dark:text-amber-400"
      />

      <p className="flex-1 text-xs text-gray-700 dark:text-gray-300 leading-snug">
        {tip.title}
      </p>

      {/* Action link */}
      <button
        type="button"
        onClick={() => onAccept(tip.id)}
        className="
          shrink-0 inline-flex items-center gap-1
          text-xs font-semibold
          text-amber-600 hover:text-amber-700
          dark:text-amber-400 dark:hover:text-amber-300
          transition-colors duration-150
          focus:outline-none focus:underline
        "
      >
        {tip.action_label}
        <ChevronRight size={12} />
      </button>

      {/* Dismiss (visible on hover) */}
      <button
        type="button"
        onClick={() => onDismiss(tip.id)}
        className="
          shrink-0 p-0.5 rounded
          text-gray-400 hover:text-gray-600
          dark:text-gray-500 dark:hover:text-gray-300
          opacity-0 group-hover:opacity-100
          transition-all duration-150
          focus:outline-none focus:opacity-100
        "
        aria-label="Dispensar dica"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/* ---------- Minimal Variant ---------- */

function MinimalVariant({ tip, onAccept, onDismiss }: Omit<TipCardProps, 'variant'>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="
        group flex items-center gap-2
        px-3 py-2 rounded-md
        hover:bg-amber-50/50 dark:hover:bg-amber-500/5
        transition-colors duration-150
      "
    >
      <Lightbulb
        size={14}
        className="shrink-0 text-amber-400 dark:text-amber-500"
      />

      <button
        type="button"
        onClick={() => onAccept(tip.id)}
        className="
          flex-1 text-left text-xs
          text-gray-600 dark:text-gray-400
          hover:text-amber-600 dark:hover:text-amber-400
          transition-colors duration-150
          focus:outline-none focus:underline
          truncate
        "
        title={tip.message}
      >
        {tip.title}
      </button>

      <button
        type="button"
        onClick={() => onDismiss(tip.id)}
        className="
          shrink-0 p-0.5 rounded
          text-gray-300 hover:text-gray-500
          dark:text-gray-600 dark:hover:text-gray-400
          opacity-0 group-hover:opacity-100
          transition-all duration-150
          focus:outline-none focus:opacity-100
        "
        aria-label="Dispensar dica"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

/* ---------- Main Component ---------- */

/**
 * TipCard — A smaller inline tip card variant that can be placed in
 * specific areas of the UI (e.g., dashboard, sidebar, settings).
 *
 * Supports three visual variants:
 * - `banner`: Full card with title, message, and action buttons
 * - `inline`: Compact row with icon, title, action link, and hover dismiss
 * - `minimal`: Smallest form — just icon, title click, and hover dismiss
 *
 * All variants use Framer Motion for enter/exit/hover animations.
 */
export function TipCard({
  tip,
  variant = 'inline',
  onAccept,
  onDismiss,
}: TipCardProps) {
  const props = { tip, onAccept, onDismiss };

  switch (variant) {
    case 'banner':
      return <BannerVariant {...props} />;
    case 'inline':
      return <InlineVariant {...props} />;
    case 'minimal':
      return <MinimalVariant {...props} />;
    default:
      return <InlineVariant {...props} />;
  }
}
