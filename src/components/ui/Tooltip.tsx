import { type ReactNode } from 'react';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  content: string;
  placement?: TooltipPlacement;
}

const placementStyles: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100 border-x-transparent border-b-transparent border-4',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100 border-x-transparent border-t-transparent border-4',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100 border-y-transparent border-r-transparent border-4',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100 border-y-transparent border-l-transparent border-4',
};

export function Tooltip({
  children,
  content,
  placement = 'top',
}: TooltipProps) {
  return (
    <div className="relative group/tooltip inline-flex">
      {children}
      <div
        role="tooltip"
        className={`
          absolute z-50 ${placementStyles[placement]}
          pointer-events-none
          opacity-0 group-hover/tooltip:opacity-100
          transition-opacity duration-150
        `}
      >
        <div className="relative px-2.5 py-1.5 text-xs font-medium text-white dark:text-gray-900 bg-gray-900 dark:bg-gray-100 rounded-md shadow-lg whitespace-nowrap">
          {content}
          <span className={`absolute ${arrowStyles[placement]}`} />
        </div>
      </div>
    </div>
  );
}
