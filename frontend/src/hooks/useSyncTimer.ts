//Synchronized Timer Hook
// Uses requestAnimationFrame to compute remaining time against the server's absolute deadline (adjusted by NTP clock offset).
// Returns timeRemaining in SECONDS (float) for smooth rendering.

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useSyncTimer = (): number => {
  const tDeadline = useGameStore((s) => s.tDeadline);
  const clockOffset = useGameStore((s) => s.clockOffset);
  const phase = useGameStore((s) => s.phase);

  const [timeRemaining, setTimeRemaining] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== 'question' || tDeadline === 0) {
      setTimeRemaining(0);
      return;
    }

    const tick = () => {
      const serverNow = Date.now() + clockOffset;
      const remaining = Math.max(0, (tDeadline - serverNow) / 1000);
      setTimeRemaining(remaining);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tDeadline, clockOffset, phase]);

  return timeRemaining;
};
