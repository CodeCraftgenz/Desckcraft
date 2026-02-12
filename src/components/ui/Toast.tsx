import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

/* ---------- Types ---------- */

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

/* ---------- Context ---------- */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ---------- Constants ---------- */

const AUTO_DISMISS_MS = 4000;

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

const borderColors: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

/* ---------- Provider ---------- */

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
    },
    [removeToast],
  );

  const toast: ToastAPI = {
    success: useCallback(
      (message: string) => addToast('success', message),
      [addToast],
    ),
    error: useCallback(
      (message: string) => addToast('error', message),
      [addToast],
    ),
    info: useCallback(
      (message: string) => addToast('info', message),
      [addToast],
    ),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, x: 0, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`
                  pointer-events-auto
                  flex items-start gap-3 min-w-[320px] max-w-md
                  px-4 py-3
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  border-l-4 ${borderColors[t.type]}
                  rounded-lg shadow-lg
                `}
              >
                <Icon size={18} className={`${iconColors[t.type]} shrink-0 mt-0.5`} />
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-snug">
                  {t.message}
                </p>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="
                    shrink-0 p-0.5 rounded
                    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors
                  "
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Hook ---------- */

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx.toast;
}
