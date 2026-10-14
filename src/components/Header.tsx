import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes";
import { Page, Currency, CatalogSection } from "../types";
import { useAuth } from "../context/AuthContext";
import { FlashClearancePill } from "./FlashClearancePill";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  currentPage: Page;
  section?: CatalogSection;
  onSelectSection?: (section: CatalogSection) => void;
  onNavigate?: (page: Page) => void;
  cartCount: number;
  onOpenCart: () => void;
  currency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  section = "all",
  cartCount,
  onOpenCart,
  currency,
  onCurrencyChange,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  onOpenSearch,
  onOpenAuth,
}) => {
  const { client, logout } = useAuth();
  const isCheckout = currentPage.startsWith("checkout");
  const isEditorial = currentPage === "editorial" || currentPage === "article";
  const [menuOpen, setMenuOpen] = useState(false);

  if (isCheckout) {
    return (
      <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/95 border-b-2 border-primary">
        <div className="h-20 w-full px-6 lg:px-12 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link
              to={ROUTES.home}
              aria-label="KRAFT home"
              className="flex items-center gap-3 shrink-0 group cursor-pointer text-left"
            >
              <span className="font-headline text-2xl font-bold tracking-tighter uppercase text-primary">
                KRAFT<span className="text-secondary">*</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 border-l-2 border-primary pl-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">
                SECURE CHECKOUT PROTOCOL //
              </span>
              <span className="px-2 py-0.5 bg-primary text-on-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                TLS_256
              </span>
            </div>
          </div>

          <nav
            aria-label="Checkout steps"
            className="hidden md:flex items-center gap-3 lg:gap-5"
          >
            <Link
              to={ROUTES.checkoutInformation}
              aria-current={currentPage === "checkout-1" ? "page" : undefined}
              className={`px-3 py-1.5 text-xs uppercase font-headline tracking-widest border border-primary transition-colors cursor-pointer ${
                currentPage === "checkout-1"
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              01 Information
            </Link>
            <span className="text-primary font-bold">→</span>
            <Link
              to={ROUTES.checkoutPayment}
              aria-current={currentPage === "checkout-2" ? "page" : undefined}
              className={`px-3 py-1.5 text-xs uppercase font-headline tracking-widest border border-primary transition-colors cursor-pointer ${
                currentPage === "checkout-2"
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              02 Payment & Review
            </Link>
            <span className="text-primary font-bold">→</span>
            <Link
              to={ROUTES.checkoutConfirmation}
              aria-current={currentPage === "checkout-3" ? "page" : undefined}
              className={`px-3 py-1.5 text-xs uppercase font-headline tracking-widest border border-primary transition-colors cursor-pointer ${
                currentPage === "checkout-3"
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              03 Confirmation
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest text-primary border-2 border-primary font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                shopping_bag
              </span>
              <span className="hidden sm:inline">RETURN TO BAG</span>
              <span className="sm:hidden">BAG</span>
              <span>[{cartCount}]</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  const renderLinks = (mobile: boolean) => {
    const base = mobile
      ? "text-sm py-3 border-b border-outline-variant "
      : "";
    return (
      <>
            {(
              [
                ["all", "New Arrivals"],
                ["women", "Women"],
                ["men", "Men"],
                ["unisex", "Unisex"],
              ] as const
            ).map(([key, label]) => (
              <Link
                key={key}
                to={ROUTES.shopSection(key)}
                onClick={() => setMenuOpen(false)}
                className={`${base}text-xs uppercase font-headline tracking-widest transition-colors cursor-pointer ${
                  currentPage === "catalog" && section === key
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to={ROUTES.editorial}
              onClick={() => setMenuOpen(false)}
              aria-current={isEditorial ? "page" : undefined}
              className={`${base}text-xs uppercase font-headline tracking-widest transition-colors cursor-pointer ${
                isEditorial
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Editorial
            </Link>
            <Link
              to={ROUTES.sale}
              onClick={() => setMenuOpen(false)}
              aria-current={currentPage === "sale" ? "page" : undefined}
              className={`${base}text-xs uppercase font-headline tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPage === "sale"
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Sale</span>
              <span className="px-1.5 py-0.5 bg-secondary text-on-error text-[10px] font-bold tracking-normal uppercase">
                %
              </span>
            </Link>
            <FlashClearancePill active={currentPage === "flash-sale"} />
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/90 border-b border-primary">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4 lg:gap-6">
        <div className="flex items-center gap-3 lg:gap-8">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="xl:hidden flex items-center justify-center p-1 text-primary hover:text-secondary cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
          <Link
            to={ROUTES.home}
            aria-label="KRAFT home"
            className="flex items-center gap-3 shrink-0 group cursor-pointer text-left"
          >
            <span className="font-headline text-2xl font-bold tracking-tighter uppercase text-primary">
              KRAFT<span className="text-secondary">*</span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden xl:flex items-center gap-6"
          >
            {renderLinks(false)}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          {/* Search (icon only) */}
          <button
            type="button"
            aria-label="Search"
            title="Search"
            onClick={() => (onOpenSearch ? onOpenSearch() : onSearchSubmit?.(searchQuery))}
            className="flex items-center justify-center p-1 text-primary hover:text-secondary cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              search
            </span>
          </button>

          <ThemeToggle />

          {/* Currency selector */}
          <div className="hidden lg:flex items-center gap-1 border border-primary px-2 py-1 bg-surface-container-lowest text-xs font-headline font-bold uppercase">
            <span className="text-[10px] text-on-surface-variant">CUR:</span>
            <select
              aria-label="Currency Selector"
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
              <option value="JPY">JPY ¥</option>
            </select>
          </div>

          {/* Bag Button */}
          <button
            aria-label="Open Cart"
            onClick={onOpenCart}
            id="cart-open-btn"
            className="flex items-center gap-2 px-3 py-2 bg-primary-container text-on-primary-container border border-primary font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">
              shopping_bag
            </span>
            <span>BAG [{cartCount}]</span>
          </button>

          {/* Account */}
          {client ? (
            <div className="flex items-center gap-2 border border-primary px-2 py-1.5 font-mono text-[10px] font-bold uppercase">
              <span className="material-symbols-outlined text-base">
                person
              </span>
              <span className="max-w-[110px] truncate" title={client.email}>
                {client.name}
              </span>
              <button
                onClick={() => logout()}
                className="underline hover:text-error cursor-pointer"
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              id="account-btn"
              className="flex items-center gap-1 border border-primary px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
              title="Log in or register"
            >
              <span className="material-symbols-outlined text-base">
                person
              </span>
              <span>LOG IN</span>
            </button>
          )}
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="xl:hidden flex flex-col px-4 sm:px-6 pb-4 border-t border-primary bg-paper"
        >
          {renderLinks(true)}
          <div className="lg:hidden flex items-center gap-2 pt-3 text-xs font-headline font-bold uppercase">
            <span className="text-[10px] text-on-surface-variant">CUR:</span>
            <select
              aria-label="Currency Selector (mobile)"
              className="border border-primary bg-surface-container-lowest px-2 py-1 text-xs font-bold cursor-pointer"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            >
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
              <option value="JPY">JPY ¥</option>
            </select>
          </div>
        </nav>
      )}
    </header>
  );
};
