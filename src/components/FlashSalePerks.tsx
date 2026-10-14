import React from 'react';

const PERKS = [
  { icon: 'flight_takeoff', color: 'text-secondary', id: '01', title: 'SAME-DAY AIR DISPATCH // ZERO-EMISSION', body: 'ORDERS ALLOCATED BEFORE 16:00 CET BOARD DEDICATED ELECTRIC COURIER TRANSPORTS. REAL-TIME TELEMETRY TRACKING DISPATCHED IMMEDIATELY VIA SMS.' },
  { icon: 'verified', color: 'text-tertiary', id: '02', title: 'PHYSICAL SERIAL DOCKET CERTIFICATION', body: 'EACH ARCHIVAL SPECIMEN IS ACCOMPANIED BY AN INDIVIDUALLY EMBOSSED HEAVYWEIGHT KRAFT CERTIFICATE IDENTIFYING RUNWAY SEASON, SAMPLE BATCH, AND PROVENANCE.' },
  { icon: 'inventory_2', color: 'text-primary-fixed-dim', id: '03', title: 'TAMPER-PROOF CRATE PACKAGING', body: 'SEALED IN INDUSTRIAL HIGH-DENSITY CELLULOSE CRATES WITH BARCODE TEAR-SEALS. GUARENTEED ARCHIVE INTEGRITY FROM VAULT TO DOORSTEP.' },
];

export const FlashSalePerks: React.FC = () => (
  <section className="w-full bg-surface-container-low border-y-2 border-primary py-12 px-6 lg:px-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {PERKS.map((perk) => (
        <div key={perk.id} className="p-6 bg-surface-container-lowest border-2 border-primary space-y-3 shadow-[4px_4px_0px_0px_var(--color-ink)]">
          <div className="flex items-center justify-between">
            <span className={`material-symbols-outlined text-2xl ${perk.color}`}>{perk.icon}</span>
            <span className="font-mono text-[10px] text-on-surface-variant font-bold">PROTOCOL_{perk.id}</span>
          </div>
          <h3 className="font-headline font-bold text-sm lg:text-base uppercase tracking-tight text-primary">{perk.title}</h3>
          <p className="font-mono text-xs text-on-surface-variant leading-relaxed uppercase">{perk.body}</p>
        </div>
      ))}
    </div>
  </section>
);
