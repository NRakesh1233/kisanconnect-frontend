import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for smooth GSAP animations with ScrollTrigger and React 19 cleanup.
 * Respects 'prefers-reduced-motion' for accessibility.
 *
 * @param {Function} animationCallback - Callback receiving (gsap, ScrollTrigger) inside a gsap.context
 * @param {Array} dependencies - React effect dependencies
 * @param {React.RefObject} [scopeRef] - Optional element scope for scoping selectors
 */
export const useScrollAnimation = (animationCallback, dependencies = [], scopeRef = null) => {
  const isReducedMotion = useRef(false);

  useEffect(() => {
    // Check user's OS reduced motion accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    if (isReducedMotion.current) {
      // If reduced motion is requested, skip heavy animations
      return;
    }

    const ctx = gsap.context(() => {
      animationCallback(gsap, ScrollTrigger);
    }, scopeRef?.current || undefined);

    return () => {
      ctx.revert(); // 100% clean teardown of all tweens and ScrollTriggers
    };
  }, dependencies);
};

export default useScrollAnimation;
