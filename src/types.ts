export type Page =
  | "home"
  | "catalog"
  | "pdp"
  | "checkout-1"
  | "checkout-2"
  | "checkout-3"
  | "flash-sale"
  | "sale"
  | "editorial"
  | "article";

export type Gender = "men" | "women" | "unisex";
export type CatalogSection = "all" | "men" | "women" | "unisex";

export type Currency = "EUR" | "USD" | "GBP" | "JPY";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: string;
  gender?: Gender;
  subCategory?: string;
  priceEUR: number;
  price?: number;
  onSale?: boolean;
  discountPercent?: number | null;
  compareAtPriceEUR?: number | null;
  saleEndsAt?: string | null;
  specWeight?: string;
  substrate: string;
  material?: string;
  tag?: string;
  colorway: string;
  color?: string;
  colorHexList: string[];
  colorsAvailable?: ProductColor[];
  sizes: string[];
  sizesAvailable?: string[];
  inStock: boolean;
  stockLeft?: number;
  featured?: boolean;
  image: string;
  galleryImages?: string[];
  description: string;
  badge?: string;
  headline?: string | null;
  longDescription?: string | null;
  careInstructions?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sku: string;
  specs: {
    origin?: string;
    weight?: string;
    composition?: string;
    care?: string;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  title: string;
  image: string;
  priceEUR: number;
  price?: number;
  sku: string;
  size: string;
  selectedSize?: string;
  color: string;
  selectedColor?: string;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  avatarInitials?: string;
  verified: boolean;
  sizeOrdered?: string;
  sizePurchased?: string;
  colorOrdered?: string;
  measurements?: string;
  stars?: number;
  rating?: number;
  date: string;
  headline?: string;
  text?: string;
  comment?: string;
  fitVerdict?: string;
  fitScore?: string;
  helpfulCount: number;
  photos?: string[];
}

export interface CheckoutData {
  email: string;
  newsletter?: boolean;
  country: string;
  firstName: string;
  lastName: string;
  address?: string;
  address1?: string;
  address2?: string;
  apartment?: string;
  postalCode: string;
  city: string;
  phone?: string;
  dispatchSpeed?: "standard" | "priority" | "express";
  deliveryMethod?: "standard" | "express" | "sameday";
  deliveryCostEUR?: number;
  paymentMethod?: "card" | "klarna" | "paypal" | "sepa";
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  saveCard?: boolean;
  sameBilling?: boolean;
  promoCode?: string;
  discountEUR?: number;
  protocolId?: string;
  timestamp?: string;
}

export type FlashSaleTier = "all" | "40" | "50" | "60";
export type FlashSaleSort = "discount" | "depletion" | "price_asc" | "price_desc";
export type FlashSaleStockState = "critical" | "low" | "ok";

export interface FlashSaleProduct {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: string;
  image: string;
  sizes: string[];
  sku: string;
  gender?: string;
}

export interface FlashSale {
  id: string;
  status: "active" | "upcoming";
  startsAt: string;
  endsAt: string;
  salePrice: number;
  originalPrice: number;
  currency: string;
  discountPercent: number;
  totalStock: number;
  availableStock: number;
  depletionPercent: number;
  stockState: FlashSaleStockState;
  product: FlashSaleProduct;
}

export interface FlashSaleCategory {
  name: string;
  slug: string;
  count: number;
}

export interface FlashSaleMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  nextEndsAt: string | null;
  serverTime: string;
  tiers: Record<FlashSaleTier, number>;
  categories: FlashSaleCategory[];
}

export interface FlashSaleFilters {
  tier: FlashSaleTier;
  category: string;
  size: string;
  sort: FlashSaleSort;
}

export interface FlashSaleListResponse {
  data: FlashSale[];
  meta: FlashSaleMeta;
}

export interface FlashSaleReservation {
  status: string;
  message: string;
  reservation?: { id: string; status: string; expires_at: string };
}

export interface LookbookItem {
  id: string;
  title: string;
  caption: string;
  link: string;
  imageUrl: string | null;
  imageAlt: string;
}

export interface HomeContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  lookbook: LookbookItem[];
  editorialTitle: string;
  editorialBody: string;
  editorialImageUrl: string | null;
}

export interface SocialLink {
  label: string;
  icon: string;
  href: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  hours: string;
}

export interface SiteSettings {
  announcement: string;
  footerTagline: string;
  socialLinks: SocialLink[];
  storeLocations: StoreLocation[];
}

export interface SiteContent {
  home: HomeContent;
  settings: SiteSettings;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverImageAlt: string;
  author: string;
  category: string | null;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface Article extends ArticleSummary {
  body: string;
}

export interface ArticlesMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface ArticlesPage {
  articles: ArticleSummary[];
  meta: ArticlesMeta;
  categories: string[];
}

export interface ArticleDetail {
  article: Article;
  related: ArticleSummary[];
  /** Set when the article was loaded through a signed CMS preview link. */
  previewStatus?: 'draft' | 'scheduled' | 'published';
}

/** Signed-URL query params minted by the CMS preview link. */
export interface PreviewCredentials {
  expires: string;
  signature: string;
}

export interface ArticlesParams {
  page?: number;
  perPage?: number;
  category?: string;
}
