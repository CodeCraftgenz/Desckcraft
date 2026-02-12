import { useEffect, useState, useCallback, useRef } from 'react';
import { useTourStore } from '@/stores';
import { TourOverlay } from './TourOverlay';
import { TourStepCard } from './TourStep';

/**
 * TourController orchestrates the guided tour experience.
 * It finds the target element for the current step, scrolls it into view,
 * manages keyboard navigation, and renders the overlay + tooltip.
 */
export function TourController() {
  const {
    isActive,
    currentStep,
    steps,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    updateTourStep,
  } = useTourStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isReady, setIsReady] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const rafRef = useRef<number>(0);

  const stepConfig = steps[currentStep] ?? null;

  /**
   * Locate the target element and update its bounding rect.
   * Returns true if the element was found.
   */
  const findAndMeasureTarget = useCallback((): boolean => {
    if (!stepConfig) return false;

    const el = document.querySelector(stepConfig.target);
    if (!el) return false;

    // Scroll element into view with smooth behavior
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Get bounding rect after a brief delay to allow scroll to settle
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    return true;
  }, [stepConfig]);

  /**
   * When the active step changes, find the target element.
   * If the target is not found, skip forward to the next step.
   */
  useEffect(() => {
    if (!isActive || !stepConfig) {
      setIsReady(false);
      setTargetRect(null);
      return;
    }

    // Small delay to let the DOM settle (e.g., after navigation)
    let attempts = 0;
    const maxAttempts = 15;
    const retryDelay = 100;

    function tryFind() {
      const found = findAndMeasureTarget();
      if (found) {
        setIsReady(true);
        // Persist step to store
        updateTourStep(currentStep);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryFind, retryDelay);
        } else {
          // Target not found after retries -- skip to next step
          setIsReady(false);
          if (currentStep < totalSteps - 1) {
            nextStep();
          } else {
            completeTour();
          }
        }
      }
    }

    // Start searching after a brief initial delay
    const initialTimer = setTimeout(tryFind, 50);

    return () => {
      clearTimeout(initialTimer);
    };
  }, [isActive, currentStep, stepConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Keep the target rect updated when the window resizes or the DOM mutates.
   */
  useEffect(() => {
    if (!isActive || !isReady) return;

    function updateRect() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        findAndMeasureTarget();
      });
    }

    // Observe resize
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    // Observe DOM mutations (e.g., sidebar collapse changes element positions)
    observerRef.current = new MutationObserver(updateRect);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      observerRef.current?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, isReady, findAndMeasureTarget]);

  /**
   * Keyboard navigation:
   * - ArrowRight / Enter = next step
   * - ArrowLeft = previous step
   * - Escape = skip tour
   */
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          if (currentStep >= totalSteps - 1) {
            completeTour();
          } else {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          skipTour();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, totalSteps, nextStep, prevStep, skipTour, completeTour]);

  // Don't render anything if the tour is not active
  if (!isActive) return null;

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <TourOverlay targetRect={targetRect} isVisible={isActive && isReady} />

      {/* Tooltip card positioned next to the target */}
      {isReady && targetRect && stepConfig && (
        <TourStepCard
          step={stepConfig}
          targetRect={targetRect}
          currentIndex={currentStep}
          totalSteps={totalSteps}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          onComplete={completeTour}
          isVisible={isReady}
        />
      )}
    </>
  );
}
