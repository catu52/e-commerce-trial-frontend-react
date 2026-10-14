import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Page,
  CatalogSection,
  Product,
  CartItem,
  Currency,
  CheckoutData,
} from "./types";
import { buildCreateOrderInput, createOrder } from "./services/orders";
import { useCart } from "./hooks/useCart";
import { useProducts } from "./hooks/useProducts";
import { useProductBySlug } from "./hooks/useProductBySlug";
import { ROUTES, pathForPage, resolveRoute } from "./routes";
import { useSiteContent } from "./hooks/useSiteContent";
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY, TOAST_DURATION_MS } from "./config";
import { ApiError } from "./lib/api";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomeScreen } from "./components/HomeScreen";
import { CatalogScreen } from "./components/CatalogScreen";
import { PDPScreen } from "./components/PDPScreen";
import { CheckoutStep1 } from "./components/CheckoutStep1";
import { CheckoutStep2 } from "./components/CheckoutStep2";
import { CheckoutStep3 } from "./components/CheckoutStep3";
import { FlashSaleScreen } from "./components/FlashSaleScreen";
import { SaleScreen } from "./components/SaleScreen";
import { NotFoundScreen } from "./components/NotFoundScreen";
import { EditorialScreen } from "./components/EditorialScreen";
import { ArticleScreen } from "./components/ArticleScreen";
import { Seo } from "./components/Seo";
import {
  breadcrumbLd,
  itemListLd,
  organizationLd,
  productLd,
  websiteLd,
} from "./lib/structuredData";

const SECTION_TITLES = {
  all: "Shop the Archive",
  men: "Men's Collection",
  women: "Women's Collection",
  unisex: "Unisex Collection",
} as const;

