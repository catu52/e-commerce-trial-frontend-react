import React, { useState } from 'react';
import { CartItem, Currency, CheckoutData } from '../types';
import { formatPrice } from '../data/mockData';
import { dispatchShippingPreview, VAT_RATE } from '../config';

interface CheckoutStep2Props {
  cart: CartItem[];
  currency: Currency;
  checkoutData: CheckoutData;
  onUpdateCheckoutData: (data: Partial<CheckoutData>) => void;
  onNext: (data?: Partial<CheckoutData>) => void | Promise<void>;
  onBack: () => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutStep2: React.FC<CheckoutStep2Props> = ({
  cart,
  currency,
  checkoutData,
  onUpdateCheckoutData,
  onNext,
  onBack,
  onShowToast,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'klarna' | 'paypal' | 'sepa'>(
    checkoutData.paymentMethod || 'card'
  );
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('941');
  const [cardName, setCardName] = useState(`${checkoutData.firstName} ${checkoutData.lastName}`.trim() || 'WALTER GROPIUS');
  const [sameBilling, setSameBilling] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.priceEUR || item.price || (item.product?.priceEUR ?? 0)) * item.quantity, 0);
  const shippingCost = dispatchShippingPreview(checkoutData.dispatchSpeed);
  const grandTotal = subtotal + shippingCost;

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    onShowToast('TRANSMITTING FINANCIAL AUTHORIZATION TOKEN...');
    onUpdateCheckoutData({ paymentMethod: selectedMethod });
    try {
      await onNext({ paymentMethod: selectedMethod });
    } catch (err) {
      const msg = err instanceof Error ? (err as { detail?: string }).detail || err.message : 'ORDER FAILED';
      onShowToast(`ORDER REJECTED: ${msg}`.toUpperCase());
    } finally {
      setIsProcessing(false);
    }
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
          onClick={onBack}
          className="font-mono text-xs uppercase hover:text-[#ffcc00] flex items-center gap-1"
        >
          ← EDIT DISPATCH
        </button>
      </div>

