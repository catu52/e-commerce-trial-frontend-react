import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  endsAt: string | null;
  serverTime: string | null;
}

export const FlashSaleBanner: React.FC<Props> = ({ endsAt, serverTime }) => {
  const { hours, minutes, seconds } = useCountdown(endsAt, serverTime);
  return (
    <div className="w-full bg-secondary text-on-error px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono font-bold uppercase tracking-widest border-b-2 border-primary">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-primary-container animate-ping inline-block"></span>
        <span className="text-[11px] lg:text-xs">TERMINATION PROTOCOL: TIME REMAINING UNTIL VAULT LOCK:</span>
        <span className="bg-primary text-primary-fixed px-1.5 py-0.5 tracking-tight font-headline">
          {endsAt ? `${hours}H : ${minutes}M : ${seconds}S` : '--H : --M : --S'}
        </span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-[11px]">
        <span>// ALLOCATIONS PERISH AT ZERO</span>
        <span className="bg-primary text-on-primary px-1 font-mono">SYS_STATUS: CRITICAL_VOLUME</span>
      </div>
    </div>
  );
};
