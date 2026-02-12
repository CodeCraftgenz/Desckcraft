import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourOverlayProps {
  /** The bounding rect of the target element to spotlight */
  targetRect: DOMRect | null;
  /** Whether the overlay is visible */
  isVisible: boolean;
}

const SPOTLIGHT_PADDING = 8;
const SPOTLIGHT_RADIUS = 12;

/**
 * TourOverlay renders a full-screen dark overlay with a "spotlight" cutout
 * around the target element. Uses an SVG mask approach for the highlight effect.
 */
export function TourOverlay({ targetRect, isVisible }: TourOverlayProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate spotlight rect with padding
  const spotX = targetRect ? targetRect.left - SPOTLIGHT_PADDING : 0;
  const spotY = targetRect ? targetRect.top - SPOTLIGHT_PADDING : 0;
  const spotW = targetRect ? targetRect.width + SPOTLIGHT_PADDING * 2 : 0;
  const spotH = targetRect ? targetRect.height + SPOTLIGHT_PADDING * 2 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* SVG overlay with mask cutout */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${windowSize.width} ${windowSize.height}`}
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="tour-spotlight-mask">
                {/* White = visible (dark overlay), Black = hidden (spotlight) */}
                <rect
                  x="0"
                  y="0"
                  width={windowSize.width}
                  height={windowSize.height}
                  fill="white"
                />
                {targetRect && (
                  <rect
                    x={spotX}
                    y={spotY}
                    width={spotW}
                    height={spotH}
                    rx={SPOTLIGHT_RADIUS}
                    ry={SPOTLIGHT_RADIUS}
                    fill="black"
                  />
                )}
              </mask>
            </defs>

            {/* Dark overlay with mask */}
            <rect
              x="0"
              y="0"
              width={windowSize.width}
              height={windowSize.height}
              fill="rgba(0, 0, 0, 0.6)"
              mask="url(#tour-spotlight-mask)"
            />
          </svg>

          {/* Spotlight border with pulse animation */}
          {targetRect && (
            <motion.div
              className="absolute border-2 border-brand-400 dark:border-brand-500 pointer-events-none"
              style={{
                left: spotX,
                top: spotY,
                width: spotW,
                height: spotH,
                borderRadius: SPOTLIGHT_RADIUS,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-[inherit] border-2 border-brand-400/50 dark:border-brand-500/50"
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ borderRadius: SPOTLIGHT_RADIUS }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
