import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { TourStep as TourStepType } from '@/types/tour';

interface TourStepProps {
  /** The current step configuration */
  step: TourStepType;
  /** Bounding rect of the target element */
  targetRect: DOMRect;
  /** Current step index (0-based) */
  currentIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Navigate to next step */
  onNext: () => void;
  /** Navigate to previous step */
  onPrev: () => void;
  /** Skip/close the tour */
  onSkip: () => void;
  /** Complete the tour (last step) */
  onComplete: () => void;
  /** Whether this step is visible */
  isVisible: boolean;
}

const CARD_WIDTH = 360;
const CARD_GAP = 16;
const VIEWPORT_PADDING = 16;

interface CardPosition {
  top: number;
  left: number;
  actualPlacement: 'top' | 'bottom' | 'left' | 'right';
}

function calculatePosition(
  targetRect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
  cardHeight: number,
): CardPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try the requested placement first, then fall back to alternatives
  const placements: Array<'top' | 'bottom' | 'left' | 'right'> = [
    placement,
    ...(['bottom', 'right', 'top', 'left'] as const).filter(
      (p) => p !== placement,
    ),
  ];

  let bestTop = 0;
  let bestLeft = 0;
  let bestPlacement = placement;

  for (const p of placements) {
    let candidateTop = 0;
    let candidateLeft = 0;
    let fits = true;

    switch (p) {
      case 'bottom':
        candidateTop = targetRect.bottom + CARD_GAP;
        candidateLeft =
          targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2;
        if (candidateTop + cardHeight > vh - VIEWPORT_PADDING) fits = false;
        break;
      case 'top':
        candidateTop = targetRect.top - CARD_GAP - cardHeight;
        candidateLeft =
          targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2;
        if (candidateTop < VIEWPORT_PADDING) fits = false;
        break;
      case 'right':
        candidateTop =
          targetRect.top + targetRect.height / 2 - cardHeight / 2;
        candidateLeft = targetRect.right + CARD_GAP;
        if (candidateLeft + CARD_WIDTH > vw - VIEWPORT_PADDING) fits = false;
        break;
      case 'left':
        candidateTop =
          targetRect.top + targetRect.height / 2 - cardHeight / 2;
        candidateLeft = targetRect.left - CARD_GAP - CARD_WIDTH;
        if (candidateLeft < VIEWPORT_PADDING) fits = false;
        break;
    }

    if (fits || p === placements[placements.length - 1]) {
      bestTop = candidateTop;
      bestLeft = candidateLeft;
      bestPlacement = p;
      if (fits) break;
    }
  }

  // Clamp to viewport
  bestLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(bestLeft, vw - CARD_WIDTH - VIEWPORT_PADDING),
  );
  bestTop = Math.max(
    VIEWPORT_PADDING,
    Math.min(bestTop, vh - cardHeight - VIEWPORT_PADDING),
  );

  return { top: bestTop, left: bestLeft, actualPlacement: bestPlacement };
}

function getArrowPosition(
  placement: 'top' | 'bottom' | 'left' | 'right',
  targetRect: DOMRect,
  cardLeft: number,
  cardTop: number,
  cardHeight: number,
): { className: string; style: React.CSSProperties } {
  const arrowBase =
    'absolute w-3 h-3 rotate-45 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';

  switch (placement) {
    case 'bottom': {
      const arrowLeft = Math.max(
        24,
        Math.min(
          targetRect.left + targetRect.width / 2 - cardLeft,
          CARD_WIDTH - 24,
        ),
      );
      return {
        className: `${arrowBase} border-l border-t`,
        style: {
          top: -6,
          left: arrowLeft - 6,
        },
      };
    }
    case 'top': {
      const arrowLeft = Math.max(
        24,
        Math.min(
          targetRect.left + targetRect.width / 2 - cardLeft,
          CARD_WIDTH - 24,
        ),
      );
      return {
        className: `${arrowBase} border-r border-b`,
        style: {
          bottom: -6,
          left: arrowLeft - 6,
        },
      };
    }
    case 'right': {
      const arrowTop = Math.max(
        24,
        Math.min(
          targetRect.top + targetRect.height / 2 - cardTop,
          cardHeight - 24,
        ),
      );
      return {
        className: `${arrowBase} border-l border-b`,
        style: {
          left: -6,
          top: arrowTop - 6,
        },
      };
    }
    case 'left': {
      const arrowTop = Math.max(
        24,
        Math.min(
          targetRect.top + targetRect.height / 2 - cardTop,
          cardHeight - 24,
        ),
      );
      return {
        className: `${arrowBase} border-r border-t`,
        style: {
          right: -6,
          top: arrowTop - 6,
        },
      };
    }
  }
}

