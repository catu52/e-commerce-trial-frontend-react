import { apiRequest } from '../lib/api';
import { CONTENT_TIMEOUT_MS } from '../config';
import { DEFAULT_HOME_CONTENT, DEFAULT_SITE_SETTINGS } from '../data/defaultContent';
import type {
  HomeContent,
  LookbookItem,
  SiteSettings,
  SocialLink,
  StoreLocation,
} from '../types';

const HOME_PATH = '/content/home';
const SETTINGS_PATH = '/content/site-settings';

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v : null;
const arr = (v: unknown): Raw[] => (Array.isArray(v) ? v.filter(isObj) : []);

export function mapLookbook(raw: unknown): LookbookItem[] {
  return arr(raw)
    .map((item, i): LookbookItem | null => {
      const title = str(item.title);
      if (!title) return null;
      return {
        id: String(item.id ?? i),
        title,
        caption: str(item.caption) ?? '',
        link: str(item.link) ?? '',
        imageUrl: str(item.imageUrl),
        imageAlt: title,
      };
    })
    .filter((x): x is LookbookItem => x !== null);
}

/** Maps a /content/home response onto HomeContent; missing fields fall back to defaults. */
export function mapHomePage(
  response: unknown,
  defaults: HomeContent = DEFAULT_HOME_CONTENT
): HomeContent {
  const data = isObj(response) && isObj(response.data) ? response.data : {};
  const lookbook = mapLookbook(data.lookbook);
  return {
    heroEyebrow: str(data.heroEyebrow) ?? defaults.heroEyebrow,
    heroTitle: str(data.heroTitle) ?? defaults.heroTitle,
    heroSubtitle: str(data.heroSubtitle) ?? defaults.heroSubtitle,
    lookbook: lookbook.length ? lookbook : defaults.lookbook,
    editorialTitle: str(data.editorialTitle) ?? defaults.editorialTitle,
    editorialBody: str(data.editorialBody) ?? defaults.editorialBody,
    editorialImageUrl: str(data.editorialImageUrl) ?? defaults.editorialImageUrl,
  };
}

export function mapSocialLinks(raw: unknown): SocialLink[] {
  return arr(raw).flatMap((l) => {
    const label = str(l.label);
    const href = str(l.href);
    return label && href ? [{ label, href, icon: str(l.icon) ?? 'link' }] : [];
  });
}

export function mapStoreLocations(raw: unknown): StoreLocation[] {
  return arr(raw).flatMap((l) => {
    const name = str(l.name);
    return name ? [{ name, address: str(l.address) ?? '', hours: str(l.hours) ?? '' }] : [];
  });
}

/** Maps a /content/site-settings response onto SiteSettings; missing fields fall back to defaults. */
export function mapSiteSettings(
  response: unknown,
  defaults: SiteSettings = DEFAULT_SITE_SETTINGS
): SiteSettings {
  const data = isObj(response) && isObj(response.data) ? response.data : {};
  const socialLinks = mapSocialLinks(data.socialLinks);
  const storeLocations = mapStoreLocations(data.storeLocations);
  return {
    announcement: str(data.announcement) ?? defaults.announcement,
    footerTagline: str(data.footerTagline) ?? defaults.footerTagline,
    socialLinks: socialLinks.length ? socialLinks : defaults.socialLinks,
    storeLocations: storeLocations.length ? storeLocations : defaults.storeLocations,
  };
}

export async function fetchHomePage(): Promise<HomeContent> {
  return mapHomePage(await apiRequest<unknown>(HOME_PATH, { auth: false, timeoutMs: CONTENT_TIMEOUT_MS }));
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  return mapSiteSettings(await apiRequest<unknown>(SETTINGS_PATH, { auth: false, timeoutMs: CONTENT_TIMEOUT_MS }));
}