const SECTION_DESCRIPTIONS = {
  all: "Browse the full KRAFT Studio archive of Bauhaus-inspired utility apparel and objects.",
  men: "Men's outerwear, knitwear, trousers and accessories from the KRAFT Studio archive.",
  women: "Women's outerwear, knitwear, trousers and accessories from the KRAFT Studio archive.",
  unisex: "Unisex pieces from the KRAFT Studio archive.",
} as const;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = resolveRoute(location.pathname);
  const currentPage: Page | "not-found" = route.page;
  const section: CatalogSection = route.section;
  const { client } = useAuth();
  const {
    products,
    loading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useProducts(section);

  const goToPage = (page: Page) => {
    if (page === "pdp") {
      navigate(products[0] ? ROUTES.product(products[0].slug) : ROUTES.shop);
      return;
    }
    navigate(page === "article" ? ROUTES.editorial : pathForPage(page));
  };
  const handleNavigate = goToPage;
  const handleSelectSection = (next: CatalogSection) => {
    navigate(ROUTES.shopSection(next));
  };
  const { cart, addItem, updateQuantity, removeItem, clear, addComplement } =
    useCart();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Checkout state
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: DEFAULT_COUNTRY,
    phone: "",
    dispatchSpeed: "standard",
    paymentMethod: "card",
  });

  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<{
    items: CartItem[];
    checkoutData: CheckoutData;
    orderNumber: string;
    total?: number;
  }>({
    items: [],
    checkoutData: {
      email: "",
      firstName: "",
      lastName: "",
      postalCode: "",
      city: "",
      country: "",
    },
    orderNumber: "",
  });

  // Toast handler
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, TOAST_DURATION_MS);
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleRemoveCartItem = (id: string) => {
    removeItem(id);
    showToast("SPECIMEN EXPELLED FROM BAG");
  };

  const handleClearCart = () => {
    clear();
    showToast("BAG PURGED: ALL SPECIMENS CLEARED");
  };

  const handleAddComplement = (
    title: string,
    priceEUR: number,
    sku: string,
    size?: string,
  ) => {
    addComplement(title, priceEUR, sku, size);
    showToast(`COMPLEMENT LOGGED: ${title}`);
  };

  const handleSelectProduct = (product: Product) => {
    navigate(ROUTES.product(product.slug));
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      showToast("DISPATCH BAG IS EMPTY. SELECT SPECIMENS TO PROCEED.");
      return;
    }
    setIsCartOpen(false);
    navigate(ROUTES.checkoutInformation);
  };

  const handleCompleteOrder = async (overrides: Partial<CheckoutData> = {}) => {
    const data = { ...checkoutData, ...overrides };
    if (!client) {
      setAuthModalOpen(true);
      showToast("LOG IN OR REGISTER TO COMPLETE ACQUISITION");
      return;
    }
    try {
      const order = await createOrder(buildCreateOrderInput(cart, data));
      setLastConfirmedOrder({
        items: [...cart],
        checkoutData: { ...data, protocolId: order.orderNumber },
        orderNumber: order.orderNumber,
        total: order.total,
      });
      clear();
      navigate(ROUTES.checkoutConfirmation);
      showToast(`ACQUISITION LOGGED UNDER MANIFEST #${order.orderNumber}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthModalOpen(true);
        showToast("SESSION EXPIRED. LOG IN AGAIN.");
      }
      throw err;
    }
  };

  // Search filter
  const filteredSearchProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.material || p.substrate || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : [];

  const isStoreFront = currentPage === "home" || currentPage === "catalog";
  const catalogReady =
    !productsLoading && !productsError && products.length > 0;
  const pdpSlug = route.page === "pdp" ? route.slug : undefined;
  const pdp = useProductBySlug(pdpSlug, products);
  const isCheckout = currentPage.startsWith("checkout");

  const { announcement } = useSiteContent().content.settings;

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-paper text-ink font-body selection:bg-[#ffcc00] selection:text-[#1a1a1a] flex flex-col">
      {/* SCREEN DEMO JUMP BAR (Allows rapid preview of all 7 requested screens) */}
      <div className="bg-panel text-[#f5f0eb] border-b-2 border-ink px-3 py-1.5 flex items-center justify-between overflow-x-auto text-[10px] font-mono z-50">
        <div className="flex items-center gap-2 shrink-0 pr-4">
          <span className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse"></span>
          <span className="font-bold tracking-wider text-[#ffcc00]">
            SCREEN NAVIGATOR:
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => goToPage("home")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "home"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            01 HOME
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              isCartOpen
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            02 BAG ({cartTotalCount})
          </button>
          <button
            onClick={() => goToPage("catalog")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "catalog"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            03 CATALOG
          </button>
          <button
            onClick={() => goToPage("pdp")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "pdp"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            04 PDP
          </button>
          <button
            onClick={() => goToPage("checkout-1")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "checkout-1"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            05 CHECKOUT-1
          </button>
          <button
            onClick={() => goToPage("checkout-2")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "checkout-2"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            06 CHECKOUT-2
          </button>
          <button
            onClick={() => goToPage("checkout-3")}
            className={`px-2 py-0.5 border border-[#444] transition-colors ${
              currentPage === "checkout-3"
                ? "bg-[#ffcc00] text-[#1a1a1a] font-bold border-[#ffcc00]"
                : "hover:bg-[#333]"
            }`}
          >
            07 CONFIRMED
          </button>
        </div>
        {announcement && (
          <span className="hidden lg:block shrink-0 pl-4 font-bold tracking-wider text-[#ffcc00]">
            {announcement}
          </span>
        )}
      </div>

      {/* Main Header (shown on store browsing pages) */}
      {!isCheckout && currentPage !== "not-found" && (
        <Header
          currentPage={currentPage}
          section={section}
          onSelectSection={handleSelectSection}
          onNavigate={handleNavigate}
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          currency={currency}
          onCurrencyChange={(curr) => {
            setCurrency(curr);
            showToast(`TELEMETRY CURRENCY CONVERTED: ${curr}`);
          }}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {/* Active Screen View */}
      <main className="flex-1">
        {currentPage === "home" && (
          <Seo path={ROUTES.home} jsonLd={[organizationLd(), websiteLd()]} />
        )}
        {currentPage === "catalog" && (
          <Seo
            path={ROUTES.shopSection(section)}
            title={SECTION_TITLES[section]}
            description={SECTION_DESCRIPTIONS[section]}
            jsonLd={[
              breadcrumbLd([
                { name: "Home", path: ROUTES.home },
                { name: "Shop", path: ROUTES.shop },
                ...(section === "all"
                  ? []
                  : [{ name: SECTION_TITLES[section], path: ROUTES.shopSection(section) }]),
              ]),
              ...(catalogReady ? [itemListLd(products)] : []),
            ]}
          />
        )}
        {currentPage === "flash-sale" && (
          <Seo
            path={ROUTES.flashSale}
            title="Flash Clearance"
            description="Limited-time surplus and sample clearance. Reserve archive pieces before the countdown ends."
          />
        )}
        {isCheckout && (
          <Seo path={location.pathname} title="Checkout" noindex />
        )}
        {currentPage === "pdp" && pdp.status === "found" && (
          <Seo
            path={ROUTES.product(pdp.product.slug)}
            title={pdp.product.seoTitle || pdp.product.title}
            description={
              pdp.product.seoDescription ||
              pdp.product.headline ||
              pdp.product.description
            }
            image={pdp.product.image}
            type="product"
            jsonLd={[
              productLd(pdp.product, "EUR"),
              breadcrumbLd([
                { name: "Home", path: ROUTES.home },
                { name: "Shop", path: ROUTES.shop },
                {
                  name: pdp.product.title,
                  path: ROUTES.product(pdp.product.slug),
                },
              ]),
            ]}
          />
        )}
        {isStoreFront &&
          (productsLoading || productsError || products.length === 0) && (
            <div className="py-24 text-center font-mono text-sm uppercase space-y-4">
              {productsLoading ? (
                <div>LOADING ARCHIVE CATALOG...</div>
              ) : productsError ? (
                <>
                  <div className="text-[#e63b2e] font-bold">
                    CATALOG UNAVAILABLE: {productsError}
                  </div>
                  <button
                    onClick={() => reloadProducts()}
                    className="border-2 border-ink bg-[#ffcc00] px-4 py-2 font-bold hover:bg-panel hover:text-[#ffcc00]"
                  >
                    RETRY
                  </button>
                </>
              ) : (
                <div className="text-[#888888]">
                  NO SPECIMENS REGISTERED IN THE ARCHIVE.
                </div>
              )}
            </div>
          )}

        {isStoreFront && catalogReady && currentPage === "home" && (
          <HomeScreen
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onSelectSection={handleSelectSection}
            onOpenCart={() => setIsCartOpen(true)}
            currency={currency}
            onAddToCart={(prod) => {
              addItem(
                prod,
                prod.sizesAvailable?.[0] || prod.sizes[0] || "M",
                prod.colorsAvailable?.[0]?.name || prod.colorway,
                1,
              );
              showToast(`ADDED ${prod.title} TO BAG`);
            }}
            onShowToast={showToast}
          />
        )}

        {isStoreFront && catalogReady && currentPage === "catalog" && (
          <CatalogScreen
            products={products}
            onSelectProduct={handleSelectProduct}
            section={section}
            onNavigate={handleNavigate}
            currency={currency}
            onAddToCart={(prod, size = "M") => {
              addItem(
                prod,
                size,
                prod.colorsAvailable?.[0]?.name || prod.colorway,
                1,
              );
              showToast(`LOGGED: ${prod.title} [SIZE ${size}]`);
            }}
            onShowToast={showToast}
          />
        )}

        {currentPage === "pdp" && pdp.status === "loading" && (
          <div className="py-24 text-center font-mono text-sm uppercase">
            LOADING SPECIMEN...
          </div>
        )}

        {currentPage === "pdp" && pdp.status === "error" && (
          <div className="py-24 text-center font-mono text-sm uppercase space-y-4">
            <div className="text-[#e63b2e] font-bold">
              SPECIMEN UNAVAILABLE: {pdp.message}
            </div>
          </div>
        )}

        {currentPage === "pdp" && pdp.status === "not-found" && (
          <NotFoundScreen />
        )}

        {currentPage === "pdp" && pdp.status === "found" && (
          <PDPScreen
            key={pdp.product.id}
            product={pdp.product}
            currency={currency}
            onAddToCart={addItem}
            onSelectProduct={handleSelectProduct}
            allProducts={products}
            onOpenCart={() => setIsCartOpen(true)}
            onShowToast={showToast}
          />
        )}

        {currentPage === "not-found" && <NotFoundScreen />}

        {route.page === "editorial" && <EditorialScreen />}

        {route.page === "article" && (
          <ArticleScreen key={route.slug} slug={route.slug} />
        )}

        {currentPage === "sale" && <SaleScreen currency={currency} />}

        {currentPage === "flash-sale" && (
          <FlashSaleScreen
            currency={currency}
            onShowToast={showToast}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {(currentPage === "checkout-1" || currentPage === "checkout-2") &&
          cart.length === 0 && <Navigate to={ROUTES.shop} replace />}

        {currentPage === "checkout-3" && !lastConfirmedOrder.orderNumber && (
          <Navigate to={ROUTES.home} replace />
        )}

        {currentPage === "checkout-1" && (
          <CheckoutStep1
            cart={cart}
            currency={currency}
            checkoutData={checkoutData}
            onUpdateCheckoutData={(data) =>
              setCheckoutData((prev) => ({ ...prev, ...data }))
            }
            onNext={() => navigate(ROUTES.checkoutPayment)}
            onBackToCart={() => {
              navigate(ROUTES.shop);
              setIsCartOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {currentPage === "checkout-2" && (
          <CheckoutStep2
            cart={cart}
            currency={currency}
            checkoutData={checkoutData}
            onUpdateCheckoutData={(data) =>
              setCheckoutData((prev) => ({ ...prev, ...data }))
            }
            onNext={handleCompleteOrder}
            onBack={() => navigate(ROUTES.checkoutInformation)}
            onShowToast={showToast}
          />
        )}

        {currentPage === "checkout-3" && (
          <CheckoutStep3
            orderItems={lastConfirmedOrder.items}
            currency={currency}
            checkoutData={lastConfirmedOrder.checkoutData}
            orderNumber={lastConfirmedOrder.orderNumber}
            orderTotal={lastConfirmedOrder.total}
            onNavigate={goToPage}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onAddComplement={handleAddComplement}
        onProceedToCheckout={handleProceedToCheckout}
        currency={currency}
        onShowToast={showToast}
      />

      {/* Footer (shown on store browsing pages) */}
      {!isCheckout && currentPage !== "not-found" && (
        <Footer currency={currency} onShowToast={showToast} />
      )}

      {/* SEARCH OVERLAY MODAL */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-paper border-4 border-ink shadow-[10px_10px_0px_var(--color-ink)] max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-ink pb-3">
              <span className="font-mono text-xs font-bold text-[#888888] uppercase">
                ARCHIVAL SEARCH TELEMETRY
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="w-8 h-8 border-2 border-ink bg-paper-2 hover:bg-[#e63b2e] hover:text-[#f5f0eb] font-mono font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY SPECIMEN CODE, MATERIAL, SILHOUETTE..."
              className="w-full bg-paper-2 border-2 border-ink px-4 py-3 font-mono text-sm focus:outline-none focus:bg-[#ffcc00]/20"
            />

            <div className="max-h-80 overflow-y-auto divide-y divide-ink/20">
              {filteredSearchProducts.length > 0 ? (
                filteredSearchProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      handleSelectProduct(p);
                      setSearchModalOpen(false);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#ffcc00]/20 px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-10 h-12 border border-ink object-cover"
                      />
                      <div>
                        <span className="font-mono text-[10px] text-[#888888]">
                          {p.code}
                        </span>
                        <div className="font-headline font-bold text-xs uppercase">
                          {p.title}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs">
                      €{p.price}
                    </span>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="py-6 text-center font-mono text-xs text-[#888888]">
                  NO REGISTERED SPECIMENS MATCHING QUERY.
                </div>
              ) : (
                <div className="py-4 text-xs font-mono text-[#888888] space-y-1">
                  <div>RECOMMENDED QUERIES:</div>
                  <div className="flex gap-2 flex-wrap pt-1">
                    {[
                      "WOOL",
                      "OVERSHIRT",
                      "DENIM",
                      "CHORE JACKET",
                      "PRT_001",
                      "BAG",
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="border border-ink bg-paper-2 px-2 py-0.5 hover:bg-[#ffcc00] text-[10px]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-panel text-[#ffcc00] border-2 border-[#ffcc00] px-4 py-3 shadow-[6px_6px_0px_var(--color-ink)] font-mono text-xs font-bold tracking-wider uppercase animate-bounce flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
