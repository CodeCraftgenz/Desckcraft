import React from 'react';
import { vi } from 'vitest';

// Filter out framer-motion specific props that shouldn't reach DOM
const motionProps = [
  'layout', 'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
  'layoutId', 'layoutDependency', 'layoutScroll', 'onLayoutAnimationStart',
  'onLayoutAnimationComplete', 'drag', 'dragConstraints', 'dragControls',
  'dragElastic', 'dragListener', 'dragMomentum', 'dragPropagation',
  'dragSnapToOrigin', 'dragTransition', 'onDrag', 'onDragEnd', 'onDragStart',
  'onDirectionLock', 'onMeasureDrag',
];

function filterProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionProps.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function createMotionComponent(tag: string) {
  return React.forwardRef(({ children, ...props }: Record<string, unknown>, ref: unknown) => {
    return React.createElement(tag, { ...filterProps(props), ref }, children as React.ReactNode);
  });
}

export const motion = {
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  span: createMotionComponent('span'),
  a: createMotionComponent('a'),
  p: createMotionComponent('p'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  nav: createMotionComponent('nav'),
  section: createMotionComponent('section'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  textarea: createMotionComponent('textarea'),
  select: createMotionComponent('select'),
  label: createMotionComponent('label'),
  img: createMotionComponent('img'),
};

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAnimation() {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  };
}

export function useMotionValue(initial: number) {
  return {
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  };
}

export function useTransform() {
  return useMotionValue(0);
}

export function useSpring() {
  return useMotionValue(0);
}
