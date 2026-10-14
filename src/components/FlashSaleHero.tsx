import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

interface Props {
  endsAt: string | null;
  serverTime: string | null;
}

export const FlashSaleHero: React.FC<Props> = ({ endsAt, serverTime }) => {
  const { hours, minutes, seconds } = useCountdown(endsAt, serverTime);
  return (
    <section className="w-full bg-surface-container-low px-6 lg:px-12 py-10 lg:py-14 border-b-2 border-primary relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 select-none pointer-events-none opacity-5 font-headline font-bold text-[18vw] leading-none text-primary">
        ARCHV
      </div>
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] lg:text-xs font-mono uppercase tracking-widest">
            <span className="px-2 py-0.5 bg-secondary text-on-error font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-paper-3 rounded-full"></span> ACTIVE TELEMETRY
            </span>
            <span className="px-2 py-0.5 bg-surface-container-lowest text-primary border border-primary font-bold">
              LIMITED RUN RUNWAY SPECIMENS
            </span>
            <span className="px-2 py-0.5 bg-primary-container text-on-primary-container border border-primary font-bold">
              FINAL SALE // NO RESTOCKS
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-primary leading-[0.95]">
            ARCHIVE PROTOCOL <br />
            <span className="text-secondary bg-surface-container-lowest px-2 inline-block border-2 border-primary -rotate-1 mt-1">
              SURPLUS &amp; SAMPLE CLEARANCE
            </span>
          </h1>
          <p className="font-mono text-xs uppercase text-on-surface-variant max-w-xl leading-relaxed">
            DECOMMISSIONED DESIGN ARTIFACTS, PROTOTYPES, AND SURPLUS RUNWAY SPECIMENS RELEASED UNDER STRICT MATRIX PROTOCOL. MAXIMUM -60% ADJUSTED REVALUATION. ONCE DISPATCHED, ARCHIVE SECTOR CLOSES.
          </p>
        </div>
        <div className="bg-surface-container-lowest border-2 border-primary p-4 shadow-[4px_4px_0px_0px_var(--color-ink)] flex flex-col gap-2 shrink-0">
          <div className="text-[10px] font-mono uppercase font-bold text-on-surface-variant tracking-wider flex justify-between">
            <span>LOCKDOWN SEQUENCE:</span>
            <span className="text-secondary animate-pulse">LIVE FEED</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-headline">
            <div className="bg-surface-container-low border border-primary px-3 py-2 min-w-[70px]">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-primary">{endsAt ? hours : '--'}</div>
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">HOURS</div>
            </div>
            <div className="bg-surface-container-low border border-primary px-3 py-2 min-w-[70px]">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-primary">{endsAt ? minutes : '--'}</div>
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">MINUTES</div>
            </div>
            <div className="bg-primary text-primary-fixed border border-primary px-3 py-2 min-w-[70px]">
              <div className="text-2xl lg:text-3xl font-bold font-mono">{endsAt ? seconds : '--'}</div>
              <div className="text-[9px] font-bold text-surface-container-highest uppercase tracking-widest mt-0.5">SECONDS</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-center text-on-surface-variant bg-surface-container-low border border-outline-variant py-1">
            GLOBAL VAULT LOCK AT 23:59:59 GMT
          </div>
        </div>
      </div>
    </section>
  );
};
