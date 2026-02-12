import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { useTips } from '@/hooks/useTips';

/**
 * TipBanner — A persistent, dismissible notification banner for displaying
 * contextual smart tips at the bottom of the main content area.
 *
 * Shows one tip at a time (the first from the queue). Features a beautiful
 * card design with left accent gradient bar, lightbulb icon, title/message,
 * action buttons ("Criar regra" / "Dispensar"), and a close button.
 *
 * Uses Framer Motion for smooth slide-up/down + fade transitions.
 * AnimatePresence handles smooth transitions when the displayed tip changes.
 * Does not render anything when tips are disabled or the queue is empty.
 */
export function TipBanner() {
  const { currentTip, isEnabled, acceptTip, dismissTip } = useTips();

  if (!isEnabled) return null;

  return (
    <AnimatePresence mode="wait">
      {currentTip && (
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mt-4 mx-auto w-full max-w-3xl"
        >
          <div
            className="
              relative overflow-hidden rounded-xl
              bg-white dark:bg-gray-900
              border border-amber-200/60 dark:border-amber-500/20
              shadow-lg shadow-amber-100/50 dark:shadow-amber-900/10
            "
          >
            {/* Left accent bar with amber gradient */}
            <div
              className="
                absolute left-0 top-0 bottom-0 w-1.5
                bg-gradient-to-b from-amber-400 via-yellow-400 to-orange-400
                dark:from-amber-500 dark:via-yellow-500 dark:to-orange-500
              "
            />

            {/* Close button (top-right corner) */}
            <button
              type="button"
              onClick={() => dismissTip(currentTip.id)}
              className="
                absolute top-3 right-3 p-1 rounded-md
                text-gray-400 hover:text-gray-600
                dark:text-gray-500 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
                dark:focus:ring-offset-gray-900
              "
              aria-label="Fechar dica"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4 pl-6 pr-12 py-4">
              {/* Lightbulb icon */}
              <div
                className="
                  flex items-center justify-center shrink-0
                  w-10 h-10 rounded-lg
                  bg-amber-50 dark:bg-amber-500/10
                  ring-1 ring-amber-200/50 dark:ring-amber-500/20
                "
              >
                <Lightbulb
                  size={20}
                  className="text-amber-500 dark:text-amber-400"
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h4
                  className="
                    text-sm font-semibold leading-tight
                    text-gray-900 dark:text-gray-100
                    mb-1
                  "
                >
                  {currentTip.title}
                </h4>
                <p
                  className="
                    text-sm leading-relaxed
                    text-gray-600 dark:text-gray-400
                    mb-3
                  "
                >
                  {currentTip.message}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {/* Primary action — "Criar regra" */}
                  <button
                    type="button"
                    onClick={() => acceptTip(currentTip.id)}
                    className="
                      inline-flex items-center gap-1.5
                      px-4 py-1.5 rounded-lg
                      text-xs font-semibold
                      bg-amber-500 hover:bg-amber-600
                      dark:bg-amber-500 dark:hover:bg-amber-400
                      text-white dark:text-gray-900
                      shadow-sm shadow-amber-200/50 dark:shadow-amber-900/20
                      transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
                      dark:focus:ring-offset-gray-900
                      active:scale-[0.97]
                    "
                  >
                    {currentTip.action_label}
                  </button>

                  {/* Dismiss — "Dispensar" */}
                  <button
                    type="button"
                    onClick={() => dismissTip(currentTip.id)}
                    className="
                      inline-flex items-center
                      px-3 py-1.5 rounded-lg
                      text-xs font-medium
                      text-gray-500 hover:text-gray-700
                      dark:text-gray-400 dark:hover:text-gray-200
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
                      dark:focus:ring-offset-gray-900
                    "
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
