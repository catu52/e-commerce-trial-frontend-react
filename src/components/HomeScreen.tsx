import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';
import { Product, Currency, Page, CatalogSection } from '../types';
import { formatPrice } from '../data/mockData';
import { useSiteContent } from '../hooks/useSiteContent';
import { LatestArticles } from './editorial/LatestArticles';

interface HomeScreenProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onNavigate?: (page: Page) => void;
  onSelectSection?: (section: CatalogSection) => void;
  onOpenCart: () => void;
  currency: Currency;
  onShowToast: (msg: string) => void;
}

/** CMS-set site-relative path; "/catalog" is the legacy CMS default for the shop. */
const internalPath = (link: string): string | null => {
  const path = link.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path === '/catalog' ? ROUTES.shop : path;
};

const LookLink: React.FC<{
  look: { link: string };
  fallbackTo: string;
  className: string;
  children: React.ReactNode;
}> = ({ look, fallbackTo, className, children }) =>
  /^https?:\/\//i.test(look.link) ? (
    <a href={look.link} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  ) : (
    <Link to={internalPath(look.link) ?? fallbackTo} className={className}>
      {children}
    </Link>
  );

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  onAddToCart,
  onOpenCart,
  currency,
  onShowToast
}) => {
  const { home, settings } = useSiteContent().content;
  const look = home.lookbook[0];
  const titleLines = home.heroTitle.split('\n').filter(Boolean);

  // Live countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 56,
    seconds: 25
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Interactive like counts for community strip
  const [communityLikes, setCommunityLikes] = useState<Record<string, number>>({
    kenji: 1420,
    anna: 2840,
    london: 920,
    seoul: 3105
  });
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { days: 2, hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLike = (key: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[key];
      setCommunityLikes((l) => ({
        ...l,
        [key]: isLiked ? l[key] + 1 : l[key] - 1
      }));
      return { ...prev, [key]: isLiked };
    });
  };

  // Trending items subset
  const trendingItems = products.slice(6, 10);
  const filteredTrending = activeCategoryFilter === 'ALL'
    ? trendingItems
    : trendingItems.filter((p) => {
        if (activeCategoryFilter === 'OUTERWEAR') return p.category === 'OUTERWEAR';
        if (activeCategoryFilter === 'PANTS') return p.category === 'TROUSERS';
        if (activeCategoryFilter === 'ACCESSORIES') return p.category === 'HARDWARE';
        return true;
      });

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: TICKER RIBBON */}
      <div className="w-full bg-primary text-on-primary py-2 px-4 overflow-hidden shadow-sm">
        <div className="flex whitespace-nowrap gap-12 font-headline text-xs font-bold uppercase tracking-widest animate-pulse">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-container inline-block" /> FW25 WORLDWIDE DISPATCH COMMENCED
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary inline-block" /> PROTOCOL #08: HEAVYWEIGHT WATER-REPELLENT TWILL RESTOCKED
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-tertiary inline-block" /> {settings.announcement}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-container inline-block" /> TOKYO • BERLIN • NEW YORK EXHIBITIONS OPEN
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-secondary inline-block" /> ARCHIVAL SPEC 09-B NOW LIVE
          </span>
        </div>
      </div>

      {/* SECTION 2: HERO ARCHITECTURAL GRID */}
      <section className="w-full px-4 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
          {/* Block A: Big Typography & Manifest (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 lg:p-14 flex flex-col justify-between shadow-xl relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container flex items-center justify-center font-headline font-bold text-xs uppercase tracking-widest text-primary rotate-45 translate-x-10 -translate-y-10 border-b-2 border-primary">
              FW25.01
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-headline uppercase tracking-wider text-on-surface-variant font-bold mb-6">
                <span className="px-2 py-0.5 bg-secondary text-on-error">SYSTEM RELEASE</span>
                <span className="font-mono text-primary">{home.heroEyebrow}</span>
                <span className="hidden sm:inline text-outline-variant">●</span>
                <span className="font-mono text-tertiary">LAT 52.5200° N / LON 13.4050° E</span>
              </div>

              <h1 className="font-headline text-5xl sm:text-7xl xl:text-8xl font-bold uppercase tracking-tighter leading-[0.88] text-primary mb-8">
                {titleLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {i === 1 ? <span className="text-secondary">{line}</span> : line}
                  </React.Fragment>
                ))}
              </h1>

              <p className="max-w-xl text-sm lg:text-base text-on-surface-variant font-body leading-relaxed mb-8">
                {home.heroSubtitle}
              </p>
            </div>

            {/* Metric & Action Matrix */}
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4 font-headline uppercase text-xs">
                <div className="bg-surface-container-low p-4 border border-primary/20">
                  <span className="text-[10px] text-on-surface-variant block font-mono">SPEC WEIGHT</span>
                  <span className="text-xl font-bold text-primary font-mono">520 GSM</span>
                </div>
                <div className="bg-surface-container-low p-4 border border-primary/20">
                  <span className="text-[10px] text-on-surface-variant block font-mono">ALL WEATHER</span>
                  <span className="text-xl font-bold text-secondary font-mono">IPX-6 SEAL</span>
                </div>
                <div className="bg-surface-container-low p-4 border border-primary/20">
                  <span className="text-[10px] text-on-surface-variant block font-mono">UNITS ISSUED</span>
                  <span className="text-xl font-bold text-tertiary font-mono">350 ONLY</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={ROUTES.shop}
                  className="px-8 py-5 bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md hover:bg-secondary hover:text-on-error transition-all flex items-center gap-3 group cursor-pointer border-2 border-primary"
                >
                  <span>EXPLORE CAPSULE</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <button
                  onClick={onOpenCart}
                  className="px-8 py-5 bg-primary-container text-on-primary-container font-headline text-xs font-bold uppercase tracking-widest shadow-md hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2 cursor-pointer border-2 border-primary"
                >
                  <span className="material-symbols-outlined text-base">receipt_long</span>
                  <span>INSPECT SPEC SHEET</span>
                </button>
              </div>
            </div>
          </div>

          {/* Block B: Visual Hero Editorial Photo (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <LookLink
              look={look}
              fallbackTo={products[0] ? ROUTES.product(products[0].slug) : ROUTES.shop}
              className="relative flex-1 min-h-[380px bg-surface-container-high overflow-hidden shadow-xl group border-2 border-primary cursor-pointer block"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                role="img"
                aria-label={look.imageAlt}
                style={look.imageUrl ? { backgroundImage: `url('${look.imageUrl}')` } : undefined}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex flex-col justify-end p-6 text-on-primary">
                <span className="font-headline text-[10px] tracking-widest uppercase bg-primary text-primary-container px-2 py-0.5 w-fit mb-2 font-bold">
                  LOOK 01 / LOOKBOOK
                </span>
                <p className="font-headline text-xl font-bold uppercase tracking-tight">
                  {look.title}
                </p>
                <p className="text-xs font-mono text-outline-variant mt-1">
                  {look.caption}
                </p>
              </div>
            </LookLink>

            {/* Release Countdown Block */}
            <div className="bg-secondary text-on-error p-6 shadow-xl flex items-center justify-between border-2 border-primary">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest block opacity-90 font-bold">
                  GLOBAL DROP WINDOW #02
                </span>
                <div className="font-headline text-2xl lg:text-3xl font-bold uppercase tracking-tight mt-1 font-mono">
                  {timeLeft.days.toString().padStart(2, '0')}D : {timeLeft.hours.toString().padStart(2, '0')}H :{' '}
                  {timeLeft.minutes.toString().padStart(2, '0')}M : {timeLeft.seconds.toString().padStart(2, '0')}S
                </div>
              </div>
              <button
                onClick={() => {
                  const section = document.getElementById('trending-now');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center hover:bg-surface-container-lowest hover:text-primary transition-colors cursor-pointer border border-primary"
              >
                <span className="material-symbols-outlined font-bold">north_east</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2B: MEN / WOMEN ENTRY TILES */}
      <section className="w-full px-4 lg:px-12 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(['women', 'men'] as const).map((key) => (
            <Link
              key={key}
              to={ROUTES.shopSection(key)}
              className="flex items-center justify-between p-8 border-2 border-primary bg-surface-container-low hover:bg-primary hover:text-on-primary transition-colors cursor-pointer font-headline text-3xl font-bold uppercase tracking-tight"
            >
              <span>SHOP {key}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: SECONDARY PROMOTIONAL BANNERS */}
      <section className="w-full px-4 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Promo Card 01: MONOCHROME CAPSULE */}
          <div className="bg-surface-container-low p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[420px] group border-2 border-primary">
            <div className="flex items-start justify-between z-10">
              <div>
                <span className="px-2.5 py-1 bg-primary text-on-primary font-headline text-[10px] font-bold uppercase tracking-widest">
                  SUB-COLLECTION 01
                </span>
                <h2 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight text-primary mt-3">
                  MONOCHROME<br />CAPSULE
                </h2>
              </div>
              <span className="font-mono text-xs text-on-surface-variant font-bold">SPEC: NO. 884-BLK</span>
            </div>

            <div className="my-6 relative h-48 overflow-hidden border border-primary">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwlILGyMnFgMQr2QPmJ7YTZMj_KbcUfmKNZI-FMCfedQWDtGapyx353gMQvGlMhPzi8MLgoQJPAHHVhdMNSDpbgroSi5FjGFOJ0R1uVpzbNybR4BIoqfX45xM6OV05nAdw-Z8A6BZ8SyScOoyikaX-fbXzaVlmzCiRyu6RDR8qnX-4jtEFFCdYapSCnKT_WuOrKv7kcau1SwBy00QXr2NRb8U3m6BJ8wr503AoLnfemcvPlIpRo52r')"
                }}
              />
              <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 px-3 py-1 text-[10px] font-headline uppercase font-bold text-primary">
                SHADES OF PURE CARBON & TITANIUM
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 z-10">
              <p className="text-xs font-mono uppercase text-on-surface-variant">14 TECHNICAL PIECES READY</p>
              <Link
                to={ROUTES.shop}
                className="px-5 py-2.5 bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer border border-primary"
              >
                <span>ACCESS CATALOG</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Promo Card 02: HEAVYWEIGHT FLEECE & OUTERWEAR */}
          <div className="bg-surface-container p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[420px] group border-2 border-primary">
            <div className="flex items-start justify-between z-10">
              <div>
                <span className="px-2.5 py-1 bg-tertiary text-on-tertiary font-headline text-[10px] font-bold uppercase tracking-widest">
                  FABRIC LAB RELEASE
                </span>
                <h2 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight text-primary mt-3">
                  HEAVYWEIGHT FLEECE<br />& OUTERWEAR
                </h2>
              </div>
              <span className="font-mono text-xs text-on-surface-variant font-bold">SPEC: 620GSM TACTICAL</span>
            </div>

            <div className="my-6 relative h-48 overflow-hidden border border-primary">
              <div
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDN0Y6IBM_9XDJKRUfhJ3mSNo4DtNvfM3wKqrYeu-DtEwZ4y4Po03S0-EWlCbaCmqZHNNtq7BHBZZUk1G6MV5BhjUMvCQtZ2P1l4RFEhMnp1otG6pkrbaySVHtDkm63Hl-HWEaCF9WtRxzio6abXSXiDKko92be3YRvms-57uw-QdEHVgQo2zE_ADuDkg97QCnWtPY9x_LG3B3O20xZu24B825YPbklxUiLa-7o0b48BonUdnf2dr4g')"
                }}
              />
              <div className="absolute bottom-2 left-2 bg-primary-container px-3 py-1 text-[10px] font-headline uppercase font-bold text-on-primary-container">
                THERMAL RETENTION + ZERO SAGGING
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 z-10">
              <p className="text-xs font-mono uppercase text-on-surface-variant">DESIGNED FOR -15°C CITY COMMUTE</p>
              <Link
                to={ROUTES.shop}
                className="px-5 py-2.5 bg-tertiary text-on-tertiary font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer border border-primary"
              >
                <span>VIEW DROP</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEASONAL DROPS / TRENDING NOW */}
      <section className="w-full px-4 lg:px-12 py-12" id="trending-now">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-secondary" />
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-secondary">
                PRIMARY SELECTION
              </span>
            </div>
            <h2 className="font-headline text-4xl sm:text-5xl font-bold uppercase tracking-tight text-primary">
              TRENDING ARCHIVE DROPS
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-headline font-bold uppercase tracking-wider">
            {['ALL', 'OUTERWEAR', 'PANTS', 'ACCESSORIES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-4 py-2 border border-primary transition-colors cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary'
                }`}
              >
                {cat === 'ALL' ? 'ALL PIECES (24)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTrending.map((product) => (
            <div
              key={product.id}
              className="bg-surface-container-lowest p-4 shadow-xl flex flex-col justify-between group relative border-2 border-primary"
            >
              <div className="relative w-full aspect-[3/4] bg-surface-container-high overflow-hidden mb-4 border border-primary">
                <Link to={ROUTES.product(product.slug)} aria-hidden="true" tabIndex={-1} className="block w-full h-full cursor-pointer">
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary-container text-on-primary-container font-headline text-[10px] font-bold uppercase">
                  {product.tag || 'HOT ISSUE'}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-surface-container-lowest font-mono text-[10px] font-bold text-primary">
                  {product.code}
                </span>
                </Link>

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onShowToast(`${product.title} (${formatPrice(product.priceEUR, currency)}) ADDED TO BAG`);
                    }}
                    className="w-full py-3 bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-widest hover:bg-secondary hover:text-on-error transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-primary"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>QUICK ADD / {formatPrice(product.priceEUR, currency)}</span>
                  </button>
                </div>
              </div>

              <div>
                <Link
                  to={ROUTES.product(product.slug)}
                  className="flex justify-between items-baseline mb-1 cursor-pointer hover:text-secondary transition-colors"
                >
                  <h3 className="font-headline text-sm font-bold uppercase tracking-wide text-primary">
                    {product.title}
                  </h3>
                  <span className="font-mono text-sm font-bold text-primary">
                    {formatPrice(product.priceEUR, currency)}
                  </span>
                </Link>
                <p className="text-[11px] font-mono text-on-surface-variant uppercase mb-3">
                  {product.subCategory || product.substrate}
                </p>
                <div className="flex items-center justify-between text-[10px] font-headline font-bold text-on-surface-variant pt-2 border-t border-primary/10">
                  <span>SIZES: {product.sizes.join(' / ')}</span>
                  <span className="text-secondary">{product.stockLeft ? `${product.stockLeft} LEFT` : 'IN STOCK'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: EDITORIAL CURATION SPOTLIGHT */}
      <section className="w-full px-4 lg:px-12 py-12" id="manifesto-section">
        <div className="bg-primary text-on-primary p-8 lg:p-16 shadow-2xl relative overflow-hidden border-2 border-primary">
          {home.editorialImageUrl && (
            <img
              src={home.editorialImageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
          )}
          <span className="absolute -bottom-10 -right-8 font-headline text-[18vw] font-bold text-surface-container-highest/10 leading-none pointer-events-none select-none uppercase">
            FORM
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-3 h-3 bg-primary-container" />
                  <span className="font-headline text-xs uppercase tracking-widest font-bold text-primary-container">
                    ARCHIVAL STATEMENT // 098
                  </span>
                </div>
                <h3 className="font-headline text-3xl sm:text-5xl font-bold uppercase tracking-tight leading-[1.05]">
                  {home.editorialTitle}
                </h3>
              </div>
              <div className="space-y-4">
                <p className="font-body text-xs sm:text-sm text-outline-variant leading-relaxed">
                  {home.editorialBody}
                </p>
                <Link
                  to={ROUTES.editorial}
                  className="inline-block border-2 border-primary-container px-4 py-2 font-mono text-xs font-bold uppercase text-primary-container hover:bg-primary-container hover:text-primary"
                >
                  READ THE EDITORIAL →
                </Link>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-1 bg-secondary" />
                  <span className="font-mono text-xs uppercase text-primary-container">
                    CHIEF DESIGNER: L. VANDERVOORT
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest text-primary p-6 shadow-lg flex flex-col justify-between border-2 border-primary">
                <div>
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">TENET 01</span>
                  <h4 className="font-headline text-lg font-bold uppercase mt-2 mb-3">HYPER-DURABILITY COEFFICIENT</h4>
                  <p className="text-xs text-on-surface-variant font-body">
                    Reinforced triple bar-tack stitching on all stress vectors guarantees zero seam separation under dynamic load.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-outline-variant">
                  <svg className="w-full h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 200 40">
                    <line strokeDasharray="4 4" strokeWidth="2" x1="10" x2="190" y1="20" y2="20" />
                    <circle cx="40" cy="20" fill="#e63b2e" r="6" stroke="none" />
                    <circle cx="100" cy="20" fill="#ffcc00" r="6" stroke="none" />
                    <circle cx="160" cy="20" fill="#0055ff" r="6" stroke="none" />
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-on-surface-variant uppercase mt-1">
                    <span>TENSILE: 980N</span>
                    <span>FLEXION: 10K CYC</span>
                    <span>GRADE: MIL-SPEC</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest text-primary p-6 shadow-lg flex flex-col justify-between border-2 border-primary">
                <div>
                  <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase">TENET 02</span>
                  <h4 className="font-headline text-lg font-bold uppercase mt-2 mb-3">MODULAR CONVERGENCE</h4>
                  <p className="text-xs text-on-surface-variant font-body">
                    Pockets detach and mount directly to bags, harnesses, or overcoats via the standardized KRAFT 25mm rail system.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between font-mono text-xs">
                  <span className="bg-secondary text-on-error px-2 py-0.5 font-bold">RAIL V.3</span>
                  <span className="text-on-surface-variant">100% INTERCHANGEABLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LatestArticles />

      {/* SECTION 6: MINIMALIST SOCIAL COMMUNITY STRIP */}
      <section className="w-full px-4 lg:px-12 py-12">
        <div className="bg-surface-container-low p-8 shadow-xl border-2 border-primary">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-primary">
            <div>
              <span className="font-mono text-xs font-bold uppercase text-tertiary">RADAR & FIELD REPORTS</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight text-primary mt-1">
                AS SEEN ON #KRAFTSTUDIO
              </h2>
              <p className="text-xs font-mono uppercase text-on-surface-variant mt-1">
                COMMUNITY SUBMISSIONS FROM TOKYO, ZURICH, SEOUL, AND LONDON
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right font-headline text-xs uppercase">
                <span className="block font-bold text-primary">84.2K COMMUNITY ARCHIVISTS</span>
                <span className="text-on-surface-variant font-mono text-[10px]">TAG @KRAFTSTUDIO TO ENTER INDEX</span>
              </div>
              <button
                onClick={() => onShowToast('CAMERA LINKED: UPLOAD OUTFIT SPEC')}
                className="px-5 py-3 bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer border border-primary"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                <span>TAG OUTFIT</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {/* Social Post 1 */}
            <div className="bg-surface-container-lowest p-3 shadow-md group border border-primary">
              <div className="relative aspect-square overflow-hidden mb-3 bg-surface-container-high border border-primary/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbg5CKf2h659VLFn3D94t0QlmhjsdEArw7iFKCmMnFKQ-tz3hoqlTzoRNMTXqrFn_dwNd4Obz_eEHq2UXezi8DiwOXBgpoZWpRVi82PnkAK1Ad_22nbffukWLXZpz8rsZo9goZi5i7CWw5ESXQaW4p2NSm65rDV8DRHTL3uhbbbVTptVC8msW1iWj6WzzP55tFhUstt4yRbfgArAacRbI33n0ObY5Kb4EYhSNwny08j3TSNYgiDAnm"
                  alt="Tokyo street style"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[10px] px-1.5 py-0.5">
                  @KENJI_03
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-headline">
                <span className="font-bold text-primary">TOKYO SHIBUYA</span>
                <button
                  onClick={() => handleLike('kenji')}
                  className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant hover:text-secondary cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-xs ${likedPosts.kenji ? 'text-secondary font-bold' : 'text-secondary'}`}>
                    favorite
                  </span>{' '}
                  {(communityLikes.kenji / 1000).toFixed(1)}k
                </button>
              </div>
            </div>

            {/* Social Post 2 */}
            <div className="bg-surface-container-lowest p-3 shadow-md group border border-primary">
              <div className="relative aspect-square overflow-hidden mb-3 bg-surface-container-high border border-primary/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsMfpuWOxxAdBrRrIK2KrVkMe1WjK_EWGKShSsqdKgdpCkn8QbXQy_vUFpxgu8BqPkP5O8f0qTPNEIyGyvKs5pjZ_ifK0whmgFDB0nt54mz798Adc6j0HM6uUYfcEGoJpRWYKkI6s9YDyA1q2tL-cmeKuFIbGWOozUfoZds-lNxYzk0H0LFtWCcVYsZXJCGplDFz44khbbriWWy439AywLcZ5z-PRkh0NqJxOtGwezgV6LtDaG0D85"
                  alt="Berlin Mitte"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[10px] px-1.5 py-0.5">
                  @ANNA_BAU
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-headline">
                <span className="font-bold text-primary">BERLIN MITTE</span>
                <button
                  onClick={() => handleLike('anna')}
                  className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant hover:text-secondary cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-xs ${likedPosts.anna ? 'text-secondary font-bold' : 'text-secondary'}`}>
                    favorite
                  </span>{' '}
                  {(communityLikes.anna / 1000).toFixed(1)}k
                </button>
              </div>
            </div>

            {/* Social Post 3 */}
            <div className="bg-surface-container-lowest p-3 shadow-md group border border-primary">
              <div className="relative aspect-square overflow-hidden mb-3 bg-surface-container-high border border-primary/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHCijmJhXlqiX9yuh62AV3Km7nRpkl3R7jA9uHwo1WFmTr52e2kwoTX_S6Y8KMH9nYuEB2IbBiLlub5O6wm71mJMYeDiIA76g6XS17FjKFZQXJvc4wAaWzTAUO7IJb1aKystyqBEfm65uw2qANeqs6ieqM8NZeaaijKIYOKx_XOg7945NM1xuJFkvj4uJsHITbj0yea_WdamD_9aooco7-Pk_EOht_SZgcmXAzpkcELMKW-zYag4t6"
                  alt="London Shoreditch"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[10px] px-1.5 py-0.5">
                  @LNDN_CORE
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-headline">
                <span className="font-bold text-primary">LONDON SHOREDITCH</span>
                <button
                  onClick={() => handleLike('london')}
                  className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant hover:text-secondary cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-xs ${likedPosts.london ? 'text-secondary font-bold' : 'text-secondary'}`}>
                    favorite
                  </span>{' '}
                  {communityLikes.london}
                </button>
              </div>
            </div>

            {/* Social Post 4 */}
            <div className="bg-surface-container-lowest p-3 shadow-md group border border-primary">
              <div className="relative aspect-square overflow-hidden mb-3 bg-surface-container-high border border-primary/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMGeDrL18UyDNhLljlxJKmECXvWfwNkW6BqvF-b2NV0mtyuqZXl9ld4yEdfEWyNoQx-UnTt_7NJRPdiKvH33BvkosnxpH7m_nyopjZ1yEQOOu7sbR6n0JWlyufcUr4YlOWaGrRhyYMIQmADProXQU-vGfGhrXx9h1ja8pfuc7cB_d7Wn6tSpZ4NiHlFx8RTK7yJJONZ4Vy3ztZZHhpxHglCr1F66zoXjCDPRsQdrA_LNdH-gqDwnMA"
                  alt="Seoul Hannam"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-primary text-on-primary font-mono text-[10px] px-1.5 py-0.5">
                  @MIN_SEOUL
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-headline">
                <span className="font-bold text-primary">SEOUL HANNAM</span>
                <button
                  onClick={() => handleLike('seoul')}
                  className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant hover:text-secondary cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-xs ${likedPosts.seoul ? 'text-secondary font-bold' : 'text-secondary'}`}>
                    favorite
                  </span>{' '}
                  {(communityLikes.seoul / 1000).toFixed(1)}k
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SUSTAINABILITY & CRAFT METRICS MATRIX */}
      <section className="w-full px-4 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-headline uppercase">
          <div className="bg-primary-container text-on-primary-container p-6 shadow-md flex flex-col justify-between border-2 border-primary">
            <span className="text-xs font-bold font-mono">01 // REPAIR GUARANTEE</span>
            <div className="my-6">
              <p className="text-4xl font-bold tracking-tight">10-YEAR</p>
              <p className="text-xs font-body mt-2">Free lifetime seam rehabilitation across our Berlin & Tokyo studios.</p>
            </div>
            <span className="material-symbols-outlined text-3xl">build</span>
          </div>

          <div className="bg-surface-container-lowest text-primary p-6 shadow-md flex flex-col justify-between border-2 border-primary">
            <span className="text-xs font-bold font-mono text-on-surface-variant">02 // SOURCING ETHICS</span>
            <div className="my-6">
              <p className="text-4xl font-bold tracking-tight">100%</p>
              <p className="text-xs font-body text-on-surface-variant mt-2">Organic or regenerated tactical nylon woven in Okayama.</p>
            </div>
            <span className="material-symbols-outlined text-3xl text-secondary">eco</span>
          </div>

          <div className="bg-secondary text-on-error p-6 shadow-md flex flex-col justify-between border-2 border-primary">
            <span className="text-xs font-bold font-mono opacity-80">03 // CARBON LOGISTICS</span>
            <div className="my-6">
              <p className="text-4xl font-bold tracking-tight">NET 0.0</p>
              <p className="text-xs font-body mt-2 opacity-90">Ground transport via green cargo rails throughout EU & Asia.</p>
            </div>
            <span className="material-symbols-outlined text-3xl">electric_bolt</span>
          </div>

          <div className="bg-tertiary text-on-tertiary p-6 shadow-md flex flex-col justify-between border-2 border-primary">
            <span className="text-xs font-bold font-mono opacity-80">04 // CIRCULAR TRADE-IN</span>
            <div className="my-6">
              <p className="text-4xl font-bold tracking-tight">{formatPrice(80, currency)} CREDIT</p>
              <p className="text-xs font-body mt-2 opacity-90">Return any past season garment for instant archive credit.</p>
            </div>
            <span className="material-symbols-outlined text-3xl">change_circle</span>
          </div>
        </div>
      </section>
    </div>
  );
};
