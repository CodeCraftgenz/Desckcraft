
type ProgressSize = 'sm' | 'md';
type ProgressColor = 'brand' | 'green' | 'red';

interface ProgressProps {
  value: number;
  label?: string;
  showPercent?: boolean;
  size?: ProgressSize;
  color?: ProgressColor;
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

const colorClasses: Record<ProgressColor, string> = {
  brand: 'bg-brand-600',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
};

const trackColorClasses: Record<ProgressColor, string> = {
  brand: 'bg-brand-100 dark:bg-brand-900/30',
  green: 'bg-emerald-100 dark:bg-emerald-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
};

export function Progress({
  value,
  label,
  showPercent = false,
  size = 'md',
  color = 'brand',
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${sizeClasses[size]} ${trackColorClasses[color]} rounded-full overflow-hidden`}
      >
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${Math.round(clampedValue)}%`}
        />
      </div>
    </div>
  );
}
