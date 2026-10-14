import type { CatalogSection, Page } from "./types";

/** Single source of truth for URLs. Product URLs use the product slug. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  shopSection: (section: CatalogSection) =>
    section === "all" ? "/shop" : `/shop/${section}`,
  product: (slug: string) => `/products/${encodeURIComponent(slug)}`,
  unisex: "/unisex",
  flashSale: "/flash-sale",
  sale: "/sale",
  editorial: "/editorial",
  article: (slug: string) => `/editorial/${encodeURIComponent(slug)}`,
  checkoutInformation: "/checkout/information",
  checkoutPayment: "/checkout/payment",
  checkoutConfirmation: "/checkout/confirmation",
} as const;

export const PRODUCT_PATTERN = "/products/:slug";
export const SECTION_PATTERN = "/shop/:section";

/**
 * Maps legacy `Page` keys to their corresponding URL paths. Excludes product detail pages (`pdp`) and article pages (`article`) which require a slug.
 */
const PAGE_PATHS: Record<Exclude<Page, "pdp" | "article">, string> = {
  home: ROUTES.home,
  catalog: ROUTES.shop,
  "flash-sale": ROUTES.flashSale,
  sale: ROUTES.sale,
  editorial: ROUTES.editorial,
  "checkout-1": ROUTES.checkoutInformation,
  "checkout-2": ROUTES.checkoutPayment,
  "checkout-3": ROUTES.checkoutConfirmation,
};

/** Path for a legacy `Page` key (product pages need a slug, see ROUTES.product). */
export function pathForPage(page: Exclude<Page, "pdp" | "article">): string {
  return PAGE_PATHS[page];
}

// List of all catalog sections, including the new "unisex" section.
export const SECTIONS: readonly CatalogSection[] = [
  "all",
  "men",
  "women",
  "unisex",
];

/**
 * Checks if a given string is a valid catalog section (excluding "all").
 *
 * @param value The string to check.
 * @returns True if the value is "men", "women", or "unisex"; false otherwise.
 */
export function isSection(
  value: string | undefined,
): value is Exclude<CatalogSection, "all"> {
  return value === "men" || value === "women" || value === "unisex";
}

/** Checkout pages are private: no indexing, no header/footer. */
export const CHECKOUT_PREFIX = "/checkout";

/**
 * Represents a fully resolved route, including the page, section, and any required slugs.
 */
export type ResolvedRoute =
  | { page: Exclude<Page, "pdp" | "article">; section: CatalogSection }
  | { page: "pdp"; section: "all"; slug: string }
  | { page: "article"; section: "all"; slug: string }
  | { page: "not-found"; section: "all" };

/** Maps a URL pathname to the page it renders. Trailing slashes are ignored. */
export function resolveRoute(pathname: string): ResolvedRoute {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return { page: "home", section: "all" };

  // Destructure the first two segments of the path for easier routing logic.
  const [first, second, ...rest] = segments;
  if (rest.length === 0) {
    if (first === "shop") {
      if (second === undefined) return { page: "catalog", section: "all" };
      if (isSection(second)) return { page: "catalog", section: second };
    }
    if (first === "products" && second) {
      try {
        return {
          page: "pdp",
          section: "all",
          slug: decodeURIComponent(second),
        };
      } catch {
        return { page: "not-found", section: "all" };
      }
    }
    if (first === "editorial") {
      if (second === undefined) return { page: "editorial", section: "all" };
      try {
        return {
          page: "article",
          section: "all",
          slug: decodeURIComponent(second),
        };
      } catch {
        return { page: "not-found", section: "all" };
      }
    }
    if (first === "sale" && second === undefined)
      return { page: "sale", section: "all" };
    if (first === "flash-sale" && second === undefined)
      return { page: "flash-sale", section: "all" };
    if (first === "checkout") {
      if (second === "information")
        return { page: "checkout-1", section: "all" };
      if (second === "payment") return { page: "checkout-2", section: "all" };
      if (second === "confirmation")
        return { page: "checkout-3", section: "all" };
    }
  }
  return { page: "not-found", section: "all" };
}
