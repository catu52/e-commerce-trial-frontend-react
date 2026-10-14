import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onAddComplement: (title: string, priceEUR: number, sku: string, size?: string) => void;
  onProceedToCheckout: () => void;
  currency: Currency;
  onShowToast: (msg: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddComplement,
  onProceedToCheckout,
  currency,
  onShowToast
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedTeeSize, setSelectedTeeSize] = useState('M');

  const subtotalEUR = items.reduce((sum, item) => sum + item.priceEUR * item.quantity, 0);
  const discountRate = promoApplied ? 0.1 : 0;
  const discountEUR = subtotalEUR * discountRate;
  const totalEUR = Math.max(0, subtotalEUR - discountEUR);
  const freeShippingThreshold = 600;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalEUR);
  const shippingProgressPct = Math.min(100, Math.round((subtotalEUR / freeShippingThreshold) * 100));

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if (promoInput.trim().toUpperCase() === 'BAUHAUS10' || promoInput.trim().toUpperCase() === 'KRAFT10') {
      setPromoApplied(true);
      onShowToast('ARCHIVAL ACCESS CODE APPLIED: 10% DEDUCTION');
    } else {
      onShowToast('VOUCHER CODE NOT FOUND IN ACTIVE LEDGER');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/75 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        aria-label="Dispatch Bag"
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[500px] lg:w-[540px] bg-surface-container-lowest text-on-surface shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0"
      >
        {/* Top Status Bar & Header */}
        <header className="p-6 pb-5 bg-surface-container-low border-b-2 border-primary">
          {/* Status Meta Tracker */}
          <div className="flex items-center justify-between pb-3 text-[10px] font-headline font-bold tracking-widest text-on-surface-variant uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary animate-pulse inline-block" />
              <span>TERMINAL // 04.DISPATCH</span>
            </div>
            <span className="font-mono">SESSION #KFT-8092</span>
          </div>

          {/* Main Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-xl lg:text-2xl font-bold uppercase tracking-tight text-primary">
                  DISPATCH BAG
                </h2>
                <span className="font-headline text-xs font-bold px-2 py-0.5 bg-primary-container text-on-primary-container uppercase">
                  [{totalUnits.toString().padStart(2, '0')} ITEMS]
                </span>
              </div>
              <p className="text-[11px] font-headline tracking-widest uppercase text-on-surface-variant mt-1">
                BAUHAUS PROTOCOL • CART REPOSITORY
              </p>
            </div>

            {/* Close Button */}
            <button
              aria-label="Close Cart Drawer"
              onClick={onClose}
              className="w-10 h-10 bg-surface-container-lowest border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center font-headline text-xs font-bold uppercase group cursor-pointer"
            >
              <span className="group-hover:rotate-90 transition-transform duration-200 text-sm">✕</span>
            </button>
          </div>

          {/* Free Express Shipping Meter */}
          <div className="mt-5 p-3.5 bg-surface-container-lowest border border-primary/20">
            <div className="flex items-center justify-between text-xs font-headline font-bold uppercase mb-2">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-sm text-tertiary">local_shipping</span>
                <span>EXPRESS COURIER STATUS</span>
              </div>
              {remainingForFreeShipping > 0 ? (
                <span className="text-secondary font-mono text-[11px]">
                  ADD {formatPrice(remainingForFreeShipping, currency)} MORE
                </span>
              ) : (
                <span className="text-tertiary font-mono text-[11px] font-bold">
                  FREE GLOBAL COURIER UNLOCKED ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant font-headline uppercase leading-relaxed mb-2.5">
              Unlock complimentary worldwide carbon-neutral courier at {formatPrice(freeShippingThreshold, currency)}
            </p>

            {/* Striped Bauhaus Progress Bar */}
            <div className="h-3 w-full bg-surface-container-high overflow-hidden p-0.5 border border-primary/30">
              <div
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={shippingProgressPct}
                className="h-full bg-primary-container relative flex items-center overflow-hidden transition-all duration-300"
                style={{ width: `${shippingProgressPct}%` }}
                role="progressbar"
              >
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a_6px,transparent_6px,transparent_12px)]" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-on-surface-variant uppercase mt-1.5">
              <span>CURR: {formatPrice(subtotalEUR, currency)}</span>
              <span className="text-primary">TARGET: {formatPrice(freeShippingThreshold, currency)}</span>
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-surface-container-high border-2 border-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">inventory_2</span>
              </div>
              <h3 className="font-headline text-lg font-bold uppercase tracking-tight text-primary">
                DISPATCH BAG IS EMPTY
              </h3>
              <p className="text-xs font-mono text-on-surface-variant max-w-xs mx-auto">
                No verified garments or hardware specimens in the active ledger.
              </p>
            </div>
          ) : (
            <section aria-label="Cart Items Matrix" className="space-y-4">
              <div className="flex items-center justify-between text-[11px] font-headline font-bold uppercase text-on-surface-variant">
                <span>SPECIMEN VERIFIED ({items.length.toString().padStart(2, '0')})</span>
                <button
                  onClick={onClearCart}
                  className="hover:text-secondary underline tracking-widest text-[10px] cursor-pointer"
                >
                  CLEAR ALL
                </button>
              </div>

              {items.map((item, idx) => (
                <article
                  key={item.id}
                  className="p-4 bg-surface-container-low border border-primary/20 transition-colors hover:bg-surface-container flex flex-col gap-3"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-32 bg-surface-container-high shrink-0 relative overflow-hidden border border-primary">
                      <img
                        className="w-full h-full object-cover"
                        src={item.image}
                        alt={item.title}
                      />
                      <span className="absolute bottom-1 left-1 bg-primary text-on-primary text-[9px] font-mono font-bold px-1">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-headline text-xs lg:text-sm font-bold uppercase tracking-tight text-primary leading-tight">
                            {item.title}
                          </h3>
                          <span className="font-headline font-bold text-sm text-primary font-mono shrink-0">
                            {formatPrice(item.priceEUR, currency)}
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-0.5 text-[11px] font-mono uppercase text-on-surface-variant">
                          <p>
                            REF: <span className="text-primary font-bold">{item.sku}</span>
                          </p>
                          <p>
                            SPEC: <span className="text-primary font-bold">{item.color}</span>
                          </p>
                          <p>
                            SIZE: <span className="text-primary font-bold">{item.size}</span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-surface-container-lowest border border-primary">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center font-mono text-xs font-bold bg-surface-container-low text-primary select-none">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-headline uppercase font-bold">
                          <button
                            onClick={() => onShowToast(`SPECIMEN ${item.sku} SAVED IN ARCHIVAL VAULT`)}
                            className="text-on-surface-variant hover:text-tertiary transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">bookmark</span>
                            <span>VAULT</span>
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-secondary hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                            <span>REMOVE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Upsell / Complement Section */}
          <section className="p-4 bg-surface-container-high border border-primary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary inline-block" />
                <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-primary">
                  ESSENTIAL SPECIMEN COMPLEMENTS
                </h4>
              </div>
              <span className="font-mono text-[10px] uppercase text-on-surface-variant">CURATED +2</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Suggestion 1: Ring */}
              <div className="p-2.5 bg-surface-container-lowest border border-primary/20 flex items-center justify-between gap-3">
                <div className="w-12 h-14 bg-surface-container shrink-0 overflow-hidden border border-primary">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtUQ1Ltkn_889Spm3kdBbyfcYE0J6AKZhZ5NwNeIs8nErlPeZZbkawzSXhRBiZiSULyHXYBu3LMCM9qj6KrNAf-oJA5fptsEwDg53YWnR3iyb_JtIav4h37eND-j-PPEIs3PSJrTfn0WcJxJ1ZW7hRKVuch0LkpuoRxMdiumzyz_J9pVnGjQW6OnVi4sguhGHKtxWFzDQ7fa64mO4OtpRMHzZ7lTgBEo60-bPuLVauU-4nOBYv_Rch"
                    alt="Solid 925 Architect Signet Ring"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold uppercase truncate text-primary">
                    SOLID 925 ARCHITECT SIGNET RING
                  </p>
                  <p className="text-[10px] font-mono text-on-surface-variant">
                    SILVER / SIZE 62 • {formatPrice(140, currency)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onAddComplement(
                      'SOLID 925 ARCHITECT SIGNET RING',
                      140,
                      'SKU-KFT-ACC-99',
                      '62'
                    )
                  }
                  className="px-2.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-headline text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>+ ADD</span>
                </button>
              </div>

              {/* Suggestion 2: Heavy Tee */}
              <div className="p-2.5 bg-surface-container-lowest border border-primary/20 flex items-center justify-between gap-3">
                <div className="w-12 h-14 bg-surface-container shrink-0 overflow-hidden border border-primary">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT-cYkudZC9suBH05CZOxeESEJxYmMiIwJWt9Qq3vhPJ68nejhwmunNcVIRWq1nniDh8AJFO1JkllMwsqjBWuag6omwyTwOTh8N7vvafe2jhZclN9fkaRJ-I_FGbL23-PAke9uRyE_LW7TGn8iYx9aN3d-PdkWOYUVexL-joJpwNlEchupBdxXrZOQJbZWqFVyVlptb8BTjG-NojEpaq_30DV7keEGVNB4TBXqfAtcT9Gwhy54syPN"
                    alt="Heavy Mockneck Cotton Tee"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline text-xs font-bold uppercase truncate text-primary">
                    HEAVY MOCKNECK COTTON TEE
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      CHALK WHITE • {formatPrice(95, currency)}
                    </span>
                    <select
                      aria-label="Tee Size"
                      value={selectedTeeSize}
                      onChange={(e) => setSelectedTeeSize(e.target.value)}
                      className="text-[9px] font-mono bg-surface-container px-1 py-0.5 uppercase focus:outline-none cursor-pointer border border-primary/20"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onAddComplement(
                      'HEAVY MOCKNECK COTTON TEE',
                      95,
                      'SKU-KFT-MCK-11',
                      selectedTeeSize
                    )
                  }
                  className="px-2.5 py-1.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-headline text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>+ ADD</span>
                </button>
              </div>
            </div>
          </section>

          {/* Promo Code Accordion */}
          <section className="p-3 bg-surface-container-low border border-primary/20 space-y-2">
            <details className="group cursor-pointer">
              <summary className="flex justify-between items-center text-xs font-headline font-bold uppercase text-primary select-none list-none">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">confirmation_number</span>
                  <span>PROMO MATRIX // ARCHIVAL ACCESS CODE</span>
                </div>
                <span className="font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <form onSubmit={handleApplyPromo} className="mt-3 flex gap-2">
                <input
                  className="flex-1 bg-surface-container-lowest border border-primary px-3 py-2 text-xs font-mono uppercase text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
                  placeholder="TRY: BAUHAUS10"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary hover:bg-secondary font-headline text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  APPLY
                </button>
              </form>
            </details>
          </section>

          {/* Archival Packaging Notes */}
          <div className="p-3 bg-surface-container border border-primary/20 flex items-start gap-2.5 text-[11px] font-headline uppercase text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-primary shrink-0">inventory_2</span>
            <p className="leading-tight">
              <span className="text-primary font-bold">ARCHIVAL PACKAGING PROTOCOL:</span>{' '}
              Orders dispatch in FSC-certified unbleached kraft housing with reusable cotton anti-static dust sleeve.
            </p>
          </div>
        </div>

        {/* Bottom Calculations & Checkout Actions */}
        <footer className="p-6 bg-surface-container-low border-t-2 border-primary space-y-4">
          <div className="space-y-2 text-xs font-headline uppercase">
            <div className="flex justify-between text-on-surface-variant">
              <span>SUBTOTAL ({totalUnits.toString().padStart(2, '0')} UNITS)</span>
              <span className="font-mono font-bold text-primary">{formatPrice(subtotalEUR, currency)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-secondary">
                <span>VOUCHER DISCOUNT (10%)</span>
                <span className="font-mono font-bold">- {formatPrice(discountEUR, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span>CARBON-NEUTRAL COURIER</span>
                <span className="material-symbols-outlined text-[14px]">eco</span>
              </div>
              <span className="font-mono text-primary font-semibold">
                {subtotalEUR >= freeShippingThreshold ? 'FREE [QUALIFIED]' : 'CALCULATED AT STEP 2'}
              </span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>ARCHIVAL VAULT PACKAGING</span>
              <span className="font-mono text-tertiary font-bold">INCLUDED [FREE]</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 text-base font-bold text-primary bg-surface-container-lowest p-2.5 border border-primary">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant">ESTIMATED TOTAL DUE</span>
                <span className="text-[10px] font-mono text-on-surface-variant font-normal">
                  INCL. VAT & APPLICABLE LEVIES
                </span>
              </div>
              <span className="font-mono text-xl lg:text-2xl text-primary font-bold tracking-tight">
                {formatPrice(totalEUR, currency)}
              </span>
            </div>
          </div>

          {/* Main Proceed to Checkout CTA */}
          <button
            onClick={() => {
              if (items.length === 0) {
                onShowToast('BAG IS EMPTY. SELECT PIECES FIRST.');
                return;
              }
              onClose();
              onProceedToCheckout();
            }}
            className="w-full py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container border-2 border-primary transition-all font-headline text-xs lg:text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 group shadow-md active:translate-y-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>PROCEED TO SECURE DISPATCH CHECKOUT</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
          </button>

          {/* Express Checkout Options */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-center text-on-surface-variant">
              OR EXPRESS ACCELERATED PAYMENT
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                  onShowToast('APPLE PAY EXPRESS RECOGNIZED');
                }}
                className="py-2.5 bg-primary text-on-primary hover:bg-surface-variant hover:text-primary transition-colors flex items-center justify-center font-headline text-[11px] font-bold uppercase cursor-pointer"
              >
                <span> PAY</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                  onShowToast('GOOGLE PAY RECOGNIZED');
                }}
                className="py-2.5 bg-surface-container-lowest text-primary border border-primary hover:bg-surface-container-high transition-colors flex items-center justify-center font-headline text-[11px] font-bold uppercase cursor-pointer"
              >
                <span className="font-mono font-bold tracking-tight">G PAY</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                  onShowToast('KLARNA EXPRESS PROTOCOL');
                }}
                className="py-2.5 bg-[#ffb3c7] text-[#1a1a1a] hover:opacity-90 transition-opacity flex items-center justify-center font-headline text-[11px] font-bold uppercase cursor-pointer"
              >
                <span>KLARNA.</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees Micro-Matrix */}
          <div className="pt-2 text-center text-[10px] font-mono uppercase text-on-surface-variant flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-secondary inline-block" /> 14-DAY VAULT RETURN
            </span>
            <span>•</span>
            <span>INSURED GLOBAL COURIER</span>
            <span>•</span>
            <span>AUTHENTIC EDITION VERIFIED</span>
          </div>
        </footer>
      </aside>
    </div>
  );
};
