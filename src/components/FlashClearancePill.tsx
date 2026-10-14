import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { useCountdown } from '../hooks/useCountdown';
import { useFlashSaleTicker } from '../hooks/useFlashSaleTicker';

interface Props {
  active: boolean;
  onClick?: () => void;
}

export const FlashClearancePill: React.FC<Props> = ({ active, onClick }) => {
  const { nextEndsAt, serverTime } = useFlashSaleTicker();
  const { hours, minutes, seconds, expired } = useCountdown(nextEndsAt, serverTime);

  if (!nextEndsAt || expired) return null;

  return (
    <Link
      to={ROUTES.flashSale}
      onClick={onClick}
      className={`text-xs uppercase font-headline tracking-widest transition-colors flex items-center gap-2 border border-secondary px-2 py-1 cursor-pointer ${
        active ? 'bg-secondary text-on-error font-bold' : 'text-on-surface-variant hover:text-on-surface bg-secondary/10'
      }`}
    >
      <span className={`w-1.5 h-1.5 animate-pulse ${active ? 'bg-paper-3' : 'bg-secondary'}`}></span>
      Flash Clearance
      <span className="font-mono text-[10px] font-bold bg-secondary text-white px-1 tracking-tight">
        {hours}:{minutes}:{seconds}
      </span>
    </Link>
  );
};