/** Slide direction based on placement */
function getSlideOffset(placement: 'top' | 'bottom' | 'left' | 'right') {
  switch (placement) {
    case 'bottom':
      return { y: -12, x: 0 };
    case 'top':
      return { y: 12, x: 0 };
    case 'right':
      return { y: 0, x: -12 };
    case 'left':
      return { y: 0, x: 12 };
  }
}

export function TourStepCard({
  step,
  targetRect,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  isVisible,
}: TourStepProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(200);
  const [position, setPosition] = useState<CardPosition>({
    top: 0,
    left: 0,
    actualPlacement: step.placement,
  });

  const updatePosition = useCallback(() => {
    const height = cardRef.current?.offsetHeight || cardHeight;
    setCardHeight(height);
    const pos = calculatePosition(targetRect, step.placement, height);
    setPosition(pos);
  }, [targetRect, step.placement, cardHeight]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePosition]);

  // Re-measure card height after render
  useEffect(() => {
    if (cardRef.current) {
      const measured = cardRef.current.offsetHeight;
      if (Math.abs(measured - cardHeight) > 2) {
        setCardHeight(measured);
        const pos = calculatePosition(targetRect, step.placement, measured);
        setPosition(pos);
      }
    }
  });

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;
  const slideOffset = getSlideOffset(position.actualPlacement);

  const arrow = getArrowPosition(
    position.actualPlacement,
    targetRect,
    position.left,
    position.top,
    cardHeight,
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={step.id}
          ref={cardRef}
          className="fixed z-[9999] pointer-events-auto"
          style={{
            top: position.top,
            left: position.left,
            width: CARD_WIDTH,
          }}
          initial={{
            opacity: 0,
            x: slideOffset.x,
            y: slideOffset.y,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            x: -slideOffset.x,
            y: -slideOffset.y,
          }}
          transition={{
            duration: 0.25,
            ease: 'easeOut',
          }}
        >
          {/* Card container */}
          <div
            className="
              relative rounded-xl shadow-2xl
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              overflow-visible
            "
          >
            {/* Top accent gradient bar */}
            <div className="h-1 rounded-t-xl bg-gradient-to-r from-brand-500 to-brand-600" />

            {/* Content */}
            <div className="p-5">
              {/* Step indicator with dots */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                  Passo {currentIndex + 1} de {totalSteps}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`
                        h-1.5 rounded-full transition-colors duration-200
                        ${
                          i === currentIndex
                            ? 'bg-brand-600 dark:bg-brand-400'
                            : i < currentIndex
                              ? 'bg-brand-300 dark:bg-brand-700'
                              : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}
                      animate={{
                        width: i === currentIndex ? 16 : 6,
                      }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-b-xl">
              {/* Skip button */}
              <button
                type="button"
                onClick={onSkip}
                className="
                  text-xs font-medium text-gray-400 dark:text-gray-500
                  hover:text-gray-600 dark:hover:text-gray-300
                  transition-colors duration-150
                  px-2 py-1 -ml-2 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-brand-500/40
                "
              >
                Pular tour
              </button>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {/* Previous */}
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={onPrev}
                    className="
                      flex items-center justify-center
                      w-8 h-8 rounded-lg
                      text-gray-500 dark:text-gray-400
                      hover:bg-gray-200 dark:hover:bg-gray-700
                      hover:text-gray-700 dark:hover:text-gray-200
                      transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-brand-500/40
                    "
                    aria-label="Passo anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                {/* Next / Complete */}
                {isLastStep ? (
                  <button
                    type="button"
                    onClick={onComplete}
                    className="
                      flex items-center gap-1.5
                      px-4 py-2 rounded-lg
                      text-sm font-medium
                      bg-brand-600 hover:bg-brand-700
                      text-white
                      shadow-sm
                      transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      dark:focus:ring-offset-gray-900
                    "
                  >
                    <Check size={14} />
                    <span>Concluir</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onNext}
                    className="
                      flex items-center gap-1.5
                      px-4 py-2 rounded-lg
                      text-sm font-medium
                      bg-brand-600 hover:bg-brand-700
                      text-white
                      shadow-sm
                      transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      dark:focus:ring-offset-gray-900
                    "
                  >
                    <span>Próximo</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Arrow pointer */}
            <div className={arrow.className} style={arrow.style} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
