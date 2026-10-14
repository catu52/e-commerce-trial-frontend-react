import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Currency } from '../types';
import { useSiteContent } from '../hooks/useSiteContent';

interface FooterProps {
  currency: Currency;
  onShowToast: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currency, onShowToast }) => {
  const [email, setEmail] = useState('');
  const { footerTagline, socialLinks, storeLocations } = useSiteContent().content.settings;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onShowToast(`DISPATCH BULLETIN: ${email.toUpperCase()} ENROLLED`);
    setEmail('');
  };

  return (
    <footer className="w-full bg-surface-container-lowest border-t-2 border-primary mt-20">
      <div className="border-b-2 border-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Brand & Dispatch Newsletter */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary" />
              <div className="w-4 h-4 bg-primary-container" />
              <div className="w-4 h-4 bg-secondary" />
              <div className="w-4 h-4 bg-tertiary" />
            </div>
            <h3 className="font-headline text-2xl lg:text-3xl font-bold uppercase tracking-tight text-primary">
              DISPATCH INDEX & BULLETIN
            </h3>
            <p className="text-xs uppercase text-on-surface-variant max-w-md font-mono">
              {footerTagline}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-md pt-2">
              <input
                className="flex-1 bg-surface-container-low border-2 border-primary px-4 py-3 text-xs uppercase font-mono placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-lowest text-primary"
                placeholder="ENTER YOUR EMAIL ADDRESS"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="bg-primary text-on-primary border-2 border-primary px-6 py-3 font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                type="submit"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

          {/* Right Column: Navigation Directory */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-headline uppercase">
            <div className="space-y-3">
              <h4 className="font-bold tracking-wider text-primary border-b border-primary pb-1">
                STORE LOCATOR
              </h4>
              <ul className="space-y-2 text-on-surface-variant">
                {storeLocations.map(({ name, address, hours }) => (
                  <li key={name}>
                    <button
                      onClick={() => onShowToast(`${name}: ${address}${hours ? ` [${hours}]` : ''}`.toUpperCase())}
                      className="hover:text-primary underline decoration-primary cursor-pointer text-left"
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold tracking-wider text-primary border-b border-primary pb-1">
                CLIENT SERVICE
              </h4>
              <ul className="space-y-2 text-on-surface-variant">
                <li>
                  <Link to={ROUTES.editorial} className="hover:text-primary underline decoration-primary cursor-pointer">
                    EDITORIAL
                  </Link>
                </li>
                <li>
                  <button onClick={() => onShowToast('ORDER STATUS PORTAL // SESSION ACTIVE')} className="hover:text-primary underline decoration-primary cursor-pointer text-left">
                    ORDER STATUS
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('RETURN PROTOCOL: 14 DAYS UNCONDITIONAL')} className="hover:text-primary underline decoration-primary cursor-pointer text-left">
                    RETURN PROTOCOL
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('GARMENT CARE: PERCHLOROETHYLENE ONLY FOR VIRGIN WOOL')} className="hover:text-primary underline decoration-primary cursor-pointer text-left">
                    GARMENT CARE
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('ARCHIVAL TERMS & CONDITIONS AUDITED 2025')} className="hover:text-primary underline decoration-primary cursor-pointer text-left">
                    TERMS & ARCHIVE
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-bold tracking-wider text-primary border-b border-primary pb-1">
                NETWORK
              </h4>
              <ul className="space-y-2 text-on-surface-variant">
                {socialLinks.map(({ label, icon, href }) => (
                  <li key={label}>
                    <a
                      className="hover:text-primary underline decoration-primary flex items-center gap-2"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                    >
                      <span className="material-symbols-outlined text-base">{icon}</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-headline uppercase font-bold tracking-widest text-on-surface-variant">
        <div>© 2025 KRAFT STUDIO ARCHIVE / ALL RIGHTS RESERVED</div>
        <div className="flex items-center gap-6">
          <span>BAUHAUS PROTOCOL #08</span>
          <span>GRID: RIGID 12-COL</span>
          <span>CURRENCY: {currency}</span>
        </div>
      </div>
    </footer>
  );
};
