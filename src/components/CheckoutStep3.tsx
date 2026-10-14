import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { CartItem, Currency, CheckoutData, Page } from '../types';
import { formatPrice } from '../data/mockData';
import { dispatchShippingPreview } from '../config';

interface CheckoutStep3Props {
  orderItems: CartItem[];
  currency: Currency;
  checkoutData: CheckoutData;
  orderNumber: string;
  orderTotal?: number;
  onNavigate?: (page: Page) => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutStep3: React.FC<CheckoutStep3Props> = ({
  orderItems,
  currency,
  checkoutData,
  orderNumber,
  orderTotal,
  onShowToast,
}) => {
  const itemsSubtotal = orderItems.reduce((sum, item) => sum + (item.priceEUR || item.price || (item.product?.priceEUR ?? 0)) * item.quantity, 0);
  const shippingCost = dispatchShippingPreview(checkoutData.dispatchSpeed);
  const total = orderTotal ?? itemsSubtotal + shippingCost;

  const handlePrint = () => {
    window.print();
    onShowToast('PRINT DIALOG INITIATED FOR ARCHIVE INVOICE');
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-[#ffcc00] selection:text-[#1a1a1a] pb-24">
      {/* Top Banner */}
      <div className="border-b-2 border-ink bg-panel text-[#f5f0eb] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-headline font-black text-xl tracking-tighter text-[#ffcc00]">KRAFT*</span>
          <span className="font-mono text-xs tracking-widest uppercase text-[#888888] hidden sm:inline">
            // PROTOCOL CONFIRMATION VAULT
          </span>
        </div>
        <Link
          to={ROUTES.home}
          className="font-mono text-xs uppercase hover:text-[#ffcc00] flex items-center gap-1"
        >
          RETURN TO HOME →
        </Link>
      </div>

      {/* Stepper Header */}
      <div className="border-b-2 border-ink bg-paper-2 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#10b981] animate-pulse"></span>
            <span className="font-bold">STAGE 03 // DISPATCH PIPELINE ACTIVATED</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-[#888888]">
              <span>01</span>
              <span>INFORMATION</span>
            </div>
            <span className="text-[#888888]">───</span>
            <div className="flex items-center gap-2 text-[#888888]">
              <span>02</span>
              <span>PAYMENT</span>
            </div>
            <span className="text-[#888888]">───</span>
            <div className="flex items-center gap-2 font-bold text-[#1a1a1a] bg-[#10b981] text-[#f5f0eb] px-2.5 py-1 border border-ink">
              <span>03</span>
              <span>CONFIRMED ✓</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
        
        {/* Main Status Hero */}
        <div className="bg-paper-2 border-4 border-ink p-6 md:p-8 shadow-[8px_8px_0px_var(--color-ink)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 bg-[#10b981] rounded-full inline-block animate-ping"></span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#047857] font-bold">
                  TRANSACTION VERIFIED & LOGGED
                </span>
              </div>
              <h1 className="font-headline font-black text-2xl sm:text-4xl uppercase tracking-tight">
                ACQUISITION PROTOCOL CONFIRMED
              </h1>
            </div>

            <div className="bg-panel text-[#ffcc00] p-3 text-right font-mono border-2 border-ink shrink-0">
              <span className="text-[10px] text-[#888888] block uppercase">MANIFEST IDENTIFIER</span>
              <span className="font-black text-base md:text-lg tracking-wider">{orderNumber}</span>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed text-ink/90">
            A confirmation telemetry document and fiscal receipt have been transmitted to{' '}
            <strong className="font-mono text-[#0055ff]">{checkoutData.email || 'collector@kraft-studio.de'}</strong>.
            The archival specimens have been reserved and routed to the Berlin packing station.
          </p>

          {/* 4-Stage Dispatch Pipeline */}
          <div className="space-y-3 pt-2">
            <span className="font-mono text-xs uppercase font-bold text-[#888888] block">
              REAL-TIME DISPATCH STATUS PIPELINE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="bg-panel text-[#f5f0eb] p-3 border border-ink font-mono text-xs">
                <div className="text-[#10b981] font-bold mb-1">✓ STAGE 01</div>
                <div className="font-bold text-[11px] uppercase">ORDER RECORDED</div>
                <div className="text-[9px] text-[#888888]">PAYMENT SECURED</div>
              </div>

              <div className="bg-[#ffcc00] text-[#1a1a1a] p-3 border-2 border-ink font-mono text-xs font-bold shadow-[2px_2px_0px_var(--color-ink)]">
                <div className="text-ink font-black mb-1">● STAGE 02 [IN PROGRESS]</div>
                <div className="font-bold text-[11px] uppercase">SPECIMEN INSPECTION</div>
                <div className="text-[9px] text-ink/80">QUALITY AUDIT BERLIN</div>
              </div>

              <div className="bg-paper text-[#888888] p-3 border border-ink/30 font-mono text-xs">
                <div className="mb-1">○ STAGE 03</div>
                <div className="font-bold text-[11px] uppercase text-ink/60">CARRIER DISPATCH</div>
                <div className="text-[9px]">DHL AIRWAY BILL PENDING</div>
              </div>

              <div className="bg-paper text-[#888888] p-3 border border-ink/30 font-mono text-xs">
                <div className="mb-1">○ STAGE 04</div>
                <div className="font-bold text-[11px] uppercase text-ink/60">DELIVERED</div>
                <div className="text-[9px]">DESTINATION ATELIER</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Dispatch Coordinates & Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] font-mono text-xs space-y-3">
            <h3 className="font-headline font-black text-xs uppercase border-b border-ink/20 pb-2">
              DISPATCH DESTINATION
            </h3>
            <div className="text-sm font-bold text-ink">
              {checkoutData.firstName} {checkoutData.lastName || 'Walter Gropius'}
            </div>
            <div className="text-ink/80 leading-relaxed">
              {checkoutData.address || 'Gropiusallee 38'}
              {checkoutData.apartment && <div>{checkoutData.apartment}</div>}
              <div>{checkoutData.postalCode || '06846'} {checkoutData.city || 'Dessau'}</div>
              <div>{checkoutData.country || 'Germany'}</div>
              {checkoutData.phone && <div className="pt-1 text-[#888888]">TEL: {checkoutData.phone}</div>}
            </div>
            <div className="pt-2 border-t border-ink/20 text-[10px] text-[#888888]">
              COURIER PROTOCOL: {(checkoutData.dispatchSpeed || 'standard').toUpperCase()} SPEED TIER
            </div>
          </div>

          <div className="bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] font-mono text-xs space-y-3">
            <h3 className="font-headline font-black text-xs uppercase border-b border-ink/20 pb-2">
              FINANCIAL SETTLEMENT
            </h3>
            <div className="flex justify-between">
              <span className="text-[#888888]">GATEWAY:</span>
              <span className="font-bold uppercase">{checkoutData.paymentMethod || 'CARD'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">SETTLEMENT AMOUNT:</span>
              <span className="font-bold text-sm">{formatPrice(total, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888888]">STATUS:</span>
              <span className="text-[#047857] font-bold">PAID & SETTLED</span>
            </div>
            <div className="pt-2 border-t border-ink/20 text-[10px] text-[#888888]">
              FISCAL TRANSACTION REF: TX_BAU_{Math.floor(100000 + Math.random() * 900000)}
            </div>
          </div>
        </div>

        {/* Order Items Specification List */}
        <div className="bg-paper-2 border-2 border-ink p-6 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
          <h3 className="font-headline font-black text-xs uppercase border-b border-ink/20 pb-2">
            ACQUIRED ARCHIVAL SPECIMENS
          </h3>

          <div className="divide-y divide-ink/20">
            {orderItems.map((item, idx) => {
              const itemTitle = item.title || item.product?.title || 'SPECIMEN';
              const itemCode = item.sku || item.product?.code || 'PRT_ITEM';
              const itemImage = item.image || item.product?.image || '';
              const itemPrice = item.priceEUR || item.price || item.product?.priceEUR || 0;
              const itemSize = item.size || item.selectedSize || 'M';
              const itemColor = item.color || item.selectedColor || 'BLACK';

              return (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="w-16 h-20 border-2 border-ink object-cover bg-paper shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] text-[#888888]">{itemCode}</span>
                    <h4 className="font-headline font-bold text-sm truncate">{itemTitle}</h4>
                    <div className="font-mono text-xs text-[#888888] mt-0.5">
                      SIZE: <strong className="text-ink">{itemSize}</strong> | COLOR: <strong className="text-ink">{itemColor}</strong> | QTY: <strong className="text-ink">{item.quantity}</strong>
                    </div>
                    <div className="font-mono text-[11px] text-[#888888] mt-1">
                      SPEC: {item.product?.specWeight || '480 GSM'} // {item.product?.substrate || item.product?.material || 'WOOL'}
                    </div>
                  </div>
                  <div className="font-mono font-black text-sm shrink-0">
                    {formatPrice(itemPrice * item.quantity, currency)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t-2 border-ink pt-4 flex justify-between items-baseline font-mono">
            <span className="font-headline font-black text-sm uppercase">TOTAL SETTLED:</span>
            <span className="font-black text-2xl text-ink">
              {formatPrice(total, currency)}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-paper-2 hover:bg-[#ffcc00] text-ink hover:text-[#1a1a1a] border-2 border-ink py-3.5 font-headline font-bold text-xs uppercase shadow-[4px_4px_0px_var(--color-ink)] transition-all flex items-center justify-center gap-2"
          >
            <span>⎙</span> PRINT FISCAL INVOICE & MANIFEST
          </button>

          <Link
            to={ROUTES.shop}
            className="flex-1 bg-panel hover:bg-[#e63b2e] text-[#f5f0eb] border-2 border-ink py-3.5 font-headline font-bold text-xs uppercase shadow-[4px_4px_0px_var(--color-ink)] transition-all flex items-center justify-center gap-2"
          >
            CONTINUE ARCHIVE BROWSING →
          </Link>
        </div>

      </div>
    </div>
  );
};
