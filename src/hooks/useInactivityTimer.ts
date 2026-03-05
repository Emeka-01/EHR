import { useEffect, useRef } from 'react';

export function useInactivityTimer(
timeoutMs: number = 600000,
onTimeout: () => void)
{
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Update ref if callback changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, timeoutMs);
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Initial start
    resetTimer();

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs]);
}