import { useEffect, useMemo, useState } from 'react';

const pad = (n: number): string => String(n).padStart(2, '0');

export interface Countdown {
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  expired: boolean;
}

/** Ticks every second toward `endsAt`, compensating client clock skew via `serverTime`. */
export function useCountdown(endsAt: string | null | undefined, serverTime?: string | null): Countdown {
  const offset = useMemo(
    () => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0),
    [serverTime],
  );
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = endsAt ? new Date(endsAt).getTime() : NaN;
  const total = Number.isNaN(target) ? 0 : Math.max(0, Math.floor((target - (now + offset)) / 1000));
  return {
    hours: pad(Math.floor(total / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
    totalSeconds: total,
    expired: total <= 0,
  };
}
