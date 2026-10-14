import React, { useState } from 'react';
import { subscribeFlashDrops } from '../services/flashSales';
import { ApiError } from '../lib/api';

interface Props {
  onShowToast: (message: string) => void;
}

export const FlashSaleNewsletter: React.FC<Props> = ({ onShowToast }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await subscribeFlashDrops(email.trim());
      onShowToast(res.message || 'ACCESS CODE INITIALIZED. TELEMETRY ACTIVATED.');
      setEmail('');
    } catch (err) {
      onShowToast(err instanceof ApiError ? err.detail : 'SUBSCRIPTION FAILED. TRY AGAIN.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-primary text-on-primary px-6 lg:px-12 py-16">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs text-primary-fixed uppercase tracking-widest font-bold">PRIORITY SIGNAL INGESTION</span>
          </div>
          <h2 className="font-headline text-2xl lg:text-4xl font-bold uppercase tracking-tight leading-tight">
            RECEIVE UNRELEASED ARCHIVE SIGNALS 15 MINUTES BEFORE PUBLIC ACCESS
          </h2>
          <p className="font-mono text-xs text-surface-container-highest uppercase leading-relaxed">
            JOIN 4,200+ ARCHIVISTS. NEVER MISS CRITICAL SAMPLE LIQUIDATIONS, ONE-OFF PROTOTYPES, OR RESTRICTED CODE DROPS.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-80 space-y-3">
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <input
              className="w-full bg-surface-container-low text-primary border-2 border-primary-container px-3 py-3 font-mono text-xs uppercase placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-paper-3"
              placeholder="COMM_HANDLE@DOMAIN.COM"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full py-3 bg-primary-container text-on-primary-container font-headline font-bold text-xs uppercase tracking-widest border-2 border-primary-container hover:bg-secondary hover:text-white hover:border-secondary transition-colors disabled:opacity-50 cursor-pointer"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'TRANSMITTING...' : 'ACTIVATE PRIORITY CHANNEL'}
            </button>
          </form>
          <div className="text-[9px] font-mono text-surface-container-highest uppercase text-center">
            ENCRYPTED VIA TLS 1.3 // ZERO PROMOTIONAL NOISE
          </div>
        </div>
      </div>
    </section>
  );
};
