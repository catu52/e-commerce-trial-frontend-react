import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Product, Currency, Page, CatalogSection } from '../types';
import { SaleBadge, SalePrice } from './SalePrice';
import { SECTION_LABELS } from '../config';

interface CatalogScreenProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onNavigate?: (page: Page) => void;
  currency: Currency;
  onShowToast: (msg: string) => void;
  initialSearchQuery?: string;
  section?: CatalogSection;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  products,
  onAddToCart,
  currency,
  onShowToast,
  initialSearchQuery = '',
  section = 'all'
}) => {
  // Toolbar state
  const [showFilters, setShowFilters] = useState(true);
  const [gridDensity, setGridDensity] = useState<'dense' | 'standard' | 'editorial'>('standard');
  const [sortBy, setSortBy] = useState<string>('latest');

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(section === 'all' ? ['OUTERWEAR'] : []);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedColor, setSelectedColor] = useState<string>('CARBON BLACK');
  const [selectedSubstrates, setSelectedSubstrates] = useState<string[]>(['RAW SELVEDGE DENIM (14OZ)']);
  const [maxPrice, setMaxPrice] = useState<number>(380);
  const [onlySale, setOnlySale] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(true);

  useEffect(() => {
    setSelectedCategories(section === 'all' ? ['OUTERWEAR'] : []);
  }, [section]);

  // Wishlist items
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Pagination mock state
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Accordion collapsed state
  const [accordionOpen, setAccordionOpen] = useState({
    cat: true,
    size: true,
    color: true,
    substrate: true,
    price: true
  });

  const toggleAccordion = (key: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleWishlist = (e: React.MouseEvent, productId: string, title: string) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const active = !prev[productId];
      onShowToast(active ? `${title} SAVED TO ARCHIVE` : `${title} REMOVED FROM ARCHIVE`);
      return { ...prev, [productId]: active };
    });
  };

  // Filter calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (initialSearchQuery) {
        const q = initialSearchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.substrate.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }
      if (selectedSize && !p.sizes.includes(selectedSize)) {
        return false;
      }
      if (p.priceEUR > maxPrice) {
        return false;
      }
      if (onlyInStock && !p.inStock) {
        return false;
      }
      return true;
    });
  }, [products, initialSearchQuery, selectedCategories, selectedSize, maxPrice, onlyInStock]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') list.sort((a, b) => a.priceEUR - b.priceEUR);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.priceEUR - a.priceEUR);
    else if (sortBy === 'popular') list.sort((a, b) => (b.stockLeft || 0) - (a.stockLeft || 0));
    return list;
  }, [filteredProducts, sortBy]);

  const displayedList = sortedProducts.slice(0, displayCount);

  const activeFilterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedSize ? 1 : 0) +
    (selectedSubstrates.length > 0 ? 1 : 0) +
    (maxPrice < 380 ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSize('');
    setSelectedColor('');
    setSelectedSubstrates([]);
    setMaxPrice(650);
    setOnlySale(false);
    setOnlyInStock(false);
    onShowToast('FILTER MATRICES CLEARED');
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((c) => Math.min(products.length, c + 6));
      setIsLoadingMore(false);
      onShowToast('ADDITIONAL SPECIMENS LOADED');
    }, 500);
  };

  // Grid columns class based on density toggle
  const getGridColsClass = () => {
    if (gridDensity === 'dense') {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5';
    }
    if (gridDensity === 'editorial') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
    }
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Announcement Bar */}
      <section className="w-full bg-primary text-on-primary px-6 lg:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4 font-headline text-xs uppercase tracking-widest">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-primary-container" />
          <span className="font-bold">SERIES 2025 // BATCH 04 DROPPED</span>
          <span className="hidden md:inline text-on-primary/60 font-mono">
            | FORM-FOLLOWS-FUNCTION PROTOTYPES
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-mono">
          <span className="hidden sm:inline">GLOBAL DISPATCH: 24H</span>
          <span className="text-primary-container font-bold">COMPLIMENTARY SHIPPING &gt; €300</span>
          <span className="hidden lg:inline text-on-primary/60">SYS_REF: KRF-CAT-094</span>
        </div>
      </section>

      {/* Editorial Category Title Header */}
      <section className="w-full bg-surface-container-low px-6 lg:px-12 py-10 lg:py-14 border-b-2 border-primary">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
              <span className="px-2 py-0.5 bg-primary text-on-primary font-bold">ARCHIVE INDEX</span>
              <span>// APPAREL COLLECTION</span>
              <span className="font-bold text-secondary">AUTUMN/WINTER PROTOCOLS</span>
            </div>
            <h1 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase text-primary leading-none">
              {SECTION_LABELS[section]}<span className="text-secondary">*</span>
            </h1>
          </div>
          <div className="max-w-md space-y-3">
            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Unapologetic structural silhouettes engineered from raw selvedge, heavy boiled wool, and architectural twill. Built for endurance; zero decorative excess.
            </p>
            <div className="flex items-center gap-2 font-mono text-[11px] text-primary font-bold">
              <span className="w-2 h-2 bg-secondary inline-block" />
              <span>{products.length} REGISTERED SPECIMENS</span>
              <span className="text-on-surface-variant font-normal">| ALL WEATHER RESILIENT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Functional Workspace */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Top Control Matrix Toolbar */}
        <div className="w-full bg-surface-container-lowest p-4 sm:p-5 mb-8 shadow-md border-2 border-primary flex flex-wrap items-center justify-between gap-4">
          {/* Left: Filter Toggle & Results Count */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-primary"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>{showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}</span>
              <span className="px-1.5 py-0.2 bg-secondary text-on-error text-[10px] font-mono font-bold">
                {activeFilterCount}
              </span>
            </button>
            <div className="h-8 w-px bg-outline-variant hidden sm:block" />
            <div className="font-headline text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="font-bold text-primary">
                {sortedProducts.length} PIECES
              </span>
              <span className="text-on-surface-variant font-mono text-[11px] hidden md:inline">
                [1-{displayedList.length} OF {sortedProducts.length} DISPLAYED]
              </span>
            </div>
          </div>

          {/* Right: Grid View Density & Sort Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Grid Density Switcher */}
            <div className="flex items-center bg-surface-container-high p-1 border border-primary">
              <span className="text-[10px] font-mono uppercase font-bold px-2 text-on-surface-variant hidden lg:inline">
                GRID:
              </span>
              <button
                onClick={() => setGridDensity('dense')}
                className={`px-2.5 py-1.5 text-xs font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  gridDensity === 'dense'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary'
                }`}
                title="Dense (5-6 Columns)"
              >
                <span className="material-symbols-outlined text-base">grid_view</span>
                <span className="hidden xl:inline text-[11px]">DENSE</span>
              </button>
              <button
                onClick={() => setGridDensity('standard')}
                className={`px-2.5 py-1.5 text-xs font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  gridDensity === 'standard'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary'
                }`}
                title="Standard (3 Columns)"
              >
                <span className="material-symbols-outlined text-base">view_module</span>
                <span className="hidden xl:inline text-[11px]">STD</span>
              </button>
              <button
                onClick={() => setGridDensity('editorial')}
                className={`px-2.5 py-1.5 text-xs font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                  gridDensity === 'editorial'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-primary hover:bg-primary hover:text-on-primary'
                }`}
                title="Large (2 Columns Editorial)"
              >
                <span className="material-symbols-outlined text-base">splitscreen</span>
                <span className="hidden xl:inline text-[11px]">LARGE</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center bg-surface-container-high px-3 py-2 border border-primary">
              <span className="material-symbols-outlined text-sm text-primary mr-2">swap_vert</span>
              <span className="text-[10px] font-mono uppercase font-bold text-on-surface-variant mr-2 hidden sm:inline">
                SORT:
              </span>
              <select
                aria-label="Sort Order"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-headline font-bold uppercase focus:outline-none cursor-pointer tracking-wider text-primary pr-2"
              >
                <option value="latest">LATEST DISPATCH</option>
                <option value="price-asc">PRICE: LOW → HIGH</option>
                <option value="price-desc">PRICE: HIGH → LOW</option>
                <option value="popular">HIGH VELOCITY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Strip */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-on-surface-variant font-bold mr-1">
            ACTIVE MATRICES:
          </span>
          {selectedCategories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high border border-primary text-xs font-headline uppercase font-bold text-primary"
            >
              {cat}
              <button
                onClick={() => setSelectedCategories((c) => c.filter((x) => x !== cat))}
                className="hover:text-secondary text-xs leading-none cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
          {selectedSize && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high border border-primary text-xs font-headline uppercase font-bold text-primary">
              SIZE: {selectedSize}
              <button
                onClick={() => setSelectedSize('')}
                className="hover:text-secondary text-xs leading-none cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {selectedSubstrates.map((sub) => (
            <span
              key={sub}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high border border-primary text-xs font-headline uppercase font-bold text-primary"
            >
              {sub}
              <button
                onClick={() => setSelectedSubstrates((s) => s.filter((x) => x !== sub))}
                className="hover:text-secondary text-xs leading-none cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={resetAllFilters}
            className="text-xs font-mono uppercase text-secondary underline hover:text-primary transition-colors font-bold ml-2 cursor-pointer"
          >
            RESET MATRIX
          </button>
        </div>

        {/* Main Content Split Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Collapsible Left Filter Sidebar */}
          {showFilters && (
            <aside className="w-full lg:w-72 shrink-0 bg-surface-container-lowest p-6 shadow-md border-2 border-primary transition-all duration-300">
              <div className="flex items-center justify-between pb-4 mb-4 bg-surface-container-low -mx-6 -mt-6 p-6 border-b-2 border-primary">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary inline-block" />
                  <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-primary">
                    FILTER PROTOCOL
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-on-surface-variant font-bold">[V.04]</span>
              </div>

              <div className="space-y-6">
                {/* 01. Category */}
                <div>
                  <button
                    onClick={() => toggleAccordion('cat')}
                    className="w-full flex items-center justify-between font-headline text-xs font-bold uppercase tracking-wider text-primary py-1 text-left cursor-pointer"
                  >
                    <span>01. CATEGORY</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {accordionOpen.cat ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                  {accordionOpen.cat && (
                    <div className="pt-3 space-y-2 text-xs font-headline">
                      {[
                        { label: 'OUTERWEAR', count: 14 },
                        { label: 'KNITWEAR', count: 9 },
                        { label: 'TROUSERS', count: 11 },
                        { label: 'OVERSHIRTS', count: 8 },
                        { label: 'HARDWARE', count: 6 }
                      ].map((catItem) => (
                        <label
                          key={catItem.label}
                          className="flex items-center justify-between cursor-pointer group hover:text-primary"
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(catItem.label)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories((c) => [...c, catItem.label]);
                                } else {
                                  setSelectedCategories((c) => c.filter((x) => x !== catItem.label));
                                }
                              }}
                              className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                            />
                            <span>{catItem.label}</span>
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            [{catItem.count}]
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-outline-variant" />

                {/* 02. Size Matrix */}
                <div>
                  <button
                    onClick={() => toggleAccordion('size')}
                    className="w-full flex items-center justify-between font-headline text-xs font-bold uppercase tracking-wider text-primary py-1 text-left cursor-pointer"
                  >
                    <span>02. SIZE MATRIX</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {accordionOpen.size ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                  {accordionOpen.size && (
                    <div className="pt-3">
                      <div className="grid grid-cols-5 gap-1.5 font-headline text-xs font-bold uppercase">
                        {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                            className={`py-2 text-center transition-colors cursor-pointer border border-primary ${
                              selectedSize === s
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container-high hover:bg-primary hover:text-on-primary'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-on-surface-variant flex justify-between">
                        <span>EUROPEAN UNISEX BLOCK</span>
                        <span className="underline cursor-pointer hover:text-primary">SIZE GUIDE →</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-outline-variant" />

                {/* 03. Colorway */}
                <div>
                  <button
                    onClick={() => toggleAccordion('color')}
                    className="w-full flex items-center justify-between font-headline text-xs font-bold uppercase tracking-wider text-primary py-1 text-left cursor-pointer"
                  >
                    <span>03. COLORWAY</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {accordionOpen.color ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                  {accordionOpen.color && (
                    <div className="pt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Carbon Black', hex: '#1a1a1a' },
                          { name: 'Raw Ecru', hex: '#f5f0e8' },
                          { name: 'Industrial Ochre', hex: '#b89758' },
                          { name: 'Forest Olive', hex: '#3d443b' },
                          { name: 'Klein Bauhaus Blue', hex: '#0055ff' },
                          { name: 'Safety Red', hex: '#e63b2e' }
                        ].map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c.name.toUpperCase())}
                            className="w-8 h-8 border border-primary shadow-sm relative group cursor-pointer"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {selectedColor === c.name.toUpperCase() && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
                                ✓
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="text-[11px] font-mono text-on-surface-variant pt-1 uppercase">
                        SELECTED: {selectedColor || 'ALL PIGMENTS'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-outline-variant" />

                {/* 04. Substrate / Material */}
                <div>
                  <button
                    onClick={() => toggleAccordion('substrate')}
                    className="w-full flex items-center justify-between font-headline text-xs font-bold uppercase tracking-wider text-primary py-1 text-left cursor-pointer"
                  >
                    <span>04. SUBSTRATE / MATERIAL</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {accordionOpen.substrate ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                  {accordionOpen.substrate && (
                    <div className="pt-3 space-y-2 text-xs font-headline">
                      {[
                        'RAW SELVEDGE DENIM (14OZ)',
                        'BOILED MERINO WOOL',
                        'HEAVY COMBED COTTON (380GSM)',
                        'RIPSTOP NYLON 6.6'
                      ].map((sub) => (
                        <label key={sub} className="flex items-center justify-between cursor-pointer group">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSubstrates.includes(sub)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubstrates((s) => [...s, sub]);
                                } else {
                                  setSelectedSubstrates((s) => s.filter((x) => x !== sub));
                                }
                              }}
                              className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                            />
                            <span className="text-[11px]">{sub}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-outline-variant" />

                {/* 05. Price Interval */}
                <div>
                  <button
                    onClick={() => toggleAccordion('price')}
                    className="w-full flex items-center justify-between font-headline text-xs font-bold uppercase tracking-wider text-primary py-1 text-left cursor-pointer"
                  >
                    <span>05. PRICE INTERVAL (€)</span>
                    <span className="material-symbols-outlined text-sm font-bold">
                      {accordionOpen.price ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>
                  {accordionOpen.price && (
                    <div className="pt-3 space-y-4">
                      {/* Histogram Bar */}
                      <div className="flex items-end gap-1 h-10 px-1 pt-2">
                        <div className="w-full h-2 bg-surface-container-high" />
                        <div className="w-full h-4 bg-surface-container-high" />
                        <div className="w-full h-7 bg-primary" />
                        <div className="w-full h-9 bg-primary" />
                        <div className="w-full h-6 bg-primary" />
                        <div className="w-full h-3 bg-surface-container-high" />
                        <div className="w-full h-2 bg-surface-container-high" />
                      </div>
                      <input
                        aria-label="Price Filter"
                        className="w-full accent-primary cursor-pointer"
                        max="650"
                        min="80"
                        type="range"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                      />
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <div className="flex-1 bg-surface-container-high px-2 py-1.5 flex items-center justify-between border border-primary/20">
                          <span className="text-on-surface-variant text-[10px]">MIN</span>
                          <span className="font-bold">€80</span>
                        </div>
                        <span className="text-on-surface-variant">—</span>
                        <div className="flex-1 bg-surface-container-high px-2 py-1.5 flex items-center justify-between border border-primary/20">
                          <span className="text-on-surface-variant text-[10px]">MAX</span>
                          <span className="font-bold">€{maxPrice}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-outline-variant" />

                {/* Special Boolean Toggles */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-headline text-xs font-bold uppercase tracking-wider">
                      SALE & ARCHIVAL ONLY
                    </span>
                    <input
                      type="checkbox"
                      checked={onlySale}
                      onChange={(e) => setOnlySale(e.target.checked)}
                      className="w-4 h-4 accent-secondary rounded-none cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="font-headline text-xs font-bold uppercase tracking-wider">
                      IN STOCK READY TO SHIP
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => onShowToast(`APPLIED: ${sortedProducts.length} SPECIMENS FOUND`)}
                    className="w-full py-3 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-headline text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer border border-primary"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>APPLY FILTERS [{activeFilterCount}]</span>
                  </button>
                  <button
                    onClick={resetAllFilters}
                    className="w-full py-2.5 bg-surface-container-high text-primary hover:bg-surface-container-highest font-headline text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border border-primary/20"
                  >
                    RESET ALL CONDITIONS
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Main Product Grid Container */}
          <div className="flex-1 w-full">
            <div className={`grid gap-6 transition-all duration-300 ${getGridColsClass()}`}>
              {displayedList.map((product) => (
                <div
                  key={product.id}
                  className="group bg-surface-container-lowest flex flex-col justify-between shadow-md border-2 border-primary transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Image Container with Badges & Hover Size Quick-Add */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container-high border-b-2 border-primary">
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                      {product.tag && (
                        <span className="px-2 py-0.5 bg-primary text-on-primary font-headline text-[10px] font-bold uppercase tracking-wider">
                          {product.tag}
                        </span>
                      )}
                      {product.badge && (
                        <span className="px-2 py-0.5 bg-primary-container text-on-primary-container font-headline text-[10px] font-bold uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <button
                      aria-label="Save to Wishlist"
                      onClick={(e) => handleToggleWishlist(e, product.id, product.title)}
                      className={`absolute top-3 right-3 z-10 w-8 h-8 transition-colors flex items-center justify-center shadow-sm cursor-pointer border border-primary ${
                        wishlist[product.id]
                          ? 'bg-secondary text-on-error'
                          : 'bg-surface-container-lowest/90 text-primary hover:bg-primary hover:text-on-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {wishlist[product.id] ? 'bookmark_added' : 'bookmark'}
                      </span>
                    </button>

                    <SaleBadge product={product} className="absolute top-3 left-3 z-10" />
                    <Link to={ROUTES.product(product.slug)} aria-hidden="true" tabIndex={-1} className="absolute inset-0 block cursor-pointer">
                      <img
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                      />
                    </Link>

                    {/* Quick Size Selector on Hover */}
                    <div
                      className="absolute z-10 inset-x-0 bottom-0 bg-primary/95 text-on-primary p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex flex-col gap-2 border-t-2 border-primary"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                        <span>SELECT SIZE QUICK-ADD</span>
                        <span className="text-primary-container font-bold">READY</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 font-headline text-xs font-bold">
                        {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                          const available = product.sizes.includes(size);
                          return (
                            <button
                              key={size}
                              disabled={!available}
                              onClick={() => {
                                onAddToCart(product, size);
                                onShowToast(`${product.title} (SIZE ${size}) ADDED TO BAG`);
                              }}
                              className={`py-1 transition-colors cursor-pointer ${
                                available
                                  ? 'bg-surface-container-low text-primary hover:bg-primary-container'
                                  : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed line-through'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Meta */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">
                          {product.code} // {product.category}
                        </span>
                        <h3 className="font-headline text-sm font-bold uppercase tracking-tight text-primary hover:text-secondary transition-colors">
                          <Link to={ROUTES.product(product.slug)} className="cursor-pointer">
                            {product.title}
                          </Link>
                        </h3>
                      </div>
                      <SalePrice
                        product={product}
                        currency={currency}
                        className="font-headline text-sm font-bold text-primary font-mono shrink-0 flex-col items-end gap-0"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-primary/10">
                      <div className="flex items-center gap-1.5">
                        {product.colorHexList.map((hex, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 inline-block shadow-sm border border-primary/20"
                            style={{ backgroundColor: hex }}
                            title={product.colorway}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-on-surface-variant">
                        {product.substrate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination & Infinite Scroll Terminal */}
            <div className="mt-14 w-full bg-surface-container-lowest p-8 shadow-md border-2 border-primary flex flex-col items-center justify-center text-center space-y-6">
              <div className="space-y-2 max-w-sm w-full">
                <div className="flex items-center justify-between text-xs font-mono uppercase font-bold text-on-surface-variant">
                  <span>CATALOG DISPATCH PROGRESS</span>
                  <span className="text-primary font-bold">
                    {displayedList.length} / {sortedProducts.length} SHOWN
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-high overflow-hidden border border-primary/30">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round((displayedList.length / sortedProducts.length) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                {displayedList.length < sortedProducts.length ? (
                  <button
                    disabled={isLoadingMore}
                    onClick={handleLoadMore}
                    className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all font-headline text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-md border border-primary cursor-pointer group"
                  >
                    <span className={`material-symbols-outlined text-sm ${isLoadingMore ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`}>
                      sync
                    </span>
                    <span>{isLoadingMore ? 'RETRIEVING BATCH...' : 'LOAD MORE SPECIMENS'}</span>
                  </button>
                ) : (
                  <div className="px-8 py-3 bg-surface-container-low font-headline text-xs font-bold uppercase border border-primary">
                    ALL {sortedProducts.length} SPECIMENS LOADED
                  </div>
                )}
                <button
                  onClick={() => setDisplayCount(sortedProducts.length)}
                  className="w-full sm:w-auto px-6 py-4 bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-headline text-xs font-bold uppercase tracking-wider text-center cursor-pointer border border-primary/20"
                >
                  VIEW INDEX ALL ({sortedProducts.length})
                </button>
              </div>

              <div className="flex items-center gap-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest pt-2">
                <span>GRID SYSTEM: BAUHAUS MODULAR</span>
                <span>•</span>
                <span>AUTO-SYNC ENABLED</span>
                <span>•</span>
                <span className="text-secondary font-bold">PAGE 01 OF 02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
