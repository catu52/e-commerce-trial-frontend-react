import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Product, Currency, Review } from '../types';
import { formatPrice, MOCK_REVIEWS } from '../data/mockData';
import { SaleBadge, SalePrice } from './SalePrice';

interface PDPScreenProps {
  product: Product;
  currency: Currency;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
  onSelectProduct?: (product: Product) => void;
  allProducts: Product[];
  onOpenCart: () => void;
  onShowToast: (msg: string) => void;
}

export const PDPScreen: React.FC<PDPScreenProps> = ({
  product,
  currency,
  onAddToCart,
  allProducts,
  onOpenCart: _onOpenCart,
  onShowToast,
}) => {
  const availableSizes = product.sizesAvailable || product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const availableColors = product.colorsAvailable || (product.colorHexList
    ? product.colorHexList.map((hex, i) => ({ name: i === 0 ? product.colorway : `COLOR_${i + 1}`, hex }))
    : [{ name: product.colorway || 'BLACK', hex: '#1a1a1a' }]);

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[2] || availableSizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]?.name || product.colorway || 'PITCH BLACK');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [selectedReviewPhoto, setSelectedReviewPhoto] = useState<string | null>(null);
  const [reviewHelpfulCounts, setReviewHelpfulCounts] = useState<{ [id: string]: number }>({
    'rev-01': 42,
    'rev-02': 19,
    'rev-03': 11,
  });
  const [votedReviews, setVotedReviews] = useState<{ [id: string]: boolean }>({});
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const priceValue = product.priceEUR || product.price || 260;
  const materialName = product.material || product.substrate || '480 GSM Double-Faced Wool';

  // Fallback images if product doesn't have many
  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
    onShowToast(`ACQUISITION LOGGED: ${product.title} [SIZE ${selectedSize}]`);
  };

  const handleVoteHelpful = (reviewId: string) => {
    if (votedReviews[reviewId]) {
      setReviewHelpfulCounts(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 1) - 1 }));
      setVotedReviews(prev => ({ ...prev, [reviewId]: false }));
    } else {
      setReviewHelpfulCounts(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }));
      setVotedReviews(prev => ({ ...prev, [reviewId]: true }));
      onShowToast('AUDIT VOTE REGISTERED (+1)');
    }
  };

  const completeTheLookItems = allProducts.filter(p => p.id !== product.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-[#ffcc00] selection:text-[#1a1a1a] pb-24 md:pb-16">
      {/* Breadcrumb / Spec Registry Header */}
      <div className="border-b-2 border-ink bg-paper-2 px-4 md:px-8 py-2.5 text-xs font-mono uppercase tracking-widest flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#888888]">CATALOG / ARCHIVE /</span>
          <span className="font-bold bg-panel text-[#f5f0eb] px-1.5 py-0.5">{product.code}</span>
          <span className="font-bold tracking-tight">{product.title}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] md:text-xs">
          <span className="hidden sm:inline">BATCH: 2026_Q1</span>
          <span className="hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            DISPATCH PROTOCOL ACTIVE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Hi-Res Architectural Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative border-4 border-ink bg-paper-2 overflow-hidden aspect-[4/5] shadow-[8px_8px_0px_var(--color-ink)]">
              <img
                src={images[activeImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {/* Technical corner tags */}
              <div className="absolute top-4 left-4 bg-panel text-[#ffcc00] font-mono text-[11px] font-black px-2 py-1 tracking-wider border border-[#ffcc00]/30 uppercase">
                FIG_{String(activeImageIndex + 1).padStart(2, '0')} // HIGH-RES AUDIT
              </div>
              <div className="absolute top-4 right-4 bg-paper text-ink border-2 border-ink font-mono text-[10px] font-bold px-2 py-0.5">
                {product.specWeight || '480 GSM'}
              </div>

              {/* Wishlist button */}
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  onShowToast(!isWishlisted ? 'SPECIMEN ADDED TO ARCHIVE RECORD' : 'SPECIMEN REMOVED');
                }}
                className={`absolute bottom-4 right-4 w-12 h-12 border-2 border-ink flex items-center justify-center font-bold text-lg transition-transform active:scale-95 ${
                  isWishlisted ? 'bg-[#e63b2e] text-[#f5f0eb]' : 'bg-paper text-[#1a1a1a] hover:bg-[#ffcc00]'
                }`}
                title="Save Specimen"
              >
                {isWishlisted ? '★' : '☆'}
              </button>

              {/* Status pill */}
              <div className="absolute bottom-4 left-4 bg-panel/90 text-[#f5f0eb] backdrop-blur-xs font-mono text-[10px] px-2 py-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                <span>INSPECTION VERIFIED / {materialName}</span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative border-2 border-ink aspect-square overflow-hidden bg-paper-2 transition-all ${
                    activeImageIndex === idx
                      ? 'ring-4 ring-ink shadow-[4px_4px_0px_var(--color-ink)]'
                      : 'opacity-70 hover:opacity-100 hover:border-[#0055ff]'
                  }`}
                >
                  <img src={imgUrl} alt={`${product.title} – view ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-panel text-[#f5f0eb] font-mono text-[9px] px-1 font-bold">
                    0{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            {/* Complete The Look Section */}
            <div className="mt-12 pt-8 border-t-2 border-ink">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#e63b2e]"></span>
                  SYSTEM COMPATIBILITY // COMPLETE THE LOOK
                </h2>
                <span className="font-mono text-xs text-[#888888]">SYNERGISTIC APPAREL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completeTheLookItems.map(item => (
                  <Link
                    key={item.id}
                    to={ROUTES.product(item.slug)}
                    className="border-2 border-ink bg-paper-2 p-3 flex gap-3 cursor-pointer hover:bg-[#ffcc00]/15 hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all group"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-20 h-24 object-cover border border-ink bg-paper shrink-0"
                    />
                    <div className="flex flex-col justify-between overflow-hidden">
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase block">{item.code}</span>
                        <h3 className="font-headline font-bold text-xs leading-tight line-clamp-2 group-hover:text-[#0055ff] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/20">
                        <span className="font-mono font-black text-xs">{formatPrice(item.priceEUR || item.price || 0, currency)}</span>
                        <span className="text-[10px] font-mono font-bold bg-panel text-[#f5f0eb] px-1.5 py-0.5">
                          VIEW →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Specimen Specifications & Purchase Protocol */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Archival Classification */}
            <div className="border-b-2 border-ink pb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-panel text-[#ffcc00] font-mono text-xs font-black px-2 py-0.5">
                  {product.code}
                </span>
                <span className="font-mono text-xs text-[#888888] uppercase">
                  ARCHIVAL SPECIFICATION // BATCH_KFT_94
                </span>
              </div>
              <h1 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-ink leading-none">
                {product.title}
              </h1>
              <div className="flex items-baseline justify-between pt-2">
                <div className="font-mono font-black text-3xl text-ink flex items-baseline gap-3">
                  <SalePrice product={product} currency={currency} price={priceValue} />
                  <SaleBadge product={product} />
                </div>
                <span className="font-mono text-xs text-[#888888]">VAT INCLUDED / IMPORT CLEARED</span>
              </div>
            </div>

            {/* Editorial Description */}
            <div className="space-y-3 font-body text-sm leading-relaxed text-ink/90">
              {product.headline && (
                <p className="font-headline font-black text-lg uppercase text-ink">{product.headline}</p>
              )}
              <p>{product.description}</p>
              {product.longDescription && (
                <p className="whitespace-pre-line">{product.longDescription}</p>
              )}
              {product.careInstructions && (
                <div className="bg-paper-2 border-2 border-ink p-3 text-xs font-mono">
                  <span className="font-bold uppercase block mb-1">CARE INSTRUCTIONS:</span>
                  <span className="whitespace-pre-line">{product.careInstructions}</span>
                </div>
              )}
              <div className="bg-paper-2 border-l-4 border-[#0055ff] p-3 text-xs font-mono">
                <span className="font-bold text-[#0055ff] uppercase block mb-1">ARCHITECTURAL DESIGN INTENT:</span>
                Engineered with high-twist structured woven architecture to maintain geometric volume regardless of posture or elemental load.
              </div>
            </div>

            {/* Colorway Selection */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-mono uppercase">
                <span className="font-bold">COLOR SPECIFICATION:</span>
                <span className="text-[#888888] font-bold">{selectedColor}</span>
              </div>
              <div className="flex gap-2.5">
                {availableColors.map((colorObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(colorObj.name)}
                    className={`group relative p-1 border-2 transition-all ${
                      selectedColor === colorObj.name
                        ? 'border-ink ring-2 ring-ink bg-paper shadow-[2px_2px_0px_var(--color-ink)]'
                        : 'border-ink/40 hover:border-ink'
                    }`}
                    title={colorObj.name}
                  >
                    <span
                      className="block w-8 h-8 border border-ink/30"
                      style={{ backgroundColor: colorObj.hex }}
                    />
                    <span className="sr-only">{colorObj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector + Size Guide Modal Trigger */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-mono uppercase">
                <span className="font-bold">PROPORTION / SIZE:</span>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-[#0055ff] hover:underline font-bold flex items-center gap-1"
                >
                  <span className="w-3.5 h-3.5 border border-[#0055ff] rounded-full inline-flex items-center justify-center text-[9px]">?</span>
                  METRIC MATRIX & SIZE GUIDE
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 border-2 border-ink font-mono font-black text-sm uppercase transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-panel text-[#f5f0eb] shadow-[3px_3px_0px_#ffcc00]'
                          : 'bg-paper-2 text-ink hover:text-[#1a1a1a] hover:bg-[#ffcc00]/30 hover:shadow-[2px_2px_0px_var(--color-ink)]'
                      }`}
                    >
                      <span>{size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fit Gauge */}
            <div className="bg-paper-2 border-2 border-ink p-3 space-y-2">
              <div className="flex justify-between text-[11px] font-mono uppercase font-bold">
                <span>FIT PROFILE:</span>
                <span className="text-[#0055ff]">BOXY / STRUCTURED OVERSIZED</span>
              </div>
              <div className="grid grid-cols-3 gap-1 h-2 bg-[#d8d2cb] border border-ink/40 p-0.5">
                <div className="bg-transparent text-center text-[8px] font-mono text-[#888888]">SLIM</div>
                <div className="bg-transparent text-center text-[8px] font-mono text-[#888888]">REGULAR</div>
                <div className="bg-[#0055ff] h-full"></div>
              </div>
              <div className="text-[10px] font-mono text-[#888888] flex justify-between">
                <span>FORM-FITTING</span>
                <span>NEUTRAL</span>
                <span className="font-bold text-ink">OVERSIZED BOXY ★</span>
              </div>
            </div>

            {/* Quantity Stepper & Add to Bag CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex border-2 border-ink bg-paper-2 shadow-[3px_3px_0px_var(--color-ink)] shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-13 font-mono font-black text-base hover:bg-panel hover:text-[#f5f0eb] transition-colors border-r-2 border-ink"
                  >
                    -
                  </button>
                  <div className="w-12 h-13 flex items-center justify-center font-mono font-black text-base bg-paper">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-13 font-mono font-black text-base hover:bg-panel hover:text-[#f5f0eb] transition-colors border-l-2 border-ink"
                  >
                    +
                  </button>
                </div>

                {/* Main CTA */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-13 border-2 border-ink font-headline font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    addedAnimation
                      ? 'bg-[#10b981] text-[#1a1a1a] shadow-[4px_4px_0px_var(--color-ink)]'
                      : 'bg-[#ffcc00] text-[#1a1a1a] hover:bg-[#e63b2e] hover:text-[#f5f0eb] shadow-[5px_5px_0px_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <span>✓</span> SPECIMEN LOGGED IN BAG
                    </>
                  ) : (
                    <>
                      <span>ACQUIRE SPECIMEN</span>
                      <span className="font-mono text-xs opacity-75">[{formatPrice(priceValue * quantity, currency)}]</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>

              {/* Express dispatch note */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                  READY FOR DISPATCH FROM BERLIN WAREHOUSE
                </span>
                <span>1-2 BUSINESS DAYS</span>
              </div>
            </div>

            {/* Brutalist Accordion Stack */}
            <div className="border-2 border-ink divide-y-2 divide-ink bg-paper-2 mt-6 shadow-[4px_4px_0px_var(--color-ink)]">
              {/* Accordion 1: Material & Specs */}
              <div>
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full px-4 py-3 font-headline font-bold text-xs uppercase flex justify-between items-center hover:bg-[#ffcc00]/20 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[#888888]">01 //</span>
                    SPECIFICATIONS & MATERIAL MATRIX
                  </span>
                  <span className="font-mono font-black text-sm">
                    {openAccordion === 'specs' ? '[-]' : '[+]'}
                  </span>
                </button>
                {openAccordion === 'specs' && (
                  <div className="px-4 pb-4 pt-1 font-mono text-xs space-y-2 text-ink border-t border-ink/20 bg-paper/60">
                    <div className="grid grid-cols-2 py-1 border-b border-ink/10">
                      <span className="text-[#888888]">PRIMARY COMPOSITION:</span>
                      <span className="font-bold">{materialName}</span>
                    </div>
                    <div className="grid grid-cols-2 py-1 border-b border-ink/10">
                      <span className="text-[#888888]">WEIGHT METRIC:</span>
                      <span className="font-bold">{product.specWeight || '480 GSM'}</span>
                    </div>
                    <div className="grid grid-cols-2 py-1 border-b border-ink/10">
                      <span className="text-[#888888]">WEAVE STRUCTURE:</span>
                      <span className="font-bold">Dense Twill High-Twist Gabardine</span>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <span className="text-[#888888]">HARDWARE PROTOCOL:</span>
                      <span className="font-bold">Brushed Gunmetal Snaps (Industrial Grade)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Care & Maintenance */}
              <div>
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full px-4 py-3 font-headline font-bold text-xs uppercase flex justify-between items-center hover:bg-[#ffcc00]/20 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[#888888]">02 //</span>
                    MAINTENANCE & LONGEVITY PROTOCOL
                  </span>
                  <span className="font-mono font-black text-sm">
                    {openAccordion === 'care' ? '[-]' : '[+]'}
                  </span>
                </button>
                {openAccordion === 'care' && (
                  <div className="px-4 pb-4 pt-1 font-mono text-xs space-y-2 text-ink border-t border-ink/20 bg-paper/60">
                    <p className="leading-relaxed">
                      Dry clean only recommended to preserve architectural silhouette rigidity. Store on contoured wooden hanger in low humidity environment. Spot clean minor particulate with damp horsehair brush.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Logistics & Returns */}
              <div>
                <button
                  onClick={() => toggleAccordion('dispatch')}
                  className="w-full px-4 py-3 font-headline font-bold text-xs uppercase flex justify-between items-center hover:bg-[#ffcc00]/20 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[#888888]">03 //</span>
                    DISPATCH & RETURN MANDATES
                  </span>
                  <span className="font-mono font-black text-sm">
                    {openAccordion === 'dispatch' ? '[-]' : '[+]'}
                  </span>
                </button>
                {openAccordion === 'dispatch' && (
                  <div className="px-4 pb-4 pt-1 font-mono text-xs space-y-2 text-ink border-t border-ink/20 bg-paper/60">
                    <p className="leading-relaxed">
                      Complimentary worldwide standard dispatch via DHL Express courier network. 30-day architectural return policy provided security seal remains unsevered.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* REVIEWS & FIT TELEMETRY AUDIT SECTION */}
        <div className="mt-20 border-t-4 border-ink pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-1">
                VERIFIED COLLECTOR TELEMETRY
              </div>
              <h2 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight">
                AUDITED USER REVIEWS & FIT LOGS
              </h2>
            </div>

            <div className="flex items-center gap-4 bg-paper-2 border-2 border-ink px-4 py-2 font-mono text-xs">
              <span className="font-bold">OVERALL ARCHIVAL INDEX:</span>
              <span className="text-xl font-black bg-panel text-[#ffcc00] px-2 py-0.5">4.8 / 5.0</span>
              <span className="text-[#888888]">(28 AUDITS)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Rating Breakdown Gauge */}
            <div className="lg:col-span-4 bg-paper-2 border-2 border-ink p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-4">
              <h3 className="font-headline font-black text-xs uppercase tracking-wider border-b-2 border-ink pb-2">
                FIT & SATISFACTION TELEMETRY
              </h3>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { star: 5, pct: 82, count: 23 },
                  { star: 4, pct: 14, count: 4 },
                  { star: 3, pct: 4, count: 1 },
                  { star: 2, pct: 0, count: 0 },
                  { star: 1, pct: 0, count: 0 },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-2">
                    <span className="w-12">{row.star} STARS</span>
                    <div className="flex-1 h-3 bg-[#d8d2cb] border border-ink">
                      <div
                        className="h-full bg-panel"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-[#888888]">{row.count}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-ink space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>REPORTED FIT TENDENCY:</span>
                  <span className="font-bold text-[#0055ff]">TRUE TO SIZE (92%)</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>DURABILITY GRADE:</span>
                  <span className="font-bold text-[#10b981]">GRADE A INDUSTRIAL</span>
                </div>
              </div>
            </div>

            {/* Individual Reviews Grid */}
            <div className="lg:col-span-8 space-y-4">
              {MOCK_REVIEWS.map((rev: Review) => {
                const starCount = rev.rating || rev.stars || 5;
                const reviewComment = rev.comment || rev.text || '';
                const reviewSize = rev.sizePurchased || rev.sizeOrdered || 'L';
                const reviewFit = rev.fitScore || rev.fitVerdict || 'TRUE TO SIZE';

                return (
                  <div
                    key={rev.id}
                    className="border-2 border-ink bg-paper-2 p-5 shadow-[4px_4px_0px_var(--color-ink)] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/20 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm bg-panel text-[#ffcc00] px-2 py-0.5">
                          {'★'.repeat(starCount)}
                        </span>
                        <span className="font-headline font-bold text-sm">{rev.author}</span>
                        {rev.verified && (
                          <span className="text-[10px] font-mono bg-[#10b981]/20 text-[#047857] border border-[#10b981] px-1.5 py-0.5 font-bold">
                            VERIFIED OWNER
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-[#888888]">{rev.date}</div>
                    </div>

                    <div className="font-mono text-xs text-[#888888] flex gap-4">
                      <span>ACQUIRED SIZE: <strong className="text-ink">{reviewSize}</strong></span>
                      <span>FIT EVALUATION: <strong className="text-ink">{reviewFit}</strong></span>
                    </div>

                    <p className="font-body text-sm leading-relaxed text-ink">
                      "{reviewComment}"
                    </p>

                    {/* Photo attachments if any */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {rev.photos.map((photoUrl, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setSelectedReviewPhoto(photoUrl)}
                            className="w-16 h-16 border-2 border-ink overflow-hidden hover:opacity-80 transition-opacity"
                          >
                            <img src={photoUrl} alt="Review upload" loading="lazy" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Upvote counter */}
                    <div className="flex items-center justify-between pt-2 text-xs font-mono">
                      <button
                        onClick={() => handleVoteHelpful(rev.id)}
                        className={`px-2 py-1 border border-ink transition-all flex items-center gap-1.5 ${
                          votedReviews[rev.id]
                            ? 'bg-panel text-[#f5f0eb] font-bold'
                            : 'bg-paper hover:bg-[#ffcc00]'
                        }`}
                      >
                        <span>▲</span> HELPFUL AUDIT ({reviewHelpfulCounts[rev.id] || rev.helpfulCount || 0})
                      </button>
                      <span className="text-[#888888]">LOG_ID: {rev.id.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM PURCHASE BAR (Mobile / Quick access) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-paper-2 border-t-2 border-ink p-3 shadow-[0px_-4px_10px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <div className="font-mono text-[10px] text-[#888888] uppercase">{product.code}</div>
            <div className="font-mono font-black text-sm">{formatPrice(priceValue, currency)}</div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-paper border-2 border-ink px-2 py-2 font-mono text-xs font-bold"
            >
              {availableSizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleAddToCart}
              className="bg-[#ffcc00] border-2 border-ink px-4 py-2 font-headline font-black text-xs uppercase shadow-[2px_2px_0px_var(--color-ink)] active:translate-y-0.5"
            >
              ACQUIRE →
            </button>
          </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-paper border-4 border-ink shadow-[10px_10px_0px_var(--color-ink)] max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-ink pb-3">
              <h3 className="font-headline font-black text-lg uppercase">
                METRIC MATRIX // SIZE CHART
              </h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="w-8 h-8 border-2 border-ink bg-paper-2 hover:bg-[#e63b2e] hover:text-[#f5f0eb] font-mono font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-[#888888]">
              All specifications recorded in centimeters (cm) under standard atmospheric pressure. Relaxed tailoring allowances included.
            </p>

            <table className="w-full border-2 border-ink font-mono text-xs text-left">
              <thead className="bg-panel text-[#f5f0eb]">
                <tr>
                  <th className="p-2 border border-ink">SIZE</th>
                  <th className="p-2 border border-ink">CHEST (CM)</th>
                  <th className="p-2 border border-ink">SHOULDER (CM)</th>
                  <th className="p-2 border border-ink">LENGTH (CM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink bg-paper-2">
                <tr>
                  <td className="p-2 font-bold">S</td>
                  <td className="p-2">114</td>
                  <td className="p-2">51</td>
                  <td className="p-2">72</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">M</td>
                  <td className="p-2">120</td>
                  <td className="p-2">53</td>
                  <td className="p-2">74</td>
                </tr>
                <tr className="bg-[#ffcc00]/20 font-bold">
                  <td className="p-2">L (MODEL WEARS)</td>
                  <td className="p-2">126</td>
                  <td className="p-2">55</td>
                  <td className="p-2">76</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">XL</td>
                  <td className="p-2">132</td>
                  <td className="p-2">57</td>
                  <td className="p-2">78</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">XXL</td>
                  <td className="p-2">138</td>
                  <td className="p-2">59</td>
                  <td className="p-2">80</td>
                </tr>
              </tbody>
            </table>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSizeModal(false)}
                className="px-4 py-2 bg-panel text-[#f5f0eb] font-mono font-bold text-xs uppercase hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-colors"
              >
                CLOSE MATRIX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW PHOTO MODAL */}
      {selectedReviewPhoto && (
        <div
          onClick={() => setSelectedReviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-paper border-4 border-ink shadow-[10px_10px_0px_var(--color-ink)] max-w-lg w-full p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold">COLLECTOR SPECIMEN UPLOAD</span>
              <button
                onClick={() => setSelectedReviewPhoto(null)}
                className="w-7 h-7 border border-ink font-mono font-bold hover:bg-[#e63b2e] hover:text-[#f5f0eb]"
              >
                ✕
              </button>
            </div>
            <img src={selectedReviewPhoto} alt="Review specimen" className="w-full h-auto border-2 border-ink" />
          </div>
        </div>
      )}
    </div>
  );
};
