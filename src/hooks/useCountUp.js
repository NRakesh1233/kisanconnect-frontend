import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animated counter hook that smoothly counts numbers up to target.
 *
 * @param {number} targetValue - Number to count up to
 * @param {number} duration - Animation duration in seconds (default: 1.5)
 * @param {string} [triggerSelector] - Optional CSS selector to trigger count-up on scroll
 * @returns {[number, React.RefObject]} [currentDisplayValue, elementRef]
 */
export const useCountUp = (targetValue, duration = 1.5, triggerSelector = null) => {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = Number(targetValue) || 0;

    if (isReduced) {
      setDisplayValue(target);
      return;
    }

    const state = { val: 0 };
    const ctx = gsap.context(() => {
      const tweenConfig = {
        val: target,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          setDisplayValue(Math.round(state.val));
        },
      };

      if (triggerSelector || elementRef.current) {
        tweenConfig.scrollTrigger = {
          trigger: triggerSelector || elementRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        };
      }

      gsap.to(state, tweenConfig);
    });

    return () => ctx.revert();
  }, [targetValue, duration, triggerSelector]);

  return [displayValue, elementRef];
};

export default useCountUp;