      {/* Stepper Header */}
      <div className="border-b-2 border-ink bg-paper-2 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#0055ff] animate-pulse"></span>
            <span className="font-bold">STAGE 02 // FINANCIAL SETTLEMENT & CLEARANCE</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-[#888888]">
              <span>01</span>
              <span>INFORMATION</span>
            </div>
            <span className="text-[#888888]">───</span>
            <div className="flex items-center gap-2 font-bold text-[#1a1a1a] bg-[#ffcc00] px-2.5 py-1 border border-ink">
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Payment Options Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Information Review Snippet */}
            <div className="bg-paper-2 border-2 border-ink divide-y divide-ink/20 font-mono text-xs">
              <div className="p-3 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="text-[#888888] w-20">CONTACT:</span>
                  <span className="font-bold">{checkoutData.email || 'collector@kraft-studio.de'}</span>
                </div>
                <button onClick={onBack} className="text-[#0055ff] hover:underline uppercase text-[10px] font-bold">
                  CHANGE
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="text-[#888888] w-20">DISPATCH TO:</span>
                  <span className="font-bold truncate max-w-xs sm:max-w-md">
                    {checkoutData.address || checkoutData.address1 || 'Bauhausstrasse 4'}, {checkoutData.postalCode} {checkoutData.city}, {checkoutData.country}
                  </span>
                </div>
                <button onClick={onBack} className="text-[#0055ff] hover:underline uppercase text-[10px] font-bold">
                  CHANGE
                </button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="text-[#888888] w-20">SPEED TIER:</span>
                  <span className="font-bold uppercase">
                    {checkoutData.dispatchSpeed === 'express' ? 'GUARANTEED 24HR FLIGHT' : checkoutData.dispatchSpeed === 'priority' ? 'PRIORITY BAUHAUS COURIER' : 'DHL STANDARD COURIER'}
                  </span>
                </div>
                <button onClick={onBack} className="text-[#0055ff] hover:underline uppercase text-[10px] font-bold">
                  CHANGE
                </button>
              </div>
            </div>

            {/* Payment Method Selector Stack */}
            <form onSubmit={handleAuthorize} className="space-y-6">
              <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
                <div className="flex justify-between items-center border-b border-ink/20 pb-2">
                  <h3 className="font-headline font-black text-sm uppercase">
                    PAYMENT ARCHITECTURE
                  </h3>
                  <span className="font-mono text-[10px] text-[#888888]">SECURE TOKEN GATEWAY</span>
                </div>

                {/* Option 1: Credit / Debit Card */}
                <div className={`border-2 transition-all ${
                  selectedMethod === 'card' ? 'border-ink bg-paper' : 'border-ink/30 bg-transparent'
                }`}>
                  <label
                    onClick={() => setSelectedMethod('card')}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedMethod === 'card'}
                        onChange={() => setSelectedMethod('card')}
                        className="w-4 h-4 accent-ink"
                      />
                      <span className="font-headline font-bold text-xs uppercase">
                        CREDIT / DEBIT CARD (VISA, MC, AMEX)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="bg-panel text-white px-1.5 py-0.5 font-mono text-[9px] font-bold">VISA</span>
                      <span className="bg-[#e63b2e] text-white px-1.5 py-0.5 font-mono text-[9px] font-bold">MC</span>
                      <span className="bg-[#0055ff] text-white px-1.5 py-0.5 font-mono text-[9px] font-bold">AMEX</span>
                    </div>
                  </label>

                  {selectedMethod === 'card' && (
                    <div className="p-4 border-t-2 border-ink bg-paper-2 space-y-3 font-mono text-xs">
                      <div>
                        <label className="block font-bold mb-1 uppercase text-[11px]">CARD NUMBER</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                          className="w-full bg-paper border-2 border-ink p-2.5 focus:outline-none focus:bg-[#ffcc00]/20 font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1 uppercase text-[11px]">EXPIRY (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-paper border-2 border-ink p-2.5 focus:outline-none font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 uppercase text-[11px]">SECURITY CVC</label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="CVC"
                            className="w-full bg-paper border-2 border-ink p-2.5 focus:outline-none font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold mb-1 uppercase text-[11px]">CARDHOLDER LEGAL NAME</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="WALTER GROPIUS"
                          className="w-full bg-paper border-2 border-ink p-2.5 focus:outline-none font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Klarna */}
                <div className={`border-2 transition-all ${
                  selectedMethod === 'klarna' ? 'border-ink bg-paper' : 'border-ink/30 bg-transparent'
                }`}>
                  <label
                    onClick={() => setSelectedMethod('klarna')}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedMethod === 'klarna'}
                        onChange={() => setSelectedMethod('klarna')}
                        className="w-4 h-4 accent-ink"
                      />
                      <span className="font-headline font-bold text-xs uppercase">
                        KLARNA // SLICE IN 3 OR PAY IN 30 DAYS
                      </span>
                    </div>
                    <span className="bg-[#ffb3c7] text-[#1a1a1a] font-bold px-2 py-0.5 text-[10px] font-mono">
                      Klarna.
                    </span>
                  </label>
                  {selectedMethod === 'klarna' && (
                    <div className="p-4 border-t-2 border-ink bg-paper-2 font-mono text-xs text-ink/80">
                      Payment split into 3 monthly installments of {formatPrice(Math.round(grandTotal / 3), currency)} with 0% APR. You will be seamlessly redirected for authorization.
                    </div>
                  )}
                </div>

                {/* Option 3: PayPal */}
                <div className={`border-2 transition-all ${
                  selectedMethod === 'paypal' ? 'border-ink bg-paper' : 'border-ink/30 bg-transparent'
                }`}>
                  <label
                    onClick={() => setSelectedMethod('paypal')}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedMethod === 'paypal'}
                        onChange={() => setSelectedMethod('paypal')}
                        className="w-4 h-4 accent-ink"
                      />
                      <span className="font-headline font-bold text-xs uppercase">
                        PAYPAL EXPRESS GATEWAY
                      </span>
                    </div>
                    <span className="bg-[#003087] text-white font-bold px-2 py-0.5 text-[10px] font-mono">
                      PayPal
                    </span>
                  </label>
                </div>

                {/* Option 4: SEPA Direct Debit */}
                <div className={`border-2 transition-all ${
                  selectedMethod === 'sepa' ? 'border-ink bg-paper' : 'border-ink/30 bg-transparent'
                }`}>
                  <label
                    onClick={() => setSelectedMethod('sepa')}
                    className="p-3 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedMethod === 'sepa'}
                        onChange={() => setSelectedMethod('sepa')}
                        className="w-4 h-4 accent-ink"
                      />
                      <span className="font-headline font-bold text-xs uppercase">
                        SEPA DIRECT DEBIT (EU BANKS)
                      </span>
                    </div>
                    <span className="bg-panel text-[#ffcc00] font-bold px-2 py-0.5 text-[10px] font-mono">
                      SEPA
                    </span>
                  </label>
                  {selectedMethod === 'sepa' && (
                    <div className="p-4 border-t-2 border-ink bg-paper-2 space-y-2 font-mono text-xs">
                      <div>
                        <label className="block font-bold mb-1">IBAN NUMBER</label>
                        <input
                          type="text"
                          defaultValue="DE89 3704 0044 0532 0130 00"
                          className="w-full bg-paper border-2 border-ink p-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Billing Address Selection */}
              <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-3 font-mono text-xs">
                <h4 className="font-headline font-black text-xs uppercase border-b border-ink/20 pb-2">
                  BILLING ADDRESS RECORD
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="billing"
                    checked={sameBilling}
                    onChange={() => setSameBilling(true)}
                    className="w-4 h-4 accent-ink"
                  />
                  <span>Same as dispatch coordinates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="billing"
                    checked={!sameBilling}
                    onChange={() => setSameBilling(false)}
                    className="w-4 h-4 accent-ink"
                  />
                  <span>Specify alternative corporate / institutional billing address</span>
                </label>
              </div>

              {/* Security Credentials */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] px-1">
                <span>🔒 PCI DSS LEVEL 1 CERTIFIED</span>
                <span>BAUHAUS 30-DAY ASSURANCE</span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#e63b2e] hover:bg-panel text-[#f5f0eb] py-4 font-headline font-black text-sm uppercase tracking-wider border-2 border-ink shadow-[6px_6px_0px_var(--color-ink)] transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>AUTHORIZING FINANCIAL RECORD...</span>
                ) : (
                  <>
                    <span>AUTHORIZE PAYMENT & COMPLETE ORDER</span>
                    <span>[{formatPrice(grandTotal, currency)}]</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-paper-2 border-4 border-ink p-6 shadow-[8px_8px_0px_var(--color-ink)] space-y-6 sticky top-24">
              <div className="border-b-2 border-ink pb-3 flex justify-between items-center">
                <h3 className="font-headline font-black text-base uppercase">
                  ORDER ACQUISITION SUMMARY
                </h3>
                <span className="font-mono text-xs bg-panel text-[#ffcc00] px-2 py-0.5">
                  {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
                </span>
              </div>

              <div className="divide-y divide-ink/20 max-h-72 overflow-y-auto pr-1">
                {cart.map((item, index) => {
                  const itemTitle = item.title || item.product?.title || 'SPECIMEN';
                  const itemCode = item.sku || item.product?.code || 'PRT_ITEM';
                  const itemImage = item.image || item.product?.image || '';
                  const itemPrice = item.priceEUR || item.price || item.product?.priceEUR || 0;
                  const itemSize = item.size || item.selectedSize || 'M';

                  return (
                    <div key={`${item.id || item.productId || index}-${index}`} className="py-3 flex gap-3 items-center">
                      <img
                        src={itemImage}
                        alt={itemTitle}
                        className="w-14 h-16 border-2 border-ink object-cover bg-paper shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] text-[#888888]">{itemCode}</div>
                        <h4 className="font-headline font-bold text-xs truncate">{itemTitle}</h4>
                        <div className="font-mono text-[10px] text-[#888888]">
                          QTY: {item.quantity} | {itemSize}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-xs shrink-0">
                        {formatPrice(itemPrice * item.quantity, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-ink pt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#888888]">SUBTOTAL:</span>
                  <span className="font-bold">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">DISPATCH FREIGHT:</span>
                  <span className="font-bold">
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">INCLUDED TAX (19%):</span>
                  <span className="font-bold">{formatPrice(Math.round(grandTotal * VAT_RATE), currency)}</span>
                </div>

                <div className="border-t-2 border-ink pt-3 flex justify-between items-baseline">
                  <span className="font-headline font-black text-sm uppercase">FINAL CHARGE:</span>
                  <span className="font-mono font-black text-2xl text-ink">
                    {formatPrice(grandTotal, currency)}
                  </span>
                </div>
              </div>

              <div className="bg-paper border-2 border-ink p-3 text-[11px] font-mono space-y-1">
                <div className="font-bold text-[#0055ff]">ARCHIVAL DISPATCH NOTICE:</div>
                <p className="text-ink/80 leading-tight">
                  Upon authorization, serial number certification papers will be printed and enclosed with physical garment package.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
