import React, { useState } from 'react';
import { CartItem, Currency, CheckoutData } from '../types';
import { formatPrice } from '../data/mockData';
import { dispatchShippingPreview, PROMO_CODES, PROMO_DISCOUNT_RATE, VAT_RATE } from '../config';

interface CheckoutStep1Props {
  cart: CartItem[];
  currency: Currency;
  checkoutData: CheckoutData;
  onUpdateCheckoutData: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBackToCart: () => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutStep1: React.FC<CheckoutStep1Props> = ({
  cart,
  currency,
  checkoutData,
  onUpdateCheckoutData,
  onNext,
  onBackToCart,
  onShowToast,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + (item.priceEUR || item.price || (item.product?.priceEUR ?? 0)) * item.quantity, 0);
  
  const shippingCost = dispatchShippingPreview(checkoutData.dispatchSpeed);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if ((PROMO_CODES as readonly string[]).includes(promoInput.trim().toUpperCase())) {
      const discount = Math.round(subtotal * PROMO_DISCOUNT_RATE);
      setDiscountAmount(discount);
      setPromoApplied(true);
      onUpdateCheckoutData({ promoCode: promoInput.trim().toUpperCase(), discountEUR: discount });
      onShowToast(`CODE APPLIED: -${formatPrice(discount, currency)} (10% DEDUCTION)`);
    } else {
      onShowToast('INVALID PROTOCOL VOUCHER');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.email) {
      onShowToast('MANDATORY: CONTACT EMAIL REQUIRED');
      return;
    }
    if (!checkoutData.lastName || !checkoutData.address || !checkoutData.city || !checkoutData.postalCode) {
      onShowToast('MANDATORY: DISPATCH COORDINATES INCOMPLETE');
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-[#ffcc00] selection:text-[#1a1a1a] pb-24">
      {/* Top Banner */}
      <div className="border-b-2 border-ink bg-panel text-[#f5f0eb] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-headline font-black text-xl tracking-tighter text-[#ffcc00]">KRAFT*</span>
          <span className="font-mono text-xs tracking-widest uppercase text-[#888888] hidden sm:inline">
            // PROTOCOL CHECKOUT GATEWAY
          </span>
        </div>
        <button
          onClick={onBackToCart}
          className="font-mono text-xs uppercase hover:text-[#ffcc00] flex items-center gap-1"
        >
          ← RETURN TO BAG
        </button>
      </div>

      {/* Stepper Header */}
      <div className="border-b-2 border-ink bg-paper-2 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#e63b2e] animate-pulse"></span>
            <span className="font-bold">STAGE 01 // DISPATCH COORDINATES & RECIPIENT</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 font-bold text-[#1a1a1a] bg-[#ffcc00] px-2.5 py-1 border border-ink">
              <span>01</span>
              <span>INFORMATION</span>
            </div>
            <span className="text-[#888888]">───</span>
            <div className="flex items-center gap-2 text-[#888888]">
              <span>02</span>
              <span>PAYMENT</span>
            </div>
            <span className="text-[#888888]">───</span>
            <div className="flex items-center gap-2 text-[#888888]">
              <span>03</span>
              <span>CONFIRMATION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Dispatch Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Express Gateways */}
            <div className="bg-paper-2 border-2 border-ink p-4 shadow-[4px_4px_0px_var(--color-ink)] space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase text-[#888888] block text-center">
                EXPRESS PROTOCOL GATEWAYS
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCheckoutData({ email: 'collector@kraft-studio.de', firstName: 'Klaus', lastName: 'Breuer', address: 'Bauhausstrasse 4', city: 'Dessau', postalCode: '06846', country: 'Germany' });
                    onShowToast('EXPRESS PROFILE IMPORTED');
                  }}
                  className="bg-[#5a31f4] hover:bg-[#4922db] text-white py-2.5 font-headline font-bold text-xs uppercase border border-ink transition-transform active:scale-95"
                >
                  Shop Pay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCheckoutData({ email: 'user@gmail.com', firstName: 'Alex', lastName: 'K.', address: 'Kantstrasse 12', city: 'Berlin', postalCode: '10623', country: 'Germany' });
                    onShowToast('G-PAY CREDENTIALS IMPORTED');
                  }}
                  className="bg-paper-3 hover:bg-neutral-100 text-ink py-2.5 font-headline font-bold text-xs uppercase border border-ink transition-transform active:scale-95"
                >
                  G Pay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCheckoutData({ email: 'apple.user@icloud.com', firstName: 'Elena', lastName: 'V.', address: 'Friedrichstrasse 88', city: 'Berlin', postalCode: '10117', country: 'Germany' });
                    onShowToast('APPLE PAY AUTHORIZATION READY');
                  }}
                  className="bg-black hover:bg-neutral-800 text-white py-2.5 font-headline font-bold text-xs uppercase border border-ink transition-transform active:scale-95"
                >
                  Apple Pay
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t-2 border-ink w-full"></div>
              <span className="bg-paper px-3 font-mono text-xs uppercase text-[#888888] font-bold absolute">
                OR MANUAL DISPATCH REGISTRATION
              </span>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Contact Identifier */}
              <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
                <div className="flex justify-between items-center border-b border-ink/20 pb-2">
                  <h3 className="font-headline font-black text-sm uppercase">
                    01 // CONTACT IDENTIFIER
                  </h3>
                  <span className="font-mono text-[10px] text-[#888888]">ENCRYPTED DISPATCH LOG</span>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase font-bold block">
                    ELECTRONIC MAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={checkoutData.email}
                    onChange={(e) => onUpdateCheckoutData({ email: e.target.value })}
                    placeholder="architect@kraft-studio.de"
                    className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-none accent-ink border-2 border-ink"
                    defaultChecked
                  />
                  <span className="font-mono text-xs text-ink/80">
                    Subscribe to confidential batch manifests & archival drop alerts
                  </span>
                </label>
              </div>

              {/* Shipping Address */}
              <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
                <div className="flex justify-between items-center border-b border-ink/20 pb-2">
                  <h3 className="font-headline font-black text-sm uppercase">
                    02 // DISPATCH COORDINATES
                  </h3>
                  <span className="font-mono text-[10px] text-[#888888]">PHYSICAL GEOMETRY</span>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase font-bold block">
                    TERRITORY / JURISDICTION
                  </label>
                  <select
                    value={checkoutData.country}
                    onChange={(e) => onUpdateCheckoutData({ country: e.target.value })}
                    className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm font-bold focus:outline-none"
                  >
                    <option value="Germany">Germany (Federal Republic)</option>
                    <option value="Austria">Austria</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase font-bold block">
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      value={checkoutData.firstName}
                      onChange={(e) => onUpdateCheckoutData({ firstName: e.target.value })}
                      placeholder="Walter"
                      className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase font-bold block">
                      LAST NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.lastName}
                      onChange={(e) => onUpdateCheckoutData({ lastName: e.target.value })}
                      placeholder="Gropius"
                      className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase font-bold block">
                    STREET ADDRESS & HOUSE NUMBER *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutData.address}
                    onChange={(e) => onUpdateCheckoutData({ address: e.target.value })}
                    placeholder="Gropiusallee 38"
                    className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase font-bold block">
                    APARTMENT / ATELIER / STUDIO (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={checkoutData.apartment || ''}
                    onChange={(e) => onUpdateCheckoutData({ apartment: e.target.value })}
                    placeholder="Studio 4B, Meisterhaus"
                    className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase font-bold block">
                      POSTAL CODE *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.postalCode}
                      onChange={(e) => onUpdateCheckoutData({ postalCode: e.target.value })}
                      placeholder="06846"
                      className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-xs uppercase font-bold block">
                      CITY / METROPOLIS *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.city}
                      onChange={(e) => onUpdateCheckoutData({ city: e.target.value })}
                      placeholder="Dessau"
                      className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase font-bold block">
                    PHONE TELEMETRY (COURIER CONTACT)
                  </label>
                  <input
                    type="tel"
                    value={checkoutData.phone || ''}
                    onChange={(e) => onUpdateCheckoutData({ phone: e.target.value })}
                    placeholder="+49 30 12345678"
                    className="w-full bg-paper border-2 border-ink px-3 py-2.5 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
                  />
                </div>
              </div>

              {/* Dispatch Speed Tiers */}
              <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
                <div className="flex justify-between items-center border-b border-ink/20 pb-2">
                  <h3 className="font-headline font-black text-sm uppercase">
                    03 // DISPATCH SPEED TIER
                  </h3>
                  <span className="font-mono text-[10px] text-[#888888]">CARRIER PROTOCOL</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'standard',
                      title: 'DHL STANDARD COURIER',
                      time: '3–5 BUSINESS DAYS',
                      price: 'COMPLIMENTARY (€0.00)',
                      code: 'STD_NET_01',
                    },
                    {
                      id: 'priority',
                      title: 'PRIORITY BAUHAUS COURIER',
                      time: '1–2 BUSINESS DAYS',
                      price: '+€15.00',
                      code: 'PRIO_AIR_02',
                    },
                    {
                      id: 'express',
                      title: 'DEDICATED SAME-DAY / NEXT-DAY FLIGHT',
                      time: 'GUARANTEED 24HR WINDOW',
                      price: '+€25.00',
                      code: 'EXPR_SUP_03',
                    },
                  ].map((tier) => (
                    <label
                      key={tier.id}
                      onClick={() => onUpdateCheckoutData({ dispatchSpeed: tier.id as any })}
                      className={`block p-3 border-2 cursor-pointer transition-all ${
                        checkoutData.dispatchSpeed === tier.id
                          ? 'border-ink bg-[#ffcc00]/30 shadow-[3px_3px_0px_var(--color-ink)]'
                          : 'border-ink/30 bg-paper hover:border-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="dispatchTier"
                            checked={checkoutData.dispatchSpeed === tier.id}
                            onChange={() => onUpdateCheckoutData({ dispatchSpeed: tier.id as any })}
                            className="w-4 h-4 accent-ink"
                          />
                          <div>
                            <div className="font-headline font-bold text-xs uppercase">{tier.title}</div>
                            <div className="font-mono text-[10px] text-[#888888]">{tier.time} // {tier.code}</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-xs">{tier.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <button
                type="submit"
                className="w-full bg-panel text-[#ffcc00] hover:bg-[#e63b2e] hover:text-[#f5f0eb] py-4 font-headline font-black text-sm uppercase tracking-wider border-2 border-ink shadow-[6px_6px_0px_var(--color-ink)] transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-3"
              >
                <span>CONTINUE TO PAYMENT PROTOCOL</span>
                <span>→</span>
              </button>
            </form>

          </div>

          {/* RIGHT: Live Manifest Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-paper-2 border-4 border-ink p-6 shadow-[8px_8px_0px_var(--color-ink)] space-y-6 sticky top-24">
              <div className="border-b-2 border-ink pb-3 flex justify-between items-center">
                <h3 className="font-headline font-black text-base uppercase">
                  DISPATCH MANIFEST SUMMARY
                </h3>
                <span className="font-mono text-xs bg-panel text-[#ffcc00] px-2 py-0.5">
                  {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
                </span>
              </div>

              {/* Cart items list */}
              <div className="divide-y divide-ink/20 max-h-72 overflow-y-auto pr-1">
                {cart.map((item, index) => {
                  const itemTitle = item.title || item.product?.title || 'SPECIMEN';
                  const itemCode = item.sku || item.product?.code || 'PRT_ITEM';
                  const itemImage = item.image || item.product?.image || '';
                  const itemPrice = item.priceEUR || item.price || item.product?.priceEUR || 0;
                  const itemSize = item.size || item.selectedSize || 'M';
                  const itemColor = item.color || item.selectedColor || 'BLACK';

                  return (
                    <div key={`${item.id || item.productId || index}-${index}`} className="py-3 flex gap-3 items-center">
                      <div className="relative w-14 h-16 border-2 border-ink bg-paper shrink-0">
                        <img
                          src={itemImage}
                          alt={itemTitle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute -top-2 -right-2 bg-panel text-[#ffcc00] font-mono font-bold text-[10px] w-5 h-5 flex items-center justify-center border border-[#ffcc00]">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] text-[#888888]">{itemCode}</div>
                        <h4 className="font-headline font-bold text-xs truncate">{itemTitle}</h4>
                        <div className="font-mono text-[10px] text-[#888888]">
                          SIZE: {itemSize} | {itemColor}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-xs shrink-0">
                        {formatPrice(itemPrice * item.quantity, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="VOUCHER (e.g. BAUHAUS10)"
                    className="flex-1 bg-paper border-2 border-ink px-3 py-2 font-mono text-xs uppercase focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-panel text-[#f5f0eb] hover:bg-[#ffcc00] hover:text-[#1a1a1a] px-3 py-2 font-mono font-bold text-xs border-2 border-ink transition-colors"
                  >
                    APPLY
                  </button>
                </div>
                {promoApplied && (
                  <div className="text-[10px] font-mono text-[#047857] mt-1 font-bold">
                    ✓ 10% ARCHIVAL COURTESY DEDUCTED
                  </div>
                )}
              </form>

              {/* Pricing breakdown */}
              <div className="border-t-2 border-ink pt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888888]">SUBTOTAL:</span>
                  <span className="font-bold">{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#e63b2e]">
                    <span>PROMO DEDUCTION:</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#888888]">DISPATCH FREIGHT:</span>
                  <span className="font-bold">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">TAX (INCL. 19% VAT):</span>
                  <span className="font-bold">{formatPrice(Math.round(grandTotal * VAT_RATE), currency)}</span>
                </div>

                <div className="border-t-2 border-ink pt-3 flex justify-between items-baseline">
                  <span className="font-headline font-black text-sm uppercase">ESTIMATED TOTAL:</span>
                  <span className="font-mono font-black text-2xl text-ink">
                    {formatPrice(grandTotal, currency)}
                  </span>
                </div>
              </div>

              <div className="border-t border-ink/20 pt-2 text-[10px] font-mono text-[#888888] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  <span>AES-256 ENCRYPTED TRANSACTION TUNNEL</span>
                </div>
                <div>DISPATCH FACILITY: BERLIN WEST WAREHOUSE (DE)</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
