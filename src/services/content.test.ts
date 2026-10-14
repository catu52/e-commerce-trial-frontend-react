import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { API, homeFixture, settingsFixture } from '../test/handlers';
import { rejection } from '../test/utils';
import { DEFAULT_HOME_CONTENT, DEFAULT_SITE_SETTINGS } from '../data/defaultContent';
import {
  fetchHomePage,
  fetchSiteSettings,
  mapHomePage,
  mapLookbook,
  mapSiteSettings,
  mapSocialLinks,
  mapStoreLocations,
} from './content';

describe('mapLookbook', () => {
  it('maps items, using imageUrl directly and defaulting caption/link', () => {
    const [a, b] = mapLookbook(homeFixture.data.lookbook);
    expect(a).toEqual({
      id: '11', title: 'LARAVEL LOOK ONE', caption: 'LARAVEL CAPTION', link: 'https://example.com/look',
      imageUrl: 'https://cdn.test/look1.jpg', imageAlt: 'LARAVEL LOOK ONE',
    });
    expect(b).toEqual({ id: '12', title: 'LARAVEL LOOK TWO', caption: '', link: '', imageUrl: null, imageAlt: 'LARAVEL LOOK TWO' });
  });

  it('drops items without title and non-objects; uses index when id missing', () => {
    const out = mapLookbook([{ title: '  ' }, 'x', null, { caption: 'c' }, { title: 'OK' }]);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('2');
  });

  it('returns [] for non-arrays', () => {
    expect(mapLookbook(undefined)).toEqual([]);
    expect(mapLookbook({})).toEqual([]);
  });
});

describe('mapHomePage', () => {
  it('maps a full response', () => {
    const h = mapHomePage(homeFixture);
    expect(h.heroTitle).toBe('LARAVEL HERO\nTITLE');
    expect(h.editorialImageUrl).toBe('https://cdn.test/editorial.jpg');
    expect(h.lookbook).toHaveLength(2);
  });

  it.each([undefined, null, 'x', {}, { data: null }, { data: [] }])('falls back entirely for %j', (r) => {
    expect(mapHomePage(r)).toEqual(DEFAULT_HOME_CONTENT);
  });

  it('falls back per field for missing or empty strings', () => {
    const h = mapHomePage({ data: { heroEyebrow: 'E', heroTitle: '', heroSubtitle: '   ', editorialTitle: 5 } });
    expect(h.heroEyebrow).toBe('E');
    expect(h.heroTitle).toBe(DEFAULT_HOME_CONTENT.heroTitle);
    expect(h.heroSubtitle).toBe(DEFAULT_HOME_CONTENT.heroSubtitle);
    expect(h.editorialTitle).toBe(DEFAULT_HOME_CONTENT.editorialTitle);
    expect(h.editorialBody).toBe(DEFAULT_HOME_CONTENT.editorialBody);
  });

  it('falls back the whole lookbook when empty or all invalid', () => {
    expect(mapHomePage({ data: { lookbook: [] } }).lookbook).toEqual(DEFAULT_HOME_CONTENT.lookbook);
    expect(mapHomePage({ data: { lookbook: [{ caption: 'x' }] } }).lookbook).toEqual(DEFAULT_HOME_CONTENT.lookbook);
  });

  it('uses default editorial image when editorial image is null', () => {
    expect(mapHomePage({ data: { editorialImage: null } }).editorialImageUrl).toBe(DEFAULT_HOME_CONTENT.editorialImageUrl);
  });

  it('accepts custom defaults', () => {
    const d = { ...DEFAULT_HOME_CONTENT, heroTitle: 'CUSTOM' };
    expect(mapHomePage({}, d).heroTitle).toBe('CUSTOM');
  });
});

describe('mapSocialLinks / mapStoreLocations', () => {
  it('drops social links lacking label or href and defaults icon', () => {
    expect(mapSocialLinks([{ label: 'A', href: 'h' }, { label: 'B' }, { href: 'x' }, 3])).toEqual([
      { label: 'A', href: 'h', icon: 'link' },
    ]);
  });

  it('drops stores without name and defaults address/hours', () => {
    expect(mapStoreLocations([{ name: 'N' }, { address: 'x' }])).toEqual([{ name: 'N', address: '', hours: '' }]);
  });
});

describe('mapSiteSettings', () => {
  it('maps a full response', () => {
    const s = mapSiteSettings(settingsFixture);
    expect(s.announcement).toBe('LARAVEL ANNOUNCEMENT');
    expect(s.socialLinks).toHaveLength(1);
    expect(s.storeLocations[0].name).toBe('PARIS MARAIS');
  });

  it.each([undefined, {}, { data: null }])('falls back for %j', (r) => {
    expect(mapSiteSettings(r)).toEqual(DEFAULT_SITE_SETTINGS);
  });

  it('falls back arrays as a whole and strings per field', () => {
    const s = mapSiteSettings({ data: { announcement: 'A', socialLinks: [{ label: 'x' }], storeLocations: [] } });
    expect(s.announcement).toBe('A');
    expect(s.footerTagline).toBe(DEFAULT_SITE_SETTINGS.footerTagline);
    expect(s.socialLinks).toEqual(DEFAULT_SITE_SETTINGS.socialLinks);
    expect(s.storeLocations).toEqual(DEFAULT_SITE_SETTINGS.storeLocations);
  });
});

describe('fetch services', () => {
  it('fetchHomePage requests /content/home and maps it', async () => {
    let url = '';
    server.use(http.get(`${API}/content/home`, ({ request }) => {
      url = request.url;
      return HttpResponse.json(homeFixture);
    }));
    expect((await fetchHomePage()).heroEyebrow).toBe('LARAVEL EYEBROW');
    expect(new URL(url).pathname).toBe('/api/v1/content/home');
  });

  it('fetchSiteSettings requests /content/site-settings and maps it', async () => {
    let url = '';
    server.use(http.get(`${API}/content/site-settings`, ({ request }) => {
      url = request.url;
      return HttpResponse.json(settingsFixture);
    }));
    expect((await fetchSiteSettings()).announcement).toBe('LARAVEL ANNOUNCEMENT');
    expect(new URL(url).pathname).toBe('/api/v1/content/site-settings');
  });

  it('propagates ApiError', async () => {
    server.use(http.get(`${API}/content/home`, () => HttpResponse.json({}, { status: 500 })));
    expect(await rejection(fetchHomePage())).toMatchObject({ name: 'ApiError', status: 500 });
  });
});
